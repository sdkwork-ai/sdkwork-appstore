import { useEffect, useMemo, useState } from 'react';
import { ExpertsService } from '@sdkwork/appstore-pc-core';
import type { ExpertItem } from '@sdkwork/appstore-pc-core';
import { CardGrid } from '@sdkwork/appstore-pc-commons';
import { ExpertCard } from './components/experts/ExpertCard';
import { ALL_CATEGORY, ExpertsCategoryFilter } from './components/experts/ExpertsCategoryFilter';
import { ExpertsEmptyState } from './components/experts/ExpertsEmptyState';
import { ExpertsHeaderBanner } from './components/experts/ExpertsHeaderBanner';
import { ExpertsSearchBar } from './components/experts/ExpertsSearchBar';

export function ExpertsPage() {
  const [experts, setExperts] = useState<ExpertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    ExpertsService.getExperts(selectedCategory === ALL_CATEGORY ? '' : selectedCategory, searchQuery)
      .then((data) => {
        if (!cancelled) {
          setExperts(data);
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
  }, [selectedCategory, searchQuery]);

  const categories = useMemo(() => {
    const tags = new Set<string>();
    experts.forEach((expert) => {
      if (expert.filterTag) {
        tags.add(expert.filterTag);
      }
    });
    return [ALL_CATEGORY, ...Array.from(tags)];
  }, [experts]);

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
