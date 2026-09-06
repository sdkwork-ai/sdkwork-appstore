import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, LayoutGrid } from 'lucide-react';
import {
  useHomeFeed,
  useCategories,
  useRecommendations,
  formatApiError,
} from '@/hooks/useApi';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PlatformBadges } from '@/components/common/PlatformBadges';
import { readListingPlatformCodes } from '@/platforms';

function readListingCard(item: unknown, index: number) {
  const row = (item ?? {}) as unknown as unknown as Record<string, unknown>;
  const slug = String(row.listingSlug ?? row.listing_slug ?? row.id ?? index);
  return {
    id: slug,
    name: String(row.displayName ?? row.display_name ?? row.title ?? '应用'),
    subtitle: String(row.subtitle ?? row.shortDescription ?? ''),
    developer: String(row.developerName ?? row.publisherName ?? '开发者'),
    rating: Number(row.averageRating ?? row.rating ?? 0),
    pricing: String(row.pricingModel ?? row.pricing_model ?? 'FREE').toUpperCase(),
    platforms: readListingPlatformCodes(row),
  };
}

function HeroBanner({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="px-4 pt-2">
      <div
        className="relative overflow-hidden rounded-[var(--radius-2xl)] p-6 text-white min-h-[240px] flex flex-col justify-end"
        style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #5856d6 100%)' }}
      >
        <h2 className="text-[var(--text-2xl)] font-bold tracking-tight">{title}</h2>
        <p className="text-sm text-white/85 mt-2 line-clamp-2">{subtitle}</p>
        <Link
          to="/search"
          className="mt-4 inline-flex w-fit items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)]"
        >
          立即探索
        </Link>
      </div>
    </section>
  );
}

export function HomePage() {
  const { data: homeFeed, loading: feedLoading, error: feedError } = useHomeFeed();
  const { data: categories, loading: categoriesLoading, error: categoriesError } = useCategories(10);
  const { data: recommendations, loading: recLoading, error: recError } = useRecommendations(12);

  if (feedLoading || categoriesLoading || recLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const featuredSlots =
    homeFeed && typeof homeFeed === 'object' && homeFeed !== null && 'featuredSlots' in homeFeed
      ? (homeFeed as { featuredSlots?: unknown[] }).featuredSlots ?? []
      : [];

  const firstSlot = featuredSlots[0] as unknown as Record<string, unknown> | undefined;
  const heroTitle = String(firstSlot?.title ?? firstSlot?.slotCode ?? '发现精彩应用');
  const heroSubtitle = String(
    firstSlot?.subtitle ?? '编辑精选与智能推荐，帮你找到下一款必备应用',
  );

  const categoryItems = categories?.items ?? [];
  const recItems = (recommendations?.items ?? []).map(readListingCard);

  return (
    <div className="animate-fade-in pb-4">
      <header className="page-header px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
              Today
            </p>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">发现</h1>
          </div>
          <Link
            to="/search"
            className="rounded-full px-4 py-2 text-sm font-medium text-[var(--accent)]"
            style={{ backgroundColor: 'var(--accent-subtle)' }}
          >
            搜索
          </Link>
        </div>
      </header>

      {feedError || categoriesError || recError ? (
        <div
          className="mx-4 mb-4 rounded-xl px-4 py-3 text-sm"
          style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}
        >
          {formatApiError(feedError ?? categoriesError ?? recError ?? null)}
        </div>
      ) : null}

      <HeroBanner title={heroTitle} subtitle={heroSubtitle} />

      <section className="px-4 py-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-[var(--accent)]" />
            分类
          </h2>
        </div>
        <div className="scroll-x flex gap-2 pb-1">
          {categoryItems.length > 0
            ? categoryItems.map((item, index) => {
                const row = item as unknown as Record<string, unknown>;
                const label = String(row.displayName ?? row.name ?? row.categoryCode ?? index);
                return (
                  <Link
                    key={String(row.id ?? index)}
                    to={`/search?q=${encodeURIComponent(label)}`}
                    className="card card-press flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {label}
                  </Link>
                );
              })
            : ['效率', '社交', '游戏', '工具', '摄影'].map((label) => (
                <Link
                  key={label}
                  to={`/search?q=${encodeURIComponent(label)}`}
                  className="card card-press flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium"
                >
                  {label}
                </Link>
              ))}
        </div>
      </section>

      <section className="px-4 py-2">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            为你推荐
          </h2>
          <Link to="/search" className="text-xs font-medium text-[var(--accent)]">
            查看全部
          </Link>
        </div>
        {recItems.length === 0 ? (
          <p className="text-sm text-[var(--text-tertiary)] py-8 text-center">暂无推荐应用</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {recItems.slice(0, 8).map((app) => (
              <Link
                key={app.id}
                to={`/app/${app.id}`}
                className="card card-press p-3 flex gap-3"
              >
                <div
                  className="app-icon flex h-14 w-14 items-center justify-center text-lg font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, var(--accent), #5856d6)' }}
                >
                  {app.name[0]?.toUpperCase() ?? 'A'}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">{app.name}</h3>
                  <p className="truncate text-xs text-[var(--text-tertiary)]">{app.developer}</p>
                  <PlatformBadges platforms={app.platforms} max={2} className="mt-1" />
                  <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
                    {app.pricing === 'FREE' ? '免费' : '付费'}
                    {app.rating > 0 ? ` · ${app.rating.toFixed(1)}★` : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {featuredSlots.length > 1 ? (
        <section className="px-4 py-4">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[var(--warning)]" />
            <h2 className="section-title">编辑精选</h2>
          </div>
          <div className="scroll-x flex gap-3 pb-1">
            {featuredSlots.slice(0, 6).map((slot, index) => {
              const row = (slot ?? {}) as unknown as Record<string, unknown>;
              const label = String(row.title ?? row.slotCode ?? `精选 ${index + 1}`);
              return (
                <div
                  key={String(row.id ?? index)}
                  className="card flex-shrink-0 w-40 overflow-hidden"
                >
                  <div
                    className="flex h-28 items-center justify-center text-2xl font-bold text-white"
                    style={{ background: 'linear-gradient(160deg, #ff9500, #ff3b30)' }}
                  >
                    {label[0]}
                  </div>
                  <p className="truncate p-3 text-sm font-semibold">{label}</p>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
