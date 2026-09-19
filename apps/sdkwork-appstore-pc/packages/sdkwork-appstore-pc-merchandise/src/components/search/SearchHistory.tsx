import React from 'react';
import { useTranslation } from 'react-i18next';
import { History, Trash2 } from 'lucide-react';

interface SearchHistoryProps {
  items: string[];
  onSelect: (item: string) => void;
  onClear: () => void;
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({ items, onSelect, onClear }) => {
  const { t } = useTranslation();

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <History className="w-4 h-4 text-gray-400" />
          {t('search.historyTitle', '搜索历史')}
        </h2>
        <button
          onClick={onClear}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          {t('search.clearHistory', '清除历史')}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => onSelect(item)}
            className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-[#20222a] border border-gray-200 dark:border-gray-800 text-[11px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#262a34] transition-colors cursor-pointer"
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
};
