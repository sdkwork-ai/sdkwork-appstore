import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layers, Image, Cpu, Terminal, Play } from 'lucide-react';
import { TemplateTabType } from './TemplateDetailNavTabs';

export type { TemplateTabType };

interface TemplateDetailNavProps {
  activeTab: TemplateTabType;
  onTabChange: (tab: TemplateTabType) => void;
  screenshotsCount?: number;
}

export const TemplateDetailNav: React.FC<TemplateDetailNavProps> = ({
  activeTab,
  onTabChange,
  screenshotsCount = 0,
}) => {
  const { t } = useTranslation();

  const tabs: { id: TemplateTabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'overview',
      label: t('templates.detail.nav.overview'),
      icon: <Layers className="w-3.5 h-3.5" />,
    },
    {
      id: 'screenshots',
      label: t('templates.detail.nav.screenshots'),
      icon: <Image className="w-3.5 h-3.5" />,
      badge: screenshotsCount,
    },
    {
      id: 'techstack',
      label: t('templates.detail.nav.techstack'),
      icon: <Cpu className="w-3.5 h-3.5" />,
    },
    {
      id: 'cli',
      label: t('templates.detail.nav.cli'),
      icon: <Terminal className="w-3.5 h-3.5" />,
    },
    {
      id: 'demo',
      label: t('templates.detail.nav.demo'),
      icon: <Play className="w-3.5 h-3.5 text-store-success" />,
    },
  ];

  return (
    <div className="flex items-center gap-1.5 border-b border-store-line/80 dark:border-store-line overflow-x-auto my-3 pb-2 text-xs custom-scrollbar">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-store-control font-medium transition-all cursor-pointer shrink-0 text-xs${
              isActive
                ? 'bg-store-brand text-white shadow-sm'
                : 'text-store-ink-soft hover:bg-store-subtle hover:text-store-ink '
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive
                    ? 'bg-store-surface/20 text-white'
                    : 'bg-store-raised text-store-ink-soft '
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
