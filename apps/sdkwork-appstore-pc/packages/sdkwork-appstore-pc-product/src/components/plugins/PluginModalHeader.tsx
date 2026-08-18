import React from 'react';
import { useTranslation } from 'react-i18next';
import { PluginItem } from '../../types';
import { DynamicIcon } from '../DynamicIcon';

interface PluginModalHeaderProps {
  plugin: PluginItem;
}

export const PluginModalHeader: React.FC<PluginModalHeaderProps> = ({ plugin }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-start gap-4 pr-10">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-md ${plugin.iconColor} shrink-0`}>
        <DynamicIcon name={plugin.icon} className="w-8 h-8" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">{plugin.name}</h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
            {plugin.apiSchemaType}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {t('plugins.modal.developer', '开发者')}: <span className="text-gray-700 dark:text-gray-300 font-medium">{plugin.developer}</span> · {t('plugins.modal.version', '版本')}: {plugin.version}
        </p>
      </div>
    </div>
  );
};
