import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  APPSTORE_ADMIN_MARKET_CHANNEL_STATUSES,
  APPSTORE_ADMIN_MARKET_OPERATIONS,
  useAppstoreAdminServices,
  type AppstoreAdminMarketChannel,
} from '@sdkwork/appstore-pc-admin-core';
import {
  ADMIN_INPUT_CLASS,
  AdminActionButton,
  AdminCommandError,
  AdminDialog,
  AdminFormField,
  useAdminCommand,
} from '@sdkwork/appstore-pc-admin-shell';

/** Parse result of one optional JSON textarea. */
type JsonFieldResult =
  | { ok: true; value?: Record<string, unknown> }
  | { ok: false };

/**
 * Parse an optional JSON object field.
 *
 * A blank textarea omits the field so the backend keeps the stored value; a
 * malformed value, or any JSON that is not an object map, fails the submit and
 * is reported on the field instead of being sent as a raw string.
 */
function parseJsonField(text: string): JsonFieldResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: true };
  }
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false };
    }
    return { ok: true, value: parsed as Record<string, unknown> };
  } catch {
    return { ok: false };
  }
}

/** Render a stored JSON map back into its editable textarea form. */
function formatJsonField(value: Record<string, unknown>): string {
  return Object.keys(value).length === 0 ? '' : JSON.stringify(value, null, 2);
}

export interface MarketChannelEditDialogProps {
  open: boolean;
  /** Channel being edited; carries the id used by the update operation. */
  channel: AppstoreAdminMarketChannel;
  onClose: () => void;
  /** Invoked after the channel is updated, so the caller can refresh. */
  onCompleted: () => void;
}

/** Updates a channel (`appstore.market_channels.update`). */
export function MarketChannelEditDialog({
  channel,
  onClose,
  onCompleted,
  open,
}: MarketChannelEditDialogProps) {
  const { t } = useTranslation();
  const services = useAppstoreAdminServices();
  const [channelStatus, setChannelStatus] = useState(channel.channelStatus);
  const [externalStoreCode, setExternalStoreCode] = useState(channel.externalStoreCode ?? '');
  const [apiCapabilityText, setApiCapabilityText] = useState('');
  const [configText, setConfigText] = useState('');
  const [apiCapabilityError, setApiCapabilityError] = useState('');
  const [configError, setConfigError] = useState('');
  const command = useAdminCommand(APPSTORE_ADMIN_MARKET_OPERATIONS.updateChannel);
  const { reset: resetCommand } = command;

  useEffect(() => {
    if (!open) {
      return;
    }
    setChannelStatus(channel.channelStatus || APPSTORE_ADMIN_MARKET_CHANNEL_STATUSES[0]);
    setExternalStoreCode(channel.externalStoreCode ?? '');
    setApiCapabilityText(formatJsonField(channel.apiCapability));
    setConfigText(formatJsonField(channel.config));
    setApiCapabilityError('');
    setConfigError('');
    resetCommand();
  }, [channel, open, resetCommand]);

  const handleSubmit = async () => {
    const apiCapability = parseJsonField(apiCapabilityText);
    const config = parseJsonField(configText);
    setApiCapabilityError(apiCapability.ok ? '' : t('adminMarket.channelEdit.validationJson'));
    setConfigError(config.ok ? '' : t('adminMarket.channelEdit.validationJson'));
    if (!apiCapability.ok || !config.ok) {
      return;
    }
    const nextApiCapability = apiCapability.value;
    const nextConfig = config.value;
    const succeeded = await command.run(() =>
      services.market.updateChannel(channel.marketChannelId, {
        channelStatus,
        ...(externalStoreCode.trim() ? { externalStoreCode: externalStoreCode.trim() } : {}),
        ...(nextApiCapability === undefined ? {} : { apiCapability: nextApiCapability }),
        ...(nextConfig === undefined ? {} : { config: nextConfig }),
      }),
    );
    if (succeeded) {
      onCompleted();
      onClose();
    }
  };

  return (
    <AdminDialog
      description={t('adminMarket.channelEdit.description')}
      onClose={onClose}
      open={open}
      size="lg"
      title={t('adminMarket.channelEdit.title')}
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
              ? t('adminMarket.channelEdit.submitting')
              : t('adminMarket.channelEdit.submit')}
          </AdminActionButton>
        </>
      }
    >
      <div className="space-y-4">
        <AdminCommandError error={command.error} />
        <AdminFormField
          htmlFor="market-channel-edit-status"
          label={t('adminMarket.channelEdit.channelStatus')}
          required
        >
          <select
            id="market-channel-edit-status"
            className={ADMIN_INPUT_CLASS}
            value={channelStatus}
            onChange={(event) => setChannelStatus(event.target.value)}
          >
            {APPSTORE_ADMIN_MARKET_CHANNEL_STATUSES.map((option) => (
              <option key={option} value={option}>
                {t(`adminMarket.channelStatus.${option}`)}
              </option>
            ))}
          </select>
        </AdminFormField>
        <AdminFormField
          htmlFor="market-channel-edit-store-code"
          label={t('adminMarket.channelEdit.externalStoreCode')}
        >
          <input
            id="market-channel-edit-store-code"
            className={ADMIN_INPUT_CLASS}
            placeholder={t('adminMarket.channelEdit.externalStoreCodePlaceholder')}
            value={externalStoreCode}
            onChange={(event) => setExternalStoreCode(event.target.value)}
          />
        </AdminFormField>
        <AdminFormField
          error={apiCapabilityError || undefined}
          htmlFor="market-channel-edit-api-capability"
          hint={t('adminMarket.channelEdit.apiCapabilityHint')}
          label={t('adminMarket.channelEdit.apiCapability')}
        >
          <textarea
            id="market-channel-edit-api-capability"
            className={`${ADMIN_INPUT_CLASS} min-h-[6rem] font-mono`}
            rows={4}
            value={apiCapabilityText}
            onChange={(event) => setApiCapabilityText(event.target.value)}
          />
        </AdminFormField>
        <AdminFormField
          error={configError || undefined}
          htmlFor="market-channel-edit-config"
          hint={t('adminMarket.channelEdit.configHint')}
          label={t('adminMarket.channelEdit.config')}
        >
          <textarea
            id="market-channel-edit-config"
            className={`${ADMIN_INPUT_CLASS} min-h-[6rem] font-mono`}
            rows={4}
            value={configText}
            onChange={(event) => setConfigText(event.target.value)}
          />
        </AdminFormField>
      </div>
    </AdminDialog>
  );
}
