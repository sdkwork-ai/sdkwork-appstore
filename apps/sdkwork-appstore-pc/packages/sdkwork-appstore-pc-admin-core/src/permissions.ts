/**
 * Backend-admin permission catalog for the SDKWork App Store operator console.
 *
 * Every code mirrors the server-enforced permission recorded in
 * `docs/api/operation-catalog.md` for the `sdkwork-appstore-backend-api`
 * authority. Frontend checks are navigation and affordance hints only: the
 * backend remains the single authorization authority (`BACKEND_UI_SPEC.md` §7).
 */
export const APPSTORE_ADMIN_PERMISSIONS = {
  /** `appstore.analytics.operator` — operator dashboard and search analytics. */
  operatorAnalyticsRead: 'appstore.analytics.operator',
  /** `appstore.metrics.read` — per-listing metric snapshots. */
  listingMetricsRead: 'appstore.metrics.read',
  /** `appstore.analytics.publisher` — publisher analytics rollups. */
  publisherAnalyticsRead: 'appstore.analytics.publisher',
  /** `appstore.moderation.read` — queue, review detail, and appeal reads. */
  moderationRead: 'appstore.moderation.read',
  /** `appstore.moderation.assign` — assign a review to an operator. */
  moderationAssign: 'appstore.moderation.assign',
  /** `appstore.moderation.decide` — record review and appeal decisions. */
  moderationDecide: 'appstore.moderation.decide',
  /** `appstore.moderation.appeal` — open an appeal on a decision. */
  moderationAppeal: 'appstore.moderation.appeal',
  /** `appstore.listings.admin.read` — operator listing list and detail reads. */
  listingsRead: 'appstore.listings.admin.read',
  /** `appstore.listings.admin` — operator listing visibility transitions. */
  listingsManage: 'appstore.listings.admin',
  /** `appstore.catalog.admin` — category, collection, and featured slot authoring. */
  catalogManage: 'appstore.catalog.admin',
  /** `appstore.publishers.admin` — publisher verification decisions. */
  publishersManage: 'appstore.publishers.admin',
  /** `appstore.market_channels.read` — external market channel reads. */
  marketChannelsRead: 'appstore.market_channels.read',
  /** `appstore.market_channels.write` — market channel create and update. */
  marketChannelsWrite: 'appstore.market_channels.write',
  /** `appstore.market_releases.read` — external market release projection reads. */
  marketReleasesRead: 'appstore.market_releases.read',
  /** `appstore.market_releases.sync` — trigger external market release sync. */
  marketReleasesSync: 'appstore.market_releases.sync',
} as const;

/** Union of every backend-admin permission code owned by this application. */
export type AppstoreAdminPermission =
  (typeof APPSTORE_ADMIN_PERMISSIONS)[keyof typeof APPSTORE_ADMIN_PERMISSIONS];

/** Every backend-admin permission code, used by static scans and tests. */
export const APPSTORE_ADMIN_PERMISSION_CODES: readonly AppstoreAdminPermission[] = Object.values(
  APPSTORE_ADMIN_PERMISSIONS,
);

/**
 * Permission codes that grant entry to the operator console at all.
 *
 * Holding any of these reveals the `/admin` surface. Individual pages and
 * command buttons evaluate their own code from {@link APPSTORE_ADMIN_PERMISSIONS}.
 */
export const APPSTORE_ADMIN_SURFACE_ENTRY_PERMISSIONS: readonly AppstoreAdminPermission[] = [
  APPSTORE_ADMIN_PERMISSIONS.operatorAnalyticsRead,
  APPSTORE_ADMIN_PERMISSIONS.listingMetricsRead,
  APPSTORE_ADMIN_PERMISSIONS.publisherAnalyticsRead,
  APPSTORE_ADMIN_PERMISSIONS.moderationRead,
  APPSTORE_ADMIN_PERMISSIONS.moderationAssign,
  APPSTORE_ADMIN_PERMISSIONS.moderationDecide,
  APPSTORE_ADMIN_PERMISSIONS.moderationAppeal,
  APPSTORE_ADMIN_PERMISSIONS.listingsRead,
  APPSTORE_ADMIN_PERMISSIONS.listingsManage,
  APPSTORE_ADMIN_PERMISSIONS.catalogManage,
  APPSTORE_ADMIN_PERMISSIONS.publishersManage,
  APPSTORE_ADMIN_PERMISSIONS.marketChannelsRead,
  APPSTORE_ADMIN_PERMISSIONS.marketChannelsWrite,
  APPSTORE_ADMIN_PERMISSIONS.marketReleasesRead,
  APPSTORE_ADMIN_PERMISSIONS.marketReleasesSync,
];
