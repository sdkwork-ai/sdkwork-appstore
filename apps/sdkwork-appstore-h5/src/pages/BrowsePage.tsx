import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSearch } from '@/hooks/useApi';
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

interface BrowsePageProps {
  title: string;
  defaultQuery: string;
}

export function BrowsePage({ title, defaultQuery }: BrowsePageProps) {
  const { data, loading, error } = useSearch(defaultQuery);
  const [platformFilter, setPlatformFilter] = useState<PlatformFilterValue>('all');

  const items = useMemo(() => {
    const mapped = (data?.items ?? []).map((item, index) => {
      const row = item as unknown as Record<string, unknown>;
      const slug = String(row.listingSlug ?? row.id ?? index);
      return {
        id: slug,
        name: String(row.displayName ?? row.title ?? '应用'),
        developer: String(row.developerName ?? row.publisherName ?? '开发者'),
        rating: Number(row.rating ?? row.averageRating ?? 0),
        platforms: readListingPlatformCodes(row),
      };
    });
    if (platformFilter === 'all') {
      return mapped;
    }
    // 平台过滤在当前页结果上生效，待目录 API 支持服务端平台筛选后切换。
    return mapped.filter((app) => appSupportsPlatformGroup(app.platforms, platformFilter));
  }, [data, platformFilter]);

  return (
    <div className="animate-fade-in">
      <header className="page-header px-4 py-4">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">{title}</h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">浏览 {title} 分类下的热门内容</p>
      </header>

      <div className="px-4">
        <PlatformFilterBar activeFilter={platformFilter} onSelectFilter={setPlatformFilter} />
      </div>

      <div className="px-4 py-4">
        {error ? (
          <p className="text-sm text-[var(--danger)]">{String(error)}</p>
        ) : loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : items.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              {platformFilter === 'all' ? '暂无内容' : '该平台下暂无匹配内容'}
            </p>
            <Link to="/search" className="btn-primary mt-4 inline-flex text-sm">
              去搜索
            </Link>
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

export function AppsBrowsePage() {
  return <BrowsePage title="应用" defaultQuery="应用" />;
}

export function GamesBrowsePage() {
  return <BrowsePage title="游戏" defaultQuery="游戏" />;
}
