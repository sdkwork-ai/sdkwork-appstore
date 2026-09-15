import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import {
  APPSTORE_ADMIN_MARKET_OPERATIONS,
  APPSTORE_ADMIN_PERMISSIONS,
  useAppstoreAdminQuery,
  useAppstoreAdminServices,
} from '@sdkwork/appstore-pc-admin-core';
import {
  ADMIN_INPUT_CLASS,
  AdminActionButton,
  AdminFormField,
  AdminPageHeader,
  AdminPaginationBar,
  AdminStatePlaceholder,
  AdminToolbar,
  useAppstoreAdminPermission,
} from '@sdkwork/appstore-pc-admin-shell';

import { MarketReleaseSyncDialog } from '../components/MarketReleaseSyncDialog';
import { MarketReleaseTable } from '../components/MarketReleaseTable';

const RELEASES_PAGE_SIZE = 50;

/** `market.releases.list` — per-channel release projections with sync dispatch. */
export function MarketReleasesPage() {
  const { t } = useTranslation();
  const services = useAppstoreAdminServices();
  const canSync = useAppstoreAdminPermission(APPSTORE_ADMIN_PERMISSIONS.marketReleasesSync);

  const [releaseId, setReleaseId] = useState('');
  const [channelId, setChannelId] = useState('');
  const [marketStatus, setMarketStatus] = useState('');
  const [cursor, setCursor] = useState('');
  const [syncingReleaseId, setSyncingReleaseId] = useState<string | undefined>(undefined);

  const query = useAppstoreAdminQuery(
    APPSTORE_ADMIN_MARKET_OPERATIONS.listReleases,
    () =>
      services.market.listReleases({
        ...(releaseId.trim() ? { releaseId: releaseId.trim() } : {}),
        ...(channelId.trim() ? { channelId: channelId.trim() } : {}),
        ...(marketStatus.trim() ? { marketStatus: marketStatus.trim() } : {}),
        ...(cursor ? { cursor } : {}),
        pageSize: RELEASES_PAGE_SIZE,
      }),
    [services, releaseId, channelId, marketStatus, cursor],
  );

  const items = query.data?.items ?? [];
  const pageInfo = query.data?.pageInfo ?? { mode: 'cursor' as const };

  return (
    <div className="space-y-4">
      <AdminPageHeader
        description={t('adminMarket.releases.description')}
        title={t('adminMarket.releases.title')}
        actions={
          <AdminActionButton onClick={query.reload} disabled={query.loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${query.loading ? 'animate-spin' : ''}`} />
            {t('adminShell.common.refresh')}
          </AdminActionButton>
        }
      />

      <AdminToolbar>
        <AdminFormField
          htmlFor="market-releases-release-id"
          label={t('adminMarket.releases.filterReleaseId')}
          layout="inline"
        >
          <input
            id="market-releases-release-id"
            className={ADMIN_INPUT_CLASS}
            value={releaseId}
            onChange={(event) => {
              setCursor('');
              setReleaseId(event.target.value);
            }}
          />
        </AdminFormField>
        <AdminFormField
          htmlFor="market-releases-channel-id"
          label={t('adminMarket.releases.filterChannelId')}
          layout="inline"
        >
          <input
            id="market-releases-channel-id"
            className={ADMIN_INPUT_CLASS}
            value={channelId}
            onChange={(event) => {
              setCursor('');
              setChannelId(event.target.value);
            }}
          />
        </AdminFormField>
        <AdminFormField
          htmlFor="market-releases-market-status"
          label={t('adminMarket.releases.filterMarketStatus')}
          layout="inline"
        >
          <input
            id="market-releases-market-status"
            className={ADMIN_INPUT_CLASS}
            value={marketStatus}
            onChange={(event) => {
              setCursor('');
              setMarketStatus(event.target.value);
            }}
          />
        </AdminFormField>
      </AdminToolbar>

      {query.error && items.length === 0 ? (
        <AdminStatePlaceholder error={query.error} kind="error" onRetry={query.reload} />
      ) : (
        <>
          <MarketReleaseTable
            canSync={canSync}
            items={items}
            loading={query.loading && items.length === 0}
            onSync={
              canSync ? (release) => setSyncingReleaseId(release.marketReleaseId) : undefined
            }
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

      {syncingReleaseId ? (
        <MarketReleaseSyncDialog
          marketReleaseId={syncingReleaseId}
          onClose={() => setSyncingReleaseId(undefined)}
          onCompleted={query.reload}
          open
        />
      ) : null}
    </div>
  );
}
