import { useEffect, useMemo, useState } from 'react';
import { ExpertsService } from '@sdkwork/appstore-pc-core';
import type { ExpertItem } from '@sdkwork/appstore-pc-core';
import { CardGrid } from '@sdkwork/appstore-pc-commons';
import { ExpertCard } from './components/experts/ExpertCard';
import { ExpertsCategoryFilter } from './components/experts/ExpertsCategoryFilter';
import { ALL_CATEGORY } from './components/marketCategories';
import { ExpertsEmptyState } from './components/experts/ExpertsEmptyState';
import { ExpertsHeaderBanner } from './components/experts/ExpertsHeaderBanner';
import { ExpertsSearchBar } from './components/experts/ExpertsSearchBar';

export function ExpertsPage() {
  // The catalog is loaded once; the category filters and the search box are
  // applied locally. Deriving the category list from the filtered result would
  // hide every category except the selected one after the first click, so the
  // roster and the categories stay the full catalog.
  const [allExperts, setAllExperts] = useState<ExpertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY);

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

  const categories = useMemo(() => {
    const tags = new Set<string>();
    allExperts.forEach((expert) => {
      if (expert.filterTag) {
        tags.add(expert.filterTag);
      }
    });
    return [ALL_CATEGORY, ...Array.from(tags)];
  }, [allExperts]);

  const experts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
    return allExperts.filter((expert) => {
      if (selectedCategory !== ALL_CATEGORY && expert.filterTag !== selectedCategory) {
        return false;
      }
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
  }, [allExperts, selectedCategory, searchQuery]);

  return (
    <div className="p-6 md:p-8 w-full max-w-full space-y-6 animate-fade-in @container">
      {/* Header Banner Subcomponent */}
      <ExpertsHeaderBanner />

      {/* Search and Lab Entry Bar Subcomponent */}
      <ExpertsSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Categories Horizontal Filter Subcomponent */}
      <ExpertsCategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
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
