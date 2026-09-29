import React from 'react';

export interface FilterOption {
  name: string;
  filter: string;
}

interface BoardGameFilterBarProps {
  options: FilterOption[];
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

export const BoardGameFilterBar: React.FC<BoardGameFilterBarProps> = ({
  options,
  activeFilter,
  onSelectFilter,
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none">
      {options.map((item) => (
        <button
          key={item.name}
          onClick={() => onSelectFilter(item.filter)}
          className={`px-3 py-1 rounded-store-control text-xs font-medium transition-all shrink-0 cursor-pointer ${
            activeFilter === item.filter
              ? 'bg-store-warning text-white shadow-sm'
              : 'bg-store-surface/80 dark:bg-store-surface text-store-ink-soft hover:bg-store-raised '
          }`}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
};
