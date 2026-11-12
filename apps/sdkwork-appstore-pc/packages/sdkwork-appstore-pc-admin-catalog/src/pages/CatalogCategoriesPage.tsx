import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import {
  APPSTORE_ADMIN_CATALOG_OPERATIONS,
  APPSTORE_ADMIN_CATALOG_STATUSES,
  normalizeToken,
  useAppstoreAdminQuery,
  useAppstoreAdminServices,
  type AppstoreAdminCategoryRow,
} from '@sdkwork/appstore-pc-admin-core';
import {
  AdminActionButton,
  AdminCommandError,
  AdminDataTable,
  AdminFormField,
  AdminPageHeader,
  AdminPaginationBar,
  AdminSection,
  AdminStatePlaceholder,
  AdminToolbar,
  ADMIN_INPUT_CLASS,
  useAdminCommand,
  type AdminTableColumn,
} from '@sdkwork/appstore-pc-admin-shell';

import { CatalogCategoryCreateForm } from '../components/CatalogCategoryCreateForm';
import { CatalogCategoryUpdateForm } from '../components/CatalogCategoryUpdateForm';
import { CatalogStatusBadge } from '../components/CatalogStatusBadge';

const CATEGORIES_PAGE_SIZE = 50;

/**
 * Lifecycle status the row action transitions to.
 *
 * The operator contract exposes `categories.update` only, so deleting a
 * category is modelled as archiving it. An archived category toggles back to
 * `ACTIVE`; every other reported status (draft, unknown) transitions to
 * `ARCHIVED`. The backend stays the authority on whether a transition is legal.
 */
function nextCategoryStatus(status: string | undefined): 'ACTIVE' | 'ARCHIVED' {
  return normalizeToken(status, '') === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED';
}

/**
 * `catalog-categories` — category authoring console.
 *
 * The operator contract provides the `admin.categories.list` read, so the page
 * browses real categories (every non-deleted status) and hands a row's id to
 * the update form instead of asking the operator to look ids up elsewhere. The
 * status and keyword filters narrow the already-loaded cursor page client-side;
 * paging itself stays cursor-driven by the backend.
 */
export function CatalogCategoriesPage() {
  const { t } = useTranslation();
  const services = useAppstoreAdminServices();
  const [cursor, setCursor] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [busyCategoryId, setBusyCategoryId] = useState('');
  const lifecycleCommand = useAdminCommand(APPSTORE_ADMIN_CATALOG_OPERATIONS.updateCategory);

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

  const needle = keyword.trim().toLocaleLowerCase();
  const hasFilters = Boolean(statusFilter) || Boolean(needle);
  const visibleItems = items.filter((item) => {
    if (statusFilter && normalizeToken(item.status, '') !== statusFilter) {
      return false;
    }
    if (!needle) {
      return true;
    }
    return [item.displayName, item.categoryCode, item.categoryId].some((value) =>
      (value ?? '').toLocaleLowerCase().includes(needle),
    );
  });

  /**
   * Toggle one category between `ACTIVE` and `ARCHIVED`.
   *
   * One command state covers every row: only the row that dispatched the
   * command renders a busy button, while the table blocks further submissions
   * until it settles. Success reloads the page so the badge stays truthful.
   */
  const applyLifecycle = async (item: AppstoreAdminCategoryRow) => {
    const categoryStatus = nextCategoryStatus(item.status);
    setBusyCategoryId(item.categoryId);
    const succeeded = await lifecycleCommand.run(() =>
      services.catalog.updateCategory(item.categoryId, { categoryStatus }),
    );
    setBusyCategoryId('');
    if (succeeded) {
      query.reload();
    }
  };

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
      width: 'w-56',
      align: 'right',
      render: (item) => {
        const busy = busyCategoryId === item.categoryId;
        const archived = normalizeToken(item.status, '') === 'ARCHIVED';
        return (
          <div className="flex items-center justify-end gap-1.5">
            <AdminActionButton onClick={() => setSelectedCategoryId(item.categoryId)}>
              {t('adminCatalog.categories.browse.pick')}
            </AdminActionButton>
            <AdminActionButton
              onClick={() => {
                void applyLifecycle(item);
              }}
              loading={busy}
              disabled={lifecycleCommand.submitting}
            >
              {busy
                ? t('adminCatalog.categories.browse.lifecycle.applying')
                : archived
                  ? t('adminCatalog.categories.browse.lifecycle.activate')
                  : t('adminCatalog.categories.browse.lifecycle.archive')}
            </AdminActionButton>
          </div>
        );
      },
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

      {lifecycleCommand.error ? <AdminCommandError error={lifecycleCommand.error} /> : null}
      {lifecycleCommand.succeeded ? (
        <p className="text-xs text-store-success" role="status">
          {t('adminCatalog.categories.browse.lifecycle.updated')}
        </p>
      ) : null}

      <AdminSection title={t('adminCatalog.categories.browse.title')}>
        {query.error && items.length === 0 ? (
          <AdminStatePlaceholder error={query.error} kind="error" onRetry={query.reload} />
        ) : (
          <>
            <AdminToolbar
              actions={
                <AdminActionButton
                  onClick={() => {
                    setStatusFilter('');
                    setKeyword('');
                  }}
                  disabled={!hasFilters}
                >
                  {t('adminCatalog.categories.browse.filters.reset')}
                </AdminActionButton>
              }
            >
              <AdminFormField
                htmlFor="catalog-categories-status"
                label={t('adminCatalog.categories.browse.filters.status')}
                layout="inline"
              >
                <select
                  id="catalog-categories-status"
                  className={ADMIN_INPUT_CLASS}
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="">
                    {t('adminCatalog.categories.browse.filters.statusAll')}
                  </option>
                  {APPSTORE_ADMIN_CATALOG_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {t(`adminCatalog.lifecycleStatus.${status}`)}
                    </option>
                  ))}
                </select>
              </AdminFormField>
              <AdminFormField
                htmlFor="catalog-categories-keyword"
                label={t('adminCatalog.categories.browse.filters.keyword')}
                layout="inline"
              >
                <input
                  id="catalog-categories-keyword"
                  className={ADMIN_INPUT_CLASS}
                  placeholder={t('adminCatalog.categories.browse.filters.keywordPlaceholder')}
                  type="search"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                />
              </AdminFormField>
            </AdminToolbar>

            <div className="mt-3">
              <AdminDataTable
                caption={t('adminCatalog.categories.browse.title')}
                columns={columns}
                dense
                emptyContent={
                  <AdminStatePlaceholder
                    inline
                    kind="empty"
                    description={
                      hasFilters
                        ? t('adminCatalog.categories.browse.emptyFiltered')
                        : t('adminCatalog.categories.browse.empty')
                    }
                  />
                }
                loading={query.loading && items.length === 0}
                loadingContent={<AdminStatePlaceholder inline kind="loading" />}
                rowKey={(item) => item.categoryId}
                rows={visibleItems}
              />
            </div>
            <div className="mt-3">
              <AdminPaginationBar
                cursorApplied={Boolean(cursor)}
                loadedCount={visibleItems.length}
                loading={query.loading}
                onNext={setCursor}
                onReset={() => setCursor('')}
                pageInfo={pageInfo}
              />
            </div>
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
