import type { SdkworkAppstoreBackendClient } from '@sdkwork/appstore-backend-sdk';

import { AppstoreAdminServiceError, executeAdminOperation, requireAdminIdentifier } from './errors';
import {
  type AppstoreAdminPage,
  asRecord,
  emptyPage,
  mapPage,
  readId,
  readNumber,
  readRecord,
  readString,
} from './viewModel';

/**
 * Catalog operation ids owned by this port
 * (`docs/api/operation-catalog.md`, permission `appstore.catalog.admin`).
 */
export const APPSTORE_ADMIN_CATALOG_OPERATIONS = {
  listCategories: 'appstore.catalog.admin.categories.list',
  listCollections: 'appstore.catalog.admin.collections.list',
  listFeaturedSlots: 'appstore.catalog.admin.featured.list',
  createCategory: 'appstore.catalog.categories.create',
  updateCategory: 'appstore.catalog.categories.update',
  createCollection: 'appstore.catalog.collections.create',
  updateCollection: 'appstore.catalog.collections.update',
  updateCollectionItems: 'appstore.catalog.collections.items.update',
  updateFeaturedSlot: 'appstore.catalog.featured.update',
} as const;

/**
 * Lifecycle statuses accepted by category and collection update operations.
 * Kept as an open union: the backend owns the authoritative enum, and the
 * console must not hard-fail when a new status ships server-side.
 */
export const APPSTORE_ADMIN_CATALOG_STATUSES = ['DRAFT', 'ACTIVE', 'ARCHIVED'] as const;

/** Collection kinds accepted by the create operation. */
export const APPSTORE_ADMIN_COLLECTION_TYPES = [
  'EDITORIAL',
  'CHART',
  'CATEGORY',
  'SEASONAL',
  'PERSONALIZED',
] as const;

/** Audience scopes accepted by the create operation. */
export const APPSTORE_ADMIN_COLLECTION_AUDIENCE_SCOPES = [
  'PUBLIC',
  'TENANT',
  'INTERNAL',
] as const;

/** Featured-slot publication states. */
export const APPSTORE_ADMIN_FEATURED_SLOT_STATUSES = ['SCHEDULED', 'ACTIVE', 'ENDED'] as const;

export interface AppstoreAdminCreateCategoryInput {
  categoryCode: string;
  parentCategoryId?: string;
}

export interface AppstoreAdminUpdateCategoryInput {
  categoryStatus?: string;
  sortOrder?: number;
}

export interface AppstoreAdminCreateCollectionInput {
  collectionCode: string;
  collectionType: string;
  audienceScope?: string;
}

export interface AppstoreAdminUpdateCollectionInput {
  collectionStatus?: string;
  sortOrder?: number;
}

export interface AppstoreAdminCollectionItemInput {
  listingId: string;
  sortOrder?: number;
}

export interface AppstoreAdminFeaturedSlotInput {
  listingId: string;
  /** ISO 8601 instant; required by the operation. */
  startsAt: string;
  /** ISO 8601 instant; required by the operation. */
  endsAt: string;
  slotStatus?: string;
}

/** One operator-visible category row with its resolved display name. */
export interface AppstoreAdminCategoryRow {
  categoryId: string;
  categoryCode: string;
  parentCategoryId?: string;
  status?: string;
  sortOrder?: number;
  /** Display name resolved from localizations (zh-CN first, then the first entry). */
  displayName?: string;
}

/** One operator-visible collection row with its item count. */
export interface AppstoreAdminCollectionRow {
  collectionId: string;
  collectionCode: string;
  collectionType?: string;
  audienceScope?: string;
  status?: string;
  sortOrder?: number;
  displayName?: string;
  itemCount: number;
}

/** One operator-visible featured-slot row. */
export interface AppstoreAdminFeaturedSlotRow {
  slotCode: string;
  listingId: string;
  status?: string;
  audienceScope?: string;
  platformScope?: string;
  startsAt?: string;
  endsAt?: string;
}

export interface AppstoreAdminCatalogListQuery {
  cursor?: string;
  pageSize?: number;
}

/**
 * Backend-admin catalog governance port.
 *
 * Reads and writes both come from the operator contract: the `admin.*.list`
 * operations return every non-deleted status, while mutations stay scoped to
 * create/update. Pages browse real rows and compose edits on top of them.
 */
export interface AppstoreAdminCatalogPort {
  listCategories(
    query?: AppstoreAdminCatalogListQuery,
  ): Promise<AppstoreAdminPage<AppstoreAdminCategoryRow>>;
  listCollections(
    query?: AppstoreAdminCatalogListQuery,
  ): Promise<AppstoreAdminPage<AppstoreAdminCollectionRow>>;
  listFeaturedSlots(): Promise<AppstoreAdminPage<AppstoreAdminFeaturedSlotRow>>;
  createCategory(input: AppstoreAdminCreateCategoryInput): Promise<string>;
  updateCategory(categoryId: string, input: AppstoreAdminUpdateCategoryInput): Promise<void>;
  createCollection(input: AppstoreAdminCreateCollectionInput): Promise<string>;
  updateCollection(collectionId: string, input: AppstoreAdminUpdateCollectionInput): Promise<void>;
  updateCollectionItems(
    collectionId: string,
    items: readonly AppstoreAdminCollectionItemInput[],
  ): Promise<void>;
  updateFeaturedSlot(slotCode: string, input: AppstoreAdminFeaturedSlotInput): Promise<void>;
}

export function createAppstoreAdminCatalogPort(
  client: SdkworkAppstoreBackendClient,
): AppstoreAdminCatalogPort {
  const operations = APPSTORE_ADMIN_CATALOG_OPERATIONS;

  return {
    async listCategories(query) {
      const payload = await executeAdminOperation(operations.listCategories, () =>
        client.catalog.appstore.catalog.admin.categories.list({
          ...(query?.cursor ? { cursor: query.cursor } : {}),
          ...(query?.pageSize === undefined ? {} : { pageSize: query.pageSize }),
        }),
      );
      if (!payload) {
        return emptyPage<AppstoreAdminCategoryRow>();
      }
      return mapPage(payload, projectCategoryRow);
    },

    async listCollections(query) {
      const payload = await executeAdminOperation(operations.listCollections, () =>
        client.catalog.appstore.catalog.admin.collections.list({
          ...(query?.cursor ? { cursor: query.cursor } : {}),
          ...(query?.pageSize === undefined ? {} : { pageSize: query.pageSize }),
        }),
      );
      if (!payload) {
        return emptyPage<AppstoreAdminCollectionRow>();
      }
      return mapPage(payload, projectCollectionRow);
    },

    async listFeaturedSlots() {
      const payload = await executeAdminOperation(operations.listFeaturedSlots, () =>
        client.catalog.appstore.catalog.admin.featured.list(),
      );
      if (!payload) {
        return emptyPage<AppstoreAdminFeaturedSlotRow>();
      }
      return mapPage(payload, projectFeaturedSlotRow);
    },

    async createCategory(input) {
      const categoryCode = requireAdminIdentifier(input.categoryCode, 'categoryCode');
      const payload = await executeAdminOperation(operations.createCategory, () =>
        client.catalog.appstore.catalog.categories.create({
          categoryCode,
          ...(input.parentCategoryId?.trim() ? { parentCategoryId: input.parentCategoryId.trim() } : {}),
        }),
      );
      return readCreatedResourceId(payload);
    },

    async updateCategory(categoryId, input) {
      const id = requireAdminIdentifier(categoryId, 'categoryId');
      await executeAdminOperation(operations.updateCategory, () =>
        client.catalog.appstore.catalog.categories.update(id, {
          ...(input.categoryStatus?.trim() ? { categoryStatus: input.categoryStatus.trim() } : {}),
          ...(input.sortOrder === undefined ? {} : { sortOrder: input.sortOrder }),
        }),
      );
    },

    async createCollection(input) {
      const collectionCode = requireAdminIdentifier(input.collectionCode, 'collectionCode');
      const collectionType = requireAdminIdentifier(input.collectionType, 'collectionType');
      const payload = await executeAdminOperation(operations.createCollection, () =>
        client.catalog.appstore.catalog.collections.create({
          collectionCode,
          collectionType,
          ...(input.audienceScope?.trim() ? { audienceScope: input.audienceScope.trim() } : {}),
        }),
      );
      return readCreatedResourceId(payload);
    },

    async updateCollection(collectionId, input) {
      const id = requireAdminIdentifier(collectionId, 'collectionId');
      await executeAdminOperation(operations.updateCollection, () =>
        client.catalog.appstore.catalog.collections.update(id, {
          ...(input.collectionStatus?.trim() ? { collectionStatus: input.collectionStatus.trim() } : {}),
          ...(input.sortOrder === undefined ? {} : { sortOrder: input.sortOrder }),
        }),
      );
    },

    async updateCollectionItems(collectionId, items) {
      const id = requireAdminIdentifier(collectionId, 'collectionId');
      if (items.length === 0) {
        throw new AppstoreAdminServiceError({
          kind: 'validation',
          message: 'At least one collection item is required.',
          operationId: operations.updateCollectionItems,
          fieldErrors: [{ field: 'items' }],
        });
      }
      await executeAdminOperation(operations.updateCollectionItems, () =>
        client.catalog.appstore.catalog.collections.items.update(id, {
          items: items.map((item) => ({
            listingId: requireAdminIdentifier(item.listingId, 'listingId'),
            ...(item.sortOrder === undefined ? {} : { sortOrder: item.sortOrder }),
          })),
        }),
      );
    },

    async updateFeaturedSlot(slotCode, input) {
      const code = requireAdminIdentifier(slotCode, 'slotCode');
      await executeAdminOperation(operations.updateFeaturedSlot, () =>
        client.catalog.appstore.catalog.featured.update(code, {
          listingId: requireAdminIdentifier(input.listingId, 'listingId'),
          startsAt: input.startsAt,
          endsAt: input.endsAt,
          ...(input.slotStatus?.trim() ? { slotStatus: input.slotStatus.trim() } : {}),
        }),
      );
    },
  };
}

/** Resolve a display name from a localizations array (zh-CN first). */
function readLocalizedDisplayName(record: Record<string, unknown>): string | undefined {
  const localizations = record.localizations;
  if (!Array.isArray(localizations) || localizations.length === 0) {
    return undefined;
  }
  const entries = localizations
    .map((entry) => asRecord(entry))
    .filter((entry): entry is Record<string, unknown> => entry !== undefined);
  const preferred =
    entries.find((entry) => readString(entry, 'locale') === 'zh-CN') ?? entries[0];
  return readString(preferred, 'displayName', 'display_name') || undefined;
}

function projectCategoryRow(record: Record<string, unknown>): AppstoreAdminCategoryRow | undefined {
  // The wire item wraps the category and its localizations
  // (`{category, localizations}`); probe the wrapper first, then the flat shape.
  const categoryRecord = readRecord(record, 'category') ?? record;
  const categoryId = readId(categoryRecord, 'id', 'categoryId', 'category_id');
  if (!categoryId) {
    return undefined;
  }
  const parentCategoryId = readId(categoryRecord, 'parentCategoryId', 'parent_category_id');
  const sortOrder = readNumber(categoryRecord, 'sortOrder', 'sort_order');
  const displayName = readLocalizedDisplayName(record);
  return {
    categoryId,
    categoryCode: readString(categoryRecord, 'categoryCode', 'category_code') || categoryId,
    ...(parentCategoryId ? { parentCategoryId } : {}),
    ...(readString(categoryRecord, 'status')
      ? { status: readString(categoryRecord, 'status') }
      : {}),
    ...(sortOrder === undefined ? {} : { sortOrder }),
    ...(displayName ? { displayName } : {}),
  };
}

function projectCollectionRow(
  record: Record<string, unknown>,
): AppstoreAdminCollectionRow | undefined {
  const collectionRecord = readRecord(record, 'collection') ?? record;
  const collectionId = readId(collectionRecord, 'id', 'collectionId', 'collection_id');
  if (!collectionId) {
    return undefined;
  }
  const sortOrder = readNumber(collectionRecord, 'sortOrder', 'sort_order');
  const items = record.items;
  const displayName = readLocalizedDisplayName(record);
  return {
    collectionId,
    collectionCode:
      readString(collectionRecord, 'collectionCode', 'collection_code') || collectionId,
    ...(readString(collectionRecord, 'collectionType', 'collection_type')
      ? { collectionType: readString(collectionRecord, 'collectionType', 'collection_type') }
      : {}),
    ...(readString(collectionRecord, 'audienceScope', 'audience_scope')
      ? { audienceScope: readString(collectionRecord, 'audienceScope', 'audience_scope') }
      : {}),
    ...(readString(collectionRecord, 'status')
      ? { status: readString(collectionRecord, 'status') }
      : {}),
    ...(sortOrder === undefined ? {} : { sortOrder }),
    ...(displayName ? { displayName } : {}),
    itemCount: Array.isArray(items) ? items.length : 0,
  };
}

function projectFeaturedSlotRow(
  record: Record<string, unknown>,
): AppstoreAdminFeaturedSlotRow | undefined {
  const slotCode = readString(record, 'slotCode', 'slot_code');
  const listingId = readString(record, 'listingId', 'listing_id');
  if (!slotCode && !listingId) {
    return undefined;
  }
  const startsAt = readString(record, 'startsAt', 'starts_at');
  const endsAt = readString(record, 'endsAt', 'ends_at');
  return {
    slotCode: slotCode || listingId,
    listingId,
    ...(readString(record, 'status') ? { status: readString(record, 'status') } : {}),
    ...(readString(record, 'audienceScope', 'audience_scope')
      ? { audienceScope: readString(record, 'audienceScope', 'audience_scope') }
      : {}),
    ...(readString(record, 'platformScope', 'platform_scope')
      ? { platformScope: readString(record, 'platformScope', 'platform_scope') }
      : {}),
    ...(startsAt ? { startsAt } : {}),
    ...(endsAt ? { endsAt } : {}),
  };
}

/**
 * Catalog create operations do not declare a command envelope, and different
 * backend revisions return either the created resource or a command payload,
 * so probe both before degrading to an empty identifier.
 */
function readCreatedResourceId(payload: unknown): string {
  const record = asRecord(payload);
  if (!record) {
    return '';
  }
  return (
    readId(record, 'resourceId', 'resource_id')
    || readId(record, 'id', 'categoryId', 'category_id', 'collectionId', 'collection_id')
    || readString(record, 'code', 'categoryCode', 'category_code', 'collectionCode', 'collection_code')
  );
}
