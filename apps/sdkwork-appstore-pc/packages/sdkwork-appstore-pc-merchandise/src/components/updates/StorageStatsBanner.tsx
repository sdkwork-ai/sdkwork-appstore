import React from 'react';
import { HardDrive, ShieldCheck, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StorageStatsBannerProps {
  installedAppsCount: number;
}

export const StorageStatsBanner: React.FC<StorageStatsBannerProps> = ({
  installedAppsCount,
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="p-4 bg-store-subtle/60 dark:bg-store-surface border border-store-line rounded-store-card flex items-center gap-3 ">
        <div className="p-2.5 rounded-store-control bg-store-brand/10 text-store-brand ">
          <HardDrive className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] text-store-ink-faint ">{t('updates.storage.installedCount')}</div>
          <div className="text-sm font-bold text-store-ink ">
            {t('updates.storage.appsInstalled', { count: installedAppsCount })}
          </div>
        </div>
      </div>

      <div className="p-4 bg-store-subtle/60 dark:bg-store-surface border border-store-line rounded-store-card flex items-center gap-3 ">
        <div className="p-2.5 rounded-store-control bg-store-success/10 text-store-success ">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] text-store-ink-faint ">{t('updates.storage.securityEngine')}</div>
          <div className="text-sm font-bold text-store-ink ">
            {t('updates.storage.securityStatus')}
          </div>
        </div>
      </div>

      <div className="p-4 bg-store-subtle/60 dark:bg-store-surface border border-store-line rounded-store-card flex items-center gap-3 ">
        <div className="p-2.5 rounded-store-control bg-purple-500/10 text-purple-600 dark:text-purple-400">
          <Download className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] text-store-ink-faint ">{t('updates.storage.downloadedCount')}</div>
          <div className="text-sm font-bold text-store-ink ">
            {t('updates.storage.appsDeployed', { count: installedAppsCount })}
          </div>
        </div>
      </div>
    </div>
  );
};

