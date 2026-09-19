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
    <div className="bg-gray-100/50 dark:bg-[#181a20] border border-gray-200 dark:border-[#22252e] rounded-2xl p-5 shadow-sm">
      <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4">
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
