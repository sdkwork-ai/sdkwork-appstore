import React from 'react';
import { Wifi, WifiOff, AlertTriangle, Radio } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface McpServerStatusBadgeProps {
  status: 'active' | 'idle' | 'disconnected' | 'error';
}

export const McpServerStatusBadge: React.FC<McpServerStatusBadgeProps> = ({ status }) => {
  const { t } = useTranslation();

  switch (status) {
    case 'active':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          {t('mcp.status.active')}
        </span>
      );
    case 'idle':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <Radio className="w-3 h-3" />
          {t('mcp.status.idle')}
        </span>
      );
    case 'error':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
          <AlertTriangle className="w-3 h-3" />
          {t('mcp.status.error')}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-500/20">
          <WifiOff className="w-3 h-3" />
          {t('mcp.status.disconnected')}
        </span>
      );
  }
};

