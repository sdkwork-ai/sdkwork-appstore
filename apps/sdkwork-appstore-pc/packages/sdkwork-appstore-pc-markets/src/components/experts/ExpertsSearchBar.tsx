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
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('experts.searchPlaceholder')}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#1b1e26] border border-gray-200 dark:border-[#282c38] rounded-2xl text-xs focus:outline-none focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-400"
        />
      </div>
    </div>
  );
};
