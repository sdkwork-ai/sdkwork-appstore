import React from 'react';
import { useTranslation } from 'react-i18next';
import { Play } from 'lucide-react';

interface SkillModalNavTabsProps {
  activeTab: 'info' | 'test';
  onTabChange: (tab: 'info' | 'test') => void;
}

export const SkillModalNavTabs: React.FC<SkillModalNavTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex border-b border-gray-200 dark:border-[#282c38] mt-3 gap-4 text-xs font-semibold">
      <button
        onClick={() => onTabChange('info')}
        className={`pb-2 cursor-pointer border-b-2 transition-all ${
          activeTab === 'info'
            ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
            : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400'
        }`}
      >
        {t('skills.modal.overviewTab')}
      </button>
      <button
        onClick={() => onTabChange('test')}
        className={`pb-2 cursor-pointer border-b-2 transition-all flex items-center gap-1.5 ${
          activeTab === 'test'
            ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
            : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400'
        }`}
      >
        <Play className="w-3.5 h-3.5" />
        <span>{t('skills.modal.sandboxTab')}</span>
      </button>
    </div>
  );
};
