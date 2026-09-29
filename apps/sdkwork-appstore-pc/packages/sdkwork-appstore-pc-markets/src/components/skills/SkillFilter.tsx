import React from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SkillFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories: string[];
}

export const SkillFilter: React.FC<SkillFilterProps> = ({
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
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-store-ink-faint" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('skills.filter.searchPlaceholder')}
          className="w-full pl-10 pr-4 bg-store-field border border-store-line rounded-store-control text-sm focus:outline-none focus:border-store-brand text-store-ink placeholder:text-store-ink-faint h-9 outline-none transition-colors focus:ring-2 focus:ring-store-brand/25"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 min-w-0 custom-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-3 py-1.5 rounded-store-control text-xs font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-store-surface text-store-ink-soft border border-store-line hover:bg-store-subtle '
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

