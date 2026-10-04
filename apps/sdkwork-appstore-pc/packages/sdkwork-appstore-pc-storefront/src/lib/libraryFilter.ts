import type { AppItem } from '../types';

export type LibrarySortMode = 'name' | 'updated';

/**
 * Filter installed apps by keyword (name or developer) and sort them by
 * name (zh-CN aware) or latest release date. Pure helper so the library
 * page stays a thin view over deterministic data transforms.
 */
export function filterAndSortLibraryApps(
  apps: AppItem[],
  query: string,
  sortMode: LibrarySortMode,
): AppItem[] {
  const keyword = query.trim().toLocaleLowerCase();
  const filtered = keyword
    ? apps.filter(
        (app) =>
          app.name.toLocaleLowerCase().includes(keyword) ||
          app.developer.toLocaleLowerCase().includes(keyword),
      )
    : apps;
  return [...filtered].sort((a, b) => {
    if (sortMode === 'updated') {
      const dateA = a.whatsNew?.date ?? '';
      const dateB = b.whatsNew?.date ?? '';
      return dateB.localeCompare(dateA);
    }
    return a.name.localeCompare(b.name, 'zh-CN');
  });
}
