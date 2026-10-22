import { describe, expect, it, vi } from 'vitest';

import type { AppStoreClient, CommentsAppClient } from '@sdkwork/appstore-pc-core';

import { createAppStoreServicePort } from './appStore.ts';

/**
 * The catalog returns category rows as `{ category: { … }, localizations: […] }`.
 * Reading the identity fields off the top level left every id empty, so the
 * storefront's category filters resolved to nothing and listed every app.
 */
const categoryRows = [
  {
    category: { id: 'cat-apps', categoryCode: 'apps' },
    localizations: [
      { locale: 'zh-CN', displayName: '应用' },
      { locale: 'en-US', displayName: 'Apps' },
    ],
  },
  {
    category: { id: 'cat-education', categoryCode: 'education' },
    localizations: [{ locale: 'zh-CN', displayName: '教育' }],
  },
];

function catalogPage(items: unknown[]): { items: unknown[] } {
  return { items };
}

function stubClient(): {
  client: AppStoreClient;
  searchListings: ReturnType<typeof vi.fn>;
  getCategory: ReturnType<typeof vi.fn>;
} {
  const searchListings = vi.fn(async () => catalogPage([]));
  const getCategory = vi.fn(async () => categoryRows[1]);
  const client = {
    catalog: {
      listCategories: vi.fn(async () => catalogPage(categoryRows)),
      searchListings,
      getCategory,
    },
  } as unknown as AppStoreClient;
  return { client, searchListings, getCategory };
}

function commentsStub(): CommentsAppClient {
  return {} as unknown as CommentsAppClient;
}

describe('catalog categories', () => {
  it('unwraps the nested category row and its localized name', async () => {
    const { client } = stubClient();
    const service = createAppStoreServicePort(client, commentsStub());

    const categories = await service.getCategories();

    expect(categories.map(({ id, name }) => ({ id, name }))).toEqual([
      { id: 'cat-apps', name: '应用' },
      { id: 'cat-education', name: '教育' },
    ]);
  });

  it('narrows a listing window by the selected category id', async () => {
    const { client, searchListings } = stubClient();
    const service = createAppStoreServicePort(client, commentsStub());

    await service.listAppsPage({ categoryId: 'cat-education', limit: 20 });

    expect(searchListings).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: 'cat-education', limit: 20 }),
    );
  });

  it('resolves a category display name to its id for search filters', async () => {
    const { client, searchListings } = stubClient();
    const service = createAppStoreServicePort(client, commentsStub());

    await service.searchApps('', '教育');

    expect(searchListings).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: 'cat-education' }),
    );
  });

  it('unwraps the category detail row', async () => {
    const { client } = stubClient();
    const service = createAppStoreServicePort(client, commentsStub());

    await expect(service.getCategoryDetail('cat-education')).resolves.toEqual(
      expect.objectContaining({ id: 'cat-education', name: '教育' }),
    );
  });
});
