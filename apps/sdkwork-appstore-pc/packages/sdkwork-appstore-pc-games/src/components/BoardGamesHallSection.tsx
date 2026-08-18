import React from 'react';
import { Club } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppItem } from '@sdkwork/appstore-pc-core';
import { AppRow } from '@sdkwork/appstore-pc-commons';
import { BoardGameFilterBar, FilterOption } from './BoardGameFilterBar';

interface BoardGamesHallSectionProps {
  boardGames: AppItem[];
  filteredBoardGames: AppItem[];
  boardQuickNav: FilterOption[];
  boardSubFilter: string;
  onSelectSubFilter: (filter: string) => void;
}

export const BoardGamesHallSection: React.FC<BoardGamesHallSectionProps> = ({
  boardGames,
  filteredBoardGames,
  boardQuickNav,
  boardSubFilter,
  onSelectSubFilter,
}) => {
  const { t } = useTranslation();

  return (
    <section className="p-5 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500 text-white rounded-xl shadow-sm">
            <Club className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span>{t('games.sections.boardHall', { count: boardGames.length, defaultValue: `棋牌游戏大厅 (${boardGames.length})` })}</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('games.sections.boardDesc', '支持斗地主、中国象棋、国际象棋、麻将、五子棋、军旗及热门扑克竞技')}
            </p>
          </div>
        </div>

        {/* Sub-component: Filter Bar */}
        <BoardGameFilterBar
          options={boardQuickNav}
          activeFilter={boardSubFilter}
          onSelectFilter={onSelectSubFilter}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredBoardGames.map((game) => (
          <AppRow key={game.id} app={game} />
        ))}
      </div>
    </section>
  );
};

