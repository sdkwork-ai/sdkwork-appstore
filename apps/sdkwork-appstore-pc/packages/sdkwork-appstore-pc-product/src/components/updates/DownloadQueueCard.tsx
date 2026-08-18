import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppItem } from '../../types';
import { DynamicIcon } from '../DynamicIcon';

interface DownloadQueueCardProps {
  app: AppItem;
  downloadState: 'confirm' | 'downloading' | 'success' | null;
  progress: number;
  onOpenApp: (app: AppItem) => void;
}

export const DownloadQueueCard: React.FC<DownloadQueueCardProps> = ({
  app,
  downloadState,
  progress,
  onOpenApp,
}) => {
  const { t } = useTranslation();

  return (
    <div className="p-5 bg-blue-500/10 border border-blue-500/30 rounded-2xl space-y-3 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm ${app.iconColor}`}>
            <DynamicIcon name={app.icon} className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">
              {downloadState === 'downloading'
                ? t('updates.downloadQueue.downloading', { name: app.name })
                : downloadState === 'success'
                ? t('updates.downloadQueue.installed', { name: app.name })
                : t('updates.downloadQueue.preparing', { name: app.name })}
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {downloadState === 'downloading'
                ? t('updates.downloadQueue.speedInfo', { progress: progress.toFixed(0) })
                : t('updates.downloadQueue.readyInfo')}
            </p>
          </div>
        </div>

        {downloadState === 'success' && (
          <button
            onClick={() => onOpenApp(app)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
          >
            <span>{t('updates.downloadQueue.runNow')}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-200 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

