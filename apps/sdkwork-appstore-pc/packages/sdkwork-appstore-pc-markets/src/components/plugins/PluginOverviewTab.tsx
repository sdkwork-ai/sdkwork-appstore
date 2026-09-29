import React from 'react';
import { useTranslation } from 'react-i18next';
import { PluginItem } from '@sdkwork/appstore-pc-core';
import { PluginCapabilitiesGrid } from './PluginCapabilitiesGrid';

interface PluginOverviewTabProps {
  plugin: PluginItem;
}

export const PluginOverviewTab: React.FC<PluginOverviewTabProps> = ({ plugin }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 my-4">
      <div className="p-4 rounded-store-card bg-store-subtle border border-store-line/60 dark:border-store-line ">
        <h4 className="text-xs font-bold text-store-ink-faint uppercase tracking-wider mb-1">
          {t('plugins.modal.descriptionLabel')}
        </h4>
        <p className="text-sm leading-relaxed text-store-ink-soft ">
          {plugin.description}
        </p>
      </div>

      <PluginCapabilitiesGrid capabilities={plugin.capabilities} />
    </div>
  );
};
