import { describe, expect, it } from 'vitest';

import { filterAndSortLibraryApps, LibrarySortMode } from './libraryFilter';
import type { AppItem } from '../types';

function makeApp(id: string, name: string, developer: string, date?: string): AppItem {
  return {
    id,
    name,
    developer,
    category: '效率',
    price: 0,
    rating: 4,
    reviewsCount: 10,
    description: '',
    screenshots: [],
    icon: 'AppWindow',
    iconColor: 'bg-blue-600',
    version: '1.0.0',
    size: '10 MB',
    ageRating: '4+',
    whatsNew: date ? { version: '1.0.0', date, notes: '' } : undefined,
  };
}

describe('filterAndSortLibraryApps', () => {
  const apps = [
    makeApp('app-b', '笔记应用', '开发者甲', '2026-05-01'),
    makeApp('app-a', '效率工具', '开发者乙', '2026-07-01'),
    makeApp('app-c', 'AI 助手', '开发者丙', '2026-03-01'),
  ];

  it('returns all apps when the query is empty', () => {
    expect(filterAndSortLibraryApps(apps, '', 'name')).toHaveLength(3);
  });

  it('filters by name and developer keyword', () => {
    const byName = filterAndSortLibraryApps(apps, '笔记', 'name');
    expect(byName.map((app) => app.id)).toEqual(['app-b']);

    const byDeveloper = filterAndSortLibraryApps(apps, '丙', 'name');
    expect(byDeveloper.map((app) => app.id)).toEqual(['app-c']);
  });

  it('sorts by name using zh-CN collation', () => {
    // zh-CN pinyin collation: 笔记 (bǐ) < 效率 (xiào); latin "AI" sorts after pinyin.
    const sorted = filterAndSortLibraryApps(apps, '', 'name');
    expect(sorted.map((app) => app.id)).toEqual(['app-b', 'app-a', 'app-c']);
  });

  it('sorts by update date descending', () => {
    const sorted = filterAndSortLibraryApps(apps, '', 'updated');
    expect(sorted.map((app) => app.id)).toEqual(['app-a', 'app-b', 'app-c']);
  });

  it('treats missing update dates as the oldest entries', () => {
    const mixed = [...apps, makeApp('app-d', '无日期应用', '开发者丁')];
    const sorted = filterAndSortLibraryApps(mixed, '', 'updated');
    expect(sorted[sorted.length - 1].id).toBe('app-d');
  });

  it('does not mutate the input array', () => {
    const input = [...apps];
    filterAndSortLibraryApps(input, '笔记', 'name');
    expect(input.map((app) => app.id)).toEqual(['app-b', 'app-a', 'app-c']);
  });
});
