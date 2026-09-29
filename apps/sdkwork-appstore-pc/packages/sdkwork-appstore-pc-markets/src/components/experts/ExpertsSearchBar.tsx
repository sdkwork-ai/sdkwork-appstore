import React from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ExpertsSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const ExpertsSearchBar: React.FC<ExpertsSearchBarProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-store-ink-faint" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('experts.searchPlaceholder')}
          className="w-full pl-10 pr-4 bg-store-field border border-store-line rounded-store-control text-sm focus:outline-none focus:border-store-brand text-store-ink placeholder:text-store-ink-faint h-9 outline-none transition-colors focus:ring-2 focus:ring-store-brand/25"
        />
      </div>
    </div>
  );
};
