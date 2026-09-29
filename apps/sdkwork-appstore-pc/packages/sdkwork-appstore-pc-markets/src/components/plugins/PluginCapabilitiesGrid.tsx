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
      <h4 className="text-xs font-bold text-store-ink-faint uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Zap className="w-4 h-4 text-store-warning" />
        {t('plugins.modal.coreCapabilities', '核心 API 能力接口')}
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {capabilities.map((cap, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 p-2.5 rounded-store-control bg-store-subtle/70 dark:bg-store-surface text-xs font-medium text-store-ink "
          >
            <ShieldCheck className="w-4 h-4 text-store-success shrink-0" />
            <span className="truncate">{cap}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
