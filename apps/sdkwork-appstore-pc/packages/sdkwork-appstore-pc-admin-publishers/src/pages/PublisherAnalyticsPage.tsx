import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import {
  APPSTORE_ADMIN_PUBLISHER_OPERATIONS,
  formatAdminPercent,
  useAppstoreAdminQuery,
  useAppstoreAdminServices,
  type AppstoreAdminDateRange,
} from '@sdkwork/appstore-pc-admin-core';
import {
  AdminActionButton,
  AdminFormField,
  AdminKpiCard,
  AdminPageHeader,
  AdminPaginationBar,
  AdminSection,
  AdminStatePlaceholder,
  AdminToolbar,
  ADMIN_INPUT_CLASS,
} from '@sdkwork/appstore-pc-admin-shell';

import { PublisherListingDetailDialog } from '../components/PublisherListingDetailDialog';
import { PublisherListingTable } from '../components/PublisherListingTable';
import { formatPublisherCount, formatPublisherRating, formatPublisherRevenue } from '../format';

/** Listings requested per page; the backend owns the page-size ceiling. */
const LISTINGS_PAGE_SIZE = 50;

/**
 * `publishers.analytics` — publisher rollups and per-listing storefront metrics.
 *
 * Both reads share one date window so the KPI row and the table always describe
 * the same period; changing the window resets the cursor because a cursor minted
 * for one range cannot address another.
 */
export function PublisherAnalyticsPage() {
  const { t } = useTranslation();
  const services = useAppstoreAdminServices();

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [cursor, setCursor] = useState('');
  const [detailListingId, setDetailListingId] = useState<string | undefined>(undefined);

  const range = useMemo<AppstoreAdminDateRange>(
    () => ({ ...(from ? { from } : {}), ...(to ? { to } : {}) }),
    [from, to],
  );

  const overviewQuery = useAppstoreAdminQuery(
    APPSTORE_ADMIN_PUBLISHER_OPERATIONS.publisherOverview,
    () => services.publishers.getPublisherOverview(range),
    [services, range],
  );
  const listingsQuery = useAppstoreAdminQuery(
    APPSTORE_ADMIN_PUBLISHER_OPERATIONS.publisherListings,
    () =>
      services.publishers.listPublisherListings({
        range,
        ...(cursor ? { cursor } : {}),
        pageSize: LISTINGS_PAGE_SIZE,
      }),
    [services, range, cursor],
  );

  const overview = overviewQuery.data;
  const items = listingsQuery.data?.items ?? [];
  const pageInfo = listingsQuery.data?.pageInfo ?? { mode: 'cursor' as const };

  const handleRefresh = () => {
    overviewQuery.reload();
    listingsQuery.reload();
  };

  return (
    <div className="space-y-4">
      <AdminPageHeader
        description={t('adminPublishers.analytics.description')}
        title={t('adminPublishers.analytics.title')}
        actions={
          <AdminActionButton
            onClick={handleRefresh}
            disabled={overviewQuery.loading || listingsQuery.loading}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                overviewQuery.loading || listingsQuery.loading ? 'animate-spin' : ''
              }`}
            />
            {t('adminShell.common.refresh')}
          </AdminActionButton>
        }
      />

      <AdminToolbar>
        <AdminFormField
          htmlFor="publishers-analytics-from"
          label={t('adminPublishers.analytics.filterFrom')}
          layout="inline"
        >
          <input
            id="publishers-analytics-from"
            className={ADMIN_INPUT_CLASS}
            type="date"
            value={from}
            onChange={(event) => {
              setCursor('');
              setFrom(event.target.value);
            }}
          />
        </AdminFormField>
        <AdminFormField
          htmlFor="publishers-analytics-to"
          label={t('adminPublishers.analytics.filterTo')}
          layout="inline"
        >
          <input
            id="publishers-analytics-to"
            className={ADMIN_INPUT_CLASS}
            type="date"
            value={to}
            onChange={(event) => {
              setCursor('');
              setTo(event.target.value);
            }}
          />
        </AdminFormField>
      </AdminToolbar>

      <AdminSection title={t('adminPublishers.analytics.overview')}>
        {overviewQuery.error ? (
          <AdminStatePlaceholder
            error={overviewQuery.error}
            inline
            kind="error"
            onRetry={overviewQuery.reload}
          />
        ) : !overviewQuery.loading && !overview ? (
          <AdminStatePlaceholder
            inline
            kind="empty"
            description={t('adminPublishers.analytics.overviewEmpty')}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <AdminKpiCard
              label={t('adminPublishers.analytics.kpi.totalListings')}
              loading={overviewQuery.loading}
              value={formatPublisherCount(overview?.totalListings ?? 0)}
            />
            <AdminKpiCard
              label={t('adminPublishers.analytics.kpi.activeListings')}
              loading={overviewQuery.loading}
              value={formatPublisherCount(overview?.activeListings ?? 0)}
            />
            <AdminKpiCard
              label={t('adminPublishers.analytics.kpi.totalInstalls')}
              loading={overviewQuery.loading}
              value={formatPublisherCount(overview?.totalInstalls ?? 0)}
            />
            <AdminKpiCard
              label={t('adminPublishers.analytics.kpi.totalDownloads')}
              loading={overviewQuery.loading}
              value={formatPublisherCount(overview?.totalDownloads ?? 0)}
            />
            <AdminKpiCard
              label={t('adminPublishers.analytics.kpi.revenue')}
              loading={overviewQuery.loading}
              value={formatPublisherRevenue(overview?.totalRevenueAmount, overview?.revenueCurrency)}
            />
            <AdminKpiCard
              label={t('adminPublishers.analytics.kpi.averageRating')}
              loading={overviewQuery.loading}
              value={formatPublisherRating(overview?.averageRating)}
            />
            <AdminKpiCard
              label={t('adminPublishers.analytics.kpi.installToDownloadRatio')}
              loading={overviewQuery.loading}
              value={formatAdminPercent(overview?.installToDownloadRatio)}
            />
          </div>
        )}
      </AdminSection>

      {listingsQuery.error && items.length === 0 ? (
        <AdminStatePlaceholder
          error={listingsQuery.error}
          kind="error"
          onRetry={listingsQuery.reload}
        />
      ) : (
        <>
          <PublisherListingTable
            items={items}
            loading={listingsQuery.loading && items.length === 0}
            onOpenListing={setDetailListingId}
          />
          <AdminPaginationBar
            cursorApplied={Boolean(cursor)}
            loadedCount={items.length}
            loading={listingsQuery.loading}
            onNext={setCursor}
            onReset={() => setCursor('')}
            pageInfo={pageInfo}
          />
        </>
      )}

      {detailListingId ? (
        <PublisherListingDetailDialog
          listingId={detailListingId}
          onClose={() => setDetailListingId(undefined)}
          open
          range={range}
        />
      ) : null}
    </div>
  );
}
