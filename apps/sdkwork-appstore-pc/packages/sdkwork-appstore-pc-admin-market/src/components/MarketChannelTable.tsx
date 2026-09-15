import { useTranslation } from 'react-i18next';
import {
  formatAdminDate,
  type AppstoreAdminMarketChannel,
} from '@sdkwork/appstore-pc-admin-core';
import {
  AdminActionButton,
  AdminDataTable,
  AdminStatePlaceholder,
  type AdminTableColumn,
} from '@sdkwork/appstore-pc-admin-shell';

import { MarketChannelStatusBadge, MarketChannelTypeBadge } from './MarketStatusBadge';

export interface MarketChannelTableProps {
  items: readonly AppstoreAdminMarketChannel[];
  loading: boolean;
  /** Row edit handler; omitted when the operator lacks write access. */
  onEdit?: (channel: AppstoreAdminMarketChannel) => void;
  /** Whether the edit affordance is available. */
  canWrite?: boolean;
}

/** Operator channel grid: one row per external market channel. */
export function MarketChannelTable({
  canWrite = false,
  items,
  loading,
  onEdit,
}: MarketChannelTableProps) {
  const { t } = useTranslation();
  const notAvailable = t('adminShell.common.notAvailable');

  const columns: AdminTableColumn<AppstoreAdminMarketChannel>[] = [
    {
      key: 'channelCode',
      header: t('adminMarket.channels.columns.channelCode'),
      render: (item) => (
        <span className="font-mono text-[11px] text-gray-600 dark:text-gray-300">
          {item.channelCode || notAvailable}
        </span>
      ),
    },
    {
      key: 'channelType',
      header: t('adminMarket.channels.columns.channelType'),
      width: 'w-40',
      render: (item) => <MarketChannelTypeBadge channelType={item.channelType} />,
    },
    {
      key: 'provider',
      header: t('adminMarket.channels.columns.provider'),
      width: 'w-40',
      hideBelowLarge: true,
      render: (item) => (
        <span className="truncate text-xs text-gray-600 dark:text-gray-300">
          {item.provider || notAvailable}
        </span>
      ),
    },
    {
      key: 'channelStatus',
      header: t('adminMarket.channels.columns.status'),
      width: 'w-28',
      render: (item) => <MarketChannelStatusBadge status={item.channelStatus} />,
    },
    {
      key: 'externalStoreCode',
      header: t('adminMarket.channels.columns.externalStoreCode'),
      width: 'w-40',
      hideBelowLarge: true,
      render: (item) => (
        <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
          {item.externalStoreCode || notAvailable}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      header: t('adminMarket.channels.columns.updatedAt'),
      width: 'w-32',
      hideBelowLarge: true,
      render: (item) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatAdminDate(item.updatedAt) || notAvailable}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('adminMarket.channels.columns.actions'),
      width: 'w-24',
      align: 'right',
      render: (item) =>
        canWrite ? (
          <AdminActionButton onClick={() => onEdit?.(item)}>
            {t('adminMarket.channels.edit')}
          </AdminActionButton>
        ) : null,
    },
  ];

  return (
    <AdminDataTable
      caption={t('adminMarket.channels.title')}
      columns={columns}
      dense
      emptyContent={
        <AdminStatePlaceholder inline kind="empty" description={t('adminMarket.channels.empty')} />
      }
      loading={loading}
      loadingContent={<AdminStatePlaceholder inline kind="loading" />}
      rowKey={(item) => item.marketChannelId}
      rows={items}
    />
  );
}
