import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppStoreService } from '../services/api';
import { AppItem, CategoryDetail } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AppRow } from '../components/AppRow';

export default function Category() {
  const { id = '' } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [category, setCategory] = useState<CategoryDetail | undefined>();
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const detail = await AppStoreService.getCategoryDetail(id);
        if (cancelled) {
          return;
        }
        setCategory(detail);
        if (!detail) {
          setLoading(false);
          return;
        }
        const results = await AppStoreService.searchApps('', detail.name);
        if (!cancelled) {
          setApps(results);
        }
      } catch (error) {
        console.error('Failed to load category', error);
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
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!category) {
    return (
      <div className="p-6 md:p-8 w-full max-w-full">
        <div className="flex flex-col items-center justify-center py-16 text-center gap-2 rounded-2xl border border-dashed border-store-line-strong ">
          <h3 className="text-sm font-bold text-store-ink ">
            {t('category.grid.empty')}
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 w-full max-w-full transition-colors duration-200 select-none space-y-6">
      {/* Compact entity heading: the former gradient hero card is gone; the
          category name and description stay as plain text. */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-store-ink">
          {t('category.header.title', { name: category.name })}
        </h1>
        <p className="text-xs text-store-ink-faint mt-1 max-w-xl">
          {t('category.header.subtitle', { name: category.name })}
        </p>
      </div>

      <section className="space-y-4">
        <h3 className="text-sm font-bold tracking-tight text-store-ink ">
          {t('category.grid.title', { count: apps.length })}
        </h3>
        {apps.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {apps.map((app) => (
              <AppRow key={app.id} app={app} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-2 rounded-2xl border border-dashed border-store-line-strong ">
            <h3 className="text-sm font-bold text-store-ink ">
              {t('category.grid.empty')}
            </h3>
          </div>
        )}
      </section>
    </div>
  );
}
