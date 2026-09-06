import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Share2, Copy, Ban, RefreshCw, Link2, Check } from 'lucide-react';
import { ModalShell } from '@sdkwork/appstore-pc-commons';
import type {
  UserCategory,
  UserStoreShare,
  UserStoreShareCreateInput,
} from '../../services/api';

interface ShareManageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** All active categories, used for the scope=selected picker. */
  categories: UserCategory[];
  shares: UserStoreShare[];
  /** Category preset when opened from a category card (scope defaults to selected). */
  presetCategory?: UserCategory | null;
  onCreateShare: (input: UserStoreShareCreateInput) => Promise<UserStoreShare>;
  onRevokeShare: (shareId: string) => Promise<void>;
  onRefreshShareToken: (shareId: string) => Promise<UserStoreShare>;
}

type ExpiryChoice = 'never' | '7d' | '30d';

function expiryDate(choice: ExpiryChoice): string | undefined {
  if (choice === 'never') return undefined;
  const days = choice === '7d' ? 7 : 30;
  const dt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return dt.toISOString();
}

export function ShareManageDialog({
  isOpen,
  onClose,
  categories,
  shares,
  presetCategory,
  onCreateShare,
  onRevokeShare,
  onRefreshShareToken,
}: ShareManageDialogProps) {
  const { t } = useTranslation();
  const [scope, setScope] = useState<'all' | 'selected'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'unlisted'>('public');
  const [expiry, setExpiry] = useState<ExpiryChoice>('never');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setScope(presetCategory ? 'selected' : 'all');
      setSelectedIds(presetCategory ? [presetCategory.id] : []);
      setTitle(presetCategory ? presetCategory.name : '');
      setDescription(presetCategory?.description ?? '');
      setError(null);
      setNotice(null);
    }
  }, [isOpen, presetCategory]);

  const activeShares = useMemo(
    () => shares.filter((share) => share.status === 'active'),
    [shares],
  );

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!title.trim()) {
      setError(t('userStore.share.titleRequired'));
      return;
    }
    if (scope === 'selected' && selectedIds.length === 0) {
      setError(t('userStore.share.selectRequired'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const expiresAt = expiryDate(expiry);
      await onCreateShare({
        title: title.trim(),
        ...(description.trim() ? { description: description.trim() } : {}),
        scope,
        ...(scope === 'selected' ? { selectedCategoryIds: selectedIds } : {}),
        visibility,
        ...(expiresAt ? { expiresAt } : {}),
      });
      setNotice(t('userStore.share.created'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('userStore.error.loadFailed'));
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async (share: UserStoreShare) => {
    const link = `${window.location.origin}/store/${share.shareToken}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(share.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // clipboard unavailable (e.g. embedded webview); ignore silently
    }
  };

  const handleRevoke = async (shareId: string) => {
    setBusy(true);
    try {
      await onRevokeShare(shareId);
      setNotice(t('userStore.share.revoked'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('userStore.error.loadFailed'));
    } finally {
      setBusy(false);
    }
  };

  const handleRefresh = async (shareId: string) => {
    setBusy(true);
    try {
      await onRefreshShareToken(shareId);
      setNotice(t('userStore.share.refreshed'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('userStore.error.loadFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={t('userStore.share.title')}
      subtitle={t('userStore.share.subtitle')}
      icon={<Share2 className="w-5 h-5" />}
      maxWidthClass="max-w-lg"
    >
      <div className="space-y-5">
        {/* Create form */}
        <div className="space-y-3 p-4 rounded-2xl bg-gray-50 dark:bg-[#222530] border border-gray-200 dark:border-[#262933]">
          <div>
            <label htmlFor="user-share-title" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              {t('userStore.share.titleInput')}
            </label>
            <input
              id="user-share-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={128}
              className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-[#181a20] border border-gray-200 dark:border-[#262933] text-sm outline-none focus:border-indigo-400 transition-colors"
              placeholder={t('userStore.share.titleInput')}
            />
          </div>
          <div>
            <label htmlFor="user-share-description" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              {t('userStore.share.descriptionInput')}
            </label>
            <input
              id="user-share-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-[#181a20] border border-gray-200 dark:border-[#262933] text-sm outline-none focus:border-indigo-400 transition-colors"
              placeholder={t('userStore.share.descriptionInput')}
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'selected'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setScope(option)}
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  scope === option
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-[#181a20] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#262933]'
                }`}
              >
                {t(option === 'all' ? 'userStore.share.scopeAll' : 'userStore.share.scopeSelected')}
              </button>
            ))}
          </div>

          {scope === 'selected' && (
            <div className="max-h-32 overflow-y-auto space-y-1.5">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white dark:bg-[#181a20] border border-gray-200 dark:border-[#262933] text-xs cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(category.id)}
                    onChange={(e) =>
                      setSelectedIds((prev) =>
                        e.target.checked
                          ? [...prev, category.id]
                          : prev.filter((id) => id !== category.id),
                      )
                    }
                    className="accent-indigo-600"
                  />
                  <span className="truncate">{category.name}</span>
                  <span className="ml-auto text-gray-400 shrink-0">
                    {t('userStore.category.itemCount', { count: category.itemCount })}
                  </span>
                </label>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            {(['public', 'unlisted'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setVisibility(option)}
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  visibility === option
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-[#181a20] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#262933]'
                }`}
              >
                {t(option === 'public' ? 'userStore.share.visibilityPublic' : 'userStore.share.visibilityUnlisted')}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {(['never', '7d', '30d'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setExpiry(option)}
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  expiry === option
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-[#181a20] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#262933]'
                }`}
              >
                {t(`userStore.share.expiry${option === 'never' ? 'Never' : option === '7d' ? '7d' : '30d'}`)}
              </button>
            ))}
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="button"
            disabled={busy}
            onClick={handleCreate}
            className="w-full px-4 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-medium transition-colors cursor-pointer"
          >
            {t('userStore.share.create')}
          </button>
        </div>

        {notice && <p className="text-xs text-emerald-500 text-center">{notice}</p>}

        {/* Existing shares */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {t('userStore.share.existing')}
          </h4>
          {activeShares.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-3">{t('userStore.share.empty')}</p>
          ) : (
            activeShares.map((share) => (
              <div
                key={share.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#181a20] border border-gray-200 dark:border-[#262933]"
              >
                <Link2 className="w-4 h-4 text-indigo-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate text-gray-800 dark:text-gray-100">
                    {share.title}
                  </p>
                  <p className="text-[11px] font-mono truncate text-gray-500 dark:text-gray-400">
                    {`${window.location.origin}/store/${share.shareToken}`}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {t(share.scope === 'all' ? 'userStore.share.scopeAll' : 'userStore.share.scopeSelected')}
                    {' · '}
                    {t(share.visibility === 'public' ? 'userStore.share.visibilityPublic' : 'userStore.share.visibilityUnlisted')}
                    {' · '}
                    {t('userStore.share.viewCount', { count: share.viewCount })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(share)}
                  aria-label={t('userStore.actions.copyLink')}
                  className="p-1.5 rounded-full text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors cursor-pointer"
                >
                  {copiedId === share.id
                    ? <Check className="w-4 h-4 text-emerald-500" />
                    : <Copy className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleRefresh(share.id)}
                  aria-label={t('userStore.actions.refreshToken')}
                  disabled={busy}
                  className="p-1.5 rounded-full text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRevoke(share.id)}
                  aria-label={t('userStore.actions.revoke')}
                  disabled={busy}
                  className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Ban className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </ModalShell>
  );
}
