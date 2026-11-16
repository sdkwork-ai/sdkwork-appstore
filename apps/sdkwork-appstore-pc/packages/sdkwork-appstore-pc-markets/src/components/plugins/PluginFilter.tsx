import React from 'react';
import { CategoryChips } from '../CategoryChips';
import type { CategoryOption } from '../marketCategories';

interface PluginFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories: CategoryOption[];
}

/** The plugins category chip row; the row itself is {@link CategoryChips}. */
export const PluginFilter: React.FC<PluginFilterProps> = ({
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
