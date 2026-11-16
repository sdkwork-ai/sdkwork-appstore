import React from 'react';
import { CategoryChips } from '../CategoryChips';
import type { CategoryOption } from '../marketCategories';

interface SkillFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories: CategoryOption[];
}

/** The skills category chip row; the row itself is {@link CategoryChips}. */
export const SkillFilter: React.FC<SkillFilterProps> = ({
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
