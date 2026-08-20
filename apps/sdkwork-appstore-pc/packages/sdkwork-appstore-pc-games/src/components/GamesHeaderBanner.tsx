import React from 'react';
import { useTranslation } from 'react-i18next';
import { Gamepad2 } from 'lucide-react';

export type GameTabType = 'all' | 'board' | 'mini' | 'handheld';

interface GamesHeaderBannerProps {
  activeTab: GameTabType;
  onTabChange: (tab: GameTabType) => void;
}

export const GamesHeaderBanner: React.FC<GamesHeaderBannerProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-[#12141c] border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white shadow-lg relative overflow-hidden">
      <div className="z-10 max-w-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>{t('games.header.badge')}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          {t('games.header.title')}
        </h1>
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
          {t('games.header.subtitle')}
        </p>
      </div>

      {/* Action Tabs */}
      <div className="z-10 flex flex-wrap items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
        <button
          onClick={() => onTabChange('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
          }`}
        >
          {t('games.filter.allCategories', '全部游戏')}
        </button>
        <button
          onClick={() => onTabChange('board')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'board' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
          }`}
        >
          {t('games.sections.boardGamesHall')}
        </button>
        <button
          onClick={() => onTabChange('mini')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'mini' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
          }`}
        >
          {t('games.sections.miniGames', '微信小游戏')}
        </button>
        <button
          onClick={() => onTabChange('handheld')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'handheld' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
          }`}
        >
          {t('games.sections.mobileGames', '精品手游')}
        </button>
      </div>
    </div>
  );
};
