import { useTranslation } from 'react-i18next';
import { FolderPlus } from 'lucide-react';

interface UserStoreEmptyStateProps {
  onCreate?: () => void;
}

export function UserStoreEmptyState({ onCreate }: UserStoreEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 rounded-3xl border border-dashed border-gray-200 dark:border-[#262933] text-center">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
        <FolderPlus className="w-7 h-7" />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
        {t('userStore.category.empty')}
      </p>
      {onCreate && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-5 px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors cursor-pointer"
        >
          {t('userStore.actions.createCategory')}
        </button>
      )}
    </div>
  );
}
