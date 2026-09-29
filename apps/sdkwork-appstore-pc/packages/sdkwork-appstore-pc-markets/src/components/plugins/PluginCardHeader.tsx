import React from 'react';
import { PluginItem } from '@sdkwork/appstore-pc-core';
import { DynamicIcon } from '@sdkwork/appstore-pc-commons';

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
          <h3 className="font-bold text-sm text-store-ink group-hover:text-store-brand transition-colors truncate ">
            {plugin.name}
          </h3>
          <p className="text-xs text-store-ink-faint truncate mt-0.5">
            v{plugin.version} · {plugin.developer}
          </p>
        </div>
      </div>

      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-store-brand/10 text-store-brand shrink-0 ">
        {plugin.apiSchemaType}
      </span>
    </div>
  );
};
