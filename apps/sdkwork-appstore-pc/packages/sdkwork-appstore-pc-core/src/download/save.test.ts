import { describe, expect, it, vi } from 'vitest'

import { saveDownloadedFile, type DownloadSaveBridge } from './save.ts'

function fakeDocument() {
  const clicks: Array<{ href: string; download: string }> = []
  const anchor = {
    href: '',
    download: '',
    rel: '',
    style: { display: '' },
    click() {
      clicks.push({ href: anchor.href, download: anchor.download })
    },
    remove() {},
  }
  const body = { appendChild: () => undefined }
  return {
    clicks,
    document: {
      createElement: () => anchor,
      body,
    } as unknown as Document,
  }
}

describe('saveDownloadedFile', () => {
  it('hands the completed file to the desktop save bridge', async () => {
    const save = vi.fn(async () => ({ status: 'saved' as const, path: 'C:\\Users\\me\\Downloads\\tool.msi' }))
    const bridge: DownloadSaveBridge = { fileActions: { save } }
    const revoke = vi.fn()
    const result = await saveDownloadedFile(new Blob(['abc']), 'tool.msi', {
      bridge,
      createObjectUrl: () => 'blob:tool',
      revokeObjectUrl: revoke,
      document: fakeDocument().document,
    })
    expect(result).toEqual({
      status: 'saved',
      method: 'desktop',
      path: 'C:\\Users\\me\\Downloads\\tool.msi',
    })
    expect(save).toHaveBeenCalledWith({
      url: 'blob:tool',
      name: 'tool.msi',
      mediaType: 'application/octet-stream',
      mode: 'download',
    })
    expect(revoke).toHaveBeenCalledWith('blob:tool')
  })

  it('reports a cancelled desktop save', async () => {
    const bridge: DownloadSaveBridge = {
      fileActions: { save: async () => ({ status: 'cancelled' as const }) },
    }
    const result = await saveDownloadedFile(new Blob(['abc']), 'tool.msi', {
      bridge,
      createObjectUrl: () => 'blob:tool',
      document: fakeDocument().document,
    })
    expect(result).toEqual({ status: 'cancelled', method: 'desktop' })
  })

  it('falls back to an anchor download when the bridge rejects', async () => {
    const { clicks, document } = fakeDocument()
    const bridge: DownloadSaveBridge = {
      fileActions: {
        save: async () => {
          throw new Error('bridge rejected')
        },
      },
    }
    const result = await saveDownloadedFile(new Blob(['abc']), 'tool.msi', {
      bridge,
      createObjectUrl: () => 'blob:tool',
      document,
    })
    expect(result).toEqual({ status: 'saved', method: 'browser' })
    expect(clicks).toEqual([{ href: 'blob:tool', download: 'tool.msi' }])
  })

  it('reports unavailable without a local destination', async () => {
    const result = await saveDownloadedFile(new Blob(['abc']), 'tool.msi', {
      createObjectUrl: () => 'blob:tool',
    })
    expect(result).toEqual({ status: 'unavailable' })
  })
})
