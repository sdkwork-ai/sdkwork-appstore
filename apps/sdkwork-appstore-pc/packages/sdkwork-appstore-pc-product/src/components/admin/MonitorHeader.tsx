import React from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, RefreshCw } from 'lucide-react';

interface MonitorHeaderProps {
  refreshing: boolean;
  onRefresh: () => void;
}

export const MonitorHeader: React.FC<MonitorHeaderProps> = ({
  refreshing,
  onRefresh,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-[#22252e]">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-500" />
          {t('admin.header.title')}
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {t('admin.header.subtitle')}
        </p>
      </div>
      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 dark:bg-[#20232b] hover:bg-gray-300 dark:hover:bg-[#282c38] text-gray-800 dark:text-gray-200 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-500' : ''}`} />
        {refreshing ? t('admin.header.refreshing') : t('admin.header.refreshBtn')}
      </button>
    </div>
  );
};
