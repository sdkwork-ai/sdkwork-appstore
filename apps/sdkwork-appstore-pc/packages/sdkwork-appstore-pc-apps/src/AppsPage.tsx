import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppStoreService } from '@sdkwork/appstore-pc-core';
import { AppItem } from '@sdkwork/appstore-pc-core';
import { LoadingSpinner } from '@sdkwork/appstore-pc-commons';
import { AppsHeaderBanner } from './components/AppsHeaderBanner';
import { AppsCategoryFilter, type AppsCategoryOption } from './components/AppsCategoryFilter';
import { AppsGrid } from './components/AppsGrid';

const ALL_SUBCATEGORY = 'all';

/** Catalog categories that belong to the games marketplace, not the app list. */
const GAME_CATEGORIES = new Set(['微信小游戏', '精品手游']);

interface StoreCategory {
  id: string;
  name: string;
  icon: string;
}

export default function AppsPage() {
  const { t } = useTranslation();
  const [apps, setApps] = useState<AppItem[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(ALL_SUBCATEGORY);

  useEffect(() => {
    let cancelled = false;
    async function loadApps() {
      setLoading(true);
      try {
        // Category chips are the storefront's own category list, and the page
        // is narrowed server-side by the selected category id.
        const storeCategories = await AppStoreService.getCategories();
        if (cancelled) {
          return;
        }
        setCategories(storeCategories);
        const page = await AppStoreService.listAppsPage({
          limit: 50,
          ...(selectedSubCategory === ALL_SUBCATEGORY ? {} : { categoryId: selectedSubCategory }),
        });
        if (cancelled) {
          return;
        }
        setApps(page.items);
        setCursor(page.nextCursor);
      } catch (err) {
        console.error('Failed to load apps page data', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    loadApps();
    return () => {
      cancelled = true;
    };
  }, [selectedSubCategory]);

  async function loadMore() {
    if (!cursor || loadingMore) {
      return;
    }
    setLoadingMore(true);
    try {
      const page = await AppStoreService.listAppsPage({
        cursor,
        limit: 50,
        ...(selectedSubCategory === ALL_SUBCATEGORY ? {} : { categoryId: selectedSubCategory }),
      });
      setApps((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
    } catch (err) {
      console.error('Failed to load more apps', err);
    } finally {
      setLoadingMore(false);
    }
  }

  const subCategories = useMemo<AppsCategoryOption[]>(() => {
    const options: AppsCategoryOption[] = [
      { value: ALL_SUBCATEGORY, label: t('apps.categories.all') },
    ];
    const seenIds = new Set<string>();
    categories.forEach((category) => {
      if (!category.id || !category.name || seenIds.has(category.id) || GAME_CATEGORIES.has(category.name)) {
        return;
      }
      seenIds.add(category.id);
      options.push({ value: category.id, label: category.name });
    });
    return options;
  }, [categories, t]);

  // The games marketplace owns the mini and handheld game categories.
  const visibleApps = useMemo(
    () => apps.filter((app) => !GAME_CATEGORIES.has(app.category)),
    [apps],
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  const featuredApp = apps[0];

  return (
    <div className="p-5 md:p-6 space-y-6 w-full max-w-full select-none transition-colors duration-200">
      {/* Sub-component: Header Banner */}
      <AppsHeaderBanner featuredApp={featuredApp} />

      {/* Sub-component: Sub-Category Filter Badges */}
      <AppsCategoryFilter
        categories={subCategories}
        selectedCategory={selectedSubCategory}
        onSelectCategory={setSelectedSubCategory}
      />

      {/* Sub-component: Applications Grid */}
      <AppsGrid
        apps={visibleApps}
        title={t('apps.stats.filteredApps', { count: visibleApps.length })}
      />

      {cursor ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="px-4 py-2 rounded-full text-sm font-medium bg-store-brand text-white disabled:opacity-50"
          >
            {loadingMore ? t('common.loading', '加载中…') : t('common.loadMore', '加载更多')}
          </button>
        </div>
      ) : null}
    </div>
  );
}
