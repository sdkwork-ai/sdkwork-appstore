import type { SdkworkAppstoreBackendClient } from '@sdkwork/appstore-backend-sdk';

import { AppstoreAdminServiceError, executeAdminOperation, requireAdminIdentifier } from './errors';
import { asRecord, readId, readString } from './viewModel';

/**
 * Catalog operation ids owned by this port
 * (`docs/api/operation-catalog.md`, permission `appstore.catalog.admin`).
 */
export const APPSTORE_ADMIN_CATALOG_OPERATIONS = {
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

/**
 * Backend-admin catalog governance port.
 *
 * Note: the authoritative backend API currently exposes catalog *mutations*
 * only (create/update). Category, collection, and featured-slot *reads* are not
 * part of the operator contract, so the console composes its editing surfaces
 * around operator-supplied identifiers and listing lookups from the listings
 * port instead of fabricating a catalog browse endpoint.
 */
export interface AppstoreAdminCatalogPort {
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
