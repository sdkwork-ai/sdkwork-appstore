import React from 'react';
import { useTranslation } from 'react-i18next';
import { Flame } from 'lucide-react';
import { AppItem } from '@sdkwork/appstore-pc-core';
import { MiniGamesCarousel } from '@sdkwork/appstore-pc-commons';

interface MiniGamesSectionProps {
  games: AppItem[];
}

export const MiniGamesSection: React.FC<MiniGamesSectionProps> = ({ games }) => {
  const { t } = useTranslation();
  if (games.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-bold text-store-ink ">
        <Flame className="w-4 h-4 text-store-warning" />
        <span>{t('games.sections.miniGames', '热门微信小游戏')}</span>
      </div>
      <MiniGamesCarousel apps={games} />
    </section>
  );
};
