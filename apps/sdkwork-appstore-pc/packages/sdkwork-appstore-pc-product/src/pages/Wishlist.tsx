import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppStoreService } from '../services/api';
import { AppItem } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { WishlistCard } from '../components/wishlist/WishlistCard';
import { WishlistEmptyState } from '../components/wishlist/WishlistEmptyState';

export default function Wishlist() {
  const { t } = useTranslation();
  const [items, setItems] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const apps = await AppStoreService.getWishlist();
        if (!cancelled) {
          setItems(apps);
        }
      } catch (error) {
        console.error('Failed to load wishlist', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRemove = async (appId: string) => {
    setItems((prev) => prev.filter((app) => app.id !== appId));
    try {
      await AppStoreService.removeFromWishlist(appId);
    } catch (error) {
      console.error('Failed to remove from wishlist', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 md:p-8 w-full max-w-full transition-colors duration-200 select-none space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {t('wishlist.header.title')}
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t('wishlist.header.subtitle')}
        </p>
      </div>

      <section className="space-y-4">
        <h3 className="text-sm font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {t('wishlist.grid.title', { count: items.length })}
        </h3>
        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {items.map((app) => (
              <WishlistCard key={app.id} app={app} onRemove={handleRemove} />
            ))}
          </div>
        ) : (
          <WishlistEmptyState />
        )}
      </section>
    </div>
  );
}
