import { useTranslation } from 'react-i18next';
import {
  formatAdminPercent,
  type AppstoreAdminPublisherListingAnalytics,
} from '@sdkwork/appstore-pc-admin-core';
import {
  AdminActionButton,
  AdminDataTable,
  AdminStatePlaceholder,
  type AdminTableColumn,
} from '@sdkwork/appstore-pc-admin-shell';

import { formatPublisherCount, formatPublisherRating, formatPublisherRevenue } from '../format';
import { PublisherListingStatusBadge } from './PublisherListingStatusBadge';

export interface PublisherListingTableProps {
  items: readonly AppstoreAdminPublisherListingAnalytics[];
  loading: boolean;
  onOpenListing: (listingId: string) => void;
}

/** Operator analytics grid: one row per listing in the applied date range. */
export function PublisherListingTable({
  items,
  loading,
  onOpenListing,
}: PublisherListingTableProps) {
  const { t } = useTranslation();

  const columns: AdminTableColumn<AppstoreAdminPublisherListingAnalytics>[] = [
    {
      key: 'listing',
      header: t('adminPublishers.analytics.columns.listing'),
      render: (item) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-gray-900 dark:text-gray-50">{item.displayName}</p>
          <p className="truncate font-mono text-[11px] text-gray-400 dark:text-gray-500">
            {item.listingId}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      header: t('adminPublishers.analytics.columns.status'),
      width: 'w-32',
      render: (item) => <PublisherListingStatusBadge status={item.listingStatus} />,
    },
    {
      key: 'impressions',
      header: t('adminPublishers.analytics.columns.impressions'),
      width: 'w-28',
      align: 'right',
      hideBelowLarge: true,
      render: (item) => (
        <span className="text-xs tabular-nums text-gray-600 dark:text-gray-300">
          {formatPublisherCount(item.impressions)}
        </span>
      ),
    },
    {
      key: 'pageViews',
      header: t('adminPublishers.analytics.columns.pageViews'),
      width: 'w-28',
      align: 'right',
      hideBelowLarge: true,
      render: (item) => (
        <span className="text-xs tabular-nums text-gray-600 dark:text-gray-300">
          {formatPublisherCount(item.pageViews)}
        </span>
      ),
    },
    {
      key: 'installs',
      header: t('adminPublishers.analytics.columns.installs'),
      width: 'w-24',
      align: 'right',
      render: (item) => (
        <span className="text-xs tabular-nums text-gray-600 dark:text-gray-300">
          {formatPublisherCount(item.installs)}
        </span>
      ),
    },
    {
      key: 'uninstalls',
      header: t('adminPublishers.analytics.columns.uninstalls'),
      width: 'w-24',
      align: 'right',
      hideBelowLarge: true,
      render: (item) => (
        <span className="text-xs tabular-nums text-gray-600 dark:text-gray-300">
          {formatPublisherCount(item.uninstalls)}
        </span>
      ),
    },
    {
      key: 'revenue',
      header: t('adminPublishers.analytics.columns.revenue'),
      width: 'w-32',
      align: 'right',
      hideBelowLarge: true,
      render: (item) => (
        <span className="text-xs tabular-nums text-gray-600 dark:text-gray-300">
          {formatPublisherRevenue(item.revenueAmount, item.revenueCurrency)}
        </span>
      ),
    },
    {
      key: 'averageRating',
      header: t('adminPublishers.analytics.columns.averageRating'),
      width: 'w-28',
      align: 'right',
      hideBelowLarge: true,
      render: (item) => (
        <span className="text-xs tabular-nums text-gray-600 dark:text-gray-300">
          {formatPublisherRating(item.averageRating)}
        </span>
      ),
    },
    {
      key: 'conversionRatio',
      header: t('adminPublishers.analytics.columns.conversionRatio'),
      width: 'w-24',
      align: 'right',
      render: (item) => (
        <span className="text-xs tabular-nums text-gray-600 dark:text-gray-300">
          {formatAdminPercent(item.conversionRatio)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('adminPublishers.analytics.columns.actions'),
      width: 'w-24',
      align: 'right',
      render: (item) => (
        <AdminActionButton onClick={() => onOpenListing(item.listingId)}>
          {t('adminPublishers.analytics.detail')}
        </AdminActionButton>
      ),
    },
  ];

  return (
    <AdminDataTable
      caption={t('adminPublishers.analytics.title')}
      columns={columns}
      dense
      emptyContent={
        <AdminStatePlaceholder
          inline
          kind="empty"
          description={t('adminPublishers.analytics.listingsEmpty')}
        />
      }
      loading={loading}
      loadingContent={<AdminStatePlaceholder inline kind="loading" />}
      rowKey={(item) => item.listingId}
      rows={items}
    />
  );
}
