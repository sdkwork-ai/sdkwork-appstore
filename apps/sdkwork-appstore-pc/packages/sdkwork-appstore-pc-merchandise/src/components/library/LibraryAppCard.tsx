import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, RefreshCw, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PlatformBadges } from '@sdkwork/appstore-pc-commons';
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
    <div className="p-4 bg-store-subtle/60 dark:bg-store-surface border border-store-line rounded-store-card flex items-center justify-between gap-3 hover:border-store-line-strong transition-all ">
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
            <h4 className="text-xs font-bold text-store-ink truncate hover:underline ">
              {app.name}
            </h4>
          </Link>
          <div className="flex items-center gap-1.5">
            <p className="text-[11px] text-store-ink-faint truncate ">
              {app.developer} · v{app.whatsNew?.version || '1.0.0'}
            </p>
            <PlatformBadges platforms={app.platforms} max={2} />
          </div>
          {hasUpdate && (
            <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-store-warning/10 text-store-warning text-xs font-medium ">
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
            className="px-3 py-1.5 bg-store-success hover:bg-store-success disabled:opacity-60 text-white rounded-store-control text-xs font-medium transition-all shadow-sm flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>{isUpdating ? t('library.grid.updating') : t('library.grid.update')}</span>
          </button>
        )}
        <button
          onClick={() => onOpenApp(app)}
          className="px-3 py-1.5 bg-store-brand hover:bg-store-brand text-white rounded-store-control text-xs font-medium transition-all shadow-sm flex items-center gap-1 cursor-pointer"
        >
          <span>{t('library.grid.open')}</span>
          <ExternalLink className="w-3 h-3" />
        </button>
        <button
          onClick={() => onUninstallApp(app.id)}
          title={t('library.grid.uninstall')}
          className="p-2 text-store-ink-faint hover:text-store-danger hover:bg-store-danger/10 rounded-store-control transition-all cursor-pointer text-xs font-medium"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
