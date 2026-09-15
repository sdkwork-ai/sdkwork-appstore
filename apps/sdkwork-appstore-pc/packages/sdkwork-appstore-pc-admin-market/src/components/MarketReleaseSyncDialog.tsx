import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  APPSTORE_ADMIN_MARKET_OPERATIONS,
  APPSTORE_ADMIN_MARKET_SYNC_MODES,
  useAppstoreAdminServices,
  type AppstoreAdminMarketSyncMode,
} from '@sdkwork/appstore-pc-admin-core';
import {
  ADMIN_INPUT_CLASS,
  AdminActionButton,
  AdminCommandError,
  AdminDialog,
  AdminFormField,
  useAdminCommand,
} from '@sdkwork/appstore-pc-admin-shell';

export interface MarketReleaseSyncDialogProps {
  open: boolean;
  /** Market release id the synchronization is dispatched for. */
  marketReleaseId: string;
  onClose: () => void;
  /** Invoked after the synchronization is accepted, so the caller can refresh. */
  onCompleted: () => void;
}

/**
 * Triggers a market release synchronization
 * (`appstore.market_releases.sync`).
 *
 * The mutation carries a fresh `Idempotency-Key` inside the service port, so
 * retrying after a transport failure cannot dispatch the same sync twice; the
 * dialog never builds a key of its own.
 */
export function MarketReleaseSyncDialog({
  marketReleaseId,
  onClose,
  onCompleted,
  open,
}: MarketReleaseSyncDialogProps) {
  const { t } = useTranslation();
  const services = useAppstoreAdminServices();
  const [syncMode, setSyncMode] = useState<AppstoreAdminMarketSyncMode>(
    APPSTORE_ADMIN_MARKET_SYNC_MODES[0],
  );
  const [note, setNote] = useState('');
  const command = useAdminCommand(APPSTORE_ADMIN_MARKET_OPERATIONS.syncRelease);
  const { reset: resetCommand } = command;

  useEffect(() => {
    if (!open) {
      return;
    }
    setSyncMode(APPSTORE_ADMIN_MARKET_SYNC_MODES[0]);
    setNote('');
    resetCommand();
  }, [open, resetCommand]);

  const handleSubmit = async () => {
    const succeeded = await command.run(() =>
      services.market.syncRelease(marketReleaseId, {
        syncMode,
        ...(note.trim() ? { note: note.trim() } : {}),
      }),
    );
    if (succeeded) {
      onCompleted();
      onClose();
    }
  };

  return (
    <AdminDialog
      description={t('adminMarket.releaseSync.description')}
      onClose={onClose}
      open={open}
      title={t('adminMarket.releaseSync.title')}
      footer={
        <>
          <AdminActionButton onClick={onClose} disabled={command.submitting}>
            {t('adminShell.common.cancel')}
          </AdminActionButton>
          <AdminActionButton
            loading={command.submitting}
            onClick={handleSubmit}
            variant="primary"
          >
            {command.submitting
              ? t('adminMarket.releaseSync.submitting')
              : t('adminMarket.releaseSync.submit')}
          </AdminActionButton>
        </>
      }
    >
      <div className="space-y-4">
        <AdminCommandError error={command.error} />
        <AdminFormField
          htmlFor="market-release-sync-mode"
          label={t('adminMarket.releaseSync.syncMode')}
          required
        >
          <select
            id="market-release-sync-mode"
            className={ADMIN_INPUT_CLASS}
            value={syncMode}
            onChange={(event) => setSyncMode(event.target.value as AppstoreAdminMarketSyncMode)}
          >
            {APPSTORE_ADMIN_MARKET_SYNC_MODES.map((option) => (
              <option key={option} value={option}>
                {t(`adminMarket.syncMode.${option}`)}
              </option>
            ))}
          </select>
        </AdminFormField>
        <AdminFormField
          htmlFor="market-release-sync-note"
          hint={t('adminMarket.releaseSync.noteHint')}
          label={t('adminMarket.releaseSync.note')}
        >
          <textarea
            id="market-release-sync-note"
            className={`${ADMIN_INPUT_CLASS} min-h-[5rem]`}
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </AdminFormField>
      </div>
    </AdminDialog>
  );
}
