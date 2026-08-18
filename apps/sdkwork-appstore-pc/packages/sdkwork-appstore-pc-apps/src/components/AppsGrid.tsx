import React from 'react';
import { Layout } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppItem } from '@sdkwork/appstore-pc-core';
import { AppRow } from '@sdkwork/appstore-pc-commons';

interface AppsGridProps {
  apps: AppItem[];
  title?: string;
}

export const AppsGrid: React.FC<AppsGridProps> = ({ apps, title }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Layout className="w-4 h-4 text-blue-500" />
          <span>{title || t('apps.featuredApps', { count: apps.length, defaultValue: `精选桌面应用 (${apps.length})` })}</span>
        </h2>
      </div>

      {apps.length === 0 ? (
        <div className="py-12 text-center text-xs text-gray-400 dark:text-gray-500 bg-gray-100/40 dark:bg-[#181a20] rounded-2xl border border-gray-200/50 dark:border-[#22252e]">
          {t('apps.noMatchingApps', '暂无匹配的应用软件')}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {apps.map((app) => (
            <AppRow key={app.id} app={app} />
          ))}
        </div>
      )}
    </div>
  );
};
