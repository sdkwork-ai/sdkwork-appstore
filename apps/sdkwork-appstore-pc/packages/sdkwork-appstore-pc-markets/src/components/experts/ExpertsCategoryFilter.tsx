import React from 'react';
import { useTranslation } from 'react-i18next';

interface ExpertsCategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const ExpertsCategoryFilter: React.FC<ExpertsCategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const { t } = useTranslation();

  const getCategoryLabel = (cat: string) => {
    if (cat === ALL_CATEGORY) {
      return t('common.actions.all');
    }
    return cat;
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelectCategory(cat)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === cat
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-[#1b1e26] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#282c38] hover:bg-gray-100 dark:hover:bg-[#222632]'
          }`}
        >
          {getCategoryLabel(cat)}
        </button>
      ))}
    </div>
  );
};

/** Sentinel category value matching every expert roster entry. */
export const ALL_CATEGORY = '__all__';
