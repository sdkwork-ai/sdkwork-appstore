import React from 'react';

/** One template category chip: the catalog category value and its display label. */
export interface TemplateCategoryOption {
  value: string;
  label: string;
}

interface TemplatesCategoryFilterProps {
  categories: TemplateCategoryOption[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const TemplatesCategoryFilter: React.FC<TemplatesCategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onSelectCategory(category.value)}
          className={`px-3.5 py-1.5 rounded-store-control text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === category.value
              ? 'bg-store-brand text-white shadow-sm'
              : 'bg-store-surface text-store-ink-soft border border-store-line hover:bg-store-subtle '
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
};
