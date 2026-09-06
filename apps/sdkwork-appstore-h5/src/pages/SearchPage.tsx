import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useSearch, formatApiError } from '@/hooks/useApi';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  PlatformBadges,
  PlatformFilterBar,
  type PlatformFilterValue,
} from '@/components/common/PlatformBadges';
import {
  appSupportsPlatformGroup,
  readListingPlatformCodes,
} from '@/platforms';

interface SearchResultItem {
  id: string;
  name: string;
  developer: string;
  rating: number;
  platforms: string[];
}

function mapSearchResult(item: unknown, index: number): SearchResultItem {
  const row = item as Record<string, unknown>;
  const slug = String(row.listingSlug ?? row.id ?? index);
  return {
    id: slug,
    name: String(row.displayName ?? row.title ?? '应用'),
    developer: String(row.developerName ?? row.publisherName ?? '开发者'),
    rating: Number(row.rating ?? row.averageRating ?? 0),
    platforms: readListingPlatformCodes(row),
  };
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
  const [platformFilter, setPlatformFilter] = useState<PlatformFilterValue>('all');
  const { data, loading, error } = useSearch(submittedQuery);

  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    setQuery(q);
    setSubmittedQuery(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function submitSearch() {
    const trimmed = query.trim();
    setSubmittedQuery(trimmed);
    setSearchParams(trimmed ? { q: trimmed } : {}, { replace: true });
  }

  const items = useMemo(() => {
    const mapped = (data?.items ?? []).map(mapSearchResult);
    if (platformFilter === 'all') {
      return mapped;
    }
    // 平台过滤在当前页结果上生效，待目录 API 支持服务端平台筛选后切换。
    return mapped.filter((app) => appSupportsPlatformGroup(app.platforms, platformFilter));
  }, [data, platformFilter]);

  return (
    <div className="animate-fade-in">
      <header className="page-header px-4 py-4">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">搜索</h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">发现更多应用与内容</p>
      </header>

      <div className="px-4 py-2">
        <form
          className="card flex items-center gap-2 px-3 py-2"
          onSubmit={(event) => {
            event.preventDefault();
            submitSearch();
          }}
        >
          <Search className="h-4 w-4 text-[var(--text-tertiary)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索应用名称或关键词"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-tertiary)]"
          />
          {query ? (
            <button
              type="button"
              aria-label="清空搜索"
              onClick={() => {
                setQuery('');
                setSubmittedQuery('');
                setSearchParams({}, { replace: true });
              }}
              className="text-[var(--text-tertiary)]"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
          <button type="submit" className="btn-primary px-4 py-1.5 text-sm">
            搜索
          </button>
        </form>
      </div>

      <div className="px-4">
        <PlatformFilterBar activeFilter={platformFilter} onSelectFilter={setPlatformFilter} />
      </div>

      <div className="px-4 py-4">
        {error ? (
          <p className="text-sm text-[var(--danger)]">{formatApiError(error)}</p>
        ) : loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : items.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              {submittedQuery
                ? `没有找到与「${submittedQuery}」相关的内容`
                : platformFilter === 'all'
                  ? '输入关键词开始搜索'
                  : '该平台下暂无匹配内容'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((app, index) => (
              <Link
                key={app.id}
                to={`/app/${app.id}`}
                className="card card-press flex items-center gap-3 p-3"
              >
                <span className="w-6 text-center text-sm font-bold text-[var(--text-tertiary)]">
                  {index + 1}
                </span>
                <div
                  className="app-icon flex h-12 w-12 items-center justify-center text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, var(--accent), #5856d6)' }}
                >
                  {app.name[0]?.toUpperCase() ?? 'A'}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold">{app.name}</h3>
                  <p className="truncate text-xs text-[var(--text-tertiary)]">{app.developer}</p>
                  <PlatformBadges platforms={app.platforms} max={2} className="mt-0.5" />
                </div>
                {app.rating > 0 ? (
                  <span className="text-xs text-[var(--text-secondary)]">{app.rating.toFixed(1)}★</span>
                ) : null}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
