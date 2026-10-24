import { describe, expect, it } from 'vitest';
import type { AppstoreAdminDemandCategoryRow } from '@sdkwork/appstore-pc-admin-core';

import { collectDemandCategorySubtree, flattenDemandCategories } from './categoryTree';

function row(overrides: Partial<AppstoreAdminDemandCategoryRow> & { categoryId: string }): AppstoreAdminDemandCategoryRow {
  return {
    categoryCode: overrides.categoryId,
    displayName: overrides.categoryId,
    level: 1,
    path: `/${overrides.categoryId}`,
    ...overrides,
  };
}

describe('flattenDemandCategories', () => {
  it('renders parents before children with their depth', () => {
    const entries = flattenDemandCategories([
      row({ categoryId: 'software', sortOrder: 10 }),
      row({ categoryId: 'web', parentId: 'software', level: 2, sortOrder: 10 }),
      row({ categoryId: 'admin', parentId: 'web', level: 3, sortOrder: 20 }),
      row({ categoryId: 'purchase', sortOrder: 20 }),
    ]);

    expect(entries.map((entry) => [entry.row.categoryId, entry.depth])).toEqual([
      ['software', 0],
      ['web', 1],
      ['admin', 2],
      ['purchase', 0],
    ]);
  });

  it('renders an orphan as a root instead of dropping it', () => {
    const entries = flattenDemandCategories([
      row({ categoryId: 'orphan', parentId: 'missing' }),
    ]);

    expect(entries).toHaveLength(1);
    expect(entries[0]?.depth).toBe(0);
  });
});

describe('collectDemandCategorySubtree', () => {
  it('collects the node and every descendant', () => {
    const rows = [
      row({ categoryId: 'software' }),
      row({ categoryId: 'web', parentId: 'software' }),
      row({ categoryId: 'admin', parentId: 'web' }),
      row({ categoryId: 'purchase' }),
    ];

    expect([...collectDemandCategorySubtree(rows, 'web')].sort()).toEqual(['admin', 'web']);
    expect([...collectDemandCategorySubtree(rows, 'purchase')]).toEqual(['purchase']);
  });
});
