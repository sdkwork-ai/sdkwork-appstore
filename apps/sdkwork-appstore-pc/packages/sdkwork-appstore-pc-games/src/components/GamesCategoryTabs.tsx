import React from 'react';
import { useTranslation } from 'react-i18next';

export type GameTabType = 'all' | 'board' | 'mini' | 'handheld';

interface GamesCategoryTabsProps {
  activeTab: GameTabType;
  onTabChange: (tab: GameTabType) => void;
}

/** The games page's category tab strip (all / board / mini / handheld). The
    former hero banner around it is gone: the sidebar already names the page. */
export const GamesCategoryTabs: React.FC<GamesCategoryTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-store-control border border-store-line">
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
  );
};
