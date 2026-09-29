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
    <div className="bg-store-surface rounded-store-card p-2 border border-store-line/80 dark:border-store-line shadow-sm ">
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => onTabChange('overview')}
          className={`px-4 py-2.5 rounded-store-control text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-store-brand text-white shadow-sm'
              : 'text-store-ink-soft hover:bg-store-subtle '
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{t('templates.detail.nav.overview')}</span>
        </button>

        <button
          onClick={() => onTabChange('screenshots')}
          className={`px-4 py-2.5 rounded-store-control text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'screenshots'
              ? 'bg-store-brand text-white shadow-sm'
              : 'text-store-ink-soft hover:bg-store-subtle '
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>
            {t('templates.detail.nav.screenshots')} ({screenshotsCount})
          </span>
        </button>

        <button
          onClick={() => onTabChange('techstack')}
          className={`px-4 py-2.5 rounded-store-control text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'techstack'
              ? 'bg-store-brand text-white shadow-sm'
              : 'text-store-ink-soft hover:bg-store-subtle '
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>{t('templates.detail.nav.techstack')}</span>
        </button>

        <button
          onClick={() => onTabChange('cli')}
          className={`px-4 py-2.5 rounded-store-control text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'cli'
              ? 'bg-store-brand text-white shadow-sm'
              : 'text-store-ink-soft hover:bg-store-subtle '
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>{t('templates.detail.nav.cli')}</span>
        </button>

        <button
          onClick={() => onTabChange('demo')}
          className={`px-4 py-2.5 rounded-store-control text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'demo'
              ? 'bg-store-brand text-white shadow-sm'
              : 'text-store-ink-soft hover:bg-store-subtle '
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-store-warning" />
          <span>{t('templates.detail.nav.demo')}</span>
        </button>
      </div>
    </div>
  );
};
