import type { SdkworkAppstoreBackendClient } from '@sdkwork/appstore-backend-sdk';
import { uuid } from '@sdkwork/utils/id';

import { executeAdminOperation, requireAdminIdentifier } from './errors';
import {
  type AppstoreAdminPage,
  emptyPage,
  formatAdminDate,
  mapPage,
  readId,
  readNumber,
  readString,
  normalizeToken,
} from './viewModel';

/**
 * Catalog operation ids owned by this port
 * (`docs/api/operation-catalog.md`, permissions `appstore.market_channels.*`,
 * `appstore.market_releases.*`).
 */
export const APPSTORE_ADMIN_MARKET_OPERATIONS = {
  listChannels: 'appstore.marketChannels.list',
  createChannel: 'appstore.marketChannels.create',
  updateChannel: 'appstore.marketChannels.update',
  listReleases: 'appstore.marketReleases.list',
  syncRelease: 'appstore.marketReleases.sync',
} as const;

/** External store families supported by the channel contract. */
export const APPSTORE_ADMIN_MARKET_CHANNEL_TYPES = [
  'APPLE_APP_STORE',
  'GOOGLE_PLAY',
  'ENTERPRISE',
  'EXTERNAL',
] as const;

export type AppstoreAdminMarketChannelType = (typeof APPSTORE_ADMIN_MARKET_CHANNEL_TYPES)[number];

/** Channel lifecycle statuses. */
export const APPSTORE_ADMIN_MARKET_CHANNEL_STATUSES = ['ACTIVE', 'DISABLED', 'DRAFT'] as const;

/** Synchronization modes accepted by the release sync operation. */
export const APPSTORE_ADMIN_MARKET_SYNC_MODES = [
  'PULL_STATUS',
  'PUSH_METADATA',
  'PUSH_RELEASE',
  'RECONCILE',
] as const;

export type AppstoreAdminMarketSyncMode = (typeof APPSTORE_ADMIN_MARKET_SYNC_MODES)[number];

export interface AppstoreAdminMarketChannel {
  marketChannelId: string;
  channelCode: string;
  channelType: string;
  provider: string;
  channelStatus: string;
  externalStoreCode?: string;
  apiCapability: Record<string, unknown>;
  config: Record<string, unknown>;
  updatedAt?: string;
}

export interface AppstoreAdminMarketRelease {
  marketReleaseId: string;
  releaseId: string;
  channelId: string;
  channelCode?: string;
  listingId: string;
  listingName: string;
  marketStatus: string;
  externalReleaseCode?: string;
  lastSyncedAt?: string;
  lastSyncedDate: string;
  note?: string;
}

export interface AppstoreAdminMarketChannelQuery {
  channelStatus?: string;
  cursor?: string;
  pageSize?: number;
}

export interface AppstoreAdminMarketReleaseQuery {
  releaseId?: string;
  channelId?: string;
  marketStatus?: string;
  cursor?: string;
  pageSize?: number;
}

export interface AppstoreAdminCreateMarketChannelInput {
  channelCode: string;
  channelType: AppstoreAdminMarketChannelType | string;
  provider: string;
  externalStoreCode?: string;
  apiCapability?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

export interface AppstoreAdminUpdateMarketChannelInput {
  channelStatus?: string;
  externalStoreCode?: string;
  apiCapability?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

export interface AppstoreAdminSyncReleaseInput {
  syncMode: AppstoreAdminMarketSyncMode | string;
  externalStatus?: Record<string, unknown>;
  note?: string;
}

export interface AppstoreAdminMarketPort {
  listChannels(
    query?: AppstoreAdminMarketChannelQuery,
  ): Promise<AppstoreAdminPage<AppstoreAdminMarketChannel>>;
  createChannel(input: AppstoreAdminCreateMarketChannelInput): Promise<void>;
  updateChannel(
    marketChannelId: string,
    input: AppstoreAdminUpdateMarketChannelInput,
  ): Promise<void>;
  listReleases(
    query?: AppstoreAdminMarketReleaseQuery,
  ): Promise<AppstoreAdminPage<AppstoreAdminMarketRelease>>;
  syncRelease(marketReleaseId: string, input: AppstoreAdminSyncReleaseInput): Promise<void>;
}

export function createAppstoreAdminMarketPort(
  client: SdkworkAppstoreBackendClient,
): AppstoreAdminMarketPort {
  const operations = APPSTORE_ADMIN_MARKET_OPERATIONS;

  return {
    async listChannels(query) {
      const payload = await executeAdminOperation(operations.listChannels, () =>
        client.market.appstore.marketChannels.list({
          ...(query?.channelStatus ? { channelStatus: query.channelStatus } : {}),
          ...(query?.cursor ? { cursor: query.cursor } : {}),
          ...(query?.pageSize === undefined ? {} : { pageSize: query.pageSize }),
        }),
      );
      if (!payload) {
        return emptyPage<AppstoreAdminMarketChannel>();
      }
      return mapPage(payload, (record) => {
        const marketChannelId = readId(
          record,
          'marketChannelId',
          'market_channel_id',
          'channelId',
          'channel_id',
          'id',
        );
        const channelCode = readString(record, 'channelCode', 'channel_code', 'code');
        if (!marketChannelId && !channelCode) {
          return undefined;
        }
        const externalStoreCode = readString(record, 'externalStoreCode', 'external_store_code');
        const updatedAt = readString(record, 'updatedAt', 'updated_at');
        return {
          marketChannelId: marketChannelId || channelCode,
          channelCode,
          channelType: normalizeToken(readString(record, 'channelType', 'channel_type'), 'EXTERNAL'),
          provider: readString(record, 'provider', 'providerCode', 'provider_code'),
          channelStatus: normalizeToken(readString(record, 'channelStatus', 'channel_status', 'status'), 'DRAFT'),
          ...(externalStoreCode ? { externalStoreCode } : {}),
          apiCapability: readRecordMap(record, 'apiCapability', 'api_capability'),
          config: readRecordMap(record, 'config', 'channelConfig', 'channel_config'),
          ...(updatedAt ? { updatedAt } : {}),
        } satisfies AppstoreAdminMarketChannel;
      });
    },

    async createChannel(input) {
      const channelCode = requireAdminIdentifier(input.channelCode, 'channelCode');
      const channelType = requireAdminIdentifier(input.channelType, 'channelType');
      const provider = requireAdminIdentifier(input.provider, 'provider');
      await executeAdminOperation(operations.createChannel, () =>
        client.market.appstore.marketChannels.create({
          channelCode,
          channelType: channelType as AppstoreAdminMarketChannelType,
          provider,
          ...(input.externalStoreCode?.trim() ? { externalStoreCode: input.externalStoreCode.trim() } : {}),
          ...(input.apiCapability === undefined ? {} : { apiCapability: input.apiCapability }),
          ...(input.config === undefined ? {} : { config: input.config }),
        }),
      );
    },

    async updateChannel(marketChannelId, input) {
      const id = requireAdminIdentifier(marketChannelId, 'marketChannelId');
      await executeAdminOperation(operations.updateChannel, () =>
        client.market.appstore.marketChannels.update(id, {
          ...(input.channelStatus?.trim() ? { channelStatus: input.channelStatus.trim() } : {}),
          ...(input.externalStoreCode?.trim() ? { externalStoreCode: input.externalStoreCode.trim() } : {}),
          ...(input.apiCapability === undefined ? {} : { apiCapability: input.apiCapability }),
          ...(input.config === undefined ? {} : { config: input.config }),
        }),
      );
    },

    async listReleases(query) {
      const payload = await executeAdminOperation(operations.listReleases, () =>
        client.market.appstore.marketReleases.list({
          ...(query?.releaseId ? { releaseId: query.releaseId } : {}),
          ...(query?.channelId ? { channelId: query.channelId } : {}),
          ...(query?.marketStatus ? { marketStatus: query.marketStatus } : {}),
          ...(query?.cursor ? { cursor: query.cursor } : {}),
          ...(query?.pageSize === undefined ? {} : { pageSize: query.pageSize }),
        }),
      );
      if (!payload) {
        return emptyPage<AppstoreAdminMarketRelease>();
      }
      return mapPage(payload, (record) => {
        const marketReleaseId = readId(
          record,
          'marketReleaseId',
          'market_release_id',
          'id',
        );
        if (!marketReleaseId) {
          return undefined;
        }
        const lastSyncedAt = readString(record, 'lastSyncedAt', 'last_synced_at', 'syncedAt', 'synced_at');
        const externalReleaseCode = readString(record, 'externalReleaseCode', 'external_release_code');
        const channelCode = readString(record, 'channelCode', 'channel_code');
        const note = readString(record, 'note', 'remark');
        const listingId = readId(record, 'listingId', 'listing_id');
        return {
          marketReleaseId,
          releaseId: readId(record, 'releaseId', 'release_id'),
          channelId: readId(record, 'channelId', 'channel_id', 'marketChannelId', 'market_channel_id'),
          ...(channelCode ? { channelCode } : {}),
          listingId,
          listingName: readString(record, 'listingName', 'listing_name', 'displayName', 'display_name') || listingId,
          marketStatus: normalizeToken(readString(record, 'marketStatus', 'market_status', 'status'), 'UNKNOWN'),
          ...(externalReleaseCode ? { externalReleaseCode } : {}),
          ...(lastSyncedAt ? { lastSyncedAt } : {}),
          lastSyncedDate: formatAdminDate(lastSyncedAt),
          ...(note ? { note } : {}),
        } satisfies AppstoreAdminMarketRelease;
      });
    },

    async syncRelease(marketReleaseId, input) {
      const id = requireAdminIdentifier(marketReleaseId, 'marketReleaseId');
      const syncMode = requireAdminIdentifier(input.syncMode, 'syncMode');
      await executeAdminOperation(operations.syncRelease, () =>
        client.market.appstore.marketReleases.sync(
          id,
          {
            syncMode: syncMode as AppstoreAdminMarketSyncMode,
            ...(input.externalStatus === undefined ? {} : { externalStatus: input.externalStatus }),
            ...(input.note?.trim() ? { note: input.note.trim() } : {}),
          },
          // Synchronization is a mutation; the API requires an idempotency key.
          { idempotencyKey: uuid() },
        ),
      );
    },
  };
}

function readRecordMap(record: Record<string, unknown>, ...keys: string[]): Record<string, unknown> {
  for (const key of keys) {
    const value = record[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
  }
  return {};
}
