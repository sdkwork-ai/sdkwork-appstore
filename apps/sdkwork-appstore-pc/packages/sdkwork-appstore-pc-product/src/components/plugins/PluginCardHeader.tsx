import React from 'react';
import { PluginItem } from '../../types';
import { DynamicIcon } from '../DynamicIcon';

interface PluginCardHeaderProps {
  plugin: PluginItem;
}

export const PluginCardHeader: React.FC<PluginCardHeaderProps> = ({ plugin }) => {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 ${plugin.iconColor}`}>
          <DynamicIcon name={plugin.icon} className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-500 transition-colors truncate">
            {plugin.name}
          </h3>
          <p className="text-xs text-gray-400 truncate mt-0.5">
            v{plugin.version} · {plugin.developer}
          </p>
        </div>
      </div>

      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
        {plugin.apiSchemaType}
      </span>
    </div>
  );
};
