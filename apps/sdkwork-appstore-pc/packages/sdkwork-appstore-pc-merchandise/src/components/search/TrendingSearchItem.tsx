import React from 'react';
import { Search as SearchIcon } from 'lucide-react';

interface TrendingSearchItemProps {
  item: string;
  isLast: boolean;
  onSelect: (item: string) => void;
}

export const TrendingSearchItem: React.FC<TrendingSearchItemProps> = ({
  item,
  isLast,
  onSelect,
}) => {
  return (
    <button
      onClick={() => onSelect(item)}
      className={`text-left py-3.5 text-blue-600 dark:text-[#0A84FF] hover:bg-gray-50 dark:hover:bg-[#1C1C1E] px-2 rounded-lg transition-colors font-medium flex items-center gap-4 text-lg cursor-pointer ${
        !isLast ? 'border-b border-gray-100 dark:border-[#2C2C2E]' : ''
      }`}
    >
      <SearchIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
      {item}
    </button>
  );
};
