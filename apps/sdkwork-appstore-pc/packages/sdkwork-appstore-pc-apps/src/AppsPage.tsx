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
  const [loading, setLoading] = useState(true);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');

  useEffect(() => {
    async function loadApps() {
      try {
        const all = await AppStoreService.getAllApps();
        // 过滤非游戏的应用
        const pureApps = all.filter(a => a.category !== '微信小游戏' && a.category !== '精品手游');
        setApps(pureApps);
      } catch (err) {
        console.error('Failed to load apps page data', err);
      } finally {
        setLoading(false);
      }
    }
    loadApps();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  const subCategories = ['all', 'productivity', 'utilities', 'development', 'design'];

  const filteredApps = apps.filter(app => {
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
    </div>
  );
}
