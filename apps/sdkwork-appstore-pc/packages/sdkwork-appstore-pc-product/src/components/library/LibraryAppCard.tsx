import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, RefreshCw, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppItem } from '../../types';
import { DynamicIcon } from '../DynamicIcon';

interface LibraryAppCardProps {
  app: AppItem;
  hasUpdate: boolean;
  isUpdating: boolean;
  onOpenApp: (app: AppItem) => void;
  onUninstallApp: (appId: string) => void;
  onUpdate: (appId: string) => void;
}

export function LibraryAppCard({
  app,
  hasUpdate,
  isUpdating,
  onOpenApp,
  onUninstallApp,
  onUpdate,
}: LibraryAppCardProps) {
  const { t } = useTranslation();

  return (
    <div className="p-4 bg-gray-100/60 dark:bg-[#181a20] border border-gray-200 dark:border-[#22252e] rounded-2xl flex items-center justify-between gap-3 hover:border-gray-300 dark:hover:border-[#2f3342] transition-all">
      <div className="flex items-center gap-3 min-w-0">
        <Link to={`/app/${app.id}`}>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 ${app.iconColor}`}
          >
            <DynamicIcon name={app.icon} className="w-6 h-6" />
          </div>
        </Link>
        <div className="min-w-0">
          <Link to={`/app/${app.id}`}>
            <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate hover:underline">
              {app.name}
            </h4>
          </Link>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
            {app.developer} · v{app.whatsNew?.version || '1.0.0'}
          </p>
          {hasUpdate && (
            <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
              <RefreshCw className="w-2.5 h-2.5" />
              {t('updates.tabs.updates')}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {hasUpdate && (
          <button
            onClick={() => onUpdate(app.id)}
            disabled={isUpdating}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>{isUpdating ? t('library.grid.updating') : t('library.grid.update')}</span>
          </button>
        )}
        <button
          onClick={() => onOpenApp(app)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
        >
          <span>{t('library.grid.open')}</span>
          <ExternalLink className="w-3 h-3" />
        </button>
        <button
          onClick={() => onUninstallApp(app.id)}
          title={t('library.grid.uninstall')}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
