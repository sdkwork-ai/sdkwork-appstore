import { describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'

import { DownloadCenter, parseContentRange } from './manager.ts'
import { downloadProgressPercent, formatDownloadBytes, formatDownloadSpeed, installerFileName } from './format.ts'
import { MemoryDownloadStorage } from './storage.ts'
import type { DownloadCenterOptions } from './types.ts'

const encoder = new TextEncoder()

interface FetchCall {
  url: string
  headers: Record<string, string>
}

function encode(text: string): Uint8Array {
  return encoder.encode(text)
}

function headersOf(init: RequestInit | undefined): Record<string, string> {
  return Object.fromEntries(new Headers(init?.headers).entries())
}

function streamResponse(
  chunks: readonly Uint8Array[],
  init: ResponseInit,
): Response {
  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(chunk)
        controller.close()
      },
    }),
    init,
  )
}

function heldResponse(
  firstChunk: Uint8Array,
  init: ResponseInit,
  signal: AbortSignal | null | undefined,
): Response {
  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(firstChunk)
        signal?.addEventListener('abort', () => {
          try {
            controller.error(new DOMException('Aborted', 'AbortError'))
          } catch {
            // The stream may already be closed.
          }
        })
      },
    }),
    init,
  )
}

async function waitFor(predicate: () => boolean, timeoutMs = 3_000): Promise<void> {
  const started = Date.now()
  while (!predicate()) {
    if (Date.now() - started > timeoutMs) throw new Error('timed out waiting for the download state')
    await new Promise((resolve) => setTimeout(resolve, 5))
  }
}

function clock(start = 1_000): () => number {
  let value = start
  return () => {
    value += 10
    return value
  }
}

async function createCenter(
  fetchImpl: typeof fetch,
  storage = new MemoryDownloadStorage(),
  overrides: Partial<DownloadCenterOptions> = {},
): Promise<DownloadCenter> {
  const center = new DownloadCenter({
    storage,
    fetchImpl,
    now: clock(),
    progressIntervalMs: 0,
    retryDelayMs: 0,
    ...overrides,
  })
  await center.ready()
  return center
}

const BASE_REQUEST = {
  appId: 'app-1',
  appName: 'Bird Tool',
  platform: 'windows',
  purpose: 'install' as const,
}

describe('DownloadCenter', () => {
  it('downloads a file, reports progress, and assembles the bytes', async () => {
    const calls: FetchCall[] = []
    const fetchImpl: typeof fetch = async (_input, init) => {
      calls.push({ url: String(_input), headers: headersOf(init) })
      return streamResponse([encode('abc'), encode('def')], {
        status: 200,
        headers: { 'content-length': '6' },
      })
    }
    const center = await createCenter(fetchImpl)
    const task = await center.enqueue({
      ...BASE_REQUEST,
      url: 'https://dl.example/tool.msi',
      packageFormat: 'msi',
    })
    await waitFor(() => center.getTask(task.id)?.status === 'completed')

    const completed = center.getTask(task.id)
    expect(completed?.receivedBytes).toBe(6)
    expect(completed?.totalBytes).toBe(6)
    expect(completed?.fileName).toBe('Bird Tool-windows.msi')
    expect(completed?.completedAt).not.toBeNull()
    expect(calls).toHaveLength(1)
    expect(calls[0]?.headers.range).toBeUndefined()
    expect(await (await center.getBlob(task.id))?.text()).toBe('abcdef')
  })

  it('pauses mid-transfer and resumes from the persisted byte offset', async () => {
    const calls: FetchCall[] = []
    const fetchImpl: typeof fetch = async (_input, init) => {
      calls.push({ url: String(_input), headers: headersOf(init) })
      if (calls.length === 1) {
        return heldResponse(encode('abc'), { status: 200, headers: { 'content-length': '6' } }, init?.signal)
      }
      return streamResponse([encode('def')], {
        status: 206,
        headers: { 'content-range': 'bytes 3-5/6', 'content-length': '3' },
      })
    }
    const center = await createCenter(fetchImpl)
    const task = await center.enqueue({
      ...BASE_REQUEST,
      url: 'https://dl.example/tool.msi',
      expectedBytes: 6,
    })

    await waitFor(() => (center.getTask(task.id)?.receivedBytes ?? 0) >= 3)
    await center.pause(task.id)
    expect(center.getTask(task.id)?.status).toBe('paused')

    await center.resume(task.id)
    await waitFor(() => center.getTask(task.id)?.status === 'completed')

    expect(calls[1]?.headers.range).toBe('bytes=3-')
    expect(await (await center.getBlob(task.id))?.text()).toBe('abcdef')
  })

  it('restarts cleanly when the server ignores the range request', async () => {
    const calls: FetchCall[] = []
    const fetchImpl: typeof fetch = async (_input, init) => {
      calls.push({ url: String(_input), headers: headersOf(init) })
      if (calls.length === 1) {
        return heldResponse(encode('abc'), { status: 200, headers: { 'content-length': '6' } }, init?.signal)
      }
      return streamResponse([encode('abcdef')], {
        status: 200,
        headers: { 'content-length': '6' },
      })
    }
    const center = await createCenter(fetchImpl)
    const task = await center.enqueue({
      ...BASE_REQUEST,
      url: 'https://dl.example/tool.msi',
      expectedBytes: 6,
    })
    await waitFor(() => (center.getTask(task.id)?.receivedBytes ?? 0) >= 3)
    await center.pause(task.id)
    await center.resume(task.id)
    await waitFor(() => center.getTask(task.id)?.status === 'completed')

    expect(calls[1]?.headers.range).toBe('bytes=3-')
    expect(center.getTask(task.id)?.receivedBytes).toBe(6)
    expect(await (await center.getBlob(task.id))?.text()).toBe('abcdef')
  })

  it('cancels a transfer and discards its partial bytes', async () => {
    const fetchImpl: typeof fetch = async (_input, init) => {
      return heldResponse(encode('abc'), { status: 200, headers: { 'content-length': '6' } }, init?.signal)
    }
    const storage = new MemoryDownloadStorage()
    const center = await createCenter(fetchImpl, storage)
    const task = await center.enqueue({
      ...BASE_REQUEST,
      url: 'https://dl.example/tool.msi',
      expectedBytes: 6,
    })
    await waitFor(() => (center.getTask(task.id)?.receivedBytes ?? 0) >= 3)
    await center.cancel(task.id)
    expect(center.getTask(task.id)?.status).toBe('cancelled')
    expect(center.getTask(task.id)?.receivedBytes).toBe(0)
    expect(await storage.chunkBytes(task.id)).toBe(0)
    expect(await center.getBlob(task.id)).toBeNull()
  })

  it('retries a network failure and resumes from received bytes', async () => {
    const calls: FetchCall[] = []
    const fetchImpl: typeof fetch = async (_input, init) => {
      calls.push({ url: String(_input), headers: headersOf(init) })
      if (calls.length === 1) {
        return new Response(
          new ReadableStream<Uint8Array>({
            start(controller) {
              controller.enqueue(encode('ab'))
            },
            pull(controller) {
              controller.error(new Error('connection reset'))
            },
          }),
          { status: 200, headers: { 'content-length': '4' } },
        )
      }
      return streamResponse([encode('cd')], {
        status: 206,
        headers: { 'content-range': 'bytes 2-3/4', 'content-length': '2' },
      })
    }
    const center = await createCenter(fetchImpl, new MemoryDownloadStorage(), { maxAttempts: 2 })
    const task = await center.enqueue({
      ...BASE_REQUEST,
      url: 'https://dl.example/tool.msi',
      expectedBytes: 4,
    })
    await waitFor(() => center.getTask(task.id)?.status === 'completed')
    expect(calls).toHaveLength(2)
    expect(calls[1]?.headers.range).toBe('bytes=2-')
    expect(await (await center.getBlob(task.id))?.text()).toBe('abcd')
  })

  it('marks a task failed after the automatic attempts are exhausted', async () => {
    const fetchImpl: typeof fetch = async () => {
      throw new Error('network down')
    }
    const center = await createCenter(fetchImpl, new MemoryDownloadStorage(), { maxAttempts: 2 })
    const task = await center.enqueue({ ...BASE_REQUEST, url: 'https://dl.example/tool.msi' })
    await waitFor(() => center.getTask(task.id)?.status === 'failed')
    expect(center.getTask(task.id)?.error).toContain('network down')
  })

  it('rejects a checksum mismatch and clears the bytes', async () => {
    const fetchImpl: typeof fetch = async () => {
      return streamResponse([encode('abcdef')], {
        status: 200,
        headers: { 'content-length': '6' },
      })
    }
    const center = await createCenter(fetchImpl, new MemoryDownloadStorage(), {
      digest: async () => new Uint8Array([0, 0, 0, 0]).buffer,
    })
    const task = await center.enqueue({
      ...BASE_REQUEST,
      url: 'https://dl.example/tool.msi',
      checksumSha256: 'f'.repeat(64),
      expectedBytes: 6,
    })
    await waitFor(() => center.getTask(task.id)?.status === 'failed')
    expect(center.getTask(task.id)?.error).toContain('checksum')
    expect(center.getTask(task.id)?.receivedBytes).toBe(0)
    expect(await center.getBlob(task.id)).toBeNull()
  })

  it('accepts a published sha256-prefixed checksum and verifies the bytes', async () => {
    const digest = createHash('sha256').update('abcdef').digest('hex')
    const fetchImpl: typeof fetch = async () =>
      streamResponse([encode('abcdef')], { status: 200, headers: { 'content-length': '6' } })
    const center = await createCenter(fetchImpl)
    const task = await center.enqueue({
      ...BASE_REQUEST,
      url: 'https://dl.example/tool.msi',
      checksumSha256: `sha256:${digest}`,
      expectedBytes: 6,
    })
    await waitFor(() => center.getTask(task.id)?.status === 'completed')
    expect(center.getTask(task.id)?.checksumSha256).toBe(digest)
  })

  it('restores a paused task from storage and resumes it in a new center', async () => {
    const storage = new MemoryDownloadStorage()
    const calls: FetchCall[] = []
    const firstFetch: typeof fetch = async (_input, init) => {
      calls.push({ url: String(_input), headers: headersOf(init) })
      return heldResponse(encode('abc'), { status: 200, headers: { 'content-length': '6' } }, init?.signal)
    }
    const first = await createCenter(firstFetch, storage)
    const task = await first.enqueue({
      ...BASE_REQUEST,
      url: 'https://dl.example/tool.msi',
      expectedBytes: 6,
    })
    await waitFor(() => (first.getTask(task.id)?.receivedBytes ?? 0) >= 3)
    await first.pause(task.id)

    const secondFetch: typeof fetch = async (_input, init) => {
      calls.push({ url: String(_input), headers: headersOf(init) })
      return streamResponse([encode('def')], {
        status: 206,
        headers: { 'content-range': 'bytes 3-5/6', 'content-length': '3' },
      })
    }
    const second = await createCenter(secondFetch, storage)
    const restored = second.getTask(task.id)
    expect(restored?.status).toBe('paused')
    expect(restored?.receivedBytes).toBe(3)
    await second.resume(task.id)
    await waitFor(() => second.getTask(task.id)?.status === 'completed')
    expect(calls[calls.length - 1]?.headers.range).toBe('bytes=3-')
    expect(await (await second.getBlob(task.id))?.text()).toBe('abcdef')
  })

  it('restores an interrupted transfer as queued and resumes it automatically', async () => {
    const storage = new MemoryDownloadStorage()
    const firstCalls: FetchCall[] = []
    const firstFetch: typeof fetch = async (_input, init) => {
      firstCalls.push({ url: String(_input), headers: headersOf(init) })
      return heldResponse(encode('abc'), { status: 200, headers: { 'content-length': '6' } }, init?.signal)
    }
    const first = await createCenter(firstFetch, storage)
    const task = await first.enqueue({
      ...BASE_REQUEST,
      url: 'https://dl.example/tool.msi',
      expectedBytes: 6,
    })
    await waitFor(() => (first.getTask(task.id)?.receivedBytes ?? 0) >= 3)

    // A new center represents a page reload while the first transfer was still
    // marked downloading; hydration must reconcile the persisted chunks and
    // restart from the first missing byte.
    const secondFetch: typeof fetch = async (_input, init) => {
      firstCalls.push({ url: String(_input), headers: headersOf(init) })
      return streamResponse([encode('def')], {
        status: 206,
        headers: { 'content-range': 'bytes 3-5/6', 'content-length': '3' },
      })
    }
    const second = await createCenter(secondFetch, storage)
    await waitFor(() => second.getTask(task.id)?.status === 'completed')
    expect(firstCalls[firstCalls.length - 1]?.headers.range).toBe('bytes=3-')
    expect(await (await second.getBlob(task.id))?.text()).toBe('abcdef')
  })

  it('completes a task when the server reports the resume offset is already satisfied', async () => {
    const storage = new MemoryDownloadStorage()
    const seedFetch: typeof fetch = async () =>
      streamResponse([encode('abcdef')], { status: 200, headers: { 'content-length': '6' } })
    const seeded = await createCenter(seedFetch, storage)
    const task = await seeded.enqueue({
      ...BASE_REQUEST,
      url: 'https://dl.example/tool.msi',
      expectedBytes: 6,
    })
    await waitFor(() => seeded.getTask(task.id)?.status === 'completed')
    const persisted = seeded.getTask(task.id)
    if (persisted === undefined) throw new Error('missing seeded task')
    await storage.save({
      ...persisted,
      status: 'paused',
      receivedBytes: 6,
      completedAt: null,
    })

    const fetchImpl: typeof fetch = async (_input, init) => {
      expect(headersOf(init).range).toBe('bytes=6-')
      return new Response(null, {
        status: 416,
        headers: { 'content-range': 'bytes */6' },
      })
    }
    const center = await createCenter(fetchImpl, storage)
    await center.resume(task.id)
    await waitFor(() => center.getTask(task.id)?.status === 'completed')
    expect(await (await center.getBlob(task.id))?.text()).toBe('abcdef')
  })

  it('removes a task record and its downloaded bytes', async () => {
    const storage = new MemoryDownloadStorage()
    const fetchImpl: typeof fetch = async () =>
      streamResponse([encode('abc')], { status: 200, headers: { 'content-length': '3' } })
    const center = await createCenter(fetchImpl, storage)
    const task = await center.enqueue({ ...BASE_REQUEST, url: 'https://dl.example/tool.msi' })
    await waitFor(() => center.getTask(task.id)?.status === 'completed')
    await center.remove(task.id)
    expect(center.getTask(task.id)).toBeUndefined()
    expect(await storage.chunkBytes(task.id)).toBe(0)
  })

  it('re-mints an expired presigned URL after a rejected request', async () => {
    const calls: FetchCall[] = []
    const fetchImpl: typeof fetch = async (_input, init) => {
      calls.push({ url: String(_input), headers: headersOf(init) })
      if (calls.length === 1) {
        return new Response(null, { status: 403 })
      }
      return streamResponse([encode('ok')], {
        status: 200,
        headers: { 'content-length': '2' },
      })
    }
    const center = await createCenter(fetchImpl, new MemoryDownloadStorage(), {
      refreshUrl: async () => 'https://dl.example/fresh.msi',
    })
    const task = await center.enqueue({ ...BASE_REQUEST, url: 'https://dl.example/expired.msi' })
    await waitFor(() => center.getTask(task.id)?.status === 'completed')
    expect(calls).toHaveLength(2)
    expect(calls[1]?.url).toBe('https://dl.example/fresh.msi')
    expect(center.getTask(task.id)?.url).toBe('https://dl.example/fresh.msi')
  })

  it('runs installers one at a time and starts the queued task afterwards', async () => {
    let active = 0
    let maxActive = 0
    const fetchImpl: typeof fetch = async () => {
      active += 1
      maxActive = Math.max(maxActive, active)
      return new Response(
        new ReadableStream<Uint8Array>({
          start(controller) {
            setTimeout(() => {
              controller.enqueue(encode('x'))
              controller.close()
              active -= 1
            }, 5)
          },
        }),
        { status: 200, headers: { 'content-length': '1' } },
      )
    }
    const center = await createCenter(fetchImpl)
    const first = await center.enqueue({
      ...BASE_REQUEST,
      appId: 'app-1',
      url: 'https://dl.example/one.msi',
      expectedBytes: 1,
    })
    const second = await center.enqueue({
      ...BASE_REQUEST,
      appId: 'app-2',
      url: 'https://dl.example/two.msi',
      expectedBytes: 1,
    })
    await waitFor(
      () =>
        center.getTask(first.id)?.status === 'completed'
        && center.getTask(second.id)?.status === 'completed',
    )
    expect(maxActive).toBe(1)
  })

  it('deduplicates an active task for the same build', async () => {
    const fetchImpl: typeof fetch = async (_input, init) => {
      return heldResponse(encode('a'), { status: 200, headers: { 'content-length': '2' } }, init?.signal)
    }
    const center = await createCenter(fetchImpl)
    const first = await center.enqueue({ ...BASE_REQUEST, url: 'https://dl.example/tool.msi' })
    const second = await center.enqueue({ ...BASE_REQUEST, url: 'https://dl.example/tool.msi' })
    expect(second.id).toBe(first.id)
    await center.cancel(first.id)
  })

  it('pauses every active task and clears finished records', async () => {
    const fetchImpl: typeof fetch = async (_input, init) => {
      return heldResponse(encode('a'), { status: 200, headers: { 'content-length': '2' } }, init?.signal)
    }
    const center = await createCenter(fetchImpl)
    const task = await center.enqueue({ ...BASE_REQUEST, url: 'https://dl.example/tool.msi' })
    await waitFor(() => (center.getTask(task.id)?.receivedBytes ?? 0) >= 1)
    await center.pauseAll()
    expect(center.getTask(task.id)?.status).toBe('paused')
    await center.resumeAll()
    expect(['queued', 'downloading', 'completed']).toContain(center.getTask(task.id)?.status)
    await center.cancel(task.id)
    await center.clearFinished()
    expect(center.getTask(task.id)).toBeUndefined()
  })

  it('pauses a queued task before it starts and resumes it later', async () => {
    const calls: string[] = []
    let active = 0
    const fetchImpl: typeof fetch = async (input) => {
      calls.push(String(input))
      active += 1
      if (active === 1) {
        return new Response(
          new ReadableStream<Uint8Array>({
            start(controller) {
              setTimeout(() => {
                controller.enqueue(encode('one'))
                controller.close()
                active -= 1
              }, 10)
            },
          }),
          { status: 200, headers: { 'content-length': '3' } },
        )
      }
      return streamResponse([encode('two')], { status: 200, headers: { 'content-length': '3' } })
    }
    const center = await createCenter(fetchImpl)
    const first = await center.enqueue({ ...BASE_REQUEST, appId: 'app-1', url: 'https://dl.example/one.msi' })
    const second = await center.enqueue({ ...BASE_REQUEST, appId: 'app-2', url: 'https://dl.example/two.msi' })
    expect(center.getTask(second.id)?.status).toBe('queued')
    await center.pause(second.id)
    expect(center.getTask(second.id)?.status).toBe('paused')
    expect(calls).toHaveLength(1)
    await waitFor(() => center.getTask(first.id)?.status === 'completed')
    await center.resume(second.id)
    await waitFor(() => center.getTask(second.id)?.status === 'completed')
    expect(calls).toHaveLength(2)
  })

  it('removes an active task and aborts its transfer', async () => {
    const storage = new MemoryDownloadStorage()
    const fetchImpl: typeof fetch = async (_input, init) =>
      heldResponse(encode('abc'), { status: 200, headers: { 'content-length': '6' } }, init?.signal)
    const center = await createCenter(fetchImpl, storage)
    const task = await center.enqueue({ ...BASE_REQUEST, url: 'https://dl.example/tool.msi' })
    await waitFor(() => (center.getTask(task.id)?.receivedBytes ?? 0) >= 3)
    await center.remove(task.id)
    expect(center.getTask(task.id)).toBeUndefined()
    expect(await storage.chunkBytes(task.id)).toBe(0)
  })

  it('falls back to memory storage when the persisted queue cannot be read', async () => {
    class BlockedStorage extends MemoryDownloadStorage {
      override async list(): Promise<never> {
        throw new Error('storage blocked')
      }
    }
    const fetchImpl: typeof fetch = async () =>
      streamResponse([encode('ok')], { status: 200, headers: { 'content-length': '2' } })
    const center = await createCenter(fetchImpl, new BlockedStorage())
    const task = await center.enqueue({ ...BASE_REQUEST, url: 'https://dl.example/tool.msi' })
    await waitFor(() => center.getTask(task.id)?.status === 'completed')
    expect(center.getTask(task.id)?.receivedBytes).toBe(2)
  })

  it('publishes active and queued counts to observers', async () => {
    const fetchImpl: typeof fetch = async (_input, init) =>
      heldResponse(encode('a'), { status: 200, headers: { 'content-length': '2' } }, init?.signal)
    const center = await createCenter(fetchImpl)
    await center.enqueue({ ...BASE_REQUEST, appId: 'app-1', url: 'https://dl.example/one.msi' })
    await center.enqueue({ ...BASE_REQUEST, appId: 'app-2', url: 'https://dl.example/two.msi' })
    expect(center.getSnapshot().activeCount).toBe(1)
    expect(center.getSnapshot().queuedCount).toBe(1)
    expect(center.getSnapshot().tasks).toHaveLength(2)
    await center.pauseAll()
    await center.cancel(center.getSnapshot().tasks[0]!.id)
    await center.cancel(center.getSnapshot().tasks[1]!.id)
  })
})

describe('parseContentRange', () => {
  it('reads the offset and total of a range response', () => {
    expect(parseContentRange('bytes 3-5/6')).toEqual({ start: 3, total: 6 })
  })

  it('reads an unsatisfied range and rejects malformed headers', () => {
    expect(parseContentRange('bytes */6')).toEqual({ start: null, total: 6 })
    expect(parseContentRange('bytes */unknown')).toBeNull()
    expect(parseContentRange(null)).toBeNull()
  })
})

describe('download formatting', () => {
  it('formats byte counts and speeds', () => {
    expect(formatDownloadBytes(512)).toBe('512 B')
    expect(formatDownloadBytes(2_048)).toBe('2.0 KB')
    expect(formatDownloadBytes(5 * 1024 * 1024)).toBe('5.0 MB')
    expect(formatDownloadBytes(null)).toBe('\u2014')
    expect(formatDownloadSpeed(4_194_304)).toBe('4.0 MB/s')
    expect(formatDownloadSpeed(0)).toBe('\u2014')
  })

  it('reports a bounded progress percentage', () => {
    expect(downloadProgressPercent(5, 10)).toBe(50)
    expect(downloadProgressPercent(15, 10)).toBe(100)
    expect(downloadProgressPercent(1, null)).toBe(0)
  })

  it('builds a filesystem-safe installer file name', () => {
    expect(
      installerFileName({
        appName: 'Bird: Tool',
        appVersion: '1.2.0',
        platform: 'windows',
        architecture: 'x64',
        packageFormat: 'msi',
      }),
    ).toBe('Bird Tool-1.2.0-windows-x64.msi')
    expect(installerFileName({ appName: '', platform: 'macos', packageFormat: 'dmg' })).toBe(
      'macos.dmg',
    )
  })
})

