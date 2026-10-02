import { describe, expect, it, vi } from 'vitest';

import type { AppStoreClient, CommentsAppClient } from '@sdkwork/appstore-pc-core';

import { createAppStoreServicePort } from './appStore.ts';
import { createInstallServicePort } from './install.ts';

function stubComments(): CommentsAppClient {
  return {} as unknown as CommentsAppClient;
}

/** Catalog page shape the storefront reads (`items` array). */
function catalogPage(items: unknown[]): { items: unknown[] } {
  return { items };
}

function stubClient(searchItems: unknown[]): AppStoreClient {
  return {
    catalog: {
      searchListings: vi.fn(async () => catalogPage(searchItems)),
    },
    listings: {
      listReleases: vi.fn(async () => catalogPage([])),
    },
  } as unknown as AppStoreClient;
}

describe('appStore service distribution mapping', () => {
  it('maps platform codes and the access URL onto AppItem', async () => {
    const client = stubClient([
      {
        id: 'app-qwen',
        displayName: '千问 AI',
        pricingModel: 'FREE',
        platforms: ['web', 'android', 'miniprogram-wechat'],
        accessUrl: 'https://tongyi.aliyun.com/qianwen',
      },
    ]);

    const service = createAppStoreServicePort(client, stubComments());
    const app = await service.getAppById('app-qwen');

    expect(app).toBeDefined();
    expect(app?.platforms).toEqual(['web', 'android', 'miniprogram-wechat']);
    expect(app?.accessUrl).toBe('https://tongyi.aliyun.com/qianwen');
  });

  it('keeps the PC-desktop fallback for rows without a platform projection', async () => {
    const client = stubClient([
      { id: 'app-cursor', displayName: 'Cursor AI', pricingModel: 'FREEMIUM' },
    ]);

    const service = createAppStoreServicePort(client, stubComments());
    const app = await service.getAppById('app-cursor');

    expect(app?.platforms).toEqual(['windows']);
    expect(app?.accessUrl).toBeUndefined();
  });
});

describe('install service port platform', () => {
  it('forwards the requested platform code to the library install', async () => {
    const install = vi.fn(async () => ({}));
    const client = {
      library: { install },
    } as unknown as AppStoreClient;

    const port = createInstallServicePort(client);
    await port.installApp('app-cursor', 'macos');

    expect(install).toHaveBeenCalledWith({ listingId: 'app-cursor', platform: 'macos' });
  });

  it('defaults to the PC storefront context without a platform code', async () => {
    const install = vi.fn(async () => ({}));
    const client = {
      library: { install },
    } as unknown as AppStoreClient;

    const port = createInstallServicePort(client);
    await port.installApp('app-cursor');

    expect(install).toHaveBeenCalledWith({ listingId: 'app-cursor', platform: 'pc' });
  });
});
