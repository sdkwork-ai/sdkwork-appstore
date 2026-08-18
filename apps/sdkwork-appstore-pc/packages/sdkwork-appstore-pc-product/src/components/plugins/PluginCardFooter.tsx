import React from 'react';
import { Download, Star, CheckCircle2, Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PluginItem } from '../../types';

interface PluginCardFooterProps {
  plugin: PluginItem;
  onToggleEnable: (id: string) => void;
}

export const PluginCardFooter: React.FC<PluginCardFooterProps> = ({ plugin, onToggleEnable }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-[#222530]">
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1 font-semibold text-amber-500">
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
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
          plugin.enabled
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
            : 'bg-gray-100 dark:bg-[#262a36] hover:bg-gray-200 dark:hover:bg-[#303545] text-gray-700 dark:text-gray-200'
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

