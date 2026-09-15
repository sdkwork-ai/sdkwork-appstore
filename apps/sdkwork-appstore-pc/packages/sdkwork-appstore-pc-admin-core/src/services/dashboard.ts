import type { SdkworkAppstoreBackendClient } from '@sdkwork/appstore-backend-sdk';

import { executeAdminOperation } from './errors';
import {
  type AppstoreAdminDateRange,
  type AppstoreAdminPage,
  emptyPage,
  mapPage,
  readNumber,
  readRatio,
  readRecord,
  readString,
  asRecord,
} from './viewModel';

/**
 * `appstore.analytics.operator.dashboard.retrieve`
 * (`GET /backend/v3/api/analytics/operator/dashboard`, permission
 * `appstore.analytics.operator`).
 */
export const APPSTORE_ADMIN_OPERATOR_DASHBOARD_OPERATION =
  'appstore.analytics.operator.dashboard.retrieve';

/**
 * `appstore.analytics.operator.search.retrieve`
 * (`GET /backend/v3/api/analytics/operator/search`, permission
 * `appstore.analytics.operator`).
 */
export const APPSTORE_ADMIN_OPERATOR_SEARCH_OPERATION =
  'appstore.analytics.operator.search.retrieve';

/** Storefront-wide operator KPIs. */
export interface AppstoreAdminDashboardSummary {
  totalListings: number;
  totalDownloads: number;
  totalReviews: number;
  pendingModeration: number;
  activePublishers: number;
  dailyInstalls: number;
}

/** One aggregated operator search query. */
export interface AppstoreAdminSearchTerm {
  term: string;
  searchCount: number;
  resultCount: number;
  /** Zero-result share in `0..1`. */
  zeroResultRatio?: number;
  /** Click-through share in `0..1`. */
  clickThroughRatio?: number;
  topListingId?: string;
  topListingName?: string;
}

export interface AppstoreAdminSearchAnalyticsQuery {
  range?: AppstoreAdminDateRange;
  /** Free-text filter forwarded as the `q` parameter. */
  query?: string;
  pageSize?: number;
}

export interface AppstoreAdminDashboardPort {
  /** Operator KPI snapshot. `undefined` when the backend returns no payload. */
  getSummary(range?: AppstoreAdminDateRange): Promise<AppstoreAdminDashboardSummary | undefined>;
  /** Aggregated storefront search terms for the requested window. */
  listSearchTerms(
    query?: AppstoreAdminSearchAnalyticsQuery,
  ): Promise<AppstoreAdminPage<AppstoreAdminSearchTerm>>;
}

export function createAppstoreAdminDashboardPort(
  client: SdkworkAppstoreBackendClient,
): AppstoreAdminDashboardPort {
  return {
    async getSummary(range) {
      const payload = await executeAdminOperation(
        APPSTORE_ADMIN_OPERATOR_DASHBOARD_OPERATION,
        () =>
          client.analytics.appstore.analytics.operator.dashboard.retrieve(
            buildRangeParams(range),
          ),
      );
      return projectDashboardSummary(payload);
    },

    async listSearchTerms(query) {
      const payload = await executeAdminOperation(
        APPSTORE_ADMIN_OPERATOR_SEARCH_OPERATION,
        () =>
          client.analytics.appstore.analytics.operator.search.retrieve({
            ...buildRangeParams(query?.range),
            ...(query?.query?.trim() ? { q: query.query.trim() } : {}),
            ...(query?.pageSize === undefined ? {} : { pageSize: query.pageSize }),
          }),
      );
      if (!payload) {
        return emptyPage<AppstoreAdminSearchTerm>();
      }
      return mapPage(payload, (record) => {
        const term = readString(record, 'term', 'query', 'keyword', 'searchTerm', 'search_term');
        if (!term) {
          return undefined;
        }
        const topListing = readRecord(record, 'topListing', 'top_listing', 'topResult', 'top_result');
        const topListingId = readString(topListing, 'listingId', 'listing_id', 'id')
          || readString(record, 'topListingId', 'top_listing_id');
        const topListingName = readString(topListing, 'displayName', 'display_name', 'name')
          || readString(record, 'topListingName', 'top_listing_name');
        const zeroResultRatio = readRatio(
          record,
          'zeroResultRatio',
          'zero_result_ratio',
          'zeroResultRate',
          'zero_result_rate',
        );
        const clickThroughRatio = readRatio(
          record,
          'clickThroughRatio',
          'click_through_ratio',
          'clickThroughRate',
          'click_through_rate',
          'ctr',
        );
        return {
          term,
          searchCount: readNumber(record, 'searchCount', 'search_count', 'count', 'totalSearches', 'total_searches') ?? 0,
          resultCount: readNumber(record, 'resultCount', 'result_count', 'results', 'totalResults', 'total_results') ?? 0,
          ...(zeroResultRatio === undefined ? {} : { zeroResultRatio }),
          ...(clickThroughRatio === undefined ? {} : { clickThroughRatio }),
          ...(topListingId ? { topListingId } : {}),
          ...(topListingName ? { topListingName } : {}),
        } satisfies AppstoreAdminSearchTerm;
      });
    },
  };
}

function buildRangeParams(
  range: AppstoreAdminDateRange | undefined,
): { dateFrom?: string; dateTo?: string } {
  return {
    ...(range?.from ? { dateFrom: range.from } : {}),
    ...(range?.to ? { dateTo: range.to } : {}),
  };
}

/**
 * The operator dashboard payload has no typed schema on the wire, and different
 * backend revisions have shipped both flat and `summary`-nested layouts, so
 * probe the known locations before falling back to zeroed KPIs.
 */
function projectDashboardSummary(payload: unknown): AppstoreAdminDashboardSummary | undefined {
  const root = asRecord(payload);
  if (!root || Object.keys(root).length === 0) {
    return undefined;
  }
  const summary = readRecord(root, 'summary', 'kpis', 'metrics', 'overview') ?? root;
  return {
    totalListings:
      readNumber(summary, 'totalListings', 'total_listings', 'listingCount', 'listing_count') ?? 0,
    totalDownloads:
      readNumber(summary, 'totalDownloads', 'total_downloads', 'downloadCount', 'download_count') ?? 0,
    totalReviews:
      readNumber(summary, 'totalReviews', 'total_reviews', 'reviewCount', 'review_count') ?? 0,
    pendingModeration:
      readNumber(summary, 'pendingModeration', 'pending_moderation', 'pendingReviews', 'pending_reviews') ?? 0,
    activePublishers:
      readNumber(summary, 'activePublishers', 'active_publishers', 'publisherCount', 'publisher_count') ?? 0,
    dailyInstalls:
      readNumber(summary, 'dailyInstalls', 'daily_installs', 'installsToday', 'installs_today') ?? 0,
  };
}
