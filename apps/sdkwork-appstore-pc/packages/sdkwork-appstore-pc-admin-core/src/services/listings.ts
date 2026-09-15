import type { SdkworkAppstoreBackendClient } from '@sdkwork/appstore-backend-sdk';

import { executeAdminOperation, requireAdminIdentifier } from './errors';
import {
  type AppstoreAdminDateRange,
  type AppstoreAdminPage,
  emptyPage,
  formatAdminDate,
  mapPage,
  readNumber,
  readRatio,
  readRecords,
  readSingleRecord,
  readString,
  normalizeToken,
} from './viewModel';

/**
 * Catalog operation ids owned by this port
 * (`docs/api/operation-catalog.md`, permissions `appstore.listings.admin*`,
 * `appstore.metrics.read`).
 */
export const APPSTORE_ADMIN_LISTING_OPERATIONS = {
  listListings: 'appstore.listings.admin.list',
  retrieveListing: 'appstore.listings.admin.retrieve',
  updateVisibility: 'appstore.listings.admin.visibility.update',
  retrieveMetrics: 'appstore.metrics.listings.retrieve',
} as const;

/** Storefront visibility states accepted by the visibility operation. */
export const APPSTORE_ADMIN_VISIBILITY_STATES = [
  'VISIBLE',
  'HIDDEN',
  'DELISTED',
  'REGION_RESTRICTED',
] as const;

export type AppstoreAdminVisibilityState = (typeof APPSTORE_ADMIN_VISIBILITY_STATES)[number] | string;

export interface AppstoreAdminListingSummary {
  listingId: string;
  listingCode: string;
  displayName: string;
  publisherId: string;
  publisherName?: string;
  listingStatus: string;
  storefrontVisibility?: string;
  categoryCode?: string;
  platform?: string;
  latestReleaseVersion?: string;
  updatedAt?: string;
  updatedDate: string;
}

/** One day of listing metrics. */
export interface AppstoreAdminListingMetricPoint {
  date: string;
  impressions: number;
  pageViews: number;
  installs: number;
  uninstalls: number;
  /** Storefront conversion share in `0..1`, when reported. */
  conversionRatio?: number;
}

export interface AppstoreAdminListingMetrics {
  listingId: string;
  from?: string;
  to?: string;
  impressions: number;
  pageViews: number;
  installs: number;
  uninstalls: number;
  conversionRatio?: number;
  averageRating?: number;
  /** Daily series in the order returned by the backend. */
  series: AppstoreAdminListingMetricPoint[];
}

export interface AppstoreAdminListingsQuery {
  listingStatus?: string;
  cursor?: string;
  pageSize?: number;
}

export interface AppstoreAdminVisibilityInput {
  storefrontVisibility: AppstoreAdminVisibilityState;
  reason?: string;
}

export interface AppstoreAdminListingsPort {
  listListings(
    query?: AppstoreAdminListingsQuery,
  ): Promise<AppstoreAdminPage<AppstoreAdminListingSummary>>;
  getListing(listingId: string): Promise<AppstoreAdminListingSummary | undefined>;
  updateVisibility(listingId: string, input: AppstoreAdminVisibilityInput): Promise<void>;
  getListingMetrics(
    listingId: string,
    range?: AppstoreAdminDateRange,
  ): Promise<AppstoreAdminListingMetrics | undefined>;
}

export function createAppstoreAdminListingsPort(
  client: SdkworkAppstoreBackendClient,
): AppstoreAdminListingsPort {
  const operations = APPSTORE_ADMIN_LISTING_OPERATIONS;

  return {
    async listListings(query) {
      const payload = await executeAdminOperation(operations.listListings, () =>
        client.listings.appstore.listings.admin.list({
          ...(query?.listingStatus ? { listingStatus: query.listingStatus } : {}),
          ...(query?.cursor ? { cursor: query.cursor } : {}),
          ...(query?.pageSize === undefined ? {} : { pageSize: query.pageSize }),
        }),
      );
      if (!payload) {
        return emptyPage<AppstoreAdminListingSummary>();
      }
      return mapPage(payload, (record) => projectListingSummary(record));
    },

    async getListing(listingId) {
      const id = requireAdminIdentifier(listingId, 'listingId');
      const payload = await executeAdminOperation(operations.retrieveListing, () =>
        client.listings.appstore.listings.admin.retrieve(id),
      );
      const record = readSingleRecord(payload);
      return record ? projectListingSummary(record, id) : undefined;
    },

    async updateVisibility(listingId, input) {
      const id = requireAdminIdentifier(listingId, 'listingId');
      const storefrontVisibility = requireAdminIdentifier(
        input.storefrontVisibility,
        'storefrontVisibility',
      );
      await executeAdminOperation(operations.updateVisibility, () =>
        client.listings.appstore.listings.admin.visibility.update(id, {
          storefrontVisibility,
          ...(input.reason?.trim() ? { reason: input.reason.trim() } : {}),
        }),
      );
    },

    async getListingMetrics(listingId, range) {
      const id = requireAdminIdentifier(listingId, 'listingId');
      const payload = await executeAdminOperation(operations.retrieveMetrics, () =>
        client.metrics.appstore.metrics.listings.retrieve(id, {
          ...(range?.from ? { fromDate: range.from } : {}),
          ...(range?.to ? { toDate: range.to } : {}),
        }),
      );
      if (!payload) {
        return undefined;
      }
      return projectListingMetrics(payload, id, range);
    },
  };
}

function projectListingSummary(
  record: Record<string, unknown>,
  fallbackListingId?: string,
): AppstoreAdminListingSummary | undefined {
  const listingId = readString(record, 'listingId', 'listing_id', 'id') || fallbackListingId || '';
  if (!listingId) {
    return undefined;
  }
  const updatedAt = readString(record, 'updatedAt', 'updated_at');
  const publisherName = readString(record, 'publisherName', 'publisher_name', 'developerName', 'developer_name');
  const storefrontVisibility = readString(record, 'storefrontVisibility', 'storefront_visibility', 'visibility');
  const categoryCode = readString(record, 'categoryCode', 'category_code', 'category');
  const platform = readString(record, 'platform', 'platformCode', 'platform_code');
  const latestReleaseVersion = readString(
    record,
    'latestReleaseVersion',
    'latest_release_version',
    'version',
  );
  return {
    listingId,
    listingCode: readString(record, 'listingCode', 'listing_code', 'code'),
    displayName:
      readString(record, 'displayName', 'display_name', 'name', 'title') || listingId,
    publisherId: readString(record, 'publisherId', 'publisher_id'),
    ...(publisherName ? { publisherName } : {}),
    listingStatus: normalizeToken(readString(record, 'listingStatus', 'listing_status', 'status'), 'UNKNOWN'),
    ...(storefrontVisibility ? { storefrontVisibility: normalizeToken(storefrontVisibility) } : {}),
    ...(categoryCode ? { categoryCode } : {}),
    ...(platform ? { platform } : {}),
    ...(latestReleaseVersion ? { latestReleaseVersion } : {}),
    ...(updatedAt ? { updatedAt } : {}),
    updatedDate: formatAdminDate(updatedAt),
  };
}

function projectListingMetrics(
  payload: unknown,
  listingId: string,
  range: AppstoreAdminDateRange | undefined,
): AppstoreAdminListingMetrics {
  const seriesRecords = readRecords(payload, 'items', 'series', 'points', 'daily', 'data');
  const series: AppstoreAdminListingMetricPoint[] = [];
  for (const record of seriesRecords) {
    const date = formatAdminDate(readString(record, 'date', 'statDate', 'stat_date', 'day', 'createdAt', 'created_at'));
    const conversionRatio = readRatio(record, 'conversionRatio', 'conversion_ratio', 'conversionRate', 'conversion_rate');
    series.push({
      date,
      impressions: readNumber(record, 'impressions', 'impressionCount', 'impression_count') ?? 0,
      pageViews: readNumber(record, 'pageViews', 'page_views', 'views', 'viewCount', 'view_count') ?? 0,
      installs: readNumber(record, 'installs', 'installCount', 'install_count', 'downloads') ?? 0,
      uninstalls: readNumber(record, 'uninstalls', 'uninstallCount', 'uninstall_count') ?? 0,
      ...(conversionRatio === undefined ? {} : { conversionRatio }),
    });
  }

  // Totals may be reported explicitly on the payload; when they are not,
  // derive them from the series so the KPI row still renders real numbers.
  const totalsSource = readSingleRecord(payload) ?? {};
  const conversionRatio = readRatio(
    totalsSource,
    'conversionRatio',
    'conversion_ratio',
    'conversionRate',
    'conversion_rate',
  );
  const averageRating = readNumber(totalsSource, 'averageRating', 'average_rating', 'ratingAverage', 'rating_average');
  const from = readString(totalsSource, 'fromDate', 'from_date', 'from') || range?.from;
  const to = readString(totalsSource, 'toDate', 'to_date', 'to') || range?.to;

  return {
    listingId,
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
    impressions: readNumber(totalsSource, 'impressions', 'totalImpressions', 'total_impressions')
      ?? sumSeries(series, 'impressions'),
    pageViews: readNumber(totalsSource, 'pageViews', 'page_views', 'totalPageViews', 'total_page_views')
      ?? sumSeries(series, 'pageViews'),
    installs: readNumber(totalsSource, 'installs', 'totalInstalls', 'total_installs')
      ?? sumSeries(series, 'installs'),
    uninstalls: readNumber(totalsSource, 'uninstalls', 'totalUninstalls', 'total_uninstalls')
      ?? sumSeries(series, 'uninstalls'),
    ...(conversionRatio === undefined ? {} : { conversionRatio }),
    ...(averageRating === undefined ? {} : { averageRating }),
    series,
  };
}

function sumSeries(
  series: readonly AppstoreAdminListingMetricPoint[],
  key: 'impressions' | 'pageViews' | 'installs' | 'uninstalls',
): number {
  return series.reduce((total, point) => total + point[key], 0);
}
