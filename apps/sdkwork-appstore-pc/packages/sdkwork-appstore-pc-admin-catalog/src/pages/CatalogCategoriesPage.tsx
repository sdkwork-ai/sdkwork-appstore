import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import {
  APPSTORE_ADMIN_CATALOG_OPERATIONS,
  useAppstoreAdminQuery,
  useAppstoreAdminServices,
  type AppstoreAdminCategoryRow,
} from '@sdkwork/appstore-pc-admin-core';
import {
  AdminActionButton,
  AdminDataTable,
  AdminPageHeader,
  AdminPaginationBar,
  AdminSection,
  AdminStatePlaceholder,
  type AdminTableColumn,
} from '@sdkwork/appstore-pc-admin-shell';

import { CatalogCategoryCreateForm } from '../components/CatalogCategoryCreateForm';
import { CatalogCategoryUpdateForm } from '../components/CatalogCategoryUpdateForm';
import { CatalogStatusBadge } from '../components/CatalogStatusBadge';

const CATEGORIES_PAGE_SIZE = 50;

/**
 * `catalog-categories` — category authoring console.
 *
 * The operator contract provides the `admin.categories.list` read, so the page
 * browses real categories (every non-deleted status) and hands a row's id to
 * the update form instead of asking the operator to look ids up elsewhere.
 */
export function CatalogCategoriesPage() {
  const { t } = useTranslation();
  const services = useAppstoreAdminServices();
  const [cursor, setCursor] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const query = useAppstoreAdminQuery(
    APPSTORE_ADMIN_CATALOG_OPERATIONS.listCategories,
    () =>
      services.catalog.listCategories({
        ...(cursor ? { cursor } : {}),
        pageSize: CATEGORIES_PAGE_SIZE,
      }),
    [services, cursor],
  );

  const items = query.data?.items ?? [];
  const pageInfo = query.data?.pageInfo ?? { mode: 'cursor' as const };

  const columns: AdminTableColumn<AppstoreAdminCategoryRow>[] = [
    {
      key: 'category',
      header: t('adminCatalog.categories.browse.columns.category'),
      render: (item) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-store-ink ">
            {item.displayName || item.categoryCode}
          </p>
          <p className="truncate font-mono text-[11px] text-store-ink-faint ">
            {item.categoryCode}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      header: t('adminCatalog.categories.browse.columns.status'),
      width: 'w-28',
      render: (item) => <CatalogStatusBadge status={item.status} />,
    },
    {
      key: 'sortOrder',
      header: t('adminCatalog.categories.browse.columns.sortOrder'),
      width: 'w-20',
      hideBelowLarge: true,
      render: (item) => (
        <span className="text-xs text-store-ink-faint ">{item.sortOrder ?? '—'}</span>
      ),
    },
    {
      key: 'categoryId',
      header: t('adminCatalog.categories.browse.columns.categoryId'),
      width: 'w-64',
      hideBelowLarge: true,
      render: (item) => (
        <span className="block truncate font-mono text-[11px] text-store-ink-faint ">
          {item.categoryId}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('adminCatalog.categories.browse.columns.actions'),
      width: 'w-24',
      align: 'right',
      render: (item) => (
        <AdminActionButton
          onClick={() => setSelectedCategoryId(item.categoryId)}
        >
          {t('adminCatalog.categories.browse.pick')}
        </AdminActionButton>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <AdminPageHeader
        description={t('adminCatalog.categories.description')}
        title={t('adminCatalog.categories.title')}
        actions={
          <AdminActionButton onClick={query.reload} disabled={query.loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${query.loading ? 'animate-spin' : ''}`} />
            {t('adminShell.common.refresh')}
          </AdminActionButton>
        }
      />

      <AdminSection title={t('adminCatalog.categories.browse.title')}>
        {query.error && items.length === 0 ? (
          <AdminStatePlaceholder error={query.error} kind="error" onRetry={query.reload} />
        ) : (
          <>
            <AdminDataTable
              caption={t('adminCatalog.categories.browse.title')}
              columns={columns}
              dense
              emptyContent={
                <AdminStatePlaceholder
                  inline
                  kind="empty"
                  description={t('adminCatalog.categories.browse.empty')}
                />
              }
              loading={query.loading && items.length === 0}
              loadingContent={<AdminStatePlaceholder inline kind="loading" />}
              rowKey={(item) => item.categoryId}
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
      </AdminSection>

      <CatalogCategoryCreateForm />
      <CatalogCategoryUpdateForm
        key={selectedCategoryId || 'blank'}
        presetCategoryId={selectedCategoryId}
      />
    </div>
  );
}
