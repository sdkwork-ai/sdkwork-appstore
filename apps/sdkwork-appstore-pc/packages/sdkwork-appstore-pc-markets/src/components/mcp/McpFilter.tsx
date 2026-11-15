import React from 'react';
import type { CategoryOption } from '../marketCategories';

interface McpFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories: CategoryOption[];
}

/** The MCP connector category chip row. The surrounding chrome owns text
    search (the store header's global search or the embedding host's toolbar),
    so the filter carries no search input of its own. */
export const McpFilter: React.FC<McpFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  categories,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 min-w-0 custom-scrollbar">
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onSelectCategory(category.value)}
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
