import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Store, Trash2 } from 'lucide-react';
import { ModalShell } from '@sdkwork/appstore-pc-commons';
import { UserStoreService } from '../../services/api';
import type { UserCategory, UserCategoryItemWithCard } from '../../services/api';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface CategoryItemsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: UserCategory | null;
  onItemRemoved: (categoryId: string, itemId: string) => void;
}

/**
 * Owner-side category content manager: lists the curated apps of one custom
 * category and allows removing them. Reached by opening a category card on
 * the My Appstore page.
 */
export function CategoryItemsDialog({ isOpen, onClose, category, onItemRemoved }: CategoryItemsDialogProps) {
  const { t } = useTranslation();
  const [rows, setRows] = useState<UserCategoryItemWithCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!category) return;
    setLoading(true);
    setError(null);
    try {
      const page = await UserStoreService.listUserCategoryItems(category.id);
      setRows(page.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('userStore.error.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [category, t]);

  useEffect(() => {
    if (isOpen) {
      void load();
    }
  }, [isOpen, load]);

  if (!isOpen || !category) return null;

  const handleRemove = async (row: UserCategoryItemWithCard) => {
    if (!window.confirm(t('userStore.items.removeConfirm', { name: category.name }))) {
      return;
    }
    setBusyItemId(row.item.id);
    setError(null);
    try {
      await UserStoreService.removeUserCategoryItem(category.id, row.item.id);
      setRows((prev) => prev.filter((r) => r.item.id !== row.item.id));
      onItemRemoved(category.id, row.item.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('userStore.error.loadFailed'));
    } finally {
      setBusyItemId(null);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={category.name}
      subtitle={t('userStore.items.title')}
      icon={<Store className="w-5 h-5" />}
      maxWidthClass="max-w-lg"
    >
      <div className="space-y-3">
        {loading ? (
          <LoadingSpinner />
        ) : rows.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">{t('userStore.items.empty')}</p>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-2">
            {rows.map((row) => (
              <div
                key={row.item.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-[#222530] border border-gray-200 dark:border-[#262933]"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0 overflow-hidden">
                  <Store className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                    {row.listingCard?.displayName ?? row.item.listingId}
                  </p>
                  {row.listingCard?.subtitle && (
                    <p className="text-[11px] text-gray-400 truncate">{row.listingCard.subtitle}</p>
                  )}
                </div>
                <button
                  type="button"
                  disabled={busyItemId === row.item.id}
                  onClick={() => void handleRemove(row)}
                  aria-label={t('userStore.actions.remove')}
                  className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </ModalShell>
  );
}
