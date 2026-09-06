import React from 'react';
import { useTranslation } from 'react-i18next';
import { Play, FileCode } from 'lucide-react';

interface PluginModalNavTabsProps {
  activeTab: 'overview' | 'schema' | 'sandbox';
  onTabChange: (tab: 'overview' | 'schema' | 'sandbox') => void;
}

export const PluginModalNavTabs: React.FC<PluginModalNavTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex border-b border-gray-200 dark:border-[#282c38] mt-4 gap-4 text-xs font-semibold">
      <button
        onClick={() => onTabChange('overview')}
        className={`pb-2.5 cursor-pointer border-b-2 transition-all ${
          activeTab === 'overview'
            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
            : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400'
        }`}
      >
        {t('plugins.modal.overviewTab')}
      </button>
      <button
        onClick={() => onTabChange('schema')}
        className={`pb-2.5 cursor-pointer border-b-2 transition-all flex items-center gap-1.5 ${
          activeTab === 'schema'
            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
            : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400'
        }`}
      >
        <FileCode className="w-3.5 h-3.5" />
        <span>{t('plugins.modal.schemaTab')}</span>
      </button>
      <button
        onClick={() => onTabChange('sandbox')}
        className={`pb-2.5 cursor-pointer border-b-2 transition-all flex items-center gap-1.5 ${
          activeTab === 'sandbox'
            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
            : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400'
        }`}
      >
        <Play className="w-3.5 h-3.5" />
        <span>{t('plugins.modal.sandboxTab')}</span>
      </button>
    </div>
  );
};
