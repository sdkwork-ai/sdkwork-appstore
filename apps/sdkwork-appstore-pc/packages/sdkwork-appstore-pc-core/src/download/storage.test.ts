import { describe, expect, it } from 'vitest'

import { DownloadCenter } from './manager.ts'
import {
  createScopedDownloadStorage,
  downloadStorageRecordMatchesScope,
  downloadStorageScopeKey,
  MemoryDownloadStorage,
} from './storage.ts'
import type { DownloadTask } from './types.ts'

const ALICE = { tenantId: 'tenant-1', userId: 'user-alice' }
const BOB = { tenantId: 'tenant-1', userId: 'user-bob' }
const ANONYMOUS = { tenantId: '', userId: '' }

function makeTask(id: string, overrides: Partial<DownloadTask> = {}): DownloadTask {
  return {
    id,
    appId: 'app-1',
    appName: 'Bird Tool',
    appVersion: null,
    icon: null,
    iconColor: null,
    platform: 'windows',
    architecture: null,
    artifactId: null,
    packageFormat: 'msi',
    fileName: 'Bird Tool-windows.msi',
    url: 'https://dl.example/tool.msi?signature=secret',
    totalBytes: 6,
    receivedBytes: 0,
    bytesPerSecond: 0,
    status: 'paused',
    purpose: 'install',
    error: null,
    attempts: 0,
    createdAt: 1_000,
    updatedAt: 1_000,
    startedAt: null,
    completedAt: null,
    etag: null,
    lastModified: null,
    checksumSha256: null,
    savedAt: null,
    savedPath: null,
    installRecordedAt: null,
    ...overrides,
  }
}

describe('download storage account scoping', () => {
  it('builds distinct scope keys and keeps the anonymous scope separate', () => {
    expect(downloadStorageScopeKey(ALICE)).not.toBe(downloadStorageScopeKey(BOB))
    expect(downloadStorageScopeKey(ANONYMOUS)).toBe('\u0000')
    expect(downloadStorageScopeKey(undefined)).toBeUndefined()
  })

  it('fails closed for records written before scoping existed', () => {
    const aliceKey = downloadStorageScopeKey(ALICE)
    expect(downloadStorageRecordMatchesScope(undefined, undefined)).toBe(true)
    expect(downloadStorageRecordMatchesScope(aliceKey, aliceKey)).toBe(true)
    expect(downloadStorageRecordMatchesScope(undefined, aliceKey)).toBe(false)
    expect(downloadStorageRecordMatchesScope('other-scope', aliceKey)).toBe(false)
    expect(downloadStorageRecordMatchesScope(aliceKey, undefined)).toBe(true)
  })

  it('never lists one account tasks for another account or anonymous', async () => {
    const alice = new MemoryDownloadStorage(ALICE)
    const bob = new MemoryDownloadStorage(BOB)
    const anonymous = new MemoryDownloadStorage(ANONYMOUS)

    await alice.save(makeTask('alice-task'))

    expect((await alice.list()).map((task) => task.id)).toEqual(['alice-task'])
    expect(await bob.list()).toEqual([])
    expect(await anonymous.list()).toEqual([])
  })

  it('does not expose legacy unscoped tasks to a scoped account', async () => {
    const legacy = new MemoryDownloadStorage()
    await legacy.save(makeTask('legacy-task'))

    expect((await legacy.list()).map((task) => task.id)).toEqual(['legacy-task'])
    expect(await new MemoryDownloadStorage(ALICE).list()).toEqual([])
  })

  it('creates scoped storage through the factory', async () => {
    const storage = createScopedDownloadStorage(BOB)
    expect(storage).toBeInstanceOf(MemoryDownloadStorage)

    await storage.save(makeTask('bob-task'))
    expect((await storage.list()).map((task) => task.id)).toEqual(['bob-task'])
  })

  it('hydrates a download center only from the current account records', async () => {
    const aliceStorage = new MemoryDownloadStorage(ALICE)
    await aliceStorage.save(makeTask('paused-installer', { receivedBytes: 3 }))

    const fetchImpl: typeof fetch = async () => new Response(null, { status: 206 })
    const aliceCenter = new DownloadCenter({
      storage: aliceStorage,
      fetchImpl,
      now: () => 2_000,
    })
    await aliceCenter.ready()
    expect(aliceCenter.getTask('paused-installer')?.status).toBe('paused')

    const bobCenter = new DownloadCenter({
      storage: new MemoryDownloadStorage(BOB),
      fetchImpl,
      now: () => 2_000,
    })
    await bobCenter.ready()
    expect(bobCenter.getTask('paused-installer')).toBeUndefined()
  })
})
