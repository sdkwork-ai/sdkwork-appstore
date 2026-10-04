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
      className={`text-left py-3.5 text-store-brand hover:bg-store-subtle px-2 rounded-store-control transition-colors font-medium flex items-center gap-4 text-sm cursor-pointer ${
        !isLast ? 'border-b border-store-line-soft ' : ''
      }`}
    >
      <SearchIcon className="w-5 h-5 text-store-ink-faint " />
      {item}
    </button>
  );
};
