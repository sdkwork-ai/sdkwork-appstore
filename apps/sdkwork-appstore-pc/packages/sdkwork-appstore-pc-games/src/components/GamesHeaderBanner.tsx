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
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-gradient-to-br from-store-subtle to-store-subtle border border-store-line rounded-store-card text-store-ink shadow-lg relative overflow-hidden ">
      <div className="z-10 max-w-xl">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-store-brand/10 border border-store-brand/20 text-store-brand text-xs font-medium mb-3">
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>{t('games.header.badge')}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          {t('games.header.title')}
        </h1>
        <p className="text-xs md:text-sm text-store-ink-soft mt-2 leading-relaxed ">
          {t('games.header.subtitle')}
        </p>
      </div>

      {/* Action Tabs */}
      <div className="z-10 flex flex-wrap items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-store-control border border-store-line">
        <button
          onClick={() => onTabChange('all')}
          className={`px-3 py-1.5 rounded-store-control text-xs font-medium transition-all ${
            activeTab === 'all' ? 'bg-store-brand text-white shadow-sm' : 'text-slate-300 hover:text-white'
          }`}
        >
          {t('games.filter.allCategories', '全部游戏')}
        </button>
        <button
          onClick={() => onTabChange('board')}
          className={`px-3 py-1.5 rounded-store-control text-xs font-medium transition-all ${
            activeTab === 'board' ? 'bg-store-warning text-white shadow-sm' : 'text-slate-300 hover:text-white'
          }`}
        >
          {t('games.sections.boardGamesHall')}
        </button>
        <button
          onClick={() => onTabChange('mini')}
          className={`px-3 py-1.5 rounded-store-control text-xs font-medium transition-all ${
            activeTab === 'mini' ? 'bg-store-brand text-white shadow-sm' : 'text-slate-300 hover:text-white'
          }`}
        >
          {t('games.sections.miniGames', '微信小游戏')}
        </button>
        <button
          onClick={() => onTabChange('handheld')}
          className={`px-3 py-1.5 rounded-store-control text-xs font-medium transition-all ${
            activeTab === 'handheld' ? 'bg-store-brand text-white shadow-sm' : 'text-slate-300 hover:text-white'
          }`}
        >
          {t('games.sections.mobileGames', '精品手游')}
        </button>
      </div>
    </div>
  );
};
