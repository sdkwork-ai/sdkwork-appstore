import { describe, expect, it, vi } from 'vitest'
import { createPluginsServicePort } from '@sdkwork/appstore-pc-runtime'

const template = (metadata: Record<string, unknown>, extra: Record<string, unknown> = {}) => ({
  id: 'plug-1',
  templateName: 'Database connector',
  description: 'Queries a database',
  gitRepoUrl: undefined as string | undefined,
  metadata: { category: '数据与存储', version: '1.4.0', capabilities: ['SQL 查询'], ...metadata },
  ...extra,
})

describe('the plugins catalog exposes each entry source', () => {
  it('reads the published pluginSource, including the directory that distinguishes several plugins in one repository', async () => {
    const items = [template({
      pluginSource: {
        type: 'git',
        url: 'https://github.com/sdkwork/plugins',
        ref: 'v1.4.0',
        directory: 'plugins/db-connector',
      },
    })]
    const port = createPluginsServicePort(client(items) as never)
    expect((await port.getPlugins())[0]?.source).toEqual({
      type: 'git',
      url: 'https://github.com/sdkwork/plugins',
      ref: 'v1.4.0',
      directory: 'plugins/db-connector',
    })
  })

  it('falls back to the legacy gitRepoUrl column and a metadata directory', async () => {
    const items = [template({ pluginDirectory: 'plugins/ocr' }, { gitRepoUrl: 'https://github.com/sdkwork/plugins' })]
    const port = createPluginsServicePort(client(items) as never)
    expect((await port.getPlugins())[0]?.source).toEqual({
      type: 'git',
      url: 'https://github.com/sdkwork/plugins',
      directory: 'plugins/ocr',
    })
  })

  it('publishes a source for an archive or Drive entry and drops one with no usable address', async () => {
    const items = [
      template({ pluginSource: { type: 'archive', url: 'https://cdn.example.com/dsh-x.zip', sha256: 'a'.repeat(64) } }),
      template({ pluginSource: { type: 'drive', url: 'https://drive.example.com/download/a?signature=b', nodeId: 'node_1' } }),
      template({ pluginSource: { type: 'git', url: '' } }),
    ]
    const port = createPluginsServicePort(client(items) as never)
    const [archive, drive, missing] = await port.getPlugins()
    expect(archive?.source).toEqual({ type: 'archive', url: 'https://cdn.example.com/dsh-x.zip', sha256: 'a'.repeat(64) })
    expect(drive?.source).toEqual({ type: 'drive', url: 'https://drive.example.com/download/a?signature=b', nodeId: 'node_1' })
    expect(missing?.source).toBeUndefined()
  })

  it('registers the source with the plugin so the catalog can install it', async () => {
    const created = template({ pluginSource: { type: 'git', url: 'https://github.com/sdkwork/plugins' } })
    const createTemplate = vi.fn(async () => created)
    const port = createPluginsServicePort(client([], createTemplate) as never)
    await port.registerPlugin({
      name: 'My plugin',
      category: '代码与开发',
      source: { type: 'git', url: 'https://github.com/sdkwork/plugins', directory: 'plugins/mine' },
    })
    expect(createTemplate).toHaveBeenCalledWith(expect.objectContaining({
      metadata: expect.objectContaining({
        pluginSource: { type: 'git', url: 'https://github.com/sdkwork/plugins', directory: 'plugins/mine' },
      }),
    }))
  })
})

function client(items: unknown[], createTemplate = vi.fn(async () => template({}))) {
  return {
    catalog: {
      listTemplates: vi.fn(async () => ({ items })),
      createTemplate,
      getTemplate: vi.fn(async () => template({})),
      recordTemplateUsage: vi.fn(async () => ({})),
    },
  }
}
