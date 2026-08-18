import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppItem } from '../../types';
import { LibraryAppCard } from './LibraryAppCard';
import { LibraryEmptyState } from './LibraryEmptyState';

interface LibraryAppsGridProps {
  installedApps: AppItem[];
  onOpenApp: (app: AppItem) => void;
  onUninstallApp: (appId: string) => void;
}

export const LibraryAppsGrid: React.FC<LibraryAppsGridProps> = ({
  installedApps,
  onOpenApp,
  onUninstallApp,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {t('updates.library.title', { count: installedApps.length })}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {t('updates.library.subtitle')}
          </p>
        </div>
      </div>

      {installedApps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {installedApps.map((app) => (
            <LibraryAppCard
              key={app.id}
              app={app}
              onOpenApp={onOpenApp}
              onUninstallApp={onUninstallApp}
            />
          ))}
        </div>
      ) : (
        <LibraryEmptyState />
      )}
    </div>
  );
};


