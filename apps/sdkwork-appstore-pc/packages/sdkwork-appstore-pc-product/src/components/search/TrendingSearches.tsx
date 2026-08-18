import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingSearchItem } from './TrendingSearchItem';

interface TrendingSearchesProps {
  trending: string[];
  onSelect: (item: string) => void;
}

export const TrendingSearches: React.FC<TrendingSearchesProps> = ({
  trending,
  onSelect,
}) => {
  const { t } = useTranslation();

  return (
    <section>
      <h2 className="text-2xl font-bold tracking-tight mb-4 text-[#1C1C1E] dark:text-[#F5F5F5]">
        {t('search.trendingTitle', '热门搜索')}
      </h2>
      <div className="flex flex-col">
        {trending.map((item, index) => (
          <TrendingSearchItem
            key={item}
            item={item}
            isLast={index === trending.length - 1}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
};

