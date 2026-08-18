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
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-[#0A84FF]"></div>
        ) : (
          <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        )}
      </div>
      <input
        type="text"
        className="w-full bg-gray-100 dark:bg-[#1C1C1E] border-none text-[#1C1C1E] dark:text-[#F5F5F5] placeholder-gray-500 dark:placeholder-gray-400 rounded-xl py-3.5 pl-12 pr-10 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-[17px]"
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
          className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label={t('common.accessibility.clearSearch')}
        >
          <X className="h-5 w-5 bg-gray-100 dark:bg-[#2C2C2E] rounded-full p-0.5 text-gray-500 dark:text-gray-400" />
        </button>
      )}
    </div>
  );
}
