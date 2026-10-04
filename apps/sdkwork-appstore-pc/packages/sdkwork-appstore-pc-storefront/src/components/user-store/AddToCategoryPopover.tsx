import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, FolderPlus, Loader2 } from 'lucide-react';
import { UserStoreService } from '../../services/api';
import type { UserCategory } from '../../services/api';

interface AddToCategoryPopoverProps {
  listingId: string;
}

/**
 * App-detail entry point for the "curate into my Appstore" flow: pick one of
 * the owner's custom categories (or create one inline) and add the current
 * listing to it. Errors degrade inline; the popover stays mounted.
 */
export function AddToCategoryPopover({ listingId }: AddToCategoryPopoverProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<UserCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCategories(await UserStoreService.listUserCategories());
    } catch (err) {
      setError(err instanceof Error ? err.message : t('userStore.error.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (open) {
      setAddedId(null);
      void loadCategories();
    }
  }, [open, loadCategories]);

  const handleAdd = async (category: UserCategory) => {
    setAddingId(category.id);
    setError(null);
    try {
      await UserStoreService.addUserCategoryItem(category.id, listingId);
      setAddedId(category.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('userStore.error.loadFailed'));
    } finally {
      setAddingId(null);
    }
  };

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    setError(null);
    try {
      const created = await UserStoreService.createUserCategory({ name });
      setCategories((prev) => [...prev, created]);
      setNewName('');
      await UserStoreService.addUserCategoryItem(created.id, listingId);
      setAddedId(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('userStore.error.loadFailed'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={t('userStore.actions.addToCategory')}
        onClick={() => setOpen((v) => !v)}
        className={`p-2 rounded-full transition-colors cursor-pointer text-xs font-medium${
          open
            ? 'bg-store-brand/10 text-store-brand'
            : 'bg-store-raised text-store-ink-faint hover:bg-store-raised '
        }`}
      >
        <FolderPlus className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-40 w-72 rounded-store-card bg-store-surface border border-store-line shadow-xl p-3 text-sm ">
          <p className="text-xs font-semibold text-store-ink-faint px-1 pb-2 ">
            {t('userStore.actions.addToCategory')}
          </p>

          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-store-brand" />
            </div>
          ) : categories.length === 0 ? (
            <p className="text-[11px] text-store-ink-faint px-1 py-2">{t('userStore.items.pickEmpty')}</p>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  disabled={addingId !== null}
                  onClick={() => void handleAdd(category)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-store-control text-left hover:bg-store-subtle disabled:opacity-60 transition-colors cursor-pointer text-sm font-medium"
                >
                  <span className="truncate flex-1 text-xs text-store-ink-soft ">
                    {category.name}
                  </span>
                  {addedId === category.id ? (
                    <Check className="w-3.5 h-3.5 text-store-success shrink-0" />
                  ) : addingId === category.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-store-brand shrink-0" />
                  ) : (
                    <span className="text-[11px] text-store-ink-faint shrink-0">{category.itemCount}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="mt-2 pt-2 border-t border-store-line-soft ">
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleCreate();
                }}
                maxLength={64}
                placeholder={t('userStore.category.namePlaceholder')}
                className="flex-1 min-w-0 px-3 rounded-store-control bg-store-field border border-store-line text-sm outline-none focus:border-store-brand transition-colors h-9 text-store-ink placeholder:text-store-ink-faint focus:ring-2 focus:ring-store-brand/25"
              />
              <button
                type="button"
                disabled={creating || !newName.trim()}
                onClick={() => void handleCreate()}
                className="px-3 py-1.5 rounded-store-control bg-store-brand hover:bg-store-brand disabled:opacity-50 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                {t('userStore.items.createAndAdd')}
              </button>
            </div>
          </div>

          {error && <p className="text-[11px] text-store-danger px-1 pt-2">{error}</p>}
        </div>
      )}
    </div>
  );
}
