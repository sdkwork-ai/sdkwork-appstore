import React from 'react';
import { useTranslation } from 'react-i18next';
import { ManagedAppRow } from './ManagedAppRow';

export interface PublishedApp {
  id: string;
  name: string;
  version: string;
  status: string;
  downloads: string;
}

interface ManagedAppsListProps {
  apps: PublishedApp[];
}

export const ManagedAppsList: React.FC<ManagedAppsListProps> = ({ apps }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-store-subtle/50 dark:bg-store-surface border border-store-line rounded-store-card p-5 shadow-sm ">
      <h2 className="text-sm font-bold text-store-ink mb-4 ">
        {t('console.managed.titleCount', { count: apps.length, defaultValue: `已管理应用列表 (${apps.length})` })}
      </h2>
      <div className="space-y-2.5">
        {apps.map((app) => (
          <ManagedAppRow key={app.id} app={app} />
        ))}
      </div>
    </div>
  );
};
