import type { AppStoreClient } from '@sdkwork/appstore-app-sdk';
import {
  configureInstallServicePort,
  type InstallServicePort,
  type StorageStats,
} from '@sdkwork/appstore-pc-core';

export function configureAppstorePcInstall(client: AppStoreClient): void {
  configureInstallServicePort(createInstallServicePort(client));
}

export function createInstallServicePort(client: AppStoreClient): InstallServicePort {
  return {
    async getInstalledAppIds(): Promise<string[]> {
      const response = await client.library.listItems({ limit: 200 });
      return readPageItems<Record<string, unknown>>(response)
        .map((item) => readString(item, 'listingId', 'listing_id'))
        .filter(Boolean);
    },

    async installApp(appId: string): Promise<boolean> {
      await client.library.install({ listingId: appId, platform: 'pc' });
      return true;
    },

    async uninstallApp(appId: string): Promise<boolean> {
      const response = await client.library.listItems({ limit: 200 });
      const libraryItems = readPageItems<Record<string, unknown>>(response);
      const libraryItem = libraryItems.find(
        (item) => readString(item, 'listingId', 'listing_id') === appId,
      );
      if (!libraryItem) {
        return false;
      }
      await client.library.uninstall({
        libraryItemId: readString(libraryItem, 'id'),
      });
      return true;
    },

    async getStorageStats(): Promise<StorageStats> {
      const response = await client.library.listItems({ limit: 200 });
      const libraryItems = readPageItems<Record<string, unknown>>(response);
      const appsCount = libraryItems.length;
      let usedMb = 0;
      for (const item of libraryItems) {
        const listingId = readString(item, 'listingId', 'listing_id');
        if (!listingId) {
          continue;
        }
        const listing = await client.listings.get(listingId).catch(() => undefined);
        const sizeBytes = readString(
          listing as unknown as Record<string, unknown> | undefined,
          'fileSizeBytes',
          'file_size_bytes',
        );
        const bytes = Number.parseInt(sizeBytes, 10);
        if (Number.isFinite(bytes) && bytes > 0) {
          usedMb += bytes / (1024 * 1024);
        }
      }
      return {
        usedMb: Math.round(usedMb),
        totalMb: 51200,
        appsCount,
        cacheMb: 1420,
      };
    },
  };
}

function readPageItems<T>(value: unknown): T[] {
  if (!value || typeof value !== 'object' || !Array.isArray((value as Record<string, unknown>).items)) {
    return [];
  }
  return (value as Record<string, unknown>).items as T[];
}

function readString(record: Record<string, unknown> | undefined, ...keys: string[]): string {
  if (!record) {
    return '';
  }
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}
