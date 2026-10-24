import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import {
  APPSTORE_ADMIN_DEMANDS_OPERATIONS,
  useAppstoreAdminQuery,
  useAppstoreAdminServices,
} from '@sdkwork/appstore-pc-admin-core';
import {
  AdminActionButton,
  AdminDataTable,
  AdminPageHeader,
  AdminSection,
  AdminStatePlaceholder,
  AdminStatusBadge,
  type AdminTableColumn,
} from '@sdkwork/appstore-pc-admin-shell';

import { flattenDemandCategories, type DemandCategoryTreeEntry } from '../categoryTree';
import { DemandCategoryCreateForm } from '../components/DemandCategoryCreateForm';
import { DemandCategoryUpdateForm } from '../components/DemandCategoryUpdateForm';

/**
 * `demand-categories` — the demand hall category tree console.
 *
 * The page reads the complete tree (bounded by the category taxonomy, not by
 * demand volume) so operators see the real cascade publishers will choose from,
 * then hands a row's id to the edit form.
 */
export function DemandCategoriesPage() {
  const { t } = useTranslation();
  const services = useAppstoreAdminServices();
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const query = useAppstoreAdminQuery(
    APPSTORE_ADMIN_DEMANDS_OPERATIONS.listCategories,
    () => services.demands.listCategories(),
    [services],
  );

  const items = query.data?.items ?? [];
  const tree = useMemo(() => flattenDemandCategories(items), [items]);
  const selected = items.find((row) => row.categoryId === selectedCategoryId);

  const columns: AdminTableColumn<DemandCategoryTreeEntry>[] = [
    {
      key: 'category',
      header: t('adminDemands.categories.browse.columns.category'),
      render: (entry) => (
        <div className="min-w-0" style={{ paddingLeft: `${entry.depth * 16}px` }}>
          <p className="truncate font-medium text-store-ink ">{entry.row.displayName}</p>
          <p className="truncate font-mono text-[11px] text-store-ink-faint ">
            {entry.row.categoryCode}
          </p>
        </div>
      ),
    },
    {
      key: 'appForm',
      header: t('adminDemands.categories.browse.columns.appForm'),
      width: 'w-36',
      hideBelowLarge: true,
      render: (entry) => (
        <span className="text-xs text-store-ink-soft ">
          {entry.row.appForm
            ? t(`adminDemands.appForms.${entry.row.appForm}`, entry.row.appForm)
            : t('adminDemands.categories.create.appFormUnspecified')}
        </span>
      ),
    },
    {
      key: 'level',
      header: t('adminDemands.categories.browse.columns.level'),
      width: 'w-16',
      render: (entry) => <span className="text-xs text-store-ink-faint ">{entry.row.level}</span>,
    },
    {
      key: 'path',
      header: t('adminDemands.categories.browse.columns.path'),
      width: 'w-64',
      hideBelowLarge: true,
      render: (entry) => (
        <span className="block truncate font-mono text-[11px] text-store-ink-faint ">
          {entry.row.path}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('adminDemands.categories.browse.columns.status'),
      width: 'w-24',
      render: (entry) => (
        <AdminStatusBadge
          label={t(`adminDemands.status.${entry.row.status ?? 'active'}`)}
          token={entry.row.status}
          tone={entry.row.status === 'disabled' ? 'neutral' : 'positive'}
        />
      ),
    },
    {
      key: 'sortOrder',
      header: t('adminDemands.categories.browse.columns.sortOrder'),
      width: 'w-20',
      hideBelowLarge: true,
      render: (entry) => (
        <span className="text-xs text-store-ink-faint ">{entry.row.sortOrder ?? '—'}</span>
      ),
    },
    {
      key: 'actions',
      header: t('adminDemands.categories.browse.columns.actions'),
      width: 'w-24',
      align: 'right',
      render: (entry) => (
        <AdminActionButton onClick={() => setSelectedCategoryId(entry.row.categoryId)}>
          {t('adminDemands.categories.browse.pick')}
        </AdminActionButton>
      ),
    },
  ];

  // Keep the selected row across a reload so the edit form (and its success
  // notice) survives; a deleted row simply stops resolving and the form falls
  // back to its pick hint.
  const handleChanged = (): void => {
    query.reload();
  };

  return (
    <div className="space-y-4">
      <AdminPageHeader
        description={t('adminDemands.categories.description')}
        title={t('adminDemands.categories.title')}
        actions={
          <AdminActionButton onClick={query.reload} disabled={query.loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${query.loading ? 'animate-spin' : ''}`} />
            {t('adminDemands.categories.refresh')}
          </AdminActionButton>
        }
      />

      <AdminSection title={t('adminDemands.categories.browse.title')}>
        {query.error && items.length === 0 ? (
          <AdminStatePlaceholder error={query.error} kind="error" onRetry={query.reload} />
        ) : (
          <AdminDataTable
            caption={t('adminDemands.categories.browse.title')}
            columns={columns}
            dense
            emptyContent={
              <AdminStatePlaceholder
                inline
                kind="empty"
                description={t('adminDemands.categories.browse.empty')}
              />
            }
            loading={query.loading && items.length === 0}
            loadingContent={<AdminStatePlaceholder inline kind="loading" />}
            rowKey={(entry) => entry.row.categoryId}
            rows={tree}
          />
        )}
      </AdminSection>

      <DemandCategoryCreateForm rows={items} onCreated={handleChanged} />
      <DemandCategoryUpdateForm
        key={selected?.categoryId ?? 'blank'}
        rows={items}
        categoryId={selected?.categoryId ?? ''}
        onChanged={handleChanged}
      />
    </div>
  );
}
