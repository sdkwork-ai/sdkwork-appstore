import { describe, expect, it } from 'vitest';

import { mapTemplateSuggestionRails } from './templates';

describe('mapTemplateSuggestionRails', () => {
  it('maps each rail in service order', () => {
    const rails = mapTemplateSuggestionRails({
      latest: [
        { id: 'tpl-new-2', templateName: 'Newest Two' },
        { id: 'tpl-new-1', templateName: 'Newest One' },
      ],
      related: [{ id: 'tpl-related', templateName: 'Related One' }],
      recommended: [{ id: 'tpl-recommended', templateName: 'Recommended One' }],
    });

    expect(rails.latest.map((item) => item.id)).toEqual(['tpl-new-2', 'tpl-new-1']);
    expect(rails.related.map((item) => item.id)).toEqual(['tpl-related']);
    expect(rails.recommended.map((item) => item.id)).toEqual(['tpl-recommended']);
  });

  it('derives the card fields from the wire record and its metadata', () => {
    const rails = mapTemplateSuggestionRails({
      latest: [
        {
          id: 'tpl-1',
          templateName: 'SaaS Starter',
          description: 'Full-stack starter',
          templatePlatform: 'PC',
          starCount: 12,
          forkCount: 3,
          metadata: { category: 'SaaS 全栈', tags: ['react', 'vite'], isOfficial: true },
        },
      ],
      related: [],
      recommended: [],
    });

    const [template] = rails.latest;
    expect(template?.title).toBe('SaaS Starter');
    expect(template?.category).toBe('SaaS 全栈');
    expect(template?.platform).toBe('PC');
    expect(template?.tags).toEqual(['react', 'vite']);
    expect(template?.stars).toBe(12);
    expect(template?.forks).toBe(3);
    expect(template?.isOfficial).toBe(true);
  });

  it('keeps a rail empty when the payload omits it or carries malformed entries', () => {
    const rails = mapTemplateSuggestionRails({
      related: [null, 'not-a-template', { id: 'tpl-ok', templateName: 'Kept' }],
    });

    expect(rails.latest).toEqual([]);
    expect(rails.recommended).toEqual([]);
    expect(rails.related.map((item) => item.id)).toEqual(['tpl-ok']);
  });
});
