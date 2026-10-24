import { describe, expect, it } from 'vitest';

import { buildDemandCategoryTree } from './company';

describe('buildDemandCategoryTree', () => {
  it('nests children under their parent and sorts each level by sortOrder', () => {
    const tree = buildDemandCategoryTree([
      { id: 'leaf-b', parentId: 'web', categoryCode: 'b', displayName: 'B', level: 3, path: '/s/web/b', sortOrder: 20, status: 'active' },
      { id: 'software', categoryCode: 'software', displayName: 'Software', level: 1, path: '/software', sortOrder: 10, status: 'active' },
      { id: 'leaf-a', parentId: 'web', categoryCode: 'a', displayName: 'A', level: 3, path: '/s/web/a', sortOrder: 10, status: 'active' },
      { id: 'web', parentId: 'software', categoryCode: 'web', displayName: 'Web', level: 2, path: '/software/web', sortOrder: 10, appForm: 'pc', status: 'active' },
    ]);

    expect(tree).toHaveLength(1);
    expect(tree[0]?.categoryCode).toBe('software');
    expect(tree[0]?.children).toHaveLength(1);
    expect(tree[0]?.children[0]?.categoryCode).toBe('web');
    expect(tree[0]?.children[0]?.appForm).toBe('pc');
    expect(tree[0]?.children[0]?.children.map((node) => node.categoryCode)).toEqual(['a', 'b']);
  });

  it('keeps an orphaned node selectable at the root', () => {
    const tree = buildDemandCategoryTree([
      { id: 'orphan', parentId: 'missing', categoryCode: 'orphan', displayName: 'Orphan', level: 2, path: '/missing/orphan', sortOrder: 0, status: 'active' },
    ]);

    expect(tree).toHaveLength(1);
    expect(tree[0]?.id).toBe('orphan');
    expect(tree[0]?.categoryCode).toBe('orphan');
  });

  it('drops an unknown application form instead of surfacing a raw code', () => {
    const tree = buildDemandCategoryTree([
      { id: 'legacy', categoryCode: 'legacy', displayName: 'Legacy', level: 1, path: '/legacy', sortOrder: 0, status: 'disabled', appForm: 'windows-forms' },
    ]);

    expect(tree[0]?.appForm).toBeUndefined();
    expect(tree[0]?.status).toBe('disabled');
  });
});
