import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderPlus } from 'lucide-react';
import { ModalShell } from '@sdkwork/appstore-pc-commons';
import type { UserCategory, UserCategoryCreateInput } from '../../services/api';

interface CreateCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: UserCategoryCreateInput) => Promise<void>;
  /** When provided the dialog edits this category instead of creating one. */
  category?: UserCategory | null;
}

export function CreateCategoryDialog({ isOpen, onClose, onSubmit, category }: CreateCategoryDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-seed the fields every time the dialog opens: the component stays
  // mounted across opens, so the previous category's values (or a previous
  // edit target) would otherwise leak into the next open.
  useEffect(() => {
    if (isOpen) {
      setName(category?.name ?? '');
      setDescription(category?.description ?? '');
      setError(null);
    }
  }, [isOpen, category]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t('userStore.category.nameRequired'));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ name: trimmed, description: description.trim() || undefined });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('userStore.error.loadFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={category ? t('userStore.category.updateTitle') : t('userStore.category.createTitle')}
      icon={<FolderPlus className="w-5 h-5" />}
      maxWidthClass="max-w-md"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="user-category-name" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            {t('userStore.category.namePlaceholder')}
          </label>
          <input
            id="user-category-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={64}
            autoFocus
            className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#222530] border border-gray-200 dark:border-[#262933] text-sm outline-none focus:border-indigo-400 transition-colors"
            placeholder={t('userStore.category.namePlaceholder')}
          />
        </div>
        <div>
          <label htmlFor="user-category-description" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            {t('userStore.category.descriptionPlaceholder')}
          </label>
          <textarea
            id="user-category-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#222530] border border-gray-200 dark:border-[#262933] text-sm outline-none focus:border-indigo-400 transition-colors resize-none"
            placeholder={t('userStore.category.descriptionPlaceholder')}
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
          >
            {t('userStore.actions.cancel')}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-medium transition-colors cursor-pointer"
          >
            {category ? t('userStore.actions.save') : t('userStore.actions.createCategory')}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
