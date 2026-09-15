import type { SdkworkAppstoreBackendClient } from '@sdkwork/appstore-backend-sdk';

import { executeAdminOperation, requireAdminIdentifier } from './errors';
import {
  type AppstoreAdminDateRange,
  type AppstoreAdminPage,
  emptyPage,
  mapPage,
  readNumber,
  readRatio,
  readRecord,
  readSingleRecord,
  readString,
  normalizeToken,
  asRecord,
} from './viewModel';

/**
 * Catalog operation ids owned by this port
 * (`docs/api/operation-catalog.md`, permissions `appstore.publishers.admin`,
 * `appstore.analytics.publisher`).
 */
export const APPSTORE_ADMIN_PUBLISHER_OPERATIONS = {
  verifyPublisher: 'appstore.publishers.admin.verify',
  publisherOverview: 'appstore.analytics.publisher.overview.retrieve',
  publisherListings: 'appstore.analytics.publisher.listings.list',
  publisherListingDetail: 'appstore.analytics.publisher.listings.retrieve',
} as const;

/** Verification dimensions accepted by the verify operation. */
export const APPSTORE_ADMIN_VERIFICATION_TYPES = [
  'IDENTITY',
  'BUSINESS',
  'TAX',
  'PAYOUT',
] as const;

/** Verification outcomes accepted by the verify operation. */
export const APPSTORE_ADMIN_VERIFICATION_DECISIONS = ['APPROVE', 'REJECT', 'REQUEST_MORE_INFO'] as const;

export interface AppstoreAdminVerifyPublisherInput {
  verificationType: string;
  decision: string;
}

export interface AppstoreAdminVerificationOutcome {
  accepted: boolean;
  resourceId?: string;
  status?: string;
}

export interface AppstoreAdminPublisherOverview {
  publisherId?: string;
  totalListings: number;
  activeListings: number;
  totalInstalls: number;
  totalDownloads: number;
  totalRevenueAmount?: number;
  revenueCurrency?: string;
  averageRating?: number;
  installToDownloadRatio?: number;
}

export interface AppstoreAdminPublisherListingAnalytics {
  listingId: string;
  displayName: string;
  listingStatus?: string;
  installs: number;
  uninstalls: number;
  pageViews: number;
  impressions: number;
  revenueAmount?: number;
  revenueCurrency?: string;
  averageRating?: number;
  /** Storefront conversion share in `0..1`. */
  conversionRatio?: number;
}

export interface AppstoreAdminPublisherListingQuery {
  range?: AppstoreAdminDateRange;
  cursor?: string;
  pageSize?: number;
}

export interface AppstoreAdminPublishersPort {
  verifyPublisher(
    publisherId: string,
    input: AppstoreAdminVerifyPublisherInput,
  ): Promise<AppstoreAdminVerificationOutcome>;
  getPublisherOverview(
    range?: AppstoreAdminDateRange,
  ): Promise<AppstoreAdminPublisherOverview | undefined>;
  listPublisherListings(
    query?: AppstoreAdminPublisherListingQuery,
  ): Promise<AppstoreAdminPage<AppstoreAdminPublisherListingAnalytics>>;
  getPublisherListingAnalytics(
    listingId: string,
    range?: AppstoreAdminDateRange,
  ): Promise<AppstoreAdminPublisherListingAnalytics | undefined>;
}

export function createAppstoreAdminPublishersPort(
  client: SdkworkAppstoreBackendClient,
): AppstoreAdminPublishersPort {
  const operations = APPSTORE_ADMIN_PUBLISHER_OPERATIONS;

  return {
    async verifyPublisher(publisherId, input) {
      const id = requireAdminIdentifier(publisherId, 'publisherId');
      const verificationType = requireAdminIdentifier(input.verificationType, 'verificationType');
      const decision = requireAdminIdentifier(input.decision, 'decision');
      const payload = await executeAdminOperation(operations.verifyPublisher, () =>
        client.publishers.appstore.publishers.admin.verify(id, { verificationType, decision }),
      );
      const record = asRecord(payload);
      const resourceId = readString(record, 'resourceId', 'resource_id') || id;
      const status = readString(record, 'status');
      return {
        accepted: record?.accepted === true || payload === undefined,
        ...(resourceId ? { resourceId } : {}),
        ...(status ? { status } : {}),
      };
    },

    async getPublisherOverview(range) {
      const payload = await executeAdminOperation(operations.publisherOverview, () =>
        client.analytics.appstore.analytics.publisher.overview.retrieve(buildRange(range)),
      );
      const root = asRecord(payload);
      if (!root || Object.keys(root).length === 0) {
        return undefined;
      }
      const source = readRecord(root, 'overview', 'summary', 'metrics') ?? root;
      const totalDownloads = readNumber(source, 'totalDownloads', 'total_downloads', 'downloadCount', 'download_count') ?? 0;
      const totalInstalls = readNumber(source, 'totalInstalls', 'total_installs', 'installCount', 'install_count') ?? 0;
      const revenueAmount = readNumber(source, 'totalRevenueAmount', 'total_revenue_amount', 'revenueAmount', 'revenue_amount');
      const revenueCurrency = readString(source, 'revenueCurrency', 'revenue_currency', 'currency');
      const averageRating = readNumber(source, 'averageRating', 'average_rating', 'ratingAverage', 'rating_average');
      const installToDownloadRatio = readRatio(
        source,
        'installToDownloadRatio',
        'install_to_download_ratio',
        'conversionRatio',
        'conversion_ratio',
      );
      return {
        ...(readString(source, 'publisherId', 'publisher_id') ? { publisherId: readString(source, 'publisherId', 'publisher_id') } : {}),
        totalListings: readNumber(source, 'totalListings', 'total_listings', 'listingCount', 'listing_count') ?? 0,
        activeListings: readNumber(source, 'activeListings', 'active_listings', 'publishedListings', 'published_listings') ?? 0,
        totalInstalls,
        totalDownloads,
        ...(revenueAmount === undefined ? {} : { totalRevenueAmount: revenueAmount }),
        ...(revenueCurrency ? { revenueCurrency } : {}),
        ...(averageRating === undefined ? {} : { averageRating }),
        ...(installToDownloadRatio === undefined ? {} : { installToDownloadRatio }),
      };
    },

    async listPublisherListings(query) {
      const payload = await executeAdminOperation(operations.publisherListings, () =>
        client.analytics.appstore.analytics.publisher.listings.list({
          ...buildRange(query?.range),
          ...(query?.cursor ? { cursor: query.cursor } : {}),
          ...(query?.pageSize === undefined ? {} : { pageSize: query.pageSize }),
        }),
      );
      if (!payload) {
        return emptyPage<AppstoreAdminPublisherListingAnalytics>();
      }
      return mapPage(payload, (record) => projectPublisherListing(record));
    },

    async getPublisherListingAnalytics(listingId, range) {
      const id = requireAdminIdentifier(listingId, 'listingId');
      const payload = await executeAdminOperation(operations.publisherListingDetail, () =>
        client.analytics.appstore.analytics.publisher.listings.retrieve(id, buildRange(range)),
      );
      const record = readSingleRecord(payload);
      return record ? projectPublisherListing(record, id) : undefined;
    },
  };
}

function buildRange(range: AppstoreAdminDateRange | undefined): {
  dateFrom?: string;
  dateTo?: string;
} {
  return {
    ...(range?.from ? { dateFrom: range.from } : {}),
    ...(range?.to ? { dateTo: range.to } : {}),
  };
}

function projectPublisherListing(
  record: Record<string, unknown>,
  fallbackListingId?: string,
): AppstoreAdminPublisherListingAnalytics | undefined {
  const listingId = readString(record, 'listingId', 'listing_id', 'id') || fallbackListingId || '';
  if (!listingId) {
    return undefined;
  }
  const listingStatus = readString(record, 'listingStatus', 'listing_status', 'status');
  const revenueAmount = readNumber(record, 'revenueAmount', 'revenue_amount', 'revenue', 'totalRevenue', 'total_revenue');
  const revenueCurrency = readString(record, 'revenueCurrency', 'revenue_currency', 'currency');
  const averageRating = readNumber(record, 'averageRating', 'average_rating', 'ratingAverage', 'rating_average');
  const conversionRatio = readRatio(record, 'conversionRatio', 'conversion_ratio', 'conversionRate', 'conversion_rate');
  return {
    listingId,
    displayName: readString(record, 'displayName', 'display_name', 'name', 'listingName', 'listing_name') || listingId,
    ...(listingStatus ? { listingStatus: normalizeToken(listingStatus) } : {}),
    installs: readNumber(record, 'installs', 'installCount', 'install_count') ?? 0,
    uninstalls: readNumber(record, 'uninstalls', 'uninstallCount', 'uninstall_count') ?? 0,
    pageViews: readNumber(record, 'pageViews', 'page_views', 'views', 'viewCount', 'view_count') ?? 0,
    impressions: readNumber(record, 'impressions', 'impressionCount', 'impression_count') ?? 0,
    ...(revenueAmount === undefined ? {} : { revenueAmount }),
    ...(revenueCurrency ? { revenueCurrency } : {}),
    ...(averageRating === undefined ? {} : { averageRating }),
    ...(conversionRatio === undefined ? {} : { conversionRatio }),
  };
}
