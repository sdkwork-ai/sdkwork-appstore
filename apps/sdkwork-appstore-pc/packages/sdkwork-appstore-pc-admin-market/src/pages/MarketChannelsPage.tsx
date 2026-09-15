import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, RefreshCw } from 'lucide-react';
import {
  APPSTORE_ADMIN_MARKET_CHANNEL_STATUSES,
  APPSTORE_ADMIN_MARKET_OPERATIONS,
  APPSTORE_ADMIN_PERMISSIONS,
  useAppstoreAdminQuery,
  useAppstoreAdminServices,
  type AppstoreAdminMarketChannel,
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

import { MarketChannelCreateDialog } from '../components/MarketChannelCreateDialog';
import { MarketChannelEditDialog } from '../components/MarketChannelEditDialog';
import { MarketChannelTable } from '../components/MarketChannelTable';

const CHANNELS_PAGE_SIZE = 50;

/** `market.channels.list` — external market channels with authoring commands. */
export function MarketChannelsPage() {
  const { t } = useTranslation();
  const services = useAppstoreAdminServices();
  const canWrite = useAppstoreAdminPermission(APPSTORE_ADMIN_PERMISSIONS.marketChannelsWrite);

  const [channelStatus, setChannelStatus] = useState('');
  const [cursor, setCursor] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingChannel, setEditingChannel] = useState<AppstoreAdminMarketChannel | undefined>(
    undefined,
  );

  const query = useAppstoreAdminQuery(
    APPSTORE_ADMIN_MARKET_OPERATIONS.listChannels,
    () =>
      services.market.listChannels({
        ...(channelStatus ? { channelStatus } : {}),
        ...(cursor ? { cursor } : {}),
        pageSize: CHANNELS_PAGE_SIZE,
      }),
    [services, channelStatus, cursor],
  );

  const items = query.data?.items ?? [];
  const pageInfo = query.data?.pageInfo ?? { mode: 'cursor' as const };

  return (
    <div className="space-y-4">
      <AdminPageHeader
        description={t('adminMarket.channels.description')}
        title={t('adminMarket.channels.title')}
        actions={
          <AdminActionButton onClick={query.reload} disabled={query.loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${query.loading ? 'animate-spin' : ''}`} />
            {t('adminShell.common.refresh')}
          </AdminActionButton>
        }
      />

      <AdminToolbar
        actions={
          canWrite ? (
            <AdminActionButton onClick={() => setCreating(true)} variant="primary">
              <Plus className="h-3.5 w-3.5" />
              {t('adminMarket.channels.create')}
            </AdminActionButton>
          ) : undefined
        }
      >
        <AdminFormField
          htmlFor="market-channels-status"
          label={t('adminMarket.channels.filterStatus')}
          layout="inline"
        >
          <select
            id="market-channels-status"
            className={ADMIN_INPUT_CLASS}
            value={channelStatus}
            onChange={(event) => {
              setCursor('');
              setChannelStatus(event.target.value);
            }}
          >
            <option value="">{t('adminMarket.channels.filterStatusAll')}</option>
            {APPSTORE_ADMIN_MARKET_CHANNEL_STATUSES.map((option) => (
              <option key={option} value={option}>
                {t(`adminMarket.channelStatus.${option}`)}
              </option>
            ))}
          </select>
        </AdminFormField>
      </AdminToolbar>

      {query.error && items.length === 0 ? (
        <AdminStatePlaceholder error={query.error} kind="error" onRetry={query.reload} />
      ) : (
        <>
          <MarketChannelTable
            canWrite={canWrite}
            items={items}
            loading={query.loading && items.length === 0}
            onEdit={canWrite ? setEditingChannel : undefined}
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

      {creating ? (
        <MarketChannelCreateDialog
          onClose={() => setCreating(false)}
          onCompleted={query.reload}
          open
        />
      ) : null}

      {editingChannel ? (
        <MarketChannelEditDialog
          channel={editingChannel}
          onClose={() => setEditingChannel(undefined)}
          onCompleted={query.reload}
          open
        />
      ) : null}
    </div>
  );
}
