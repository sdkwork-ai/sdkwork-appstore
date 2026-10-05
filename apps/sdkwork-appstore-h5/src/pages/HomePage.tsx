import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarClock,
  ChevronRight,
  Clock,
  Flame,
  FolderHeart,
  LayoutGrid,
  Search,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react';
import {
  useHomeFeed,
  useCategories,
  useRecommendations,
  useCollections,
  useActiveEvents,
  useRecentlyUpdated,
  formatApiError,
} from '@/hooks/useApi';
import {
  readLocalizedDescription,
  resolveListingCards,
  useTopCharts,
  type StoreListingCard,
} from '@/hooks/catalog';
import { ErrorRetry } from '@/components/common/ErrorRetry';
import { PlatformBadges } from '@/components/common/PlatformBadges';
import { readListingPlatformCodes } from '@/platforms';

/* ── shared visual helpers (UI_DESIGN_SPEC §2/§4) ─────────────────────────── */

/** Deterministic vibrant gradients keyed by name, so an app always wears the
 *  same color across rails. Palette follows the iOS system-color feel of the
 *  design spec while keeping the brand blue first. */
const GRADIENTS: ReadonlyArray<readonly [string, string]> = [
  ['#0071e3', '#5856d6'],
  ['#34c759', '#00c7be'],
  ['#ff9500', '#ff3b30'],
  ['#af52de', '#ff2d55'],
  ['#5ac8fa', '#0071e3'],
  ['#ff2d55', '#ff9500'],
];

function gradientFor(key: string): string {
  let hash = 0;
  for (let index = 0; index < key.length; index++) {
    hash = (hash * 31 + key.charCodeAt(index)) | 0;
  }
  const [from, to] = GRADIENTS[Math.abs(hash) % GRADIENTS.length];
  return `linear-gradient(135deg, ${from}, ${to})`;
}

function AppIcon({
  name,
  size = 56,
  radius,
}: {
  name: string;
  size?: number;
  radius?: number;
}) {
  return (
    <div
      className="flex flex-shrink-0 items-center justify-center font-bold text-white"
      style={{
        width: size,
        height: size,
        borderRadius: radius ?? Math.round(size * 0.2237),
        background: gradientFor(name),
        fontSize: Math.round(size * 0.42),
      }}
      aria-hidden="true"
    >
      {name.charAt(0).toUpperCase() || '应'}
    </div>
  );
}

function RatingRow({ rating }: { rating: number }) {
  if (!(rating > 0)) {
    return null;
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-[var(--text-secondary)]">
      <Star className="h-3 w-3" style={{ color: 'var(--star)', fill: 'var(--star)' }} />
      {rating.toFixed(1)}
    </span>
  );
}

function SectionHeader({
  icon,
  title,
  moreHref,
  moreLabel,
}: {
  icon: ReactNode;
  title: string;
  moreHref?: string;
  moreLabel?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="section-title flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {moreHref ? (
        <Link
          to={moreHref}
          className="flex items-center text-xs font-medium text-[var(--accent)]"
        >
          {moreLabel ?? '查看全部'}
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>
  );
}

function SectionSkeleton({ variant }: { variant: 'rail' | 'grid' | 'list' }) {
  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((key) => (
          <div key={key} className="card p-3">
            <div className="skeleton h-14 w-14 rounded-[14px]" />
            <div className="skeleton mt-3 h-3.5 w-3/4" />
            <div className="skeleton mt-2 h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }
  if (variant === 'list') {
    return (
      <div className="card divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
        {[0, 1, 2].map((key) => (
          <div key={key} className="flex items-center gap-3 p-3">
            <div className="skeleton h-11 w-11 rounded-[10px]" />
            <div className="flex-1">
              <div className="skeleton h-3.5 w-2/3" />
              <div className="skeleton mt-2 h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="scroll-x flex gap-3 pb-1">
      {[0, 1, 2].map((key) => (
        <div key={key} className="card flex-shrink-0 overflow-hidden" style={{ width: 176 }}>
          <div className="skeleton h-24 rounded-none" />
          <div className="p-3">
            <div className="skeleton h-3.5 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── data shaping ─────────────────────────────────────────────────────────── */

/** Home card: shared store card plus the platform codes for the badge row. */
type HomeAppCard = StoreListingCard & { platforms: string[] };

function readListingCard(item: unknown, index: number): HomeAppCard {
  const row = (item ?? {}) as Record<string, unknown>;
  return {
    id: String(row.listingSlug ?? row.listing_slug ?? row.id ?? index),
    name: String(row.displayName ?? row.display_name ?? row.title ?? '应用'),
    developer: String(row.developerName ?? row.publisherName ?? '开发者'),
    rating: Number(row.averageRating ?? row.rating ?? 0),
    pricingModel: String(row.pricingModel ?? row.pricing_model ?? 'FREE').toUpperCase(),
    platforms: readListingPlatformCodes(row),
  };
}

interface HeroSlide {
  id: string;
  name: string;
  developer: string;
  rating: number;
  tagline: string;
}

function localizedText(
  row: Record<string, unknown>,
  field: 'displayName' | 'description',
  fallback: string,
): string {
  const localizations = Array.isArray(row.localizations)
    ? (row.localizations as Record<string, unknown>[])
    : [];
  const preferred =
    localizations.find((entry) => entry.locale === 'zh-CN' || entry.locale === 'zh_CN') ??
    localizations[0];
  const value = preferred?.[field];
  return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}

function formatEventEnds(row: Record<string, unknown>): string {
  const endsAt = String(row.endsAt ?? '');
  const parsed = Date.parse(endsAt);
  if (!Number.isFinite(parsed)) {
    return '';
  }
  return new Date(parsed).toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ── hero carousel (UI_DESIGN_SPEC §4.3: 5s auto-rotation, swipe, dots) ──── */

function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const pauseUntilRef = useRef(0);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }
    const timer = window.setInterval(() => {
      if (Date.now() < pauseUntilRef.current) {
        return;
      }
      const track = trackRef.current;
      if (!track) {
        return;
      }
      const next =
        (Math.round(track.scrollLeft / Math.max(track.clientWidth, 1)) + 1) % slides.length;
      track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' });
    }, 5000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <section className="px-4 pt-3">
        <div
          className="flex min-h-[200px] flex-col justify-end overflow-hidden rounded-[var(--radius-2xl)] p-6 text-white"
          style={{ background: 'linear-gradient(135deg, var(--accent), #5856d6)' }}
        >
          <p className="text-xs font-medium uppercase tracking-widest text-white/70">Today</p>
          <h2 className="mt-1 text-[var(--text-2xl)] font-bold tracking-tight">发现精彩应用</h2>
          <p className="mt-2 text-sm text-white/85">编辑精选与智能推荐，帮你找到下一款必备应用</p>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="精选推荐" className="pt-3">
      <div
        ref={trackRef}
        className="home-hero-track flex overflow-x-auto"
        onScroll={(event) => {
          const track = event.currentTarget;
          setActiveIndex(Math.round(track.scrollLeft / Math.max(track.clientWidth, 1)));
        }}
        onPointerDown={() => {
          pauseUntilRef.current = Date.now() + 8000;
        }}
        onTouchStart={() => {
          pauseUntilRef.current = Date.now() + 8000;
        }}
      >
        {slides.map((slide, index) => (
          <div key={slide.id} className="home-hero-slide flex-shrink-0 px-4">
            <Link
              to={`/app/${slide.id}`}
              aria-label={`${slide.name} 详情`}
              className="relative flex h-full min-h-[210px] flex-col justify-end overflow-hidden rounded-[var(--radius-2xl)] p-5 text-white shadow-[var(--shadow-md)]"
              style={{ background: gradientFor(slide.name) }}
            >
              <div
                className="app-icon flex items-center justify-center text-2xl font-bold text-white"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: 'rgba(255, 255, 255, 0.22)',
                  position: 'absolute',
                  top: 20,
                  left: 20,
                }}
                aria-hidden="true"
              >
                {slide.name.charAt(0).toUpperCase()}
              </div>
              <p className="text-xs font-medium uppercase tracking-widest text-white/70">
                {index === 0 ? '今日精选' : '编辑推荐'}
              </p>
              <h2 className="mt-1 truncate text-[22px] font-bold tracking-tight">{slide.name}</h2>
              <p className="mt-1 truncate text-sm text-white/85">{slide.tagline || slide.developer}</p>
              <div className="mt-3 flex items-center gap-2">
                <span
                  className="rounded-full bg-white/95 px-4 py-1.5 text-xs font-semibold"
                  style={{ color: '#1d1d1f' }}
                >
                  查看
                </span>
                {slide.rating > 0 ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-white/90">
                    <Star className="h-3.5 w-3.5" style={{ color: '#ffd60a', fill: '#ffd60a' }} />
                    {slide.rating.toFixed(1)}
                  </span>
                ) : null}
              </div>
            </Link>
          </div>
        ))}
      </div>
      {slides.length > 1 ? (
        <div className="mt-2 flex justify-center gap-1.5">
          {slides.map((slide, index) => (
            <span
              key={slide.id}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: index === activeIndex ? 16 : 6,
                backgroundColor:
                  index === activeIndex ? 'var(--accent)' : 'var(--border-default)',
              }}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

/* ── page ─────────────────────────────────────────────────────────────────── */

export function HomePage() {
  const { data: homeFeed, loading: feedLoading, error: feedError, execute: feedExecute } = useHomeFeed();
  const { data: categories, loading: categoriesLoading, error: categoriesError, execute: categoriesExecute } = useCategories(12);
  const { data: recommendations, loading: recLoading, error: recError, execute: recExecute } = useRecommendations(12);
  const { data: collections, loading: collectionsLoading, error: collectionsError, execute: collectionsExecute } = useCollections(8);
  const { data: events, loading: eventsLoading, error: eventsError, execute: eventsExecute } = useActiveEvents(6);
  const { data: recentlyUpdated, loading: updatedLoading, error: updatedError, execute: updatedExecute } = useRecentlyUpdated(6);
  const { data: chartApps, loading: chartLoading, error: chartError, execute: chartExecute } = useTopCharts('free');

  const featuredSlots =
    homeFeed && typeof homeFeed === 'object' && homeFeed !== null && 'featuredSlots' in homeFeed
      ? ((homeFeed as { featuredSlots?: unknown[] }).featuredSlots ?? [])
      : [];

  const heroIds = useMemo(
    () =>
      featuredSlots
        .map((slot) =>
          slot && typeof slot === 'object'
            ? String((slot as Record<string, unknown>).listingId ?? '')
            : '',
        )
        .filter(Boolean)
        .slice(0, 5),
    [featuredSlots],
  );
  const heroIdsKey = heroIds.join(',');

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [heroResolving, setHeroResolving] = useState(false);

  useEffect(() => {
    if (heroIdsKey === '') {
      setHeroSlides([]);
      return;
    }
    let cancelled = false;
    setHeroResolving(true);
    resolveListingCards(heroIdsKey.split(','))
      .then((cards) => {
        if (cancelled) {
          return;
        }
        setHeroSlides(
          cards.map((card) => {
            const slot = featuredSlots.find(
              (entry) =>
                entry !== null &&
                typeof entry === 'object' &&
                String((entry as Record<string, unknown>).listingId ?? '') === card.id,
            ) as Record<string, unknown> | undefined;
            const tagline =
              String(slot?.subtitle ?? '') ||
              readLocalizedDescription(slot ?? {}) ||
              card.developer;
            return {
              id: card.id,
              name: card.name,
              developer: card.developer,
              rating: card.rating,
              tagline,
            };
          }),
        );
        setHeroResolving(false);
      })
      .catch(() => {
        if (!cancelled) {
          setHeroSlides([]);
          setHeroResolving(false);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- heroIdsKey summarizes featuredSlots; refetch only when the id set changes
  }, [heroIdsKey]);

  const recItems = (recommendations?.items ?? []).map(readListingCard);
  const updatedItems = (recentlyUpdated?.items ?? []).map(readListingCard);
  const collectionItems = (collections?.items ?? []) as unknown as Record<string, unknown>[];
  const eventItems = (events?.items ?? []) as unknown as Record<string, unknown>[];
  const categoryItems = (categories?.items ?? []) as unknown as Record<string, unknown>[];
  const todayLine = new Date().toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="animate-fade-in pb-6">
      <header className="page-header px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-[var(--text-tertiary)]">
              {todayLine}
            </p>
            <h1 className="text-[26px] font-bold tracking-tight text-[var(--text-primary)]">发现</h1>
          </div>
          <Link
            to="/search"
            aria-label="搜索"
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}
          >
            <Search className="h-5 w-5" />
          </Link>
        </div>
      </header>

      {heroResolving || feedLoading ? (
        <section className="px-4 pt-3">
          <div className="skeleton min-h-[210px] rounded-[var(--radius-2xl)]" />
        </section>
      ) : (
        <HeroCarousel slides={heroSlides} />
      )}

      {feedError ? (
        <div className="px-4 pt-3">
          <ErrorRetry message={formatApiError(feedError)} onRetry={feedExecute} />
        </div>
      ) : null}

      {/* 分类入口 */}
      <section className="px-4 pt-5">
        <SectionHeader icon={<LayoutGrid className="h-4 w-4 text-[var(--accent)]" />} title="分类" />
        {categoriesLoading ? (
          <div className="flex gap-4">
            {[0, 1, 2, 3, 4].map((key) => (
              <div key={key} className="flex flex-col items-center gap-1.5">
                <div className="skeleton h-14 w-14 rounded-full" />
                <div className="skeleton h-3 w-10" />
              </div>
            ))}
          </div>
        ) : categoriesError ? (
          <ErrorRetry message={formatApiError(categoriesError)} onRetry={categoriesExecute} />
        ) : (
          <div className="scroll-x flex gap-4 pb-1">
            {categoryItems.map((row, index) => {
              const id = String(row.id ?? index);
              const label = localizedText(row, 'displayName', String(row.categoryCode ?? '分类'));
              return (
                <Link
                  key={id}
                  to={`/category/${id}`}
                  className="flex w-14 flex-shrink-0 flex-col items-center gap-1.5"
                >
                  <span
                    className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white shadow-[var(--shadow-sm)] transition-transform active:scale-95"
                    style={{ background: gradientFor(label) }}
                    aria-hidden="true"
                  >
                    {label.charAt(0)}
                  </span>
                  <span className="w-full truncate text-center text-xs text-[var(--text-secondary)]">
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 编辑精选合集 */}
      <section className="px-4 pt-6">
        <SectionHeader
          icon={<FolderHeart className="h-4 w-4 text-[var(--accent)]" />}
          title="编辑精选合集"
        />
        {collectionsLoading ? (
          <SectionSkeleton variant="rail" />
        ) : collectionsError ? (
          <ErrorRetry message={formatApiError(collectionsError)} onRetry={collectionsExecute} />
        ) : collectionItems.length === 0 ? null : (
          <div className="scroll-x flex gap-3 pb-1">
            {collectionItems.slice(0, 8).map((row, index) => {
              const id = String(row.id ?? index);
              const label = localizedText(row, 'displayName', String(row.collectionCode ?? '精选合集'));
              const description = readLocalizedDescription(row);
              return (
                <Link
                  key={id}
                  to={`/collection/${id}`}
                  className="card card-press flex-shrink-0 overflow-hidden"
                  style={{ width: 176 }}
                >
                  <div
                    className="flex h-24 flex-col justify-between p-3 text-white"
                    style={{ background: gradientFor(label) }}
                  >
                    <span className="text-[10px] font-medium uppercase tracking-widest text-white/75">
                      合集
                    </span>
                    <span className="line-clamp-2 text-sm font-bold leading-snug">{label}</span>
                  </div>
                  {description ? (
                    <p className="line-clamp-2 px-3 py-2.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                      {description}
                    </p>
                  ) : (
                    <p className="px-3 py-2.5 text-xs text-[var(--text-tertiary)]">编辑精心挑选</p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 限时活动 */}
      <section className="px-4 pt-6">
        <SectionHeader
          icon={<CalendarClock className="h-4 w-4 text-[var(--warning)]" />}
          title="限时活动"
        />
        {eventsLoading ? (
          <SectionSkeleton variant="rail" />
        ) : eventsError ? (
          <ErrorRetry message={formatApiError(eventsError)} onRetry={eventsExecute} />
        ) : eventItems.length === 0 ? (
          <p className="py-2 text-sm text-[var(--text-tertiary)]">当前没有进行中的活动</p>
        ) : (
          <div className="scroll-x flex gap-3 pb-1">
            {eventItems.slice(0, 6).map((row, index) => {
              const id = String(row.id ?? index);
              const label = localizedText(row, 'displayName', String(row.title ?? '限时活动'));
              const ends = formatEventEnds(row);
              return (
                <Link
                  key={id}
                  to={`/events/${id}`}
                  className="card card-press flex-shrink-0 overflow-hidden"
                  style={{ width: 192 }}
                >
                  <div
                    className="flex h-24 flex-col justify-between p-3 text-white"
                    style={{ background: 'linear-gradient(135deg, #ff9500, #ff3b30)' }}
                  >
                    <span
                      className="w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
                    >
                      限时
                    </span>
                    <span className="line-clamp-2 text-sm font-bold leading-snug">{label}</span>
                  </div>
                  <p className="px-3 py-2 text-xs text-[var(--text-secondary)]">
                    {ends ? `截止 ${ends}` : '正在进行'}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 榜单速览 */}
      <section className="px-4 pt-6">
        <SectionHeader
          icon={<TrendingUp className="h-4 w-4 text-[var(--warning)]" />}
          title="榜单速览"
          moreHref="/charts"
          moreLabel="完整榜单"
        />
        {chartLoading ? (
          <SectionSkeleton variant="list" />
        ) : chartError ? (
          <ErrorRetry message={formatApiError(chartError)} onRetry={chartExecute} />
        ) : (chartApps ?? []).length === 0 ? (
          <p className="py-2 text-sm text-[var(--text-tertiary)]">榜单暂无内容</p>
        ) : (
          <div className="card overflow-hidden">
            {(chartApps ?? []).slice(0, 5).map((app, index) => (
              <Link
                key={app.id}
                to={`/app/${app.id}`}
                className="flex items-center gap-3 px-3 py-2.5 active:bg-[var(--bg-muted)]"
                style={{
                  borderTop: index === 0 ? 'none' : '1px solid var(--border-subtle)',
                }}
              >
                <span
                  className="w-5 flex-shrink-0 text-center text-sm font-bold"
                  style={{ color: index < 3 ? 'var(--accent)' : 'var(--text-tertiary)' }}
                >
                  {index + 1}
                </span>
                <AppIcon name={app.name} size={40} radius={10} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-[var(--text-primary)]">
                    {app.name}
                  </span>
                  <span className="block truncate text-xs text-[var(--text-tertiary)]">
                    {app.developer}
                  </span>
                </span>
                <RatingRow rating={app.rating} />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 为你推荐 */}
      <section className="px-4 pt-6">
        <SectionHeader icon={<Sparkles className="h-4 w-4 text-[var(--accent)]" />} title="为你推荐" />
        {recLoading ? (
          <SectionSkeleton variant="grid" />
        ) : recError ? (
          <ErrorRetry message={formatApiError(recError)} onRetry={recExecute} />
        ) : recItems.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--text-tertiary)]">暂无推荐应用</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {recItems.slice(0, 8).map((app) => (
              <div key={app.id} className="card card-press flex flex-col p-3">
                <Link to={`/app/${app.id}`} className="flex gap-3" aria-label={`${app.name} 详情`}>
                  <AppIcon name={app.name} size={52} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[var(--text-primary)]">
                      {app.name}
                    </span>
                    <span className="block truncate text-xs text-[var(--text-tertiary)]">
                      {app.developer}
                    </span>
                    <span className="mt-1 block">
                      <RatingRow rating={app.rating} />
                    </span>
                  </span>
                </Link>
                <PlatformBadges platforms={app.platforms} max={2} className="mt-1" />
                <div className="mt-2.5 flex items-center justify-between">
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={
                      app.pricingModel === 'FREE'
                        ? { color: 'var(--success)', backgroundColor: 'rgba(52, 199, 89, 0.12)' }
                        : { color: 'var(--warning)', backgroundColor: 'rgba(255, 149, 0, 0.12)' }
                    }
                  >
                    {app.pricingModel === 'FREE' ? '免费' : '付费'}
                  </span>
                  <Link
                    to={`/app/${app.id}`}
                    className="rounded-full px-3.5 py-1 text-xs font-semibold active:scale-95"
                    style={{ color: 'var(--accent)', backgroundColor: 'var(--accent-subtle)' }}
                  >
                    获取
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 最近更新 */}
      {updatedItems.length > 0 || updatedLoading ? (
        <section className="px-4 pt-6">
          <SectionHeader icon={<Clock className="h-4 w-4 text-[var(--accent)]" />} title="最近更新" />
          {updatedLoading ? (
            <SectionSkeleton variant="list" />
          ) : updatedError ? (
            <ErrorRetry message={formatApiError(updatedError)} onRetry={updatedExecute} />
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {updatedItems.slice(0, 4).map((app) => (
                <Link
                  key={app.id}
                  to={`/app/${app.id}`}
                  className="card card-press flex items-center gap-3 p-3"
                >
                  <AppIcon name={app.name} size={44} radius={12} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[var(--text-primary)]">
                      {app.name}
                    </span>
                    <span className="block truncate text-xs text-[var(--text-tertiary)]">
                      {app.developer}
                    </span>
                  </span>
                  <span
                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{ color: 'var(--accent)', backgroundColor: 'var(--accent-subtle)' }}
                  >
                    更新
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {/* 底部提示 */}
      <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-[var(--text-tertiary)]">
        <Flame className="h-3.5 w-3.5" />
        SDKWork App Store · 每天发现新应用
      </p>
    </div>
  );
}
