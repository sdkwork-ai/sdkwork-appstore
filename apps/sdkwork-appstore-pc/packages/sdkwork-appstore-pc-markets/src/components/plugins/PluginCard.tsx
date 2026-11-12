import React from 'react';
import { useTranslation } from 'react-i18next';
import { PluginItem } from '@sdkwork/appstore-pc-core';
import type { PluginsHost } from '@sdkwork/appstore-pc-core';
import { PluginCardHeader } from './PluginCardHeader';
import { PluginCardCapabilities } from './PluginCardCapabilities';
import { PluginCardFooter } from './PluginCardFooter';

interface PluginCardProps {
  plugin: PluginItem;
  onToggleEnable: (id: string) => void;
  onSelect: (plugin: PluginItem) => void;
  /** The embedding host's install port, when it provides one. */
  pluginsHost?: PluginsHost;
}

export const PluginCard: React.FC<PluginCardProps> = ({
  plugin,
  onToggleEnable,
  onSelect,
  pluginsHost,
}) => {
  const { t } = useTranslation();
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

        {/* Where the package comes from. A repository may carry several
            plugins, so the directory is shown beside the form. */}
        {plugin.source !== undefined && (
          <div className="mt-2 flex items-center gap-1 text-[11px] text-store-ink-faint ">
            <span>{t(`plugins.source.${plugin.source.type}`)}</span>
            {plugin.source.directory !== undefined && (
              <span className="font-mono truncate">· {plugin.source.directory}</span>
            )}
          </div>
        )}
      </div>

      {/* Subcomponent: Card Footer Actions */}
      <PluginCardFooter
        plugin={plugin}
        onToggleEnable={onToggleEnable}
        {...(pluginsHost === undefined ? {} : { pluginsHost })}
      />
    </div>
  );
};

