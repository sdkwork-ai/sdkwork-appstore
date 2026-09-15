import { useTranslation } from 'react-i18next';
import type { AppstoreAdminMarketRelease } from '@sdkwork/appstore-pc-admin-core';
import {
  AdminActionButton,
  AdminDataTable,
  AdminStatePlaceholder,
  type AdminTableColumn,
} from '@sdkwork/appstore-pc-admin-shell';

import { MarketReleaseStatusBadge } from './MarketStatusBadge';

export interface MarketReleaseTableProps {
  items: readonly AppstoreAdminMarketRelease[];
  loading: boolean;
  /** Row sync handler; omitted when the operator lacks the sync permission. */
  onSync?: (release: AppstoreAdminMarketRelease) => void;
  /** Whether the synchronization affordance is available. */
  canSync?: boolean;
}

/** Operator release grid: one row per listing projection on a channel. */
export function MarketReleaseTable({
  canSync = false,
  items,
  loading,
  onSync,
}: MarketReleaseTableProps) {
  const { t } = useTranslation();
  const notAvailable = t('adminShell.common.notAvailable');

  const columns: AdminTableColumn<AppstoreAdminMarketRelease>[] = [
    {
      key: 'marketRelease',
      header: t('adminMarket.releases.columns.marketReleaseId'),
      render: (item) => (
        <span className="font-mono text-[11px] text-gray-600 dark:text-gray-300">
          {item.marketReleaseId}
        </span>
      ),
    },
    {
      key: 'release',
      header: t('adminMarket.releases.columns.releaseId'),
      hideBelowLarge: true,
      render: (item) => (
        <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
          {item.releaseId || notAvailable}
        </span>
      ),
    },
    {
      key: 'channel',
      header: t('adminMarket.releases.columns.channel'),
      width: 'w-40',
      render: (item) => (
        <div className="min-w-0">
          <p className="truncate font-mono text-[11px] text-gray-500 dark:text-gray-400">
            {item.channelId || notAvailable}
          </p>
          {item.channelCode ? (
            <p className="truncate font-mono text-[11px] text-gray-400 dark:text-gray-500">
              {item.channelCode}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: 'listing',
      header: t('adminMarket.releases.columns.listing'),
      render: (item) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-gray-900 dark:text-gray-50">
            {item.listingName || notAvailable}
          </p>
          <p className="truncate font-mono text-[11px] text-gray-400 dark:text-gray-500">
            {item.listingId || notAvailable}
          </p>
        </div>
      ),
    },
    {
      key: 'marketStatus',
      header: t('adminMarket.releases.columns.status'),
      width: 'w-32',
      render: (item) => <MarketReleaseStatusBadge status={item.marketStatus} />,
    },
    {
      key: 'externalReleaseCode',
      header: t('adminMarket.releases.columns.externalReleaseCode'),
      width: 'w-40',
      hideBelowLarge: true,
      render: (item) => (
        <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
          {item.externalReleaseCode || notAvailable}
        </span>
      ),
    },
    {
      key: 'lastSyncedAt',
      header: t('adminMarket.releases.columns.lastSyncedAt'),
      width: 'w-32',
      hideBelowLarge: true,
      render: (item) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {item.lastSyncedDate || notAvailable}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('adminMarket.releases.columns.actions'),
      width: 'w-24',
      align: 'right',
      render: (item) =>
        canSync ? (
          <AdminActionButton onClick={() => onSync?.(item)} variant="primary">
            {t('adminMarket.releases.sync')}
          </AdminActionButton>
        ) : null,
    },
  ];

  return (
    <AdminDataTable
      caption={t('adminMarket.releases.title')}
      columns={columns}
      dense
      emptyContent={
        <AdminStatePlaceholder inline kind="empty" description={t('adminMarket.releases.empty')} />
      }
      loading={loading}
      loadingContent={<AdminStatePlaceholder inline kind="loading" />}
      rowKey={(item) => item.marketReleaseId}
      rows={items}
    />
  );
}
