import React from 'react';

/** One category filter chip: the catalog category id and its display label. */
export interface AppsCategoryOption {
  value: string;
  label: string;
}

interface AppsCategoryFilterProps {
  categories: AppsCategoryOption[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const AppsCategoryFilter: React.FC<AppsCategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onSelectCategory(category.value)}
          className={`px-4 py-2 rounded-store-control text-xs font-medium transition-all shrink-0 ${
            selectedCategory === category.value
              ? 'bg-store-brand text-white shadow-md'
              : 'bg-store-raised/70 dark:bg-store-surface text-store-ink-soft hover:bg-gray-300 dark:hover:bg-store-surface '
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
};
