import { useTranslation } from 'react-i18next';
import { FolderPlus } from 'lucide-react';

interface UserStoreEmptyStateProps {
  onCreate?: () => void;
}

export function UserStoreEmptyState({ onCreate }: UserStoreEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 rounded-3xl border border-dashed border-store-line text-center ">
      <div className="w-14 h-14 rounded-store-card bg-store-brand-soft dark:bg-store-brand/10 text-store-brand flex items-center justify-center mb-4">
        <FolderPlus className="w-7 h-7" />
      </div>
      <p className="text-sm text-store-ink-faint max-w-sm ">
        {t('userStore.category.empty')}
      </p>
      {onCreate && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-5 px-5 py-2.5 rounded-full bg-store-brand hover:bg-store-brand text-white text-sm font-medium transition-colors cursor-pointer"
        >
          {t('userStore.actions.createCategory')}
        </button>
      )}
    </div>
  );
}
