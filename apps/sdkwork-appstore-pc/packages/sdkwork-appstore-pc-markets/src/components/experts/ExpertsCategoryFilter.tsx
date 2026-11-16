import React from 'react';
import { useTranslation } from 'react-i18next';
import { CategoryChips } from '../CategoryChips';
import { ALL_CATEGORY } from '../marketCategories';

interface ExpertsCategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

/**
 * The experts category chip row.
 *
 * The experts catalog names its categories by the records' own tag values, so
 * this adapter keeps the plain `string[]` props its callers use and resolves
 * the "all" label through the locale dictionary before the shared row renders.
 */
export const ExpertsCategoryFilter: React.FC<ExpertsCategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const { t } = useTranslation();

  return (
    <CategoryChips
      categories={categories.map((category) => ({
        value: category,
        label: category === ALL_CATEGORY ? t('common.actions.all') : category,
      }))}
      selectedCategory={selectedCategory}
      onSelectCategory={onSelectCategory}
    />
  );
};
