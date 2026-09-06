import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Store, ShieldOff, Clock, Globe } from 'lucide-react';
import {
  publicUserStoreService,
  type PublicUserStoreView,
  type UserStoreListingCard,
} from '@/services/userStoreClient';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

type PublicLoadError = 'invalid' | 'expired' | 'revoked';

/**
 * 公开分享视图（匿名可访问，路由 /store/:shareToken）。
 * 访客无需登录即可浏览分享者的个人 Appstore。
 */
export function PublicUserStorePage() {
  const { shareToken = '' } = useParams<{ shareToken: string }>();
  const [view, setView] = useState<PublicUserStoreView | null>(null);
  const [items, setItems] = useState<UserStoreListingCard[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PublicLoadError | null>(null);

  const loadItems = useCallback(
    async (categoryId: string | null) => {
      const page = await publicUserStoreService.listItems(shareToken, categoryId ?? undefined);
      setItems(page.items);
    },
    [shareToken],
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const nextView = await publicUserStoreService.getView(shareToken);
        if (cancelled) return;
        setView(nextView);
        await loadItems(null);
      } catch {
        // 后端有意将 不存在/已撤销/已过期 统一为 NotFound（防枚举），
        // 因此统一按“链接无效”处理。
        if (cancelled) return;
        setError('invalid');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [shareToken, loadItems]);

  const handleSelectCategory = async (categoryId: string | null) => {
    setActiveCategoryId(categoryId);
    try {
      await loadItems(categoryId);
    } catch {
      setError('invalid');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !view) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] flex items-center justify-center mb-4">
          {error === 'expired'
            ? <Clock className="w-7 h-7" />
            : error === 'revoked'
              ? <ShieldOff className="w-7 h-7" />
              : <Globe className="w-7 h-7" />}
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          {error === 'expired' ? '分享链接已过期' : error === 'revoked' ? '分享已被撤销' : '分享链接不存在或已失效'}
        </p>
        <Link
          to="/"
          className="mt-6 px-6 py-2.5 rounded-full bg-indigo-600 text-white text-sm font-medium"
        >
          浏览 SDKWork Appstore
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-20 space-y-5">
      <header className="flex flex-col items-center text-center px-4 pt-8 pb-6">
        <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white flex items-center justify-center shadow-lg mb-4">
          <Store className="w-8 h-8" />
        </div>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">{view.title}</h1>
        {view.description && (
          <p className="text-xs text-[var(--text-secondary)] mt-1">{view.description}</p>
        )}
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          {view.categories.reduce((sum, c) => sum + Number(c.itemCount), 0)} 个应用
        </p>
      </header>

      <div className="flex gap-2 overflow-x-auto px-4 pb-1">
        <button
          type="button"
          onClick={() => void handleSelectCategory(null)}
          className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium ${
            activeCategoryId === null
              ? 'bg-indigo-600 text-white'
              : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border)]'
          }`}
        >
          全部
        </button>
        {view.categories.map((category) => (
          <button
            key={category.userCategoryId}
            type="button"
            onClick={() => void handleSelectCategory(category.userCategoryId)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium ${
              activeCategoryId === category.userCategoryId
                ? 'bg-indigo-600 text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border)]'
            }`}
          >
            {category.name}
            <span className="ml-1.5 opacity-60">{Number(category.itemCount)}</span>
          </button>
        ))}
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-3 gap-3 px-4">
          {items.map((card) => (
            <Link
              key={card.listingId}
              to={`/app/${card.listingId}`}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-500 flex items-center justify-center overflow-hidden">
                <Store className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-[var(--text-primary)] text-center line-clamp-2">
                {card.displayName}
              </span>
              {card.subtitle && (
                <span className="text-[10px] text-[var(--text-secondary)] text-center line-clamp-1">
                  {card.subtitle}
                </span>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[var(--text-secondary)] text-center py-12">
          该用户还没有公开分享任何应用
        </p>
      )}
    </div>
  );
}
