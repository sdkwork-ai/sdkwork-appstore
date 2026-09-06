import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderPlus, RefreshCw } from 'lucide-react';
import { UserStoreService } from '../services/api';
import type { UserCategory, UserStoreShare, UserStoreShareCreateInput } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { UserStoreEmptyState } from '../components/user-store/UserStoreEmptyState';
import { UserCategoryCard } from '../components/user-store/UserCategoryCard';
import { CreateCategoryDialog } from '../components/user-store/CreateCategoryDialog';
import { ShareManageDialog } from '../components/user-store/ShareManageDialog';
import { CategoryItemsDialog } from '../components/user-store/CategoryItemsDialog';

export default function UserStore() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<UserCategory[]>([]);
  const [shares, setShares] = useState<UserStoreShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState<UserCategory | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserCategory | null>(null);
  const [itemsTarget, setItemsTarget] = useState<UserCategory | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextCategories, nextShares] = await Promise.all([
        UserStoreService.listUserCategories(),
        UserStoreService.listUserStoreShares(),
      ]);
      setCategories(nextCategories);
      setShares(nextShares);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('userStore.error.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreateCategory = async (input: { name: string; description?: string }) => {
    const created = await UserStoreService.createUserCategory({
      name: input.name,
      ...(input.description ? { description: input.description } : {}),
    });
    setCategories((prev) => [...prev, created]);
  };

  const handleUpdateCategory = async (input: { name: string; description?: string }) => {
    if (!editTarget) return;
    const updated = await UserStoreService.updateUserCategory(editTarget.id, {
      name: input.name,
      ...(input.description ? { description: input.description } : {}),
    });
    setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setEditTarget(null);
  };

  const handleDeleteCategory = async (category: UserCategory) => {
    if (!window.confirm(t('userStore.category.deleteConfirm', { name: category.name }))) {
      return;
    }
    await UserStoreService.deleteUserCategory(category.id);
    setCategories((prev) => prev.filter((c) => c.id !== category.id));
  };

  const handleRemoveItem = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, itemCount: Math.max(0, c.itemCount - 1) } : c)),
    );
  };

  const handleCreateShare = async (input: UserStoreShareCreateInput) => {
    const created = await UserStoreService.createUserStoreShare(input);
    setShares((prev) => [...prev, created]);
    return created;
  };

  const handleRevokeShare = async (shareId: string) => {
    await UserStoreService.revokeUserStoreShare(shareId);
    setShares((prev) => prev.filter((share) => share.id !== shareId));
  };

  const handleRefreshShareToken = async (shareId: string) => {
    const refreshed = await UserStoreService.refreshUserStoreShareToken(shareId);
    setShares((prev) => prev.map((share) => (share.id === refreshed.id ? refreshed : share)));
    return refreshed;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 md:p-8 w-full max-w-full transition-colors duration-200 select-none space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {t('userStore.header.title')}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('userStore.header.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => void load()}
            aria-label={t('userStore.actions.refresh')}
            className="p-2.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#222530] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            {t('userStore.actions.createCategory')}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500 px-1">{error}</p>
      )}

      {categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {categories.map((category) => (
            <UserCategoryCard
              key={category.id}
              category={category}
              onOpen={(c) => setItemsTarget(c)}
              onEdit={(c) => setEditTarget(c)}
              onDelete={(c) => void handleDeleteCategory(c)}
              onShare={(c) => {
                setShareTarget(c);
                setShareOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        <UserStoreEmptyState onCreate={() => setCreateOpen(true)} />
      )}

      <CreateCategoryDialog
        isOpen={createOpen || editTarget !== null}
        category={editTarget}
        onClose={() => {
          setCreateOpen(false);
          setEditTarget(null);
        }}
        onSubmit={editTarget ? handleUpdateCategory : handleCreateCategory}
      />

      <ShareManageDialog
        isOpen={shareOpen}
        onClose={() => {
          setShareOpen(false);
          setShareTarget(null);
        }}
        categories={categories}
        shares={shares}
        presetCategory={shareTarget}
        onCreateShare={handleCreateShare}
        onRevokeShare={handleRevokeShare}
        onRefreshShareToken={handleRefreshShareToken}
      />

      <CategoryItemsDialog
        isOpen={itemsTarget !== null}
        category={itemsTarget}
        onClose={() => setItemsTarget(null)}
        onItemRemoved={handleRemoveItem}
      />
    </div>
  );
}
