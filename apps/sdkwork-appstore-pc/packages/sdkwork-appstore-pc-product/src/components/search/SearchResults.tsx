import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppItem } from '../../types';
import { AppRow } from '../AppRow';
import { SearchEmptyState } from './SearchEmptyState';

interface SearchResultsProps {
  query: string;
  results: AppItem[];
  loading: boolean;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  results,
  loading,
}) => {
  const { t } = useTranslation();

  if (loading) return null;

  if (results.length === 0) {
    return <SearchEmptyState />;
  }

  return (
    <section>
      <h2 className="text-xl font-bold tracking-tight mb-4 text-[#1C1C1E] dark:text-[#F5F5F5]">
        {t('search.header.resultsCount', { count: results.length, query })}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-1">
        {results.map((app) => (
          <AppRow key={app.id} app={app} />
        ))}
      </div>
    </section>
  );
};

