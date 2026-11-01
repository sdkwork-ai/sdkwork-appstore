import React from 'react';
import { Megaphone, PlusCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * The 发布需求 action. Extracted so the controlled layout can ride it on the
 * category-filter row while the search-bar layout reuses the same classes
 * and copy.
 */
export const DemandsPublishButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 px-4 py-2 rounded-store-control bg-store-brand hover:bg-store-brand text-white text-xs font-medium shadow-md transition-all cursor-pointer shrink-0"
    >
      <PlusCircle className="w-4 h-4" />
      <span>{t('demands.publishBtn')}</span>
    </button>
  );
};

interface DemandsSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onPublishClick: () => void;
}

/** The search-and-publish row a composition renders when no surrounding
    chrome owns text search (single-page embeds without their own field). */
export const DemandsSearchBar: React.FC<DemandsSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onPublishClick,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
      <div className="relative flex-1 max-w-md">
        <Megaphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-store-ink-faint" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('demands.searchPlaceholder')}
          className="w-full pl-10 pr-4 bg-store-field border border-store-line rounded-store-control text-sm focus:outline-none focus:border-store-brand text-store-ink placeholder:text-store-ink-faint h-9 outline-none transition-colors focus:ring-2 focus:ring-store-brand/25"
        />
      </div>

      <div className="flex items-center gap-2">
        <DemandsPublishButton onClick={onPublishClick} />
      </div>
    </div>
  );
};
