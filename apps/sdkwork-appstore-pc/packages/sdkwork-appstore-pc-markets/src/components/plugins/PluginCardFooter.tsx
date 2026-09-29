import React from 'react';
import { Download, Star, CheckCircle2, Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PluginItem } from '@sdkwork/appstore-pc-core';

interface PluginCardFooterProps {
  plugin: PluginItem;
  onToggleEnable: (id: string) => void;
}

export const PluginCardFooter: React.FC<PluginCardFooterProps> = ({ plugin, onToggleEnable }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between mt-4 pt-3 border-t border-store-line-soft ">
      <div className="flex items-center gap-3 text-xs text-store-ink-faint">
        <span className="flex items-center gap-1 font-semibold text-store-warning">
          <Star className="w-3.5 h-3.5 fill-amber-500" />
          {plugin.rating}
        </span>
        <span className="flex items-center gap-1">
          <Download className="w-3.5 h-3.5" />
          {(plugin.downloadsCount / 1000).toFixed(1)}k
        </span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleEnable(plugin.id);
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-store-control text-xs font-medium transition-all shadow-sm ${
          plugin.enabled
            ? 'bg-store-success hover:bg-store-success text-white'
            : 'bg-store-subtle hover:bg-store-raised text-store-ink-soft '
        }`}
      >
        {plugin.enabled ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t('plugins.status.enabled')}</span>
          </>
        ) : (
          <>
            <Circle className="w-3.5 h-3.5" />
            <span>{t('plugins.status.disabled')}</span>
          </>
        )}
      </button>
    </div>
  );
};

