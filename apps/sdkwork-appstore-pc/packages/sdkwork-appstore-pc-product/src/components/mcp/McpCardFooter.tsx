import React from 'react';
import { Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { McpServerItem } from '../../types';

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
    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-[#222530]">
      <button
        onClick={() => onOpenConfig(server)}
        className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
      >
        <Settings className="w-3.5 h-3.5" />
        <span>{t('mcp.modal.configJson')}</span>
      </button>

      <button
        onClick={() => onToggleConnect(server.id)}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
          server.connected
            ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
            : 'bg-gray-100 dark:bg-[#262a36] hover:bg-gray-200 dark:hover:bg-[#303545] text-gray-700 dark:text-gray-200'
        }`}
      >
        {server.connected ? t('mcp.modal.connected') : t('mcp.modal.connectMcp')}
      </button>
    </div>
  );
};

