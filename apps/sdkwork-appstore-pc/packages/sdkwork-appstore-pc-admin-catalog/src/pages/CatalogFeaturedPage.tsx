import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import {
  APPSTORE_ADMIN_CATALOG_OPERATIONS,
  useAppstoreAdminQuery,
  useAppstoreAdminServices,
  type AppstoreAdminFeaturedSlotRow,
} from '@sdkwork/appstore-pc-admin-core';
import {
  AdminActionButton,
  AdminDataTable,
  AdminPageHeader,
  AdminSection,
  AdminStatePlaceholder,
  type AdminTableColumn,
} from '@sdkwork/appstore-pc-admin-shell';

import { CatalogFeaturedSlotForm } from '../components/CatalogFeaturedSlotForm';
import { CatalogStatusBadge } from '../components/CatalogStatusBadge';

/**
 * `catalog-featured` — featured-slot authoring console.
 *
 * The operator contract provides the `admin.featured.list` read, so the page
 * browses every slot regardless of its visibility window and hands a row's
 * slot code to the upsert form.
 */
export function CatalogFeaturedPage() {
  const { t } = useTranslation();
  const services = useAppstoreAdminServices();

  const query = useAppstoreAdminQuery(
    APPSTORE_ADMIN_CATALOG_OPERATIONS.listFeaturedSlots,
    () => services.catalog.listFeaturedSlots(),
    [services],
  );

  const items = query.data?.items ?? [];

  const columns: AdminTableColumn<AppstoreAdminFeaturedSlotRow>[] = [
    {
      key: 'slotCode',
      header: t('adminCatalog.featured.browse.columns.slotCode'),
      render: (item) => (
        <span className="block truncate font-mono text-xs text-store-ink ">
          {item.slotCode}
        </span>
      ),
    },
    {
      key: 'listingId',
      header: t('adminCatalog.featured.browse.columns.listingId'),
      width: 'w-64',
      hideBelowLarge: true,
      render: (item) => (
        <span className="block truncate font-mono text-[11px] text-store-ink-faint ">
          {item.listingId}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('adminCatalog.featured.browse.columns.status'),
      width: 'w-28',
      render: (item) => <CatalogStatusBadge status={item.status} />,
    },
    {
      key: 'window',
      header: t('adminCatalog.featured.browse.columns.window'),
      width: 'w-56',
      hideBelowLarge: true,
      render: (item) => (
        <span className="text-[11px] text-store-ink-faint ">
          {formatWindow(item.startsAt, item.endsAt)}
        </span>
      ),
    },
    {
      key: 'audienceScope',
      header: t('adminCatalog.featured.browse.columns.audienceScope'),
      width: 'w-28',
      hideBelowLarge: true,
      render: (item) =>
        item.audienceScope ? (
          <span className="text-xs text-store-ink-soft">
            {t(`adminCatalog.audienceScope.${item.audienceScope.toLocaleUpperCase()}`, {
              defaultValue: item.audienceScope,
            })}
          </span>
        ) : (
          <span className="text-xs text-store-ink-faint">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <AdminPageHeader
        description={t('adminCatalog.featured.description')}
        title={t('adminCatalog.featured.title')}
        actions={
          <AdminActionButton onClick={query.reload} disabled={query.loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${query.loading ? 'animate-spin' : ''}`} />
            {t('adminShell.common.refresh')}
          </AdminActionButton>
        }
      />

      <AdminSection title={t('adminCatalog.featured.browse.title')}>
        {query.error && items.length === 0 ? (
          <AdminStatePlaceholder error={query.error} kind="error" onRetry={query.reload} />
        ) : (
          <AdminDataTable
            caption={t('adminCatalog.featured.browse.title')}
            columns={columns}
            dense
            emptyContent={
              <AdminStatePlaceholder
                inline
                kind="empty"
                description={t('adminCatalog.featured.browse.empty')}
              />
            }
            loading={query.loading && items.length === 0}
            loadingContent={<AdminStatePlaceholder inline kind="loading" />}
            rowKey={(item) => item.slotCode}
            rows={items}
          />
        )}
      </AdminSection>

      <CatalogFeaturedSlotForm />
    </div>
  );
}

function formatWindow(startsAt: string | undefined, endsAt: string | undefined): string {
  const start = formatDateOnly(startsAt) ?? '…';
  const end = formatDateOnly(endsAt) ?? '…';
  return `${start} → ${end}`;
}

function formatDateOnly(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString().slice(0, 10);
}
