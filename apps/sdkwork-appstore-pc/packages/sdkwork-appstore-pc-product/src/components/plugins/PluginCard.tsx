import React from 'react';
import { PluginItem } from '../../types';
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
      className="group relative w-full h-full bg-white dark:bg-[#191b22] border border-gray-200/80 dark:border-[#262933] hover:border-blue-500/50 dark:hover:border-blue-500/50 p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-lg flex flex-col justify-between"
    >
      <div>
        {/* Subcomponent: Plugin Header */}
        <PluginCardHeader plugin={plugin} />

        <p className="text-xs text-gray-600 dark:text-gray-300 mt-3 line-clamp-2 leading-relaxed">
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

