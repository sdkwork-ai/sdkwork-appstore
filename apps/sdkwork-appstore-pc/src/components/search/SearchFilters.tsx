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
      <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 mr-2 shrink-0">
        <Filter className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">{t('search.filtersTitle', '筛选')}</span>
      </div>
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onSelectFilter(filter.key)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0 ${
            activeFilter === filter.key
              ? 'bg-blue-600 dark:bg-[#0A84FF] text-white shadow-sm'
              : 'bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-[#2C2C2E] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2C2C2E]'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
