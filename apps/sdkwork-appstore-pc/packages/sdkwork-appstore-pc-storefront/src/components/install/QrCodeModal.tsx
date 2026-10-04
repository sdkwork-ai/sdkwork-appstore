import { QrCodeImage } from '@sdkwork/appstore-pc-commons';
import {
  resolveDistributionActions,
  type AppItem,
  type AppPlatformGroupKey,
} from '@sdkwork/appstore-pc-core';
import { useTranslation } from 'react-i18next';
import { DynamicIcon } from '../DynamicIcon';

interface QrCodeModalProps {
  /** The scanned listing plus, when known, the scanned platform group. */
  qr: { app: AppItem; group?: AppPlatformGroupKey } | null;
  onClose: () => void;
}

const GROUP_ACTION_KEY: Partial<Record<AppPlatformGroupKey, string>> = {
  android: 'qrAndroid',
  ios: 'qrIos',
  harmonyos: 'qrHarmonyos',
  miniprogram: 'qrMiniprogram',
  browserExtension: 'qrBrowserExtension',
};

/**
 * Scan-to-continue dialog for mobile, HarmonyOS, mini-program, and browser
 * extension distributions: encodes the distribution URL (accessUrl, or this
 * storefront's own listing anchor as fallback) into a QR code. The scanned
 * platform group labels the dialog when the scan was triggered per-platform.
 */
export function QrCodeModal({ qr, onClose }: QrCodeModalProps) {
  const { t } = useTranslation();
  if (!qr) {
    return null;
  }
  const { app, group } = qr;
  const qrAction = resolveDistributionActions(app).find((action) => action.kind === 'qr');
  const target = qrAction?.url ?? app.accessUrl;
  if (!target) {
    return null;
  }
  const scanLabel =
    (group && t(`common.distribution.${GROUP_ACTION_KEY[group] ?? 'qrGeneric'}`)) ||
    t('install.modal.qrTitle');
  const platformLabel = group ? t(`common.platformGroups.${group}`) : undefined;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-store-overlay backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-store-surface rounded-store-modal w-full max-w-xs p-6 shadow-2xl border border-store-line-soft text-center">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.accessibility.closeModal')}
          className="absolute top-4 right-4 p-1.5 text-store-ink-faint hover:text-store-ink rounded-full transition-colors cursor-pointer text-xs"
        >
          ✕
        </button>
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg ${app.iconColor} dark:shadow-none`}
        >
          <DynamicIcon name={app.icon} className="text-white w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-store-ink">{app.name}</h3>
        <p className="text-xs font-medium text-store-ink-soft mt-0.5">
          {platformLabel ?? t('install.modal.qrTitle')}
        </p>
        <p className="text-xs text-store-ink-faint mt-0.5">{scanLabel}</p>
        <div className="mt-4 flex justify-center">
          <QrCodeImage value={target} size={176} />
        </div>
        <p className="text-xs text-store-ink-faint mt-3 leading-relaxed">
          {t('install.modal.qrScanHint')}
        </p>
      </div>
    </div>
  );
}
