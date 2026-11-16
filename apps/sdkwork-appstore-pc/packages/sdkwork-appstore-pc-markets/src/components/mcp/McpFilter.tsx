import React from 'react';
import { CategoryChips } from '../CategoryChips';
import type { CategoryOption } from '../marketCategories';

interface McpFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories: CategoryOption[];
}

/** The MCP connector category chip row; the row itself is {@link CategoryChips}. */
export const McpFilter: React.FC<McpFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  categories,
}) => (
  <CategoryChips
    categories={categories}
    selectedCategory={selectedCategory}
    onSelectCategory={onSelectCategory}
  />
);
