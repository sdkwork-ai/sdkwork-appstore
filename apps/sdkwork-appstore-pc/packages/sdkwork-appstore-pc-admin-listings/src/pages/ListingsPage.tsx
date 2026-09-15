import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import {
  APPSTORE_ADMIN_LISTING_OPERATIONS,
  APPSTORE_ADMIN_ROUTE_PREFIX,
  useAppstoreAdminQuery,
  useAppstoreAdminServices,
  type AppstoreAdminListingSummary,
} from '@sdkwork/appstore-pc-admin-core';
import {
  AdminActionButton,
  AdminDataTable,
  AdminFormField,
  AdminPageHeader,
  AdminPaginationBar,
  AdminStatePlaceholder,
  AdminToolbar,
  ADMIN_INPUT_CLASS,
  type AdminTableColumn,
} from '@sdkwork/appstore-pc-admin-shell';

import { ListingStatusBadge, ListingVisibilityBadge } from '../components/ListingStatusBadge';

/** Listing statuses offered by the catalog filter; the backend owns the enum. */
const LISTING_STATUS_FILTERS = [
  'DRAFT',
  'IN_REVIEW',
  'PUBLISHED',
  'UNPUBLISHED',
  'DELISTED',
  'SUSPENDED',
  'REJECTED',
] as const;

const LISTINGS_PAGE_SIZE = 50;

/** `listings-admin` — operator listing catalog with per-row drill-down. */
export function ListingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const services = useAppstoreAdminServices();

  const [status, setStatus] = useState('');
  const [cursor, setCursor] = useState('');

  const query = useAppstoreAdminQuery(
    APPSTORE_ADMIN_LISTING_OPERATIONS.listListings,
    () =>
      services.listings.listListings({
        ...(status ? { listingStatus: status } : {}),
        ...(cursor ? { cursor } : {}),
        pageSize: LISTINGS_PAGE_SIZE,
      }),
    [services, status, cursor],
  );

  const items = query.data?.items ?? [];
  const pageInfo = query.data?.pageInfo ?? { mode: 'cursor' as const };

  const columns: AdminTableColumn<AppstoreAdminListingSummary>[] = [
    {
      key: 'listing',
      header: t('adminListings.list.columns.listing'),
      render: (item) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-gray-900 dark:text-gray-50">{item.displayName}</p>
          <p className="truncate font-mono text-[11px] text-gray-400 dark:text-gray-500">
            {item.listingId || t('adminShell.common.notAvailable')}
          </p>
        </div>
      ),
    },
    {
      key: 'listingCode',
      header: t('adminListings.list.columns.listingCode'),
      width: 'w-40',
      hideBelowLarge: true,
      render: (item) => (
        <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
          {item.listingCode || t('adminShell.common.notAvailable')}
        </span>
      ),
    },
    {
      key: 'listingStatus',
      header: t('adminListings.list.columns.status'),
      width: 'w-32',
      render: (item) => <ListingStatusBadge status={item.listingStatus} />,
    },
    {
      key: 'storefrontVisibility',
      header: t('adminListings.list.columns.visibility'),
      width: 'w-36',
      render: (item) => <ListingVisibilityBadge visibility={item.storefrontVisibility} />,
    },
    {
      key: 'publisher',
      header: t('adminListings.list.columns.publisher'),
      width: 'w-48',
      hideBelowLarge: true,
      render: (item) => (
        <div className="min-w-0">
          <p className="truncate text-xs text-gray-600 dark:text-gray-300">
            {item.publisherName || t('adminShell.common.notAvailable')}
          </p>
          <p className="truncate font-mono text-[11px] text-gray-400 dark:text-gray-500">
            {item.publisherId || t('adminShell.common.notAvailable')}
          </p>
        </div>
      ),
    },
    {
      key: 'updatedDate',
      header: t('adminListings.list.columns.updatedAt'),
      width: 'w-32',
      hideBelowLarge: true,
      render: (item) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {item.updatedDate || t('adminShell.common.notAvailable')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('adminListings.list.columns.actions'),
      width: 'w-24',
      align: 'right',
      render: (item) => (
        <AdminActionButton
          onClick={() => navigate(`${APPSTORE_ADMIN_ROUTE_PREFIX}/listings/${item.listingId}`)}
        >
          {t('adminListings.list.detail')}
        </AdminActionButton>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <AdminPageHeader
        description={t('adminListings.list.description')}
        title={t('adminListings.list.title')}
        actions={
          <AdminActionButton onClick={query.reload} disabled={query.loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${query.loading ? 'animate-spin' : ''}`} />
            {t('adminShell.common.refresh')}
          </AdminActionButton>
        }
      />

      <AdminToolbar>
        <AdminFormField
          htmlFor="listings-status"
          label={t('adminListings.list.filterStatus')}
          layout="inline"
        >
          <select
            id="listings-status"
            className={ADMIN_INPUT_CLASS}
            value={status}
            onChange={(event) => {
              setCursor('');
              setStatus(event.target.value);
            }}
          >
            <option value="">{t('adminListings.list.filterStatusAll')}</option>
            {LISTING_STATUS_FILTERS.map((option) => (
              <option key={option} value={option}>
                {t(`adminListings.status.${option}`)}
              </option>
            ))}
          </select>
        </AdminFormField>
      </AdminToolbar>

      {query.error && items.length === 0 ? (
        <AdminStatePlaceholder error={query.error} kind="error" onRetry={query.reload} />
      ) : (
        <>
          <AdminDataTable
            caption={t('adminListings.list.title')}
            columns={columns}
            dense
            emptyContent={
              <AdminStatePlaceholder
                inline
                kind="empty"
                description={t('adminListings.list.empty')}
              />
            }
            loading={query.loading && items.length === 0}
            loadingContent={<AdminStatePlaceholder inline kind="loading" />}
            rowKey={(item) => item.listingId}
            rows={items}
          />
          <AdminPaginationBar
            cursorApplied={Boolean(cursor)}
            loadedCount={items.length}
            loading={query.loading}
            onNext={setCursor}
            onReset={() => setCursor('')}
            pageInfo={pageInfo}
          />
        </>
      )}
    </div>
  );
}
