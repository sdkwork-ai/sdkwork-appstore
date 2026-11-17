import { describe, expect, it } from 'vitest';

import { createTemplatesServicePort } from './templates';

describe('retired app-template marketplace port', () => {
  it('degrades every read to an empty shelf', async () => {
    const port = createTemplatesServicePort();

    await expect(port.getTemplates()).resolves.toEqual([]);
    await expect(port.getTemplateById('tpl-1')).resolves.toBeNull();
    await expect(port.listTemplateSuggestions('tpl-1')).resolves.toEqual({
      latest: [],
      related: [],
      recommended: [],
    });
  });

  it('returns the create-app command without a template code', async () => {
    const port = createTemplatesServicePort();

    await expect(port.getTemplateCliCommand('tpl-1')).resolves.toBe(
      'npx create-sdkwork-app my-app',
    );
  });

  it('fails loudly on the retired write operations', async () => {
    const port = createTemplatesServicePort();

    await expect(port.publishTemplate({ title: 'Starter' })).rejects.toThrow(
      /scaffolds are served by the deploy service/,
    );
    await expect(port.starTemplate('tpl-1')).rejects.toThrow(
      /scaffolds are served by the deploy service/,
    );
    await expect(port.forkTemplate('tpl-1')).rejects.toThrow(
      /scaffolds are served by the deploy service/,
    );
  });
});
