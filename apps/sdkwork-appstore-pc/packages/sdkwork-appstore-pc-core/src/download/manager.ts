/**
 * Resumable installer download queue.
 *
 * The center owns task state, transfer ordering, retries, and persistence; the
 * install provider and the download-center page only enqueue work and react to
 * the published snapshot. Transfers use HTTP range requests against the
 * presigned artifact URL and append every received chunk to persisted storage,
 * so pausing, a network failure, or a full page reload resumes from the exact
 * byte offset already on disk.
 */

import { installerFileName } from './format.ts'
import {
  createDefaultDownloadStorage,
  MemoryDownloadStorage,
  type DownloadStorage,
} from './storage.ts'
import type {
  DownloadCenterOptions,
  DownloadCenterSnapshot,
  DownloadRequest,
  DownloadTask,
  DownloadTaskStatus,
} from './types.ts'

const DEFAULT_CONCURRENCY = 1
const DEFAULT_MAX_ATTEMPTS = 3
const DEFAULT_RETRY_DELAY_MS = 1_000
const DEFAULT_PROGRESS_INTERVAL_MS = 200
const DEFAULT_PERSIST_INTERVAL_MS = 1_000
const SPEED_SAMPLE_INTERVAL_MS = 500

const ACTIVE_STATUSES: readonly DownloadTaskStatus[] = ['queued', 'downloading', 'paused']
const FINISHED_STATUSES: readonly DownloadTaskStatus[] = ['completed', 'failed', 'cancelled']

/* v8 ignore next 3 -- fallback only runs in an environment without crypto */
const runtimeCrypto = typeof globalThis === 'undefined' ? undefined : globalThis.crypto

/** A response the transfer cannot use as-is. */
class HttpError extends Error {
  readonly status: number

  constructor(status: number, message?: string) {
    super(message ?? `download request failed with HTTP ${status}`)
    this.name = 'HttpError'
    this.status = status
  }
}

/** The complete file failed its optional SHA-256 check. */
class IntegrityError extends Error {
  constructor() {
    super('downloaded installer failed its checksum verification')
    this.name = 'IntegrityError'
  }
}

/** The stream ended before the declared file size was reached. */
class IncompleteDownloadError extends Error {
  constructor(received: number, total: number) {
    super(`downloaded ${received} of ${total} bytes`)
    this.name = 'IncompleteDownloadError'
  }
}

interface ContentRange {
  start: number | null
  total: number | null
}

/**
 * Parse a `Content-Range` header.
 * @param header - `bytes 0-499/1234` for a range, or an unsatisfied-range form.
 * @returns the start offset and total size when present.
 */
export function parseContentRange(header: string | null): ContentRange | null {
  if (header === null) return null
  const match = /^bytes\s+(?:(\d+)-(\d+)|\*)\/(\d+|\*)$/iu.exec(header.trim())
  if (match === null) return null
  const start = match[1] === undefined ? null : Number.parseInt(match[1], 10)
  const total = match[3] === '*' ? null : Number.parseInt(match[3], 10)
  return {
    start: start !== null && Number.isFinite(start) ? start : null,
    total: total !== null && Number.isFinite(total) ? total : null,
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return typeof error === 'string' && error.trim() ? error : 'download failed'
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Normalize a published SHA-256 digest.
 * Uploads carry the `sha256:<hex>` form while seeds may carry plain hex; an
 * unrecognized value is ignored instead of failing every download.
 * @param value - published checksum.
 * @returns a lowercase 64-character hex digest, or null.
 */
function normalizeChecksum(value: string | null | undefined): string | null {
  const raw = value?.trim().toLowerCase() ?? ''
  if (!raw) return null
  const hex = raw.startsWith('sha256:') ? raw.slice('sha256:'.length).trim() : raw
  return /^[a-f0-9]{64}$/u.test(hex) ? hex : null
}

function fileNameFromUrl(url: string): string {
  try {
    const parsed = new URL(url)
    const candidate = decodeURIComponent(parsed.pathname.split('/').pop() ?? '').trim()
    return candidate || 'installer.bin'
  } catch {
    return 'installer.bin'
  }
}

function defaultCreateId(): string {
  if (runtimeCrypto !== undefined && typeof runtimeCrypto.randomUUID === 'function') {
    return runtimeCrypto.randomUUID()
  }
  return `download-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function defaultSleep(milliseconds: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}

function defaultDigest(bytes: ArrayBuffer): Promise<ArrayBuffer> {
  if (runtimeCrypto === undefined || runtimeCrypto.subtle === undefined) {
    return Promise.reject(new Error('cryptography is unavailable'))
  }
  return runtimeCrypto.subtle.digest('SHA-256', bytes)
}

function createTask(request: DownloadRequest, id: string, now: number): DownloadTask {
  return {
    id,
    appId: request.appId,
    appName: request.appName,
    appVersion: request.appVersion?.trim() || null,
    icon: request.icon ?? null,
    iconColor: request.iconColor ?? null,
    platform: request.platform,
    architecture: request.architecture ?? null,
    artifactId: request.artifactId ?? null,
    packageFormat: request.packageFormat ?? '',
    fileName:
      request.fileName
      ?? installerFileName({
        appName: request.appName,
        appVersion: request.appVersion,
        platform: request.platform,
        architecture: request.architecture,
        packageFormat: request.packageFormat,
      }),
    url: request.url,
    totalBytes: request.expectedBytes ?? null,
    receivedBytes: 0,
    bytesPerSecond: 0,
    status: 'queued',
    purpose: request.purpose,
    error: null,
    attempts: 0,
    createdAt: now,
    updatedAt: now,
    startedAt: null,
    completedAt: null,
    etag: null,
    lastModified: null,
    checksumSha256: normalizeChecksum(request.checksumSha256),
    savedAt: null,
    savedPath: null,
    installRecordedAt: null,
  }
}

/**
 * Restore a persisted task and fill fields added after it was written.
 * @param raw - stored record.
 * @param now - restore time used for missing timestamps.
 * @returns a complete task safe for the transfer loop.
 */
function restoreTask(raw: DownloadTask, now: number): DownloadTask {
  return {
    ...createTask(
      {
        appId: raw.appId,
        appName: raw.appName,
        platform: raw.platform,
        url: raw.url,
        purpose: raw.purpose === 'download' ? 'download' : 'install',
        ...(raw.architecture === null ? {} : { architecture: raw.architecture }),
        ...(raw.artifactId === null ? {} : { artifactId: raw.artifactId }),
        ...(raw.packageFormat ? { packageFormat: raw.packageFormat } : {}),
        ...(raw.fileName ? { fileName: raw.fileName } : {}),
        ...(raw.totalBytes === null ? {} : { expectedBytes: raw.totalBytes }),
        ...(raw.checksumSha256 === null ? {} : { checksumSha256: raw.checksumSha256 }),
        ...(raw.appVersion === null ? {} : { appVersion: raw.appVersion }),
        ...(raw.icon === null ? {} : { icon: raw.icon }),
        ...(raw.iconColor === null ? {} : { iconColor: raw.iconColor }),
      },
      raw.id ?? defaultCreateId(),
      typeof raw.createdAt === 'number' ? raw.createdAt : now,
    ),
    receivedBytes: Number.isFinite(raw.receivedBytes) ? raw.receivedBytes : 0,
    bytesPerSecond: 0,
    status: normalizeStatus(raw.status),
    error: typeof raw.error === 'string' ? raw.error : null,
    attempts: Number.isFinite(raw.attempts) ? raw.attempts : 0,
    updatedAt: Number.isFinite(raw.updatedAt) ? raw.updatedAt : now,
    startedAt: typeof raw.startedAt === 'number' ? raw.startedAt : null,
    completedAt: typeof raw.completedAt === 'number' ? raw.completedAt : null,
    etag: typeof raw.etag === 'string' ? raw.etag : null,
    lastModified: typeof raw.lastModified === 'string' ? raw.lastModified : null,
    savedAt: typeof raw.savedAt === 'number' ? raw.savedAt : null,
    savedPath: typeof raw.savedPath === 'string' ? raw.savedPath : null,
    installRecordedAt: typeof raw.installRecordedAt === 'number' ? raw.installRecordedAt : null,
  }
}

function normalizeStatus(status: unknown): DownloadTaskStatus {
  return status === 'downloading'
    || status === 'paused'
    || status === 'completed'
    || status === 'failed'
    || status === 'cancelled'
    || status === 'queued'
    ? status
    : 'queued'
}

/** Generic resumable download queue. */
export class DownloadCenter {
  private storage: DownloadStorage
  private readonly fetchImpl: typeof fetch
  private readonly concurrency: number
  private readonly maxAttempts: number
  private readonly retryDelayMs: number
  private readonly progressIntervalMs: number
  private readonly persistIntervalMs: number
  private readonly now: () => number
  private readonly createId: () => string
  private readonly digest: (bytes: ArrayBuffer) => Promise<ArrayBuffer>
  private readonly refreshUrl: ((task: DownloadTask) => Promise<string | undefined>) | undefined
  private readonly onTaskFinished: ((task: DownloadTask) => void) | undefined
  private readonly sleep: (milliseconds: number) => Promise<void>

  private tasks: DownloadTask[] = []
  private snapshot: DownloadCenterSnapshot = {
    tasks: [],
    activeCount: 0,
    queuedCount: 0,
    finishedCount: 0,
  }
  private readonly listeners = new Set<() => void>()
  private readonly controllers = new Map<string, AbortController>()
  private readonly runs = new Map<string, Promise<void>>()
  private readonly speedSamples = new Map<string, { at: number; bytes: number }>()
  private readonly lastPersist = new Map<string, number>()
  private readonly writeChains = new Map<string, Promise<void>>()
  private readyPromise: Promise<void> | undefined
  private hydrated = false
  private lastPublishAt = 0

  constructor(options: DownloadCenterOptions = {}) {
    this.storage = options.storage ?? createDefaultDownloadStorage()
    this.fetchImpl = options.fetchImpl ?? ((input, init) => fetch(input, init))
    this.concurrency = Math.max(1, options.concurrency ?? DEFAULT_CONCURRENCY)
    this.maxAttempts = Math.max(1, options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS)
    this.retryDelayMs = Math.max(0, options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS)
    this.progressIntervalMs = Math.max(0, options.progressIntervalMs ?? DEFAULT_PROGRESS_INTERVAL_MS)
    this.persistIntervalMs = Math.max(1, options.persistIntervalMs ?? DEFAULT_PERSIST_INTERVAL_MS)
    this.now = options.now ?? (() => Date.now())
    this.createId = options.createId ?? defaultCreateId
    this.digest = options.digest ?? defaultDigest
    this.refreshUrl = options.refreshUrl
    this.onTaskFinished = options.onTaskFinished
    this.sleep = options.sleep ?? defaultSleep
  }

  /** Read persisted tasks once and restart interrupted transfers. */
  ready(): Promise<void> {
    this.readyPromise ??= this.hydrate()
    return this.readyPromise
  }

  /** @returns the current immutable queue view. */
  getSnapshot = (): DownloadCenterSnapshot => this.snapshot

  /** Observe queue changes. */
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /** @returns a task by id, or undefined. */
  getTask(id: string): DownloadTask | undefined {
    return this.tasks.find((task) => task.id === id)
  }

  /**
   * Add one installer to the queue. An existing queued, downloading, or paused
   * task for the same build is returned instead of starting a second transfer.
   * @param request - installer identity and source.
   * @returns the queued task.
   */
  async enqueue(request: DownloadRequest): Promise<DownloadTask> {
    await this.ready()
    const existing = this.tasks.find(
      (task) =>
        ACTIVE_STATUSES.includes(task.status)
        && task.purpose === request.purpose
        && task.appId === request.appId
        && task.artifactId === (request.artifactId ?? null)
        && task.platform === request.platform
        && task.architecture === (request.architecture ?? null),
    )
    if (existing !== undefined) {
      return { ...existing }
    }
    const now = this.now()
    const task = createTask(request, this.createId(), now)
    this.tasks.push(task)
    await this.storage.save(task).catch(() => undefined)
    this.publish(true)
    this.pump()
    return { ...task }
  }

  /** Pause a queued or transferring task; received bytes stay persisted. */
  async pause(id: string): Promise<void> {
    const task = this.getTask(id)
    if (task === undefined) return
    if (task.status !== 'downloading' && task.status !== 'queued') return
    const controller = this.controllers.get(id)
    task.status = 'paused'
    task.bytesPerSecond = 0
    task.error = null
    controller?.abort()
    await this.persist(task)
    this.publish(true)
  }

  /** Resume a paused or failed task from its persisted byte offset. */
  async resume(id: string): Promise<void> {
    const task = this.getTask(id)
    if (task === undefined) return
    if (task.status !== 'paused' && task.status !== 'failed') return
    task.status = 'queued'
    task.error = null
    task.attempts = 0
    task.bytesPerSecond = 0
    await this.persist(task)
    this.publish(true)
    this.pump()
  }

  /** Retry a failed or cancelled task; cancelled bytes are discarded first. */
  async retry(id: string): Promise<void> {
    const task = this.getTask(id)
    if (task === undefined) return
    if (task.status !== 'failed' && task.status !== 'cancelled') return
    if (task.status === 'cancelled') {
      await this.clearBytes(task)
    }
    task.status = 'queued'
    task.error = null
    task.attempts = 0
    task.bytesPerSecond = 0
    await this.persist(task)
    this.publish(true)
    this.pump()
  }

  /** Cancel a task and discard its partial bytes. */
  async cancel(id: string): Promise<void> {
    const task = this.getTask(id)
    if (task === undefined) return
    if (FINISHED_STATUSES.includes(task.status)) return
    task.status = 'cancelled'
    task.bytesPerSecond = 0
    task.error = null
    this.controllers.get(id)?.abort()
    await this.runs.get(id)?.catch(() => undefined)
    await this.clearBytes(task)
    await this.persist(task)
    this.publish(true)
  }

  /** Delete one task record and its bytes. */
  async remove(id: string): Promise<void> {
    const task = this.getTask(id)
    if (task === undefined) return
    this.controllers.get(id)?.abort()
    await this.runs.get(id)?.catch(() => undefined)
    this.tasks = this.tasks.filter((entry) => entry.id !== id)
    this.speedSamples.delete(id)
    this.lastPersist.delete(id)
    await this.writeChains.get(id)?.catch(() => undefined)
    this.writeChains.delete(id)
    await this.storage.delete(id).catch(() => undefined)
    this.publish(true)
  }

  /** Remove every completed and cancelled task. */
  async clearFinished(): Promise<void> {
    const finished = this.tasks.filter((task) => task.status === 'completed' || task.status === 'cancelled')
    for (const task of finished) {
      this.tasks = this.tasks.filter((entry) => entry.id !== task.id)
      await this.writeChains.get(task.id)?.catch(() => undefined)
      this.writeChains.delete(task.id)
      await this.storage.delete(task.id).catch(() => undefined)
    }
    if (finished.length > 0) {
      this.publish(true)
    }
  }

  /** Pause every queued or transferring task. */
  async pauseAll(): Promise<void> {
    for (const task of [...this.tasks]) {
      if (task.status === 'downloading' || task.status === 'queued') {
        await this.pause(task.id)
      }
    }
  }

  /** Resume every paused task. */
  async resumeAll(): Promise<void> {
    for (const task of [...this.tasks]) {
      if (task.status === 'paused') {
        await this.resume(task.id)
      }
    }
  }

  /** @returns the assembled installer bytes, or null when nothing was stored. */
  getBlob(id: string): Promise<Blob | null> {
    return this.storage.readBlob(id)
  }

  /** Record where a completed task was saved to local storage. */
  async markSaved(id: string, path: string | null): Promise<void> {
    const task = this.getTask(id)
    if (task === undefined) return
    task.savedAt = this.now()
    task.savedPath = path
    await this.persist(task)
    this.publish(true)
  }

  /** Record that a completed install was written to the server-backed library. */
  async markInstallRecorded(id: string): Promise<void> {
    const task = this.getTask(id)
    if (task === undefined) return
    task.installRecordedAt = this.now()
    await this.persist(task)
    this.publish(true)
  }

  private async hydrate(): Promise<void> {
    let stored: DownloadTask[] = []
    try {
      const persisted = await this.storage.list()
      stored = Array.isArray(persisted) ? persisted : []
    } catch {
      // A blocked or disabled database must not disable downloads entirely.
      // Rebind to memory storage so the queue still works for this session.
      this.storage = new MemoryDownloadStorage()
      stored = []
    }
    const now = this.now()
    for (const raw of stored.sort((left, right) => left.createdAt - right.createdAt)) {
      let task: DownloadTask
      try {
        task = restoreTask(raw, now)
      } catch {
        continue
      }
      try {
        const storedBytes = await this.storage.chunkBytes(task.id)
        if (storedBytes !== task.receivedBytes) {
          task.receivedBytes = storedBytes
        }
      } catch {
        // Keep the recorded offset; the first range request will correct it.
      }
      if (task.status === 'downloading') {
        // A reload interrupts the transfer; resume it from persisted bytes.
        task.status = 'queued'
      }
      this.tasks.push(task)
    }
    this.hydrated = true
    this.publish(true)
    this.pump()
  }

  private pump(): void {
    if (!this.hydrated) return
    const active = this.tasks.filter((task) => task.status === 'downloading').length
    let slots = this.concurrency - active
    if (slots <= 0) return
    for (const task of this.tasks) {
      if (slots <= 0) break
      if (task.status !== 'queued') continue
      this.begin(task)
      slots -= 1
    }
  }

  private begin(task: DownloadTask): void {
    const now = this.now()
    task.status = 'downloading'
    task.error = null
    task.attempts = 0
    task.startedAt ??= now
    task.updatedAt = now
    const controller = new AbortController()
    this.controllers.set(task.id, controller)
    void this.persist(task)
    this.publish(true)
    const run = this.download(task, controller)
    this.runs.set(task.id, run)
    void run.finally(() => {
      if (this.runs.get(task.id) === run) {
        this.runs.delete(task.id)
      }
    }).catch(() => undefined)
  }

  private async download(task: DownloadTask, controller: AbortController): Promise<void> {
    try {
      for (;;) {
        if (this.isStopped(task, controller)) return
        try {
          await this.transfer(task, controller)
          if (this.isStopped(task, controller)) return
          await this.complete(task)
          return
        } catch (error) {
          if (this.isStopped(task, controller) || isAbortError(error)) return
          if (error instanceof IntegrityError) {
            await this.clearBytes(task)
            await this.fail(task, error)
            return
          }
          task.attempts += 1
          if (task.attempts >= this.maxAttempts) {
            await this.fail(task, error)
            return
          }
          task.error = errorMessage(error)
          task.bytesPerSecond = 0
          await this.persist(task)
          this.publish(true)
          await this.sleep(this.retryDelayMs * task.attempts)
        }
      }
    } finally {
      this.controllers.delete(task.id)
      this.pump()
    }
  }

  private async transfer(task: DownloadTask, controller: AbortController): Promise<void> {
    const signal = controller.signal
    let refreshed = false
    let response: Response
    for (;;) {
      try {
        response = await this.request(task, signal)
      } catch (error) {        if (isAbortError(error)) throw error
        task.error = errorMessage(error)
        throw error
      }
      if ((response.status === 401 || response.status === 403) && !refreshed && this.refreshUrl !== undefined) {
        refreshed = true
        await response.body?.cancel().catch(() => undefined)
        const nextUrl = await this.refreshUrl({ ...task })
        if (nextUrl && nextUrl.trim()) {
          task.url = nextUrl.trim()
          await this.persist(task)
          continue
        }
      }
      break
    }

    if (response.status === 416) {
      await response.body?.cancel().catch(() => undefined)
      const range = parseContentRange(response.headers.get('content-range'))
      if (range?.total !== null && range?.total !== undefined && range.total === task.receivedBytes) {
        return
      }
      await this.clearBytes(task)
      throw new HttpError(416, 'the server rejected the resume offset; restarting the download')
    }

    if (!response.ok) {
      await response.body?.cancel().catch(() => undefined)
      throw new HttpError(response.status)
    }

    if (response.status === 206) {
      const range = parseContentRange(response.headers.get('content-range'))
      if (range?.start !== null && range?.start !== undefined && range.start !== task.receivedBytes) {
        await response.body?.cancel().catch(() => undefined)
        await this.clearBytes(task)
        throw new Error('the server resumed from an unexpected offset; restarting the download')
      }
      if (range?.total !== null && range?.total !== undefined && range.total > 0) {
        task.totalBytes = range.total
      }
    } else {
      // The server ignored the range request (200): discard partial bytes so
      // the file is not stitched from two different representations.
      if (task.receivedBytes > 0) {
        await this.clearBytes(task)
      }
      const header = response.headers.get('content-length')
      const contentLength = header === null ? Number.NaN : Number.parseInt(header, 10)
      if (Number.isFinite(contentLength) && contentLength > 0) {
        task.totalBytes = contentLength
      }
    }

    task.etag = response.headers.get('etag')
    task.lastModified = response.headers.get('last-modified')
    const reader = response.body?.getReader()
    if (reader === undefined) {
      throw new Error('the download response has no body')
    }
    try {
      for (;;) {
        const part = await reader.read()
        if (part.done) break
        if (this.isStopped(task, controller) || signal.aborted) {
          await reader.cancel().catch(() => undefined)
          return
        }
        const bytes = part.value
        if (bytes.byteLength === 0) continue
        const copy = new Uint8Array(bytes.byteLength)
        copy.set(bytes)
        await this.storage.appendChunk(task.id, copy.buffer as ArrayBuffer)
        task.receivedBytes += bytes.byteLength
        this.measureSpeed(task)
        this.persistProgress(task)
        this.publishProgress()
      }
    } finally {
      reader.releaseLock()
    }

    if (task.totalBytes !== null && task.receivedBytes < task.totalBytes) {
      throw new IncompleteDownloadError(task.receivedBytes, task.totalBytes)
    }
  }

  private request(task: DownloadTask, signal: AbortSignal): Promise<Response> {
    const headers: Record<string, string> = {
      Accept: 'application/octet-stream',
    }
    if (task.receivedBytes > 0) {
      headers.Range = `bytes=${task.receivedBytes}-`
      if (task.etag !== null) {
        headers['If-Range'] = task.etag
      } else if (task.lastModified !== null) {
        headers['If-Range'] = task.lastModified
      }
    }
    return this.fetchImpl(task.url, {
      method: 'GET',
      headers,
      signal,
      credentials: 'omit',
      cache: 'no-store',
    })
  }

  private async complete(task: DownloadTask): Promise<void> {
    if (task.totalBytes !== null && task.receivedBytes !== task.totalBytes) {
      throw new IncompleteDownloadError(task.receivedBytes, task.totalBytes)
    }
    if (task.checksumSha256 !== null) {
      const blob = await this.storage.readBlob(task.id)
      if (blob === null) {
        throw new IntegrityError()
      }
      let digest: ArrayBuffer
      try {
        digest = await this.digest(await blob.arrayBuffer())
      } catch {
        // WebCrypto is unavailable on some insecure origins; an optional
        // integrity check must not turn a complete download into a failure.
        return this.finishTask(task)
      }
      if (toHex(digest) !== task.checksumSha256) {
        throw new IntegrityError()
      }
    }
    await this.finishTask(task)
  }

  private async finishTask(task: DownloadTask): Promise<void> {
    task.status = 'completed'
    task.error = null
    task.bytesPerSecond = 0
    task.completedAt = this.now()
    await this.persist(task)
    this.publish(true)
    this.notifyFinished(task)
  }

  private async fail(task: DownloadTask, error: unknown): Promise<void> {
    task.status = 'failed'
    task.error = errorMessage(error)
    task.bytesPerSecond = 0
    await this.persist(task)
    this.publish(true)
    this.notifyFinished(task)
  }

  private notifyFinished(task: DownloadTask): void {
    if (this.onTaskFinished === undefined) return
    try {
      this.onTaskFinished({ ...task })
    } catch {
      // A consumer callback must not break the queue.
    }
  }

  private async clearBytes(task: DownloadTask): Promise<void> {
    task.receivedBytes = 0
    this.speedSamples.delete(task.id)
    await this.storage.clearChunks(task.id).catch(() => undefined)
  }

  private isStopped(task: DownloadTask, controller: AbortController): boolean {
    return controller.signal.aborted || task.status !== 'downloading'
  }

  private measureSpeed(task: DownloadTask): void {
    const now = this.now()
    const sample = this.speedSamples.get(task.id)
    if (sample === undefined) {
      this.speedSamples.set(task.id, { at: now, bytes: task.receivedBytes })
      return
    }
    const elapsed = now - sample.at
    if (elapsed < SPEED_SAMPLE_INTERVAL_MS) return
    const delta = task.receivedBytes - sample.bytes
    task.bytesPerSecond = elapsed > 0 ? Math.max(0, Math.round((delta * 1_000) / elapsed)) : 0
    this.speedSamples.set(task.id, { at: now, bytes: task.receivedBytes })
  }

  private persistProgress(task: DownloadTask): void {
    const now = this.now()
    const last = this.lastPersist.get(task.id) ?? 0
    if (now - last < this.persistIntervalMs) return
    this.lastPersist.set(task.id, now)
    task.updatedAt = now
    void this.queueWrite(task)
  }

  private publishProgress(): void {
    const now = this.now()
    if (now - this.lastPublishAt < this.progressIntervalMs) return
    this.publish(true)
  }

  private async persist(task: DownloadTask): Promise<void> {
    task.updatedAt = this.now()
    this.lastPersist.set(task.id, task.updatedAt)
    await this.queueWrite(task)
  }

  /**
   * Serialize writes for one task so a late progress snapshot can never
   * overwrite a newer pause/cancel/complete record in storage.
   */
  private queueWrite(task: DownloadTask): Promise<void> {
    const snapshot = { ...task }
    const previous = this.writeChains.get(task.id) ?? Promise.resolve()
    const next = previous
      .catch(() => undefined)
      .then(() => this.storage.save(snapshot))
      .catch(() => undefined)
    this.writeChains.set(task.id, next)
    return next
  }

  private publish(force = false): void {
    const now = this.now()
    if (!force && now - this.lastPublishAt < this.progressIntervalMs) return
    this.lastPublishAt = now
    const tasks = this.tasks.map((task) => ({ ...task }))
    this.snapshot = {
      tasks,
      activeCount: tasks.filter((task) => task.status === 'downloading').length,
      queuedCount: tasks.filter((task) => task.status === 'queued').length,
      finishedCount: tasks.filter((task) => FINISHED_STATUSES.includes(task.status)).length,
    }
    for (const listener of this.listeners) {
      try {
        listener()
      } catch {
        // One broken observer must not stop the others.
      }
    }
  }
}
