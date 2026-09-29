import React from 'react';
import { Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface SearchFilterOption {
  key: string;
  label: string;
}

interface SearchFiltersProps {
  filters: SearchFilterOption[];
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

export function SearchFilters({
  filters,
  activeFilter,
  onSelectFilter,
}: SearchFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
      <div className="flex items-center gap-1 text-store-ink-faint mr-2 shrink-0 ">
        <Filter className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">{t('search.filtersTitle', '筛选')}</span>
      </div>
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onSelectFilter(filter.key)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0 ${
            activeFilter === filter.key
              ? 'bg-store-brand text-white shadow-sm '
              : 'bg-store-surface border border-store-line text-store-ink-soft hover:bg-store-subtle '
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
