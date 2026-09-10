import React from 'react';
import { Bot } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppItem } from '@sdkwork/appstore-pc-core';
import { AppRow } from '@sdkwork/appstore-pc-commons';

interface AIAppsGridProps {
  apps: AppItem[];
}

export const AIAppsGrid: React.FC<AIAppsGridProps> = ({ apps }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Bot className="w-4 h-4 text-teal-500" />
          <span>{t('aihub.gridTitleWithCount', { count: apps.length })}</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3 @3xl:grid-cols-4 gap-3">
        {apps.map((app) => (
          <AppRow key={app.id} app={app} />
        ))}
      </div>
    </div>
  );
};
