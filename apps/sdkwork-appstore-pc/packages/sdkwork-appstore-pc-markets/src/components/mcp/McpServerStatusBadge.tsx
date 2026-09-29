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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-store-success/10 text-store-success border border-store-success/20 ">
          <span className="w-1.5 h-1.5 rounded-full bg-store-success animate-ping"></span>
          {t('mcp.status.active')}
        </span>
      );
    case 'idle':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-store-warning/10 text-store-warning border border-store-warning/20 ">
          <Radio className="w-3 h-3" />
          {t('mcp.status.idle')}
        </span>
      );
    case 'error':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-store-danger/10 text-store-danger border border-store-danger/20 ">
          <AlertTriangle className="w-3 h-3" />
          {t('mcp.status.error')}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-store-ink-faint border border-gray-500/20 ">
          <WifiOff className="w-3 h-3" />
          {t('mcp.status.disconnected')}
        </span>
      );
  }
};

