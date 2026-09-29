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
        <h2 className="text-base font-bold text-store-ink flex items-center gap-2 ">
          <Layout className="w-4 h-4 text-store-brand" />
          <span>{title || t('apps.featuredApps', { count: apps.length, defaultValue: `精选桌面应用 (${apps.length})` })}</span>
        </h2>
      </div>

      {apps.length === 0 ? (
        <div className="py-12 text-center text-xs text-store-ink-faint bg-store-subtle/40 dark:bg-store-surface rounded-store-card border border-store-line ">
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
