import React from 'react';
import { Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppItem } from '@sdkwork/appstore-pc-core';
import { HandheldGamesGrid } from '@sdkwork/appstore-pc-commons';

interface HandheldGamesSectionProps {
  games: AppItem[];
}

export const HandheldGamesSection: React.FC<HandheldGamesSectionProps> = ({ games }) => {
  const { t } = useTranslation();

  if (games.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-bold text-store-ink ">
        <Trophy className="w-4 h-4 text-store-warning" />
        <span>{t('games.sections.mobileGames', '精品手游合集')}</span>
      </div>
      <HandheldGamesGrid apps={games} />
    </section>
  );
};
