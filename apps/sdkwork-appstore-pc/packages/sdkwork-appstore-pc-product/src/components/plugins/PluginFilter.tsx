import React from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PluginFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories: string[];
}

export const PluginFilter: React.FC<PluginFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  categories,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between min-w-0 w-full">
      <div className="relative flex-1 max-w-md shrink-0">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('plugins.filter.searchPlaceholder')}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#1b1e26] border border-gray-200 dark:border-[#282c38] rounded-2xl text-xs focus:outline-none focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-400"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 min-w-0 custom-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#1b1e26] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#282c38] hover:bg-gray-100 dark:hover:bg-[#222632]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

