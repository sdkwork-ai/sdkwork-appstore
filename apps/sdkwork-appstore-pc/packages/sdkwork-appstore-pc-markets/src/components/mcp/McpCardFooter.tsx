import React from 'react';
import { Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { McpServerItem } from '@sdkwork/appstore-pc-core';

interface McpCardFooterProps {
  server: McpServerItem;
  onOpenConfig: (server: McpServerItem) => void;
  onToggleConnect: (id: string) => void;
}

export const McpCardFooter: React.FC<McpCardFooterProps> = ({
  server,
  onOpenConfig,
  onToggleConnect,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between mt-4 pt-3 border-t border-store-line-soft ">
      <button
        onClick={() => onOpenConfig(server)}
        className="flex items-center gap-1 text-xs font-semibold text-store-ink-faint hover:text-store-ink cursor-pointer "
      >
        <Settings className="w-3.5 h-3.5" />
        <span>{t('mcp.modal.configJson')}</span>
      </button>

      <button
        onClick={() => onToggleConnect(server.id)}
        className={`px-3 py-1.5 rounded-store-control text-xs font-medium transition-all shadow-sm cursor-pointer ${
          server.connected
            ? 'bg-store-info hover:bg-store-info-hover text-white'
            : 'bg-store-subtle hover:bg-store-raised text-store-ink-soft '
        }`}
      >
        {server.connected ? t('mcp.modal.connected') : t('mcp.modal.connectMcp')}
      </button>
    </div>
  );
};

