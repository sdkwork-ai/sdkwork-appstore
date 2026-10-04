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
      <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-store-ink-faint pointer-events-none " />
      <input
        id="layout-search-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={searchPlaceholder}
        className="w-full bg-store-field border border-store-line rounded-full pl-10 pr-10 text-sm focus:ring-2 focus:ring-store-brand/25 outline-none text-store-ink placeholder:text-store-ink-faint transition-all h-9 transition-colors focus:border-store-brand"
      />
      <button
        type="submit"
        className="absolute right-2.5 top-1.5 p-1 text-store-ink-faint hover:text-store-brand transition-colors text-xs font-medium"
        title={t('common.actions.search')}
      >
        <Search className="w-3.5 h-3.5" />
      </button>
    </form>
  );
};
