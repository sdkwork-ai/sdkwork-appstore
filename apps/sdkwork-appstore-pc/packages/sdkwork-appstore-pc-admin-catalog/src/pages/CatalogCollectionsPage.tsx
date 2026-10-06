import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import {
  APPSTORE_ADMIN_CATALOG_OPERATIONS,
  useAppstoreAdminQuery,
  useAppstoreAdminServices,
  type AppstoreAdminCollectionRow,
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

import { CatalogCollectionCreateForm } from '../components/CatalogCollectionCreateForm';
import { CatalogCollectionItemsEditor } from '../components/CatalogCollectionItemsEditor';
import { CatalogCollectionUpdateForm } from '../components/CatalogCollectionUpdateForm';
import { CatalogStatusBadge } from '../components/CatalogStatusBadge';

const COLLECTIONS_PAGE_SIZE = 50;

/**
 * `catalog-collections` — collection authoring console.
 *
 * The operator contract provides the `admin.collections.list` read, so the
 * page browses real collections (every non-deleted status, with live item
 * counts) and hands a row's id to the edit forms.
 */
export function CatalogCollectionsPage() {
  const { t } = useTranslation();
  const services = useAppstoreAdminServices();
  const [cursor, setCursor] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState('');

  const query = useAppstoreAdminQuery(
    APPSTORE_ADMIN_CATALOG_OPERATIONS.listCollections,
    () =>
      services.catalog.listCollections({
        ...(cursor ? { cursor } : {}),
        pageSize: COLLECTIONS_PAGE_SIZE,
      }),
    [services, cursor],
  );

  const items = query.data?.items ?? [];
  const pageInfo = query.data?.pageInfo ?? { mode: 'cursor' as const };

  const columns: AdminTableColumn<AppstoreAdminCollectionRow>[] = [
    {
      key: 'collection',
      header: t('adminCatalog.collections.browse.columns.collection'),
      render: (item) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-store-ink ">
            {item.displayName || item.collectionCode}
          </p>
          <p className="truncate font-mono text-[11px] text-store-ink-faint ">
            {item.collectionCode}
          </p>
        </div>
      ),
    },
    {
      key: 'collectionType',
      header: t('adminCatalog.collections.browse.columns.collectionType'),
      width: 'w-32',
      render: (item) =>
        item.collectionType ? (
          <span className="text-xs text-store-ink-soft">
            {t(`adminCatalog.collectionType.${item.collectionType.toLocaleUpperCase()}`, {
              defaultValue: item.collectionType,
            })}
          </span>
        ) : (
          <span className="text-xs text-store-ink-faint">—</span>
        ),
    },
    {
      key: 'status',
      header: t('adminCatalog.collections.browse.columns.status'),
      width: 'w-28',
      render: (item) => <CatalogStatusBadge status={item.status} />,
    },
    {
      key: 'itemCount',
      header: t('adminCatalog.collections.browse.columns.itemCount'),
      width: 'w-20',
      hideBelowLarge: true,
      render: (item) => (
        <span className="text-xs text-store-ink-faint">{item.itemCount}</span>
      ),
    },
    {
      key: 'collectionId',
      header: t('adminCatalog.collections.browse.columns.collectionId'),
      width: 'w-64',
      hideBelowLarge: true,
      render: (item) => (
        <span className="block truncate font-mono text-[11px] text-store-ink-faint ">
          {item.collectionId}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('adminCatalog.collections.browse.columns.actions'),
      width: 'w-24',
      align: 'right',
      render: (item) => (
        <AdminActionButton
          onClick={() => setSelectedCollectionId(item.collectionId)}
        >
          {t('adminCatalog.collections.browse.pick')}
        </AdminActionButton>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <AdminPageHeader
        description={t('adminCatalog.collections.description')}
        title={t('adminCatalog.collections.title')}
        actions={
          <AdminActionButton onClick={query.reload} disabled={query.loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${query.loading ? 'animate-spin' : ''}`} />
            {t('adminShell.common.refresh')}
          </AdminActionButton>
        }
      />

      <AdminSection title={t('adminCatalog.collections.browse.title')}>
        {query.error && items.length === 0 ? (
          <AdminStatePlaceholder error={query.error} kind="error" onRetry={query.reload} />
        ) : (
          <>
            <AdminDataTable
              caption={t('adminCatalog.collections.browse.title')}
              columns={columns}
              dense
              emptyContent={
                <AdminStatePlaceholder
                  inline
                  kind="empty"
                  description={t('adminCatalog.collections.browse.empty')}
                />
              }
              loading={query.loading && items.length === 0}
              loadingContent={<AdminStatePlaceholder inline kind="loading" />}
              rowKey={(item) => item.collectionId}
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

      <CatalogCollectionCreateForm />
      <CatalogCollectionUpdateForm
        key={selectedCollectionId || 'blank'}
        presetCollectionId={selectedCollectionId}
      />
      <CatalogCollectionItemsEditor
        key={`items-${selectedCollectionId || 'blank'}`}
        presetCollectionId={selectedCollectionId}
      />
    </div>
  );
}
