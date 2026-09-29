import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Zap, Grid } from 'lucide-react';

export type AIHubTabType = 'experts' | 'sandbox' | 'apps';

interface AIHubTabNavProps {
  activeTab: AIHubTabType;
  onTabChange: (tab: AIHubTabType) => void;
  expertsCount: number;
  appsCount: number;
}

export const AIHubTabNav: React.FC<AIHubTabNavProps> = ({
  activeTab,
  onTabChange,
  expertsCount,
  appsCount,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-2 rounded-store-card border border-store-line">
      <div className="flex items-center gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => onTabChange('experts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-store-control text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'experts'
              ? 'bg-store-brand text-white'
              : 'text-store-ink-faint hover:text-slate-100 hover:bg-slate-800/80'
          }`}
        >
          <Users className={`w-4 h-4 ${activeTab === 'experts' ? 'text-white' : 'text-store-ink-faint'}`} />
          <span>{t('aihub.tabs.experts')}</span>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium${activeTab === 'experts' ? 'bg-store-brand/40 text-white' : 'bg-slate-800 text-store-ink-faint border border-store-line/60'}`}>
            {expertsCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('sandbox')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-store-control text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'sandbox'
              ? 'bg-store-brand text-white'
              : 'text-store-ink-faint hover:text-slate-100 hover:bg-slate-800/80'
          }`}
        >
          <Zap className={`w-4 h-4 ${activeTab === 'sandbox' ? 'text-white' : 'text-store-ink-faint'}`} />
          <span>{t('aihub.tabs.sandbox')}</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('apps')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-store-control text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'apps'
              ? 'bg-store-brand text-white'
              : 'text-store-ink-faint hover:text-slate-100 hover:bg-slate-800/80'
          }`}
        >
          <Grid className={`w-4 h-4 ${activeTab === 'apps' ? 'text-white' : 'text-store-ink-faint'}`} />
          <span>{t('aihub.tabs.tools')}</span>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium${activeTab === 'apps' ? 'bg-store-brand/40 text-white' : 'bg-slate-800 text-store-ink-faint'}`}>
            {appsCount}
          </span>
        </button>
      </div>
    </div>
  );
};
