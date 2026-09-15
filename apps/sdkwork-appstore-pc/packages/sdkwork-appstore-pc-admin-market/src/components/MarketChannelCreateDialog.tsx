import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  APPSTORE_ADMIN_MARKET_CHANNEL_TYPES,
  APPSTORE_ADMIN_MARKET_OPERATIONS,
  useAppstoreAdminServices,
  type AppstoreAdminMarketChannelType,
} from '@sdkwork/appstore-pc-admin-core';
import {
  ADMIN_INPUT_CLASS,
  AdminActionButton,
  AdminCommandError,
  AdminDialog,
  AdminFormField,
  useAdminCommand,
} from '@sdkwork/appstore-pc-admin-shell';

export interface MarketChannelCreateDialogProps {
  open: boolean;
  onClose: () => void;
  /** Invoked after a channel is created, so the caller can refresh. */
  onCompleted: () => void;
}

/** Creates an external market channel (`appstore.market_channels.write`). */
export function MarketChannelCreateDialog({
  onClose,
  onCompleted,
  open,
}: MarketChannelCreateDialogProps) {
  const { t } = useTranslation();
  const services = useAppstoreAdminServices();
  const [channelCode, setChannelCode] = useState('');
  const [channelType, setChannelType] = useState<AppstoreAdminMarketChannelType>(
    APPSTORE_ADMIN_MARKET_CHANNEL_TYPES[0],
  );
  const [provider, setProvider] = useState('');
  const [externalStoreCode, setExternalStoreCode] = useState('');
  const command = useAdminCommand(APPSTORE_ADMIN_MARKET_OPERATIONS.createChannel);
  const { reset: resetCommand } = command;

  useEffect(() => {
    if (!open) {
      return;
    }
    setChannelCode('');
    setChannelType(APPSTORE_ADMIN_MARKET_CHANNEL_TYPES[0]);
    setProvider('');
    setExternalStoreCode('');
    resetCommand();
  }, [open, resetCommand]);

  const handleSubmit = async () => {
    const succeeded = await command.run(() =>
      services.market.createChannel({
        channelCode: channelCode.trim(),
        channelType,
        provider: provider.trim(),
        ...(externalStoreCode.trim() ? { externalStoreCode: externalStoreCode.trim() } : {}),
      }),
    );
    if (succeeded) {
      onCompleted();
      onClose();
    }
  };

  return (
    <AdminDialog
      description={t('adminMarket.channelCreate.description')}
      onClose={onClose}
      open={open}
      title={t('adminMarket.channelCreate.title')}
      footer={
        <>
          <AdminActionButton onClick={onClose} disabled={command.submitting}>
            {t('adminShell.common.cancel')}
          </AdminActionButton>
          <AdminActionButton
            disabled={!channelCode.trim() || !provider.trim()}
            loading={command.submitting}
            onClick={handleSubmit}
            variant="primary"
          >
            {command.submitting
              ? t('adminMarket.channelCreate.submitting')
              : t('adminMarket.channelCreate.submit')}
          </AdminActionButton>
        </>
      }
    >
      <div className="space-y-4">
        <AdminCommandError error={command.error} />
        <AdminFormField
          htmlFor="market-channel-create-code"
          label={t('adminMarket.channelCreate.channelCode')}
          required
        >
          <input
            id="market-channel-create-code"
            className={ADMIN_INPUT_CLASS}
            placeholder={t('adminMarket.channelCreate.channelCodePlaceholder')}
            value={channelCode}
            onChange={(event) => setChannelCode(event.target.value)}
          />
        </AdminFormField>
        <AdminFormField
          htmlFor="market-channel-create-type"
          label={t('adminMarket.channelCreate.channelType')}
          required
        >
          <select
            id="market-channel-create-type"
            className={ADMIN_INPUT_CLASS}
            value={channelType}
            onChange={(event) =>
              setChannelType(event.target.value as AppstoreAdminMarketChannelType)
            }
          >
            {APPSTORE_ADMIN_MARKET_CHANNEL_TYPES.map((option) => (
              <option key={option} value={option}>
                {t(`adminMarket.channelType.${option}`)}
              </option>
            ))}
          </select>
        </AdminFormField>
        <AdminFormField
          htmlFor="market-channel-create-provider"
          label={t('adminMarket.channelCreate.provider')}
          required
        >
          <input
            id="market-channel-create-provider"
            className={ADMIN_INPUT_CLASS}
            placeholder={t('adminMarket.channelCreate.providerPlaceholder')}
            value={provider}
            onChange={(event) => setProvider(event.target.value)}
          />
        </AdminFormField>
        <AdminFormField
          htmlFor="market-channel-create-store-code"
          label={t('adminMarket.channelCreate.externalStoreCode')}
        >
          <input
            id="market-channel-create-store-code"
            className={ADMIN_INPUT_CLASS}
            placeholder={t('adminMarket.channelCreate.externalStoreCodePlaceholder')}
            value={externalStoreCode}
            onChange={(event) => setExternalStoreCode(event.target.value)}
          />
        </AdminFormField>
      </div>
    </AdminDialog>
  );
}
