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
        <h2 className="text-sm font-bold tracking-tight text-store-ink flex items-center gap-2 ">
          <History className="w-4 h-4 text-store-ink-faint" />
          {t('search.historyTitle', '搜索历史')}
        </h2>
        <button
          onClick={onClear}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-store-ink-faint hover:text-store-danger transition-colors cursor-pointer"
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
            className="px-2.5 py-0.5 rounded-full bg-store-subtle border border-store-line text-xs font-medium text-store-ink-soft hover:bg-store-raised transition-colors cursor-pointer "
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
};
