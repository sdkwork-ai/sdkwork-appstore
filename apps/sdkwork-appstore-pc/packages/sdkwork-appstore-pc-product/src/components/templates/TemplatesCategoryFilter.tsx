import React from 'react';
import { useTranslation } from 'react-i18next';

interface TemplatesCategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const TemplatesCategoryFilter: React.FC<TemplatesCategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const { t } = useTranslation();

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case '全部':
        return t('common.actions.all');
      case 'SaaS 全栈':
        return t('templates.categories.saasFullstack');
      case '知识库系统':
        return t('templates.categories.knowledgeBase');
      case 'Agent 协同':
        return t('templates.categories.agentCollab');
      case '开发者工具':
        return t('templates.categories.devTools');
      case '电商应用':
        return t('templates.categories.ecommerce');
      default:
        return cat;
    }
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

