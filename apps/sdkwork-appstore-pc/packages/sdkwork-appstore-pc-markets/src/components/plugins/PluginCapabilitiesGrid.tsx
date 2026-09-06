import React from 'react';
import { ShieldCheck, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PluginCapabilitiesGridProps {
  capabilities: string[];
}

export const PluginCapabilitiesGrid: React.FC<PluginCapabilitiesGridProps> = ({ capabilities }) => {
  const { t } = useTranslation();

  return (
    <div className="mt-5">
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Zap className="w-4 h-4 text-amber-500" />
        {t('plugins.modal.coreCapabilities', '核心 API 能力接口')}
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {capabilities.map((cap, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-100/70 dark:bg-[#222530] text-xs font-medium text-gray-800 dark:text-gray-200"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="truncate">{cap}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
