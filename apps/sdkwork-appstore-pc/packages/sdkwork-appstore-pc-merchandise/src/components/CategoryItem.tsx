import React from 'react';
import { motion } from 'motion/react';
import { DynamicIcon } from './DynamicIcon';

export interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoryItemProps {
  category: Category;
  index: number;
  onClick: (categoryName: string) => void;
}

export const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  index,
  onClick,
}) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onClick(category.name)}
      className="flex items-center gap-3 p-4 rounded-store-card bg-store-surface border border-store-line-soft hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition-all text-left group cursor-pointer "
    >
      <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-store-brand/10 text-store-brand flex items-center justify-center group-hover:bg-store-brand group-hover:text-white dark:group-hover:text-white transition-colors ">
        <DynamicIcon name={category.icon} className="w-5 h-5" />
      </div>
      <span className="font-bold text-sm text-store-ink group-hover:text-store-brand transition-colors line-clamp-1  ">
        {category.name}
      </span>
    </motion.button>
  );
};
