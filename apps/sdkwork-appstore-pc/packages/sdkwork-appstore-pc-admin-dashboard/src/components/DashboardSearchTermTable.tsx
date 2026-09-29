import { useTranslation } from 'react-i18next';
import {
  APPSTORE_ADMIN_UNKNOWN_TEXT,
  formatAdminPercent,
  type AppstoreAdminSearchTerm,
} from '@sdkwork/appstore-pc-admin-core';
import {
  AdminDataTable,
  AdminStatePlaceholder,
  type AdminTableColumn,
} from '@sdkwork/appstore-pc-admin-shell';

/**
 * Render one optional ratio.
 *
 * The backend may omit either ratio, and an absent ratio means "not measured",
 * which must not be presented as `0%`.
 */
function formatRatio(ratio: number | undefined): string {
  return ratio === undefined ? APPSTORE_ADMIN_UNKNOWN_TEXT : formatAdminPercent(ratio);
}

export interface DashboardSearchTermTableProps {
  items: readonly AppstoreAdminSearchTerm[];
  loading: boolean;
}

/** Operator search-analytics grid: one row per aggregated storefront search term. */
export function DashboardSearchTermTable({ items, loading }: DashboardSearchTermTableProps) {
  const { t } = useTranslation();

  const columns: AdminTableColumn<AppstoreAdminSearchTerm>[] = [
    {
      key: 'term',
      header: t('adminDashboard.search.columns.term'),
      render: (item) => (
        <span className="font-medium text-store-ink ">{item.term}</span>
      ),
    },
    {
      key: 'searchCount',
      header: t('adminDashboard.search.columns.searchCount'),
      width: 'w-28',
      align: 'right',
      render: (item) => (
        <span className="tabular-nums text-xs text-store-ink-soft ">
          {item.searchCount}
        </span>
      ),
    },
    {
      key: 'resultCount',
      header: t('adminDashboard.search.columns.resultCount'),
      width: 'w-28',
      align: 'right',
      render: (item) => (
        <span className="tabular-nums text-xs text-store-ink-soft ">
          {item.resultCount}
        </span>
      ),
    },
    {
      key: 'zeroResultRatio',
      header: t('adminDashboard.search.columns.zeroResultRatio'),
      width: 'w-32',
      align: 'right',
      hideBelowLarge: true,
      render: (item) => (
        <span className="tabular-nums text-xs text-store-ink-faint ">
          {formatRatio(item.zeroResultRatio)}
        </span>
      ),
    },
    {
      key: 'clickThroughRatio',
      header: t('adminDashboard.search.columns.clickThroughRatio'),
      width: 'w-32',
      align: 'right',
      hideBelowLarge: true,
      render: (item) => (
        <span className="tabular-nums text-xs text-store-ink-faint ">
          {formatRatio(item.clickThroughRatio)}
        </span>
      ),
    },
    {
      key: 'topListing',
      header: t('adminDashboard.search.columns.topListing'),
      hideBelowLarge: true,
      render: (item) => (
        <div className="min-w-0">
          <p className="truncate text-store-ink-soft ">
            {item.topListingName || t('adminShell.common.notAvailable')}
          </p>
        </div>
      ),
    },
  ];

  return (
    <AdminDataTable
      caption={t('adminDashboard.search.title')}
      columns={columns}
      dense
      emptyContent={
        <AdminStatePlaceholder inline kind="empty" description={t('adminDashboard.search.empty')} />
      }
      loading={loading}
      loadingContent={<AdminStatePlaceholder inline kind="loading" />}
      rowKey={(item) => item.term}
      rows={items}
    />
  );
}
