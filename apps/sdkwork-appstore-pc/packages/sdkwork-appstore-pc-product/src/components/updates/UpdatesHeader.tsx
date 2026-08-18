import { useTranslation } from 'react-i18next';

interface UpdatesHeaderProps {
  hasUpdates: boolean;
  isUpdatingAll: boolean;
  isUpdatingAny: boolean;
  onUpdateAll: () => void;
}

export function UpdatesHeader({
  hasUpdates,
  isUpdatingAll,
  isUpdatingAny,
  onUpdateAll,
}: UpdatesHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-[#22252e]">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
          {t('updates.header.title')}
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t('updates.header.subtitle')}
        </p>
      </div>
      {hasUpdates && (
        <button
          onClick={onUpdateAll}
          disabled={isUpdatingAny}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          {isUpdatingAll ? t('updates.header.updatingAll') : t('updates.header.updateAll')}
        </button>
      )}
    </div>
  );
}

