import type { AppstoreAdminDemandCategoryRow } from '@sdkwork/appstore-pc-admin-core';

/** One rendered category row with its tree depth. */
export interface DemandCategoryTreeEntry {
  row: AppstoreAdminDemandCategoryRow;
  depth: number;
}

function bySortOrder(
  left: AppstoreAdminDemandCategoryRow,
  right: AppstoreAdminDemandCategoryRow,
): number {
  return (left.sortOrder ?? 0) - (right.sortOrder ?? 0)
    || left.displayName.localeCompare(right.displayName);
}

/**
 * Flatten the demand category list into tree order.
 *
 * The service returns rows ordered by level then sort order; this helper
 * re-derives the parent/child order so a re-parented node renders under its
 * current parent. A row whose parent is missing renders as a root, keeping an
 * orphaned node visible (and fixable) instead of dropping it from the console.
 *
 * @param rows - flat category rows from the service port.
 * @returns every row with its resolved depth, depth-first.
 */
export function flattenDemandCategories(
  rows: readonly AppstoreAdminDemandCategoryRow[],
): DemandCategoryTreeEntry[] {
  const byParent = new Map<string, AppstoreAdminDemandCategoryRow[]>();
  const ids = new Set(rows.map((row) => row.categoryId));
  for (const row of rows) {
    const parentKey = row.parentId !== undefined && ids.has(row.parentId) ? row.parentId : '';
    const bucket = byParent.get(parentKey) ?? [];
    bucket.push(row);
    byParent.set(parentKey, bucket);
  }
  for (const bucket of byParent.values()) {
    bucket.sort(bySortOrder);
  }
  const entries: DemandCategoryTreeEntry[] = [];
  const visit = (parentKey: string, depth: number): void => {
    for (const row of byParent.get(parentKey) ?? []) {
      entries.push({ row, depth });
      visit(row.categoryId, depth + 1);
    }
  };
  visit('', 0);
  return entries;
}

/**
 * Collect a category and every descendant id, so an edit form never offers a
 * node's own subtree as its parent.
 * @param rows - flat category rows.
 * @param categoryId - subtree root.
 * @returns the root id plus every descendant id.
 */
export function collectDemandCategorySubtree(
  rows: readonly AppstoreAdminDemandCategoryRow[],
  categoryId: string,
): Set<string> {
  const childrenByParent = new Map<string, string[]>();
  for (const row of rows) {
    if (row.parentId === undefined) {
      continue;
    }
    const bucket = childrenByParent.get(row.parentId) ?? [];
    bucket.push(row.categoryId);
    childrenByParent.set(row.parentId, bucket);
  }
  const collected = new Set<string>();
  const visit = (id: string): void => {
    if (collected.has(id)) {
      return;
    }
    collected.add(id);
    for (const child of childrenByParent.get(id) ?? []) {
      visit(child);
    }
  };
  visit(categoryId);
  return collected;
}
