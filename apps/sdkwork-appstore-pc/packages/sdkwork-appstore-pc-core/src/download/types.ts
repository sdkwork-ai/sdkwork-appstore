/**
 * Download-center task model.
 *
 * One task is one installer file the storefront is fetching to this machine.
 * The download center owns the queue and the transfer; consumers (the install
 * provider and the Updates page) only read tasks and request transitions.
 */

import type { DownloadStorage } from './storage.ts'

/** Lifecycle of one download task. */
export type DownloadTaskStatus =
  | 'queued'
  | 'downloading'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled'

/** Why the task exists: recorded as an install, or a plain file download. */
export type DownloadTaskPurpose = 'install' | 'download'

/** One persisted install-file download. */
export interface DownloadTask {
  /** Stable task identity; also the storage key. */
  id: string
  /** Listing id the file belongs to. */
  appId: string
  /** Display name shown by the queue and the install dialog. */
  appName: string
  /** Listing version at enqueue time, for diagnostics. */
  appVersion: string | null
  /** Icon metadata copied from the listing so the queue renders offline. */
  icon: string | null
  iconColor: string | null
  /** Desktop platform code the build targets. */
  platform: string
  /** Normalized CPU architecture, or null when the variant carries none. */
  architecture: string | null
  /** Release artifact id, used to re-mint an expired download URL. */
  artifactId: string | null
  /** Package format code (`msi`, `dmg`, ...). */
  packageFormat: string
  /** File name the saved installer uses. */
  fileName: string
  /** Current presigned source URL. */
  url: string
  /** Expected total size in bytes, or null when the server hides it. */
  totalBytes: number | null
  /** Bytes persisted so far; the resume offset for the next request. */
  receivedBytes: number
  /** Last measured transfer speed in bytes per second (display only). */
  bytesPerSecond: number
  /** Current lifecycle state. */
  status: DownloadTaskStatus
  /** Whether completion records an install. */
  purpose: DownloadTaskPurpose
  /** Last failure message, cleared by a successful resume. */
  error: string | null
  /** Automatic attempts spent on the current run. */
  attempts: number
  /** Creation time (epoch milliseconds); also the queue order. */
  createdAt: number
  /** Last state or progress write. */
  updatedAt: number
  /** First time the transfer actually started. */
  startedAt: number | null
  /** Terminal completion time. */
  completedAt: number | null
  /** Validators used to resume a changed remote file safely. */
  etag: string | null
  lastModified: string | null
  /** Optional expected SHA-256 (hex) of the complete file. */
  checksumSha256: string | null
  /** When the file was handed to local storage (Downloads) and where. */
  savedAt: number | null
  savedPath: string | null
  /** When the completed install was recorded in the server-backed library. */
  installRecordedAt: number | null
}

/** Input accepted by {@link DownloadCenter.enqueue}. */
export interface DownloadRequest {
  appId: string
  appName: string
  platform: string
  url: string
  purpose: DownloadTaskPurpose
  artifactId?: string | null
  architecture?: string | null
  packageFormat?: string
  fileName?: string
  expectedBytes?: number | null
  checksumSha256?: string | null
  appVersion?: string | null
  icon?: string | null
  iconColor?: string | null
}

/** Immutable queue view published to React consumers. */
export interface DownloadCenterSnapshot {
  /** Tasks in creation order. */
  tasks: readonly DownloadTask[]
  /** Tasks currently transferring. */
  activeCount: number
  /** Tasks waiting for a worker slot. */
  queuedCount: number
  /** Tasks with a terminal status. */
  finishedCount: number
}

/** Options for one {@link DownloadCenter} instance. */
export interface DownloadCenterOptions {
  /** Persistence adapter; defaults to IndexedDB with a memory fallback. */
  storage?: DownloadStorage
  /** Fetch implementation; defaults to the runtime `fetch`. */
  fetchImpl?: typeof fetch
  /** Concurrent transfers; the storefront runs one installer at a time. */
  concurrency?: number
  /** Automatic attempts per run before the task is marked failed. */
  maxAttempts?: number
  /** Base delay between automatic attempts, multiplied by the attempt index. */
  retryDelayMs?: number
  /** Minimum gap between published progress snapshots. */
  progressIntervalMs?: number
  /** Minimum gap between progress metadata writes. */
  persistIntervalMs?: number
  /** Clock used by persisted timestamps (injectable for tests). */
  now?: () => number
  /** Task id factory (injectable for tests). */
  createId?: () => string
  /** Digest for optional SHA-256 verification (injectable for tests). */
  digest?: (bytes: ArrayBuffer) => Promise<ArrayBuffer>
  /** Re-mint a presigned URL when the current one is rejected by storage. */
  refreshUrl?: (task: DownloadTask) => Promise<string | undefined>
  /** Called once whenever a task reaches `completed` or `failed`. */
  onTaskFinished?: (task: DownloadTask) => void
  /** Timers used for retry and throttling (injectable for tests). */
  sleep?: (milliseconds: number) => Promise<void>
}
