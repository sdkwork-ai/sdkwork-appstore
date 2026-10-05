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

function stubClient(searchItems: unknown[], releases: unknown[] = []): AppStoreClient {
  return {
    catalog: {
      searchListings: vi.fn(async () => catalogPage(searchItems)),
    },
    listings: {
      listReleases: vi.fn(async () => catalogPage(releases)),
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

  it('maps the per-platform scan links onto AppItem', async () => {
    const client = stubClient([
      {
        id: 'app-feishu',
        displayName: '飞书',
        pricingModel: 'FREE',
        platforms: ['android', 'ios'],
        platformLinks: {
          android: 'https://apps.sdkwork.com/m/app-feishu',
          ios: 'https://apps.sdkwork.com/m/app-feishu',
        },
      },
    ]);

    const service = createAppStoreServicePort(client, stubComments());
    const app = await service.getAppById('app-feishu');

    expect(app?.platformLinks).toEqual({
      android: 'https://apps.sdkwork.com/m/app-feishu',
      ios: 'https://apps.sdkwork.com/m/app-feishu',
    });
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

describe('appStore service artifact mapping', () => {
  it('maps verified release artifacts onto the app', async () => {
    const client = stubClient(
      [{ id: 'app-cursor', displayName: 'Cursor AI', pricingModel: 'FREEMIUM' }],
      [
        {
          id: 'rel-app-cursor-0420',
          versionName: '0.42.0',
          artifacts: [
            {
              id: 'artifact-rel-app-cursor-0420',
              platform: 'windows',
              architecture: 'x86_64',
              packageFormat: 'msi',
              fileSizeBytes: '52428800',
            },
          ],
        },
      ],
    );

    const service = createAppStoreServicePort(client, stubComments());
    const app = await service.getAppById('app-cursor');

    expect(app?.artifacts).toEqual([
      {
        id: 'artifact-rel-app-cursor-0420',
        platform: 'windows',
        architecture: 'x86_64',
        packageFormat: 'msi',
        fileSizeBytes: '52428800',
      },
    ]);
  });
});

describe('install service download resolution', () => {
  it('issues and consumes a grant, returning the delivery projection', async () => {
    const grant = { id: 'grant-1', artifactId: 'artifact-1' };
    const delivery = { platform: 'windows', architecture: 'x86_64', packageFormat: 'msi' };
    const create = vi.fn(async () => grant);
    const consume = vi.fn(async () => ({
      ...grant,
      delivery: { ...delivery, downloadUrl: 'https://dl.example/x.msi' },
    }));
    const client = {
      downloadGrants: { create, consume },
    } as unknown as AppStoreClient;

    const port = createInstallServicePort(client);
    const download = await port.resolveInstallerDownload('artifact-1');

    expect(create).toHaveBeenCalledWith({ artifactId: 'artifact-1' });
    expect(consume).toHaveBeenCalledWith('grant-1');
    expect(download?.downloadUrl).toBe('https://dl.example/x.msi');
    expect(download?.packageFormat).toBe('msi');
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

  it('defaults to the windows storefront platform without a platform code', async () => {
    const install = vi.fn(async () => ({}));
    const client = {
      library: { install },
    } as unknown as AppStoreClient;

    const port = createInstallServicePort(client);
    await port.installApp('app-cursor');

    expect(install).toHaveBeenCalledWith({ listingId: 'app-cursor', platform: 'windows' });
  });
});
