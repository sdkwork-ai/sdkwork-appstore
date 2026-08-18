import React from 'react';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppItem } from '@sdkwork/appstore-pc-core';
import { AppRow } from '@sdkwork/appstore-pc-commons';

interface PcGamesSectionProps {
  games: AppItem[];
}

export const PcGamesSection: React.FC<PcGamesSectionProps> = ({ games }) => {
  const { t } = useTranslation();

  if (games.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100">
        <Sparkles className="w-4 h-4 text-purple-500" />
        <span>{t('games.sections.pcGames', { count: games.length, defaultValue: `更多 PC 客户端游戏 (${games.length})` })}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {games.map((game) => (
          <AppRow key={game.id} app={game} />
        ))}
      </div>
    </section>
  );
};
