import React from 'react';
import { Terminal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface McpModalNavTabsProps {
  activeTab: 'config' | 'test';
  onTabChange: (tab: 'config' | 'test') => void;
}

export const McpModalNavTabs: React.FC<McpModalNavTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex border-b border-gray-200 dark:border-[#282c38] mb-4 gap-4 text-xs font-semibold">
      <button
        onClick={() => onTabChange('config')}
        className={`pb-2.5 cursor-pointer border-b-2 transition-all ${
          activeTab === 'config'
            ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold'
            : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400'
        }`}
      >
        {t('mcp.modal.tabJson')}
      </button>
      <button
        onClick={() => onTabChange('test')}
        className={`pb-2.5 cursor-pointer border-b-2 transition-all flex items-center gap-1.5 ${
          activeTab === 'test'
            ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold'
            : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400'
        }`}
      >
        <Terminal className="w-3.5 h-3.5" />
        <span>{t('mcp.modal.tabSandbox')}</span>
      </button>
    </div>
  );
};
