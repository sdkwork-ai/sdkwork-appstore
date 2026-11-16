import React from 'react';
import type { CategoryOption } from './marketCategories';

export interface CategoryChipsProps {
  categories: readonly CategoryOption[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  /** Accessible name of the chip group, e.g. "Marketplace categories". */
  label?: string;
}

/**
 * The one category chip row every marketplace page renders.
 *
 * The surrounding chrome owns text search (the store header's global search or
 * the embedding host's toolbar), so this row carries no search input of its
 * own: pages compose it with their own action buttons.
 */
export const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  label,
}) => {
  return (
    <div
      className="flex items-center gap-2 overflow-x-auto pb-1 min-w-0 custom-scrollbar"
      role="group"
      {...(label === undefined ? {} : { 'aria-label': label })}
    >
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onSelectCategory(category.value)}
          aria-pressed={selectedCategory === category.value}
          className={`px-3 py-1.5 rounded-store-control text-xs font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer ${
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
