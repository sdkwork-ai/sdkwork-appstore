import React from 'react';
import { BookOpen, Layers, Code2, Terminal, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type TemplateTabType = 'overview' | 'screenshots' | 'techstack' | 'cli' | 'demo';

interface TemplateDetailNavTabsProps {
  activeTab: TemplateTabType;
  screenshotsCount: number;
  onTabChange: (tab: TemplateTabType) => void;
}

export const TemplateDetailNavTabs: React.FC<TemplateDetailNavTabsProps> = ({
  activeTab,
  screenshotsCount,
  onTabChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-[#181a20] rounded-2xl p-2 border border-gray-200/80 dark:border-[#262933] shadow-sm">
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => onTabChange('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#20232d]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{t('templates.detail.nav.overview')}</span>
        </button>

        <button
          onClick={() => onTabChange('screenshots')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'screenshots'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#20232d]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>
            {t('templates.detail.nav.screenshots')} ({screenshotsCount})
          </span>
        </button>

        <button
          onClick={() => onTabChange('techstack')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'techstack'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#20232d]'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>{t('templates.detail.nav.techstack')}</span>
        </button>

        <button
          onClick={() => onTabChange('cli')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'cli'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#20232d]'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>{t('templates.detail.nav.cli')}</span>
        </button>

        <button
          onClick={() => onTabChange('demo')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'demo'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#20232d]'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-300" />
          <span>{t('templates.detail.nav.demo')}</span>
        </button>
      </div>
    </div>
  );
};
