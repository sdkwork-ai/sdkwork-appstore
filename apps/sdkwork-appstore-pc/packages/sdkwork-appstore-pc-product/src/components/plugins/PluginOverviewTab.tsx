import React from 'react';
import { useTranslation } from 'react-i18next';
import { PluginItem } from '../../types';
import { PluginCapabilitiesGrid } from './PluginCapabilitiesGrid';

interface PluginOverviewTabProps {
  plugin: PluginItem;
}

export const PluginOverviewTab: React.FC<PluginOverviewTabProps> = ({ plugin }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 my-4">
      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#20232d] border border-gray-200/60 dark:border-[#2a2d39]">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
          {t('plugins.modal.descriptionLabel')}
        </h4>
        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">
          {plugin.description}
        </p>
      </div>

      <PluginCapabilitiesGrid capabilities={plugin.capabilities} />
    </div>
  );
};
