import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppStoreService } from '@sdkwork/appstore-pc-core';
import { AppItem } from '@sdkwork/appstore-pc-core';
import { LoadingSpinner } from '@sdkwork/appstore-pc-commons';
import { AppsHeaderBanner } from './components/AppsHeaderBanner';
import { AppsCategoryFilter } from './components/AppsCategoryFilter';
import { AppsGrid } from './components/AppsGrid';

export default function AppsPage() {
  const { t } = useTranslation();
  const [apps, setApps] = useState<AppItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');

  useEffect(() => {
    async function loadApps() {
      try {
        const page = await AppStoreService.listAppsPage({ limit: 50 });
        setApps(page.items);
        setCursor(page.nextCursor);
      } catch (err) {
        console.error('Failed to load apps page data', err);
      } finally {
        setLoading(false);
      }
    }
    loadApps();
  }, []);

  async function loadMore() {
    if (!cursor || loadingMore) {
      return;
    }
    setLoadingMore(true);
    try {
      const page = await AppStoreService.listAppsPage({ cursor, limit: 50 });
      setApps((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
    } catch (err) {
      console.error('Failed to load more apps', err);
    } finally {
      setLoadingMore(false);
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  const subCategories = ['all', 'productivity', 'utilities', 'development', 'design'];

  const filteredApps = apps.filter(app => {
    if (app.category === '微信小游戏' || app.category === '精品手游') return false;
    if (selectedSubCategory === 'all') return true;
    if (selectedSubCategory === 'development' || selectedSubCategory === 'design') {
      return app.category.includes('开发') || app.category.includes('设计');
    }
    return app.category.includes(selectedSubCategory);
  });

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
        apps={filteredApps}
        title={t('apps.stats.filteredApps', { count: filteredApps.length })}
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
