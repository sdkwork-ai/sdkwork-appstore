import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import {
  APPSTORE_ADMIN_LISTING_OPERATIONS,
  APPSTORE_ADMIN_PERMISSIONS,
  APPSTORE_ADMIN_ROUTE_PREFIX,
  useAppstoreAdminQuery,
  useAppstoreAdminServices,
  type AppstoreAdminListingSummary,
} from '@sdkwork/appstore-pc-admin-core';
import {
  AdminActionButton,
  AdminCommandError,
  AdminDataTable,
  AdminFormField,
  AdminPageHeader,
  AdminPaginationBar,
  AdminStatePlaceholder,
  AdminToolbar,
  ADMIN_INPUT_CLASS,
  useAdminCommand,
  useAppstoreAdminPermission,
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

/**
 * Storefront transitions offered as a compact row action.
 *
 * The subset covers the operator's routine 上架/下架/隐藏 decisions; the full
 * visibility enum stays owned by the backend service port, so this list is a UI
 * affordance and never a second source of truth for the wire enum.
 */
const LISTING_QUICK_VISIBILITY_ACTIONS = ['VISIBLE', 'DELISTED', 'HIDDEN'] as const;

type ListingQuickVisibility = (typeof LISTING_QUICK_VISIBILITY_ACTIONS)[number];

/** Coerce the row's reported visibility into one of the quick-action options. */
function resolveQuickVisibility(visibility: string | undefined): ListingQuickVisibility {
  const token = (visibility ?? '').trim().toLocaleUpperCase();
  return LISTING_QUICK_VISIBILITY_ACTIONS.find((state) => state === token) ?? 'VISIBLE';
}

/** `listings-admin` — operator listing catalog with per-row drill-down. */
export function ListingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const services = useAppstoreAdminServices();

  const [status, setStatus] = useState('');
  const [cursor, setCursor] = useState('');
  const [visibilityReason, setVisibilityReason] = useState('');
  const [visibilityTargets, setVisibilityTargets] = useState<Record<string, ListingQuickVisibility>>({});
  const [busyListingId, setBusyListingId] = useState('');
  const canManageVisibility = useAppstoreAdminPermission(APPSTORE_ADMIN_PERMISSIONS.listingsManage);
  const visibilityCommand = useAdminCommand(APPSTORE_ADMIN_LISTING_OPERATIONS.updateVisibility);

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

  /**
   * Apply the row's selected storefront visibility in place.
   *
   * One command state covers every row: only the row that dispatched a command
   * shows a busy button, while the whole table blocks further submissions until
   * it settles. A succeeded command reloads the page so the badge and the
   * select stay in sync with the backend.
   */
  const applyVisibility = async (item: AppstoreAdminListingSummary) => {
    const storefrontVisibility =
      visibilityTargets[item.listingId] ?? resolveQuickVisibility(item.storefrontVisibility);
    const reason = visibilityReason.trim();
    setBusyListingId(item.listingId);
    const succeeded = await visibilityCommand.run(() =>
      services.listings.updateVisibility(item.listingId, {
        storefrontVisibility,
        ...(reason ? { reason } : {}),
      }),
    );
    setBusyListingId('');
    if (!succeeded) {
      return;
    }
    setVisibilityTargets((previous) => {
      const next: Record<string, ListingQuickVisibility> = {};
      for (const [listingId, state] of Object.entries(previous)) {
        if (listingId !== item.listingId) {
          next[listingId] = state;
        }
      }
      return next;
    });
    query.reload();
  };

  const columns: AdminTableColumn<AppstoreAdminListingSummary>[] = [
    {
      key: 'listing',
      header: t('adminListings.list.columns.listing'),
      render: (item) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-store-ink ">{item.displayName}</p>
          <p className="truncate font-mono text-[11px] text-store-ink-faint ">
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
        <span className="font-mono text-[11px] text-store-ink-faint ">
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
          <p className="truncate text-xs text-store-ink-soft ">
            {item.publisherName || t('adminShell.common.notAvailable')}
          </p>
          <p className="truncate font-mono text-[11px] text-store-ink-faint ">
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
        <span className="text-xs text-store-ink-faint ">
          {item.updatedDate || t('adminShell.common.notAvailable')}
        </span>
      ),
    },
    ...(canManageVisibility
      ? [
          {
            key: 'quickVisibility',
            header: t('adminListings.list.columns.quickVisibility'),
            width: 'w-64',
            align: 'right' as const,
            render: (item: AppstoreAdminListingSummary) => {
              // Compare against the raw token, not the coerced option: a
              // `REGION_RESTRICTED` row must still be able to switch to
              // `VISIBLE`, which the coerced default would otherwise suppress.
              const current = (item.storefrontVisibility ?? '').trim().toLocaleUpperCase();
              const target = visibilityTargets[item.listingId] ?? resolveQuickVisibility(item.storefrontVisibility);
              const busy = busyListingId === item.listingId;
              return (
                <div className="flex items-center justify-end gap-1.5">
                  <div className="w-28">
                    <select
                      aria-label={t('adminListings.list.quickVisibility.label', {
                        name: item.displayName,
                      })}
                      className={ADMIN_INPUT_CLASS}
                      value={target}
                      disabled={visibilityCommand.submitting}
                      onChange={(event) =>
                        setVisibilityTargets((previous) => ({
                          ...previous,
                          [item.listingId]: resolveQuickVisibility(event.target.value),
                        }))
                      }
                    >
                      {LISTING_QUICK_VISIBILITY_ACTIONS.map((state) => (
                        <option key={state} value={state}>
                          {t(`adminListings.visibilityStatus.${state}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <AdminActionButton
                    onClick={() => {
                      void applyVisibility(item);
                    }}
                    loading={busy}
                    disabled={visibilityCommand.submitting || target === current}
                  >
                    {busy
                      ? t('adminListings.list.quickVisibility.applying')
                      : t('adminListings.list.quickVisibility.apply')}
                  </AdminActionButton>
                </div>
              );
            },
          },
        ]
      : []),
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

      <AdminToolbar
        footer={
          canManageVisibility ? (
            <AdminFormField
              htmlFor="listings-visibility-reason"
              hint={t('adminListings.list.quickVisibility.reasonHint')}
              label={t('adminListings.list.quickVisibility.reason')}
              layout="inline"
            >
              <input
                id="listings-visibility-reason"
                className={ADMIN_INPUT_CLASS}
                maxLength={200}
                placeholder={t('adminListings.list.quickVisibility.reasonPlaceholder')}
                value={visibilityReason}
                onChange={(event) => setVisibilityReason(event.target.value)}
              />
            </AdminFormField>
          ) : undefined
        }
      >
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

      {visibilityCommand.error ? <AdminCommandError error={visibilityCommand.error} /> : null}
      {visibilityCommand.succeeded ? (
        <p className="text-xs text-store-success" role="status">
          {t('adminListings.list.quickVisibility.updated')}
        </p>
      ) : null}

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
