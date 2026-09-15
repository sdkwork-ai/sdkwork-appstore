import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, RefreshCw } from 'lucide-react';
import {
  APPSTORE_ADMIN_LISTING_OPERATIONS,
  APPSTORE_ADMIN_PERMISSIONS,
  APPSTORE_ADMIN_ROUTE_PREFIX,
  formatAdminPercent,
  useAppstoreAdminQuery,
  useAppstoreAdminServices,
  type AppstoreAdminListingMetricPoint,
} from '@sdkwork/appstore-pc-admin-core';
import {
  AdminActionButton,
  AdminDataTable,
  AdminDetailList,
  AdminKpiCard,
  AdminPageHeader,
  AdminSection,
  AdminStatePlaceholder,
  type AdminTableColumn,
  useAppstoreAdminPermission,
} from '@sdkwork/appstore-pc-admin-shell';

import { ListingStatusBadge, ListingVisibilityBadge } from '../components/ListingStatusBadge';
import { VisibilityChangeDialog } from '../components/VisibilityChangeDialog';
import { formatListingCount, formatListingRating } from '../format';

/** `listings-detail` — listing inspector with storefront visibility control. */
export function ListingDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const services = useAppstoreAdminServices();
  const params = useParams();
  const listingId = params.listingId ?? '';
  const canManageVisibility = useAppstoreAdminPermission(APPSTORE_ADMIN_PERMISSIONS.listingsManage);
  const canReadMetrics = useAppstoreAdminPermission(APPSTORE_ADMIN_PERMISSIONS.listingMetricsRead);

  const [changingVisibility, setChangingVisibility] = useState(false);

  const query = useAppstoreAdminQuery(
    APPSTORE_ADMIN_LISTING_OPERATIONS.retrieveListing,
    () => services.listings.getListing(listingId),
    [services, listingId],
  );

  const listing = query.data;
  const notAvailable = t('adminShell.common.notAvailable');

  return (
    <div className="space-y-4">
      <AdminPageHeader
        description={t('adminListings.detail.description')}
        meta={
          listing ? (
            <div className="flex items-center gap-1.5">
              <ListingStatusBadge status={listing.listingStatus} />
              <ListingVisibilityBadge visibility={listing.storefrontVisibility} />
            </div>
          ) : undefined
        }
        title={listing?.displayName || t('adminListings.detail.title')}
        actions={
          <>
            <AdminActionButton
              onClick={() => navigate(`${APPSTORE_ADMIN_ROUTE_PREFIX}/listings`)}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t('adminListings.detail.back')}
            </AdminActionButton>
            <AdminActionButton onClick={query.reload} disabled={query.loading}>
              <RefreshCw className={`h-3.5 w-3.5 ${query.loading ? 'animate-spin' : ''}`} />
              {t('adminShell.common.refresh')}
            </AdminActionButton>
            {canManageVisibility && listing ? (
              <AdminActionButton onClick={() => setChangingVisibility(true)} variant="primary">
                <Eye className="h-3.5 w-3.5" />
                {t('adminListings.detail.actions.changeVisibility')}
              </AdminActionButton>
            ) : null}
          </>
        }
      />

      {query.loading && !listing ? (
        <AdminStatePlaceholder kind="loading" />
      ) : query.error ? (
        <AdminStatePlaceholder error={query.error} kind="error" onRetry={query.reload} />
      ) : !listing ? (
        <AdminStatePlaceholder
          description={t('adminListings.detail.notFound')}
          kind="notFound"
        />
      ) : (
        <>
          <AdminSection title={t('adminListings.detail.title')}>
            <AdminDetailList
              columns={3}
              entries={[
                { label: t('adminListings.detail.fields.displayName'), value: listing.displayName || notAvailable },
                { label: t('adminListings.detail.fields.listingId'), value: listing.listingId, mono: true },
                { label: t('adminListings.detail.fields.listingCode'), value: listing.listingCode || notAvailable, mono: true },
                { label: t('adminListings.detail.fields.publisherName'), value: listing.publisherName || notAvailable },
                { label: t('adminListings.detail.fields.publisherId'), value: listing.publisherId || notAvailable, mono: true },
                { label: t('adminListings.detail.fields.categoryCode'), value: listing.categoryCode || notAvailable, mono: true },
                { label: t('adminListings.detail.fields.platform'), value: listing.platform || notAvailable, mono: true },
                { label: t('adminListings.detail.fields.latestReleaseVersion'), value: listing.latestReleaseVersion || notAvailable, mono: true },
                { label: t('adminListings.detail.fields.updatedAt'), value: listing.updatedAt || notAvailable, mono: true },
              ]}
            />
          </AdminSection>

          {canReadMetrics ? <ListingMetricsSection listingId={listingId} /> : null}
        </>
      )}

      <VisibilityChangeDialog
        listingId={listingId}
        onClose={() => setChangingVisibility(false)}
        onCompleted={query.reload}
        open={changingVisibility}
      />
    </div>
  );
}

/**
 * `appstore.metrics.listings.retrieve` — KPI row plus the daily metric series.
 *
 * Mounted only when the operator holds `appstore.metrics.read`, so an
 * unauthorized operator never triggers the metrics request.
 */
function ListingMetricsSection({ listingId }: { listingId: string }) {
  const { t } = useTranslation();
  const services = useAppstoreAdminServices();

  const query = useAppstoreAdminQuery(
    APPSTORE_ADMIN_LISTING_OPERATIONS.retrieveMetrics,
    () => services.listings.getListingMetrics(listingId),
    [services, listingId],
  );

  const metrics = query.data;
  const series = metrics?.series ?? [];

  const columns: AdminTableColumn<AppstoreAdminListingMetricPoint>[] = [
    {
      key: 'date',
      header: t('adminListings.metrics.columns.date'),
      render: (point) => (
        <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
          {point.date || t('adminShell.common.notAvailable')}
        </span>
      ),
    },
    {
      key: 'impressions',
      header: t('adminListings.metrics.columns.impressions'),
      align: 'right',
      render: (point) => (
        <span className="tabular-nums">{formatListingCount(point.impressions)}</span>
      ),
    },
    {
      key: 'pageViews',
      header: t('adminListings.metrics.columns.pageViews'),
      align: 'right',
      render: (point) => (
        <span className="tabular-nums">{formatListingCount(point.pageViews)}</span>
      ),
    },
    {
      key: 'installs',
      header: t('adminListings.metrics.columns.installs'),
      align: 'right',
      render: (point) => (
        <span className="tabular-nums">{formatListingCount(point.installs)}</span>
      ),
    },
    {
      key: 'uninstalls',
      header: t('adminListings.metrics.columns.uninstalls'),
      align: 'right',
      render: (point) => (
        <span className="tabular-nums">{formatListingCount(point.uninstalls)}</span>
      ),
    },
  ];

  return (
    <AdminSection
      description={t('adminListings.metrics.description')}
      title={t('adminListings.metrics.title')}
    >
      {query.loading && !metrics ? (
        <AdminStatePlaceholder inline kind="loading" />
      ) : query.error ? (
        <AdminStatePlaceholder error={query.error} inline kind="error" onRetry={query.reload} />
      ) : !metrics ? (
        <AdminStatePlaceholder
          inline
          kind="empty"
          description={t('adminListings.metrics.empty')}
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
            <AdminKpiCard
              label={t('adminListings.metrics.kpi.impressions')}
              value={formatListingCount(metrics.impressions)}
            />
            <AdminKpiCard
              label={t('adminListings.metrics.kpi.pageViews')}
              value={formatListingCount(metrics.pageViews)}
            />
            <AdminKpiCard
              label={t('adminListings.metrics.kpi.installs')}
              tone="positive"
              value={formatListingCount(metrics.installs)}
            />
            <AdminKpiCard
              label={t('adminListings.metrics.kpi.uninstalls')}
              value={formatListingCount(metrics.uninstalls)}
            />
            <AdminKpiCard
              label={t('adminListings.metrics.kpi.conversionRatio')}
              tone="info"
              value={formatAdminPercent(metrics.conversionRatio)}
            />
            <AdminKpiCard
              label={t('adminListings.metrics.kpi.averageRating')}
              value={formatListingRating(metrics.averageRating)}
            />
          </div>
          <AdminDataTable
            caption={t('adminListings.metrics.series')}
            columns={columns}
            dense
            emptyContent={
              <AdminStatePlaceholder
                inline
                kind="empty"
                description={t('adminListings.metrics.empty')}
              />
            }
            rowKey={(point) => point.date}
            rows={series}
          />
        </div>
      )}
    </AdminSection>
  );
}
