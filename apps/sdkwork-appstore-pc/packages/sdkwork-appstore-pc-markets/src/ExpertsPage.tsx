import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExpertsService } from '@sdkwork/appstore-pc-core';
import type { ExpertItem } from '@sdkwork/appstore-pc-core';
import { CardGrid } from '@sdkwork/appstore-pc-commons';
import { ExpertCard } from './components/experts/ExpertCard';
import { ExpertsCategoryFilter } from './components/experts/ExpertsCategoryFilter';
import { ExpertsEmptyState } from './components/experts/ExpertsEmptyState';
import { useCatalogCategoryFilter } from './hooks/useCatalogCategoryFilter';

/** Props for the experts catalog page. */
export interface ExpertsPageProps {
  /**
   * Controlled catalog text filter. The surrounding chrome owns the search
   * field (the store header's global search, or an embedding host's toolbar)
   * and passes its query here; the page renders no search input of its own.
   * Unset filters by the empty string, i.e. the full catalog.
   */
  searchQuery?: string;
}

export function ExpertsPage({ searchQuery }: ExpertsPageProps = {}) {
  const { t } = useTranslation();
  // The catalog is loaded once; the category filter and the controlled query
  // are applied locally through the shared catalog category filter. Deriving
  // the category list from the filtered result would hide every category
  // except the selected one after the first click, so the roster and the
  // categories stay the full catalog.
  const [allExperts, setAllExperts] = useState<ExpertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    ExpertsService.getExperts()
      .then((data) => {
        if (!cancelled) {
          setAllExperts(data);
          setLoadError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          console.error('Failed to load experts', err);
          setLoadError(
            err instanceof Error ? err.message : '专家目录加载失败，请稍后重试。',
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const matchExpertCategory = useCallback(
    (expert: ExpertItem, category: string) => expert.filterTag === category,
    [],
  );

  const categoryFilter = useCatalogCategoryFilter<ExpertItem>({
    allLabel: t('common.actions.all'),
    fallbackValues: allExperts
      .map((expert) => expert.filterTag)
      .filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0),
    matches: matchExpertCategory,
  });

  const experts = useMemo(() => {
    const normalizedQuery = (searchQuery ?? '').trim().toLocaleLowerCase();
    return categoryFilter.filter(allExperts).filter((expert) => {
      if (!normalizedQuery) {
        return true;
      }
      return (
        expert.name.toLocaleLowerCase().includes(normalizedQuery) ||
        expert.nickname.toLocaleLowerCase().includes(normalizedQuery) ||
        expert.description.toLocaleLowerCase().includes(normalizedQuery) ||
        expert.tags.some((tag) => tag.toLocaleLowerCase().includes(normalizedQuery))
      );
    });
  }, [allExperts, categoryFilter, searchQuery]);

  return (
    <div className="p-6 md:p-8 w-full max-w-full space-y-6 animate-fade-in @container">
      {/* Categories Horizontal Filter Subcomponent */}
      <ExpertsCategoryFilter
        categories={categoryFilter.categories.map((option) => option.value)}
        selectedCategory={categoryFilter.selectedCategory}
        onSelectCategory={categoryFilter.selectCategory}
      />

      {/* Expert Grid — container-query driven, up to 4 columns on wide screens */}
      {loading ? (
        <div className="py-20 text-center text-xs text-store-ink-faint" role="status">
          专家目录加载中…
        </div>
      ) : loadError ? (
        <div role="alert" className="py-12 text-center text-xs text-store-danger">
          {loadError}
        </div>
      ) : (
        <CardGrid>
          {experts.map((expert) => (
            <ExpertCard
              key={expert.id}
              expert={expert}
            />
          ))}
        </CardGrid>
      )}

      {!loading && !loadError && experts.length === 0 && <ExpertsEmptyState />}
    </div>
  );
}

export default ExpertsPage;
