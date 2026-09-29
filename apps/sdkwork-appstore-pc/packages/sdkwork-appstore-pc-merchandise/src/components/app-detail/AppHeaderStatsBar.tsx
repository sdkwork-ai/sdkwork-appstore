import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppItem } from '../../types';

interface AppHeaderStatsBarProps {
  app: AppItem;
}

export const AppHeaderStatsBar: React.FC<AppHeaderStatsBarProps> = ({ app }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center divide-x divide-store-line-soft overflow-x-auto pb-2 scrollbar-hide mt-auto ">
      <div className="pr-6 py-1 shrink-0">
        <p className="text-[10px] text-store-ink-faint uppercase font-bold tracking-wider ">{t('appDetail.stats.ratings')}</p>
        <p className="text-lg font-bold flex items-center gap-1 text-store-ink ">
          {app.rating.toFixed(1)} <span className="text-xs text-store-ink-faint font-normal ">★★★★★</span>
        </p>
      </div>
      <div className="px-6 py-1 shrink-0">
        <p className="text-[10px] text-store-ink-faint uppercase font-bold tracking-wider ">{t('appDetail.stats.age')}</p>
        <p className="text-lg font-bold text-store-ink ">{app.ageRating}</p>
      </div>
      {app.chartRank && (
        <div className="px-6 py-1 shrink-0">
          <p className="text-[10px] text-store-ink-faint uppercase font-bold tracking-wider ">{t('appDetail.stats.charts')}</p>
          <p className="text-lg font-bold text-store-brand ">#{app.chartRank}</p>
        </div>
      )}
      <div className="pl-6 py-1 shrink-0">
        <p className="text-[10px] text-store-ink-faint uppercase font-bold tracking-wider ">{t('appDetail.stats.developer')}</p>
        <p className="text-sm mt-1 font-bold text-store-brand truncate max-w-[120px] ">{app.developer}</p>
      </div>
    </div>
  );
};

