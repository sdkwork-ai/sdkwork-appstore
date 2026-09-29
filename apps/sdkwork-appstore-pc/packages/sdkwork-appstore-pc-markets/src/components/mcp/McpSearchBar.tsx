import React from 'react';
import { Search, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface McpSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddCustomServer?: () => void;
}

export const McpSearchBar: React.FC<McpSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onAddCustomServer,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-store-ink-faint" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('mcp.filter.searchPlaceholder')}
          className="w-full pl-10 pr-4 bg-store-field border border-store-line rounded-store-control text-sm focus:outline-none focus:border-store-brand text-store-ink placeholder:text-store-ink-faint h-9 outline-none transition-colors focus:ring-2 focus:ring-store-brand/25"
        />
      </div>

      <button 
        onClick={onAddCustomServer}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-store-control bg-store-info hover:bg-store-info-hover text-white text-xs font-medium shadow-md transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>{t('mcp.header.addBtn')}</span>
      </button>
    </div>
  );
};

