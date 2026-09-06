import { useCallback, useEffect, useState } from 'react';
import { FolderPlus, Share2, Trash2, RefreshCw, Store } from 'lucide-react';
import { getStoreClient } from '@/services/storeClient';
import {
  userStoreService,
  type UserCategory,
  type UserStoreShare,
} from '@/services/userStoreClient';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

/**
 * 我的自定义分类管理页（登录态）。
 * 创建分类、管理分享链接；收录应用入口在应用详情页。
 */
export function UserStorePage() {
  const [categories, setCategories] = useState<UserCategory[]>([]);
  const [shares, setShares] = useState<UserStoreShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client = getStoreClient();
      const [nextCategories, nextShares] = await Promise.all([
        userStoreService.listCategories(client),
        userStoreService.listShares(client),
      ]);
      setCategories(nextCategories);
      setShares(nextShares);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    setError(null);
    try {
      const client = getStoreClient();
      const created = await userStoreService.createCategory(client, { name });
      setCategories((prev) => [...prev, created]);
      setNewName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败，请稍后重试');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (category: UserCategory) => {
    if (!window.confirm(`删除后该分类及收录关系将一并移除，确定删除「${category.name}」？`)) {
      return;
    }
    try {
      const client = getStoreClient();
      await userStoreService.deleteCategory(client, category.id);
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败，请稍后重试');
    }
  };

  const handleCreateShare = async () => {
    try {
      const client = getStoreClient();
      const created = await userStoreService.createShare(client, {
        title: '我的 Appstore',
        scope: 'all',
        visibility: 'unlisted',
      });
      setShares((prev) => [...prev, created]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建分享失败，请稍后重试');
    }
  };

  const handleRevokeShare = async (share: UserStoreShare) => {
    try {
      const client = getStoreClient();
      await userStoreService.revokeShare(client, share.id);
      setShares((prev) => prev.filter((s) => s.id !== share.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '撤销失败，请稍后重试');
    }
  };

  const handleCopyShare = async (share: UserStoreShare) => {
    const link = `${window.location.origin}/store/${share.shareToken}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedShareId(share.id);
      setTimeout(() => setCopiedShareId(null), 1500);
    } catch {
      // clipboard unavailable; ignore
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="pb-20 space-y-5">
      <header className="flex items-center gap-3 px-4 pt-6">
        <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
          <Store className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">我的 Appstore</h1>
          <p className="text-xs text-[var(--text-secondary)]">创建分类并分享你的个人应用精选</p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          aria-label="刷新"
          className="ml-auto p-2 text-[var(--text-secondary)]"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </header>

      {error && <p className="text-xs text-red-500 px-4">{error}</p>}

      {/* 新建分类 */}
      <section className="px-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="分类名称"
            maxLength={64}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm outline-none focus:border-indigo-400"
          />
          <button
            type="button"
            disabled={creating || !newName.trim()}
            onClick={() => void handleCreate()}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium flex items-center gap-1.5"
          >
            <FolderPlus className="w-4 h-4" />
            新建
          </button>
        </div>
      </section>

      {/* 分类列表 */}
      <section className="px-4 space-y-2">
        {categories.length === 0 ? (
          <p className="text-xs text-[var(--text-secondary)] text-center py-8">
            还没有分类，先创建一个吧
          </p>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{category.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">{category.itemCount} 个应用</p>
              </div>
              <button
                type="button"
                onClick={() => void handleDelete(category)}
                aria-label="删除分类"
                className="p-2 text-[var(--text-secondary)]"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </section>

      {/* 分享 */}
      <section className="px-4 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">分享链接</h2>
          <button
            type="button"
            onClick={() => void handleCreateShare()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-indigo-600 bg-indigo-500/10"
          >
            <Share2 className="w-3.5 h-3.5" />
            生成链接
          </button>
        </div>
        {shares.filter((s) => s.status === 'active').length === 0 ? (
          <p className="text-xs text-[var(--text-secondary)] text-center py-6">还没有分享链接</p>
        ) : (
          shares
            .filter((s) => s.status === 'active')
            .map((share) => (
              <div
                key={share.id}
                className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-mono truncate text-[var(--text-primary)]">
                    {`/store/${share.shareToken}`}
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)]">{Number(share.viewCount)} 次浏览</p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleCopyShare(share)}
                  className="text-xs text-indigo-500 px-2 py-1"
                >
                  {copiedShareId === share.id ? '已复制' : '复制'}
                </button>
                <button
                  type="button"
                  onClick={() => void handleRevokeShare(share)}
                  aria-label="撤销分享"
                  className="p-1.5 text-[var(--text-secondary)]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
        )}
      </section>
    </div>
  );
}
