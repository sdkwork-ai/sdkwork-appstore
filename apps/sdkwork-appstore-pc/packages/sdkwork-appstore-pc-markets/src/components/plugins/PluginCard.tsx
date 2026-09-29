import React from 'react';
import { PluginItem } from '@sdkwork/appstore-pc-core';
import { PluginCardHeader } from './PluginCardHeader';
import { PluginCardCapabilities } from './PluginCardCapabilities';
import { PluginCardFooter } from './PluginCardFooter';

interface PluginCardProps {
  plugin: PluginItem;
  onToggleEnable: (id: string) => void;
  onSelect: (plugin: PluginItem) => void;
}

export const PluginCard: React.FC<PluginCardProps> = ({
  plugin,
  onToggleEnable,
  onSelect,
}) => {
  return (
    <div
      onClick={() => onSelect(plugin)}
      className="group relative w-full h-full bg-store-surface border border-store-line/80 dark:border-store-line hover:border-store-brand/50 p-4 rounded-store-card cursor-pointer transition-all duration-200 hover:shadow-lg flex flex-col justify-between "
    >
      <div>
        {/* Subcomponent: Plugin Header */}
        <PluginCardHeader plugin={plugin} />

        <p className="text-xs text-store-ink-soft mt-3 line-clamp-2 leading-relaxed ">
          {plugin.description}
        </p>

        {/* Subcomponent: Capabilities Chips */}
        <PluginCardCapabilities capabilities={plugin.capabilities} />
      </div>

      {/* Subcomponent: Card Footer Actions */}
      <PluginCardFooter plugin={plugin} onToggleEnable={onToggleEnable} />
    </div>
  );
};

