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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
      <div className="flex items-center gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => onTabChange('experts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'experts'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
          }`}
        >
          <Users className={`w-4 h-4 ${activeTab === 'experts' ? 'text-white' : 'text-slate-500'}`} />
          <span>{t('aihub.tabs.experts')}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'experts' ? 'bg-blue-500/40 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700/60'}`}>
            {expertsCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('sandbox')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'sandbox'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
          }`}
        >
          <Zap className={`w-4 h-4 ${activeTab === 'sandbox' ? 'text-white' : 'text-slate-500'}`} />
          <span>{t('aihub.tabs.sandbox')}</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('apps')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'apps'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
          }`}
        >
          <Grid className={`w-4 h-4 ${activeTab === 'apps' ? 'text-white' : 'text-slate-500'}`} />
          <span>{t('aihub.tabs.tools')}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'apps' ? 'bg-blue-500/40 text-white' : 'bg-slate-800 text-slate-400'}`}>
            {appsCount}
          </span>
        </button>
      </div>
    </div>
  );
};
