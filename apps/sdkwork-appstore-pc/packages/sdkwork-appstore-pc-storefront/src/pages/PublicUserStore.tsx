import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Store, ShieldOff, Clock, Globe } from 'lucide-react';
import { UserStoreService } from '../services/api';
import type {
  PublicUserStoreCategorySummary,
  PublicUserStoreView,
  UserStoreListingCard,
} from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

type PublicLoadError = 'invalid' | 'expired' | 'revoked';

export default function PublicUserStore() {
  const { shareToken = '' } = useParams<{ shareToken: string }>();
  const { t } = useTranslation();
  const [view, setView] = useState<PublicUserStoreView | null>(null);
  const [items, setItems] = useState<UserStoreListingCard[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PublicLoadError | null>(null);

  const loadItems = useCallback(
    async (categoryId: string | null) => {
      const page = await UserStoreService.listPublicUserStoreItems(
        shareToken,
        categoryId ?? undefined,
      );
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
        const nextView = await UserStoreService.getPublicUserStore(shareToken);
        if (cancelled) return;
        setView(nextView);
        await loadItems(null);
      } catch {
        // The backend intentionally collapses missing/revoked/expired shares
        // into a single NotFound (anti-enumeration), so one generic state is
        // the honest mapping.
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-14 h-14 rounded-store-card bg-store-subtle text-store-ink-faint flex items-center justify-center mb-4 ">
          {error === 'expired'
            ? <Clock className="w-7 h-7" />
            : error === 'revoked'
              ? <ShieldOff className="w-7 h-7" />
              : <Globe className="w-7 h-7" />}
        </div>
        <p className="text-sm text-store-ink-faint ">
          {t(error === 'expired'
            ? 'userStore.public.expired'
            : error === 'revoked'
              ? 'userStore.public.revoked'
              : 'userStore.public.invalid')}
        </p>
        <a
          href="/"
          className="mt-6 px-6 py-2.5 rounded-full bg-store-brand hover:bg-store-brand text-white text-sm font-medium transition-colors"
        >
          {t('userStore.public.backHome')}
        </a>
      </div>
    );
  }

  const totalItems = view.categories.reduce(
    (sum, category) => sum + Number(category.itemCount),
    0,
  );

  return (
    <div className="p-6 md:p-8 w-full max-w-full transition-colors duration-200 select-none space-y-6">
      {/* Store header */}
      <div className="flex flex-col items-center text-center py-6 rounded-store-card bg-store-surface border border-store-line ">
        <div className="w-16 h-16 rounded-store-card bg-store-brand text-white flex items-center justify-center shadow-lg mb-4">
          <Store className="w-8 h-8" />
        </div>
        <h1 className="text-lg font-bold tracking-tight text-store-ink ">
          {view.title}
        </h1>
        {view.description && (
          <p className="text-xs text-store-ink-faint mt-1 max-w-md">{view.description}</p>
        )}
        <p className="text-xs text-store-ink-faint mt-1">
          {t('userStore.public.appCount', { count: totalItems })}
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void handleSelectCategory(null)}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer ${
            activeCategoryId === null
              ? 'bg-store-brand text-white'
              : 'bg-store-surface text-store-ink-soft border border-store-line hover:border-store-brand '
          }`}
        >
          {t('userStore.public.categoryAll')}
        </button>
        {view.categories.map((category: PublicUserStoreCategorySummary) => (
          <button
            key={category.userCategoryId}
            type="button"
            onClick={() => void handleSelectCategory(category.userCategoryId)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              activeCategoryId === category.userCategoryId
                ? 'bg-store-brand text-white'
                : 'bg-store-surface text-store-ink-soft border border-store-line hover:border-store-brand '
            }`}
          >
            {category.name}
            <span className="ml-1.5 opacity-60">{Number(category.itemCount)}</span>
          </button>
        ))}
      </div>

      {/* Items grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {items.map((card) => (
            <Link
              key={card.listingId}
              to={`/app/${card.listingId}`}
              className="flex flex-col items-center gap-2 p-4 rounded-store-card bg-store-surface border border-store-line hover:border-store-brand dark:hover:border-store-brand/40 hover:shadow-lg transition-all "
            >
              <div className="w-14 h-14 rounded-store-card bg-store-brand/10 dark:bg-store-brand/15 text-store-brand flex items-center justify-center overflow-hidden">
                <Store className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-store-ink text-center line-clamp-2 ">
                {card.displayName}
              </span>
              {card.subtitle && (
                <span className="text-[11px] text-store-ink-faint truncate max-w-full">
                  {card.subtitle}
                </span>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-store-ink-faint text-center py-12">{t('userStore.public.empty')}</p>
      )}

      <p className="text-[11px] text-store-ink-faint text-center pt-4">
        {t('userStore.public.poweredBy')}
      </p>
    </div>
  );
}
