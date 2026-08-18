import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';

interface HeaderSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
}

export const HeaderSearchBar: React.FC<HeaderSearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder
}) => {
  const { t } = useTranslation();
  const searchPlaceholder = placeholder || t('nav.header.searchPlaceholder');

  return (
    <form onSubmit={onSubmit} className="relative min-w-0 flex-1 max-w-[480px]">
      <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
      <input
        id="layout-search-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={searchPlaceholder}
        className="w-full bg-gray-100 dark:bg-[#20232b] border border-gray-200 dark:border-[#2d313c] rounded-full py-1.5 pl-10 pr-10 text-xs focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all"
      />
      <button
        type="submit"
        className="absolute right-2.5 top-1.5 p-1 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 transition-colors"
        title={t('common.actions.search')}
      >
        <Search className="w-3.5 h-3.5" />
      </button>
    </form>
  );
};
