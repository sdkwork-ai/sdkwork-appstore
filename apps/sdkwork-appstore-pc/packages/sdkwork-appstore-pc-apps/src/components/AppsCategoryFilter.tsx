import React from 'react';
import { useTranslation } from 'react-i18next';

interface AppsCategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const AppsCategoryFilter: React.FC<AppsCategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      {categories.map((cat) => {
        const label = t(`apps.categories.${cat}`, cat);
        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-4 py-2 rounded-store-control text-xs font-medium transition-all shrink-0 ${
              selectedCategory === cat
                ? 'bg-store-brand text-white shadow-md'
                : 'bg-store-raised/70 dark:bg-store-surface text-store-ink-soft hover:bg-gray-300 dark:hover:bg-store-surface '
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};
