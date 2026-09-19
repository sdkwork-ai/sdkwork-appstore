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
      <div className="p-4 bg-gray-100/60 dark:bg-[#181a20] border border-gray-200 dark:border-[#22252e] rounded-2xl flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <HardDrive className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('updates.storage.installedCount')}</div>
          <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {t('updates.storage.appsInstalled', { count: installedAppsCount })}
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-100/60 dark:bg-[#181a20] border border-gray-200 dark:border-[#22252e] rounded-2xl flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('updates.storage.securityEngine')}</div>
          <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {t('updates.storage.securityStatus')}
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-100/60 dark:bg-[#181a20] border border-gray-200 dark:border-[#22252e] rounded-2xl flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
          <Download className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('updates.storage.downloadedCount')}</div>
          <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {t('updates.storage.appsDeployed', { count: installedAppsCount })}
          </div>
        </div>
      </div>
    </div>
  );
};

