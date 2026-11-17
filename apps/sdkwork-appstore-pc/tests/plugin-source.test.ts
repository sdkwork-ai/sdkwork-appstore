import { describe, expect, it } from 'vitest'
import { createPluginsServicePort } from '@sdkwork/appstore-pc-runtime'

describe('the retired plugins catalog port', () => {
  it('degrades the plugin shelf to an empty list', async () => {
    const port = createPluginsServicePort()
    await expect(port.getPlugins()).resolves.toEqual([])
  })

  it('fails loudly when the retired write operations are used', async () => {
    const port = createPluginsServicePort()
    await expect(port.togglePlugin('plug-1')).rejects.toThrow(/is retired/)
    await expect(port.registerPlugin({ name: 'My plugin' })).rejects.toThrow(/is retired/)
  })

  it('keeps the capability execution boundary explicit', async () => {
    const port = createPluginsServicePort()
    await expect(port.executePluginApi('plug-1', 'query')).rejects.toThrow(
      /not exposed by the App Store app API/,
    )
    await expect(port.getPluginSchema('plug-1')).rejects.toThrow(
      /not exposed by the App Store app API/,
    )
  })
})
