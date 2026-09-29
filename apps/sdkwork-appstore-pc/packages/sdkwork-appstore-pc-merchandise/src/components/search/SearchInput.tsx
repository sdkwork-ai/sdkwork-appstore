import { Search as SearchIcon, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  loading: boolean;
  onSubmit?: () => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  onClear,
  loading,
  onSubmit,
  placeholder,
}: SearchInputProps) {
  const { t } = useTranslation();

  return (
    <div className="relative mb-8 rounded-xl">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-store-brand "></div>
        ) : (
          <SearchIcon className="h-5 w-5 text-store-ink-faint " />
        )}
      </div>
      <input
        type="text"
        className="w-full bg-store-field border-none text-store-ink placeholder:text-store-ink-faint rounded-store-control pl-12 pr-10 outline-none focus:ring-2 focus:ring-store-brand/25 transition-all font-medium text-base h-9 transition-colors focus:border-store-brand"
        placeholder={placeholder ?? t('search.inputPlaceholder')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onSubmit) {
            onSubmit();
          }
        }}
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-4 flex items-center text-store-ink-faint hover:text-store-ink-soft "
          aria-label={t('common.accessibility.clearSearch')}
        >
          <X className="h-5 w-5 bg-store-raised rounded-full p-0.5 text-store-ink-faint  " />
        </button>
      )}
    </div>
  );
}
