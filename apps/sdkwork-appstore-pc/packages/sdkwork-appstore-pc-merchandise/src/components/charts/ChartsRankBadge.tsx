import React from 'react';
import { Medal, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ChartsRankBadgeProps {
  rank: number;
}

export const ChartsRankBadge: React.FC<ChartsRankBadgeProps> = ({ rank }) => {
  const { t } = useTranslation();

  if (rank === 1) {
    return (
      <div
        className="w-6 h-6 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-sm"
        title={t('charts.rank.first')}
      >
        <Trophy className="w-3.5 h-3.5 text-amber-500" />
      </div>
    );
  }

  if (rank === 2) {
    return (
      <div
        className="w-6 h-6 rounded-full bg-slate-300/20 border border-slate-400/30 flex items-center justify-center shrink-0 shadow-sm"
        title={t('charts.rank.second')}
      >
        <Medal className="w-3.5 h-3.5 text-slate-400" />
      </div>
    );
  }

  if (rank === 3) {
    return (
      <div
        className="w-6 h-6 rounded-full bg-amber-700/15 border border-amber-700/30 flex items-center justify-center shrink-0 shadow-sm"
        title={t('charts.rank.third')}
      >
        <Medal className="w-3.5 h-3.5 text-amber-700 dark:text-amber-600" />
      </div>
    );
  }

  return (
    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 w-6 text-center shrink-0">
      {rank}
    </span>
  );
};
