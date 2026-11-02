/**
 * Persistence for download-center tasks.
 *
 * Metadata and transferred bytes are written to IndexedDB so a paused or
 * interrupted installer download survives a reload and resumes from the exact
 * byte offset it had reached. A memory adapter backs environments without
 * IndexedDB (private windows, tests) with the same contract.
 */

import type { DownloadTask } from './types.ts'

/** Persistence contract consumed by {@link DownloadCenter}. */
export interface DownloadStorage {
  /** Read every persisted task. */
  list(): Promise<DownloadTask[]>
  /** Insert or replace one task record. */
  save(task: DownloadTask): Promise<void>
  /** Delete one task and all of its bytes. */
  delete(id: string): Promise<void>
  /** Append one received chunk to a task's byte stream. */
  appendChunk(id: string, chunk: ArrayBuffer): Promise<void>
  /** Total bytes persisted for a task. */
  chunkBytes(id: string): Promise<number>
  /** Assemble the persisted bytes into one blob, or null when none exist. */
  readBlob(id: string): Promise<Blob | null>
  /** Drop every persisted byte while keeping the task record. */
  clearChunks(id: string): Promise<void>
}

const DATABASE_NAME = 'sdkwork-appstore-downloads'
const DATABASE_VERSION = 1
const TASK_STORE = 'tasks'
const CHUNK_STORE = 'chunks'
const CHUNK_INDEX = 'taskId'

interface StoredChunk {
  key: string
  taskId: string
  sequence: number
  data: ArrayBuffer
}

function chunkKey(id: string, sequence: number): string {
  return `${id}:${String(sequence).padStart(10, '0')}`
}

function cloneTask(task: DownloadTask): DownloadTask {
  return { ...task }
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result)
    }
    request.onerror = () => {
      reject(request.error ?? new Error('IndexedDB request failed'))
    }
  })
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => {
      resolve()
    }
    transaction.onerror = () => {
      reject(transaction.error ?? new Error('IndexedDB transaction failed'))
    }
    transaction.onabort = () => {
      reject(transaction.error ?? new Error('IndexedDB transaction aborted'))
    }
  })
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(TASK_STORE)) {
        database.createObjectStore(TASK_STORE, { keyPath: 'id' })
      }
      if (!database.objectStoreNames.contains(CHUNK_STORE)) {
        const chunks = database.createObjectStore(CHUNK_STORE, { keyPath: 'key' })
        chunks.createIndex(CHUNK_INDEX, CHUNK_INDEX, { unique: false })
      }
    }
    request.onsuccess = () => {
      resolve(request.result)
    }
    request.onerror = () => {
      reject(request.error ?? new Error('download storage is unavailable'))
    }
    request.onblocked = () => {
      reject(new Error('download storage is blocked by another window'))
    }
  })
}

/** IndexedDB-backed storage. One shared database serves every task. */
export class IndexedDbDownloadStorage implements DownloadStorage {
  private database: Promise<IDBDatabase> | undefined

  private open(): Promise<IDBDatabase> {
    this.database ??= openDatabase()
    return this.database
  }

  async list(): Promise<DownloadTask[]> {
    const database = await this.open()
    const transaction = database.transaction(TASK_STORE, 'readonly')
    return requestResult(
      transaction.objectStore(TASK_STORE).getAll() as unknown as IDBRequest<DownloadTask[]>,
    )
  }

  async save(task: DownloadTask): Promise<void> {
    const database = await this.open()
    const transaction = database.transaction(TASK_STORE, 'readwrite')
    const done = transactionDone(transaction)
    transaction.objectStore(TASK_STORE).put(cloneTask(task))
    await done
  }

  async delete(id: string): Promise<void> {
    const database = await this.open()
    const transaction = database.transaction([TASK_STORE, CHUNK_STORE], 'readwrite')
    const done = transactionDone(transaction)
    transaction.objectStore(TASK_STORE).delete(id)
    const index = transaction.objectStore(CHUNK_STORE).index(CHUNK_INDEX)
    const cursorRequest = index.openKeyCursor(IDBKeyRange.only(id))
    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result
      if (cursor === null) return
      transaction.objectStore(CHUNK_STORE).delete(cursor.primaryKey)
      cursor.continue()
    }
    await done
  }

  async appendChunk(id: string, chunk: ArrayBuffer): Promise<void> {
    const database = await this.open()
    const transaction = database.transaction(CHUNK_STORE, 'readwrite')
    const done = transactionDone(transaction)
    const store = transaction.objectStore(CHUNK_STORE)
    const countRequest = store.index(CHUNK_INDEX).count(IDBKeyRange.only(id))
    countRequest.onsuccess = () => {
      const sequence = countRequest.result
      const record: StoredChunk = { key: chunkKey(id, sequence), taskId: id, sequence, data: chunk }
      store.put(record)
    }
    await done
  }

  async chunkBytes(id: string): Promise<number> {
    const chunks = await this.readChunks(id)
    return chunks.reduce((total, chunk) => total + chunk.data.byteLength, 0)
  }

  async readBlob(id: string): Promise<Blob | null> {
    const chunks = await this.readChunks(id)
    if (chunks.length === 0) return null
    return new Blob(chunks.map((chunk) => chunk.data), { type: 'application/octet-stream' })
  }

  async clearChunks(id: string): Promise<void> {
    const database = await this.open()
    const transaction = database.transaction(CHUNK_STORE, 'readwrite')
    const done = transactionDone(transaction)
    const index = transaction.objectStore(CHUNK_STORE).index(CHUNK_INDEX)
    const cursorRequest = index.openKeyCursor(IDBKeyRange.only(id))
    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result
      if (cursor === null) return
      transaction.objectStore(CHUNK_STORE).delete(cursor.primaryKey)
      cursor.continue()
    }
    await done
  }

  private async readChunks(id: string): Promise<StoredChunk[]> {
    const database = await this.open()
    const transaction = database.transaction(CHUNK_STORE, 'readonly')
    const index = transaction.objectStore(CHUNK_STORE).index(CHUNK_INDEX)
    const chunks = await requestResult(
      index.getAll(IDBKeyRange.only(id)) as unknown as IDBRequest<StoredChunk[]>,
    )
    return chunks.sort((left, right) => left.sequence - right.sequence)
  }
}

/** In-memory storage with the same semantics; used as the fallback adapter. */
export class MemoryDownloadStorage implements DownloadStorage {
  private readonly tasks = new Map<string, DownloadTask>()
  private readonly chunks = new Map<string, ArrayBuffer[]>()

  async list(): Promise<DownloadTask[]> {
    return Array.from(this.tasks.values()).map(cloneTask)
  }

  async save(task: DownloadTask): Promise<void> {
    this.tasks.set(task.id, cloneTask(task))
  }

  async delete(id: string): Promise<void> {
    this.tasks.delete(id)
    this.chunks.delete(id)
  }

  async appendChunk(id: string, chunk: ArrayBuffer): Promise<void> {
    const existing = this.chunks.get(id)
    if (existing === undefined) {
      this.chunks.set(id, [chunk])
      return
    }
    existing.push(chunk)
  }

  async chunkBytes(id: string): Promise<number> {
    const chunks = this.chunks.get(id) ?? []
    return chunks.reduce((total, chunk) => total + chunk.byteLength, 0)
  }

  async readBlob(id: string): Promise<Blob | null> {
    const chunks = this.chunks.get(id)
    return chunks === undefined || chunks.length === 0
      ? null
      : new Blob(chunks, { type: 'application/octet-stream' })
  }

  async clearChunks(id: string): Promise<void> {
    this.chunks.delete(id)
  }
}

/**
 * Pick the best storage the runtime can offer.
 * @returns IndexedDB storage in a browser, memory storage otherwise.
 */
export function createDefaultDownloadStorage(): DownloadStorage {
  if (typeof indexedDB === 'undefined') {
    return new MemoryDownloadStorage()
  }
  return new IndexedDbDownloadStorage()
}
