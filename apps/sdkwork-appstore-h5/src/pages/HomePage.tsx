import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppWindow,
  CalendarClock,
  ChevronRight,
  Clock,
  FolderHeart,
  Globe,
  LayoutGrid,
  Megaphone,
  Plus,
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

/* ═══ design primitives (UI_DESIGN_SPEC §2 tokens, Today-grade craft) ══════ */

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
  return `linear-gradient(140deg, ${from} 8%, ${to} 92%)`;
}

/** App icon with the full craft treatment: gradient base, top-left gloss,
 *  inner hairline ring, and a confident letterform — reads as an app icon,
 *  not a colored block. */
function AppIcon({ name, size = 56 }: { name: string; size?: number }) {
  return (
    <div
      className="app-icon-craft flex items-center justify-center font-extrabold text-white"
      style={{
        width: size,
        height: size,
        background: gradientFor(name),
        fontSize: Math.round(size * 0.4),
        letterSpacing: '0.02em',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.18)',
      }}
      aria-hidden="true"
    >
      {name.charAt(0).toUpperCase() || '应'}
    </div>
  );
}

function RatingRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  if (!(rating > 0)) {
    return null;
  }
  return (
    <span
      className={`inline-flex items-center gap-0.5 font-semibold text-[var(--text-secondary)] ${
        size === 'md' ? 'text-[13px]' : 'text-xs'
      }`}
    >
      <Star
        className={size === 'md' ? 'h-3.5 w-3.5' : 'h-3 w-3'}
        style={{ color: 'var(--star)', fill: 'var(--star)' }}
      />
      {rating.toFixed(1)}
    </span>
  );
}

/** Section header: 20px/700 editorial title + optional trailing action. */
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
    <div className="mb-3.5 flex items-baseline justify-between px-1">
      <h2 className="flex items-center gap-2 text-[20px] font-bold tracking-[-0.02em] text-[var(--text-primary)]">
        {icon}
        {title}
      </h2>
      {moreHref ? (
        <Link
          to={moreHref}
          className="flex items-center text-[13px] font-medium text-[var(--accent)]"
        >
          {moreLabel ?? '查看全部'}
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

function SkeletonBox({ className }: { className: string }) {
  return <div className={`skeleton ${className}`} />;
}

function SectionSkeleton({ variant }: { variant: 'rail' | 'grid' | 'list' | 'chips' }) {
  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((key) => (
          <div key={key} className="card p-3.5">
            <SkeletonBox className="h-14 w-14 rounded-[16px]" />
            <SkeletonBox className="mt-3 h-3.5 w-3/4" />
            <SkeletonBox className="mt-2 h-3 w-1/2" />
            <SkeletonBox className="mt-3 h-7 w-full rounded-full" />
          </div>
        ))}
      </div>
    );
  }
  if (variant === 'list') {
    return (
      <div className="card overflow-hidden">
        {[0, 1, 2].map((key) => (
          <div key={key} className="flex items-center gap-3 p-3">
            <SkeletonBox className="h-11 w-11 rounded-[12px]" />
            <div className="flex-1">
              <SkeletonBox className="h-3.5 w-2/3" />
              <SkeletonBox className="mt-2 h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (variant === 'chips') {
    return (
      <div className="flex gap-5">
        {[0, 1, 2, 3, 4].map((key) => (
          <div key={key} className="flex flex-col items-center gap-2">
            <SkeletonBox className="h-16 w-16 rounded-full" />
            <SkeletonBox className="h-3 w-11" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex gap-3 overflow-hidden">
      {[0, 1].map((key) => (
        <div key={key} className="card flex-shrink-0 overflow-hidden" style={{ width: 200 }}>
          <SkeletonBox className="h-28 rounded-none" />
          <div className="p-3">
            <SkeletonBox className="h-3.5 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══ data shaping ══════════════════════════════════════════════════════════ */

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

/* ═══ hero carousel (§4.3) — layered editorial feature card ════════════════ */

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
      <section className="px-4 pt-2">
        <div
          className="hero-card-craft flex min-h-[232px] flex-col justify-end p-6"
          style={{ background: gradientFor('sdkwork') }}
        >
          <div className="hero-glow" />
          <div className="hero-watermark" aria-hidden="true">
            S
          </div>
          <p className="relative text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
            Today
          </p>
          <h2 className="relative mt-1.5 text-[30px] font-extrabold leading-tight tracking-[-0.02em] text-white">
            发现精彩应用
          </h2>
          <p className="relative mt-1.5 text-sm text-white/85">
            编辑精选与智能推荐，帮你找到下一款必备应用
          </p>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="精选推荐" className="pt-2">
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
              className="hero-card-craft press block min-h-[232px] p-5"
              style={{ background: gradientFor(slide.name) }}
            >
              <div className="hero-glow" />
              <div className="hero-watermark" aria-hidden="true">
                {slide.name.charAt(0).toUpperCase()}
              </div>
              <div className="relative flex items-start justify-between">
                <span className="glass-chip rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                  {index === 0 ? '今日精选' : '编辑推荐'}
                </span>
                {slide.rating > 0 ? (
                  <span className="glass-chip flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white">
                    <Star className="h-3 w-3" style={{ color: '#ffd60a', fill: '#ffd60a' }} />
                    {slide.rating.toFixed(1)}
                  </span>
                ) : null}
              </div>
              <div className="relative mt-9">
                <div className="flex items-center gap-3.5">
                  <AppIcon name={slide.name} size={58} />
                  <div className="min-w-0">
                    <h2 className="truncate text-[24px] font-extrabold leading-tight tracking-[-0.02em] text-white">
                      {slide.name}
                    </h2>
                    <p className="mt-0.5 truncate text-[13px] text-white/80">{slide.developer}</p>
                  </div>
                </div>
                {slide.tagline ? (
                  <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-white/85">
                    {slide.tagline}
                  </p>
                ) : null}
                <span
                  className="mt-4 inline-flex items-center rounded-full bg-white px-5 py-2 text-[13px] font-bold text-[#1d1d1f]"
                >
                  立即查看
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>
      {slides.length > 1 ? (
        <div className="mt-2.5 flex justify-center gap-1.5">
          {slides.map((slide, index) => (
            <span
              key={slide.id}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: index === activeIndex ? 20 : 6,
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

/* ═══ page ══════════════════════════════════════════════════════════════════ */

/** Creation hub entries surfaced by the header plus button; each preset maps
 *  to a store application type carried into the publisher bootstrap. */
const CREATE_TARGETS = [
  { type: 'app', label: '新建应用', desc: '发布一个全新的应用', icon: AppWindow },
  { type: 'website', label: '新建官网', desc: '搭建并发布官方网站', icon: Globe },
  { type: 'promo', label: '新建宣传应用', desc: '创建宣传页应用', icon: Megaphone },
] as const;

function HeaderCreateMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="新建"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="press flex h-10 w-10 items-center justify-center rounded-full text-white shadow-[var(--shadow-sm)]"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        <Plus
          className={`h-5 w-5 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
        />
      </button>
      {open ? (
        <div
          role="menu"
          aria-label="新建"
          className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-2xl border bg-[var(--bg-surface)] shadow-[var(--shadow-md)]"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          {CREATE_TARGETS.map(({ type, label, desc, icon: Icon }) => (
            <button
              key={type}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                navigate(`/publisher/apps/new?type=${type}`);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-[var(--bg-muted)]"
            >
              <span
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[var(--text-primary)]">
                  {label}
                </span>
                <span className="block truncate text-xs text-[var(--text-tertiary)]">{desc}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

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
    <div className="animate-fade-in pb-8">
      <header className="page-header px-4 pb-3 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-tertiary)]">
              {todayLine}
            </p>
            <h1 className="mt-0.5 text-[32px] font-extrabold leading-tight tracking-[-0.03em] text-[var(--text-primary)]">
              发现
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <HeaderCreateMenu />
            <Link
              to="/charts"
              aria-label="排行榜"
              className="press flex h-10 w-10 items-center justify-center rounded-full border text-[var(--accent)]"
              style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
            >
              <TrendingUp className="h-[18px] w-[18px]" />
            </Link>
            <Link
              to="/search"
              aria-label="搜索"
              className="press flex h-10 w-10 items-center justify-center rounded-full border text-[var(--accent)]"
              style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
            >
              <Search className="h-[18px] w-[18px]" />
            </Link>
          </div>
        </div>
      </header>

      {heroResolving || feedLoading ? (
        <section className="px-4 pt-2">
          <SkeletonBox className="min-h-[232px] rounded-[var(--radius-2xl)]" />
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
      <section className="px-4 pt-7">
        <SectionHeader icon={<LayoutGrid className="h-5 w-5 text-[var(--accent)]" />} title="分类" />
        {categoriesLoading ? (
          <SectionSkeleton variant="chips" />
        ) : categoriesError ? (
          <ErrorRetry message={formatApiError(categoriesError)} onRetry={categoriesExecute} />
        ) : (
          <div className="rail-fade scroll-x flex gap-5 pb-1">
            {categoryItems.map((row, index) => {
              const id = String(row.id ?? index);
              const label = localizedText(row, 'displayName', String(row.categoryCode ?? '分类'));
              return (
                <Link
                  key={id}
                  to={`/category/${id}`}
                  className="press flex w-16 flex-shrink-0 flex-col items-center gap-2"
                >
                  <span className="app-icon-craft flex h-16 w-16 items-center justify-center rounded-full !text-[22px] shadow-[var(--shadow-sm)]">
                    <span className="relative z-[3] text-white">{label.charAt(0)}</span>
                  </span>
                  <span className="w-full truncate text-center text-xs font-medium text-[var(--text-secondary)]">
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 编辑精选合集 */}
      <section className="px-4 pt-8">
        <SectionHeader
          icon={<FolderHeart className="h-5 w-5 text-[var(--accent)]" />}
          title="编辑精选合集"
          moreHref="/apps"
        />
        {collectionsLoading ? (
          <SectionSkeleton variant="rail" />
        ) : collectionsError ? (
          <ErrorRetry message={formatApiError(collectionsError)} onRetry={collectionsExecute} />
        ) : collectionItems.length === 0 ? null : (
          <div className="rail-fade scroll-x flex gap-3 pb-1">
            {collectionItems.slice(0, 8).map((row, index) => {
              const id = String(row.id ?? index);
              const label = localizedText(row, 'displayName', String(row.collectionCode ?? '精选合集'));
              const description = readLocalizedDescription(row);
              return (
                <Link
                  key={id}
                  to={`/collection/${id}`}
                  className="hero-card-craft press relative flex-shrink-0 flex-col justify-between p-4"
                  style={{
                    width: 200,
                    height: 132,
                    background: gradientFor(label),
                    display: 'flex',
                  }}
                >
                  <div className="hero-watermark" style={{ fontSize: 96, bottom: -24 }} aria-hidden="true">
                    {label.charAt(0)}
                  </div>
                  <span className="glass-chip relative w-fit rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                    合集
                  </span>
                  <span className="relative">
                    <span className="line-clamp-2 block text-[15px] font-bold leading-snug text-white">
                      {label}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-white/75">
                      {description || '编辑精心挑选'}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 限时活动 */}
      <section className="px-4 pt-8">
        <SectionHeader
          icon={<CalendarClock className="h-5 w-5 text-[var(--warning)]" />}
          title="限时活动"
        />
        {eventsLoading ? (
          <SectionSkeleton variant="rail" />
        ) : eventsError ? (
          <ErrorRetry message={formatApiError(eventsError)} onRetry={eventsExecute} />
        ) : eventItems.length === 0 ? (
          <p className="px-1 py-1 text-[13px] text-[var(--text-tertiary)]">当前没有进行中的活动</p>
        ) : (
          <div className="rail-fade scroll-x flex gap-3 pb-1">
            {eventItems.slice(0, 6).map((row, index) => {
              const id = String(row.id ?? index);
              const label = localizedText(row, 'displayName', String(row.title ?? '限时活动'));
              const ends = formatEventEnds(row);
              return (
                <Link
                  key={id}
                  to={`/events/${id}`}
                  className="hero-card-craft press relative flex-shrink-0 flex-col justify-between p-4"
                  style={{
                    width: 200,
                    height: 132,
                    display: 'flex',
                    background: 'linear-gradient(140deg, #ff9500 8%, #ff3b30 92%)',
                  }}
                >
                  <div className="hero-watermark" style={{ fontSize: 96, bottom: -24 }} aria-hidden="true">
                    {label.charAt(0)}
                  </div>
                  <span className="glass-chip relative w-fit rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                    限时
                  </span>
                  <span className="relative">
                    <span className="line-clamp-2 block text-[15px] font-bold leading-snug text-white">
                      {label}
                    </span>
                    <span className="mt-0.5 block text-[11px] font-medium text-white/85">
                      {ends ? `截止 ${ends}` : '正在进行'}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 榜单速览 */}
      <section className="px-4 pt-8">
        <SectionHeader
          icon={<TrendingUp className="h-5 w-5 text-[var(--warning)]" />}
          title="榜单速览"
          moreHref="/charts"
          moreLabel="完整榜单"
        />
        {chartLoading ? (
          <SectionSkeleton variant="list" />
        ) : chartError ? (
          <ErrorRetry message={formatApiError(chartError)} onRetry={chartExecute} />
        ) : (chartApps ?? []).length === 0 ? (
          <p className="px-1 py-1 text-[13px] text-[var(--text-tertiary)]">榜单暂无内容</p>
        ) : (
          <div className="card overflow-hidden">
            {(chartApps ?? []).slice(0, 5).map((app, index) => (
              <Link
                key={app.id}
                to={`/app/${app.id}`}
                className="press flex items-center gap-3 py-2.5 pl-3 pr-4"
                style={{ borderTop: index === 0 ? 'none' : '1px solid var(--border-subtle)' }}
              >
                <span
                  className="w-6 flex-shrink-0 text-center text-[17px] font-extrabold tabular-nums"
                  style={{ color: index < 3 ? 'var(--accent)' : 'var(--text-tertiary)' }}
                >
                  {index + 1}
                </span>
                <AppIcon name={app.name} size={44} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-[var(--text-primary)]">
                    {app.name}
                  </span>
                  <span className="block truncate text-xs text-[var(--text-tertiary)]">
                    {app.developer}
                  </span>
                </span>
                <RatingRow rating={app.rating} />
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-[var(--text-tertiary)]" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 为你推荐 */}
      <section className="px-4 pt-8">
        <SectionHeader icon={<Sparkles className="h-5 w-5 text-[var(--accent)]" />} title="为你推荐" />
        {recLoading ? (
          <SectionSkeleton variant="grid" />
        ) : recError ? (
          <ErrorRetry message={formatApiError(recError)} onRetry={recExecute} />
        ) : recItems.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-[var(--text-tertiary)]">暂无推荐应用</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {recItems.slice(0, 8).map((app) => (
              <div key={app.id} className="card press flex flex-col p-3.5">
                <Link to={`/app/${app.id}`} className="block" aria-label={`${app.name} 详情`}>
                  <div className="flex items-center gap-3">
                    <AppIcon name={app.name} size={52} />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">
                        {app.name}
                      </h3>
                      <p className="mt-0.5 truncate text-xs text-[var(--text-tertiary)]">
                        {app.developer}
                      </p>
                    </div>
                  </div>
                </Link>
                <div className="mt-2.5 flex min-h-[20px] items-center">
                  <RatingRow rating={app.rating} />
                  <PlatformBadgesInline platforms={app.platforms} />
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                    style={
                      app.pricingModel === 'FREE'
                        ? { color: 'var(--success)', backgroundColor: 'rgba(52, 199, 89, 0.13)' }
                        : { color: 'var(--warning)', backgroundColor: 'rgba(255, 149, 0, 0.14)' }
                    }
                  >
                    {app.pricingModel === 'FREE' ? '免费' : '付费'}
                  </span>
                  <Link
                    to={`/app/${app.id}`}
                    className="press rounded-full px-4 py-1.5 text-xs font-bold text-white"
                    style={{ backgroundColor: 'var(--accent)' }}
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
        <section className="px-4 pt-8">
          <SectionHeader icon={<Clock className="h-5 w-5 text-[var(--accent)]" />} title="最近更新" />
          {updatedLoading ? (
            <SectionSkeleton variant="list" />
          ) : updatedError ? (
            <ErrorRetry message={formatApiError(updatedError)} onRetry={updatedExecute} />
          ) : (
            <div className="card overflow-hidden">
              {updatedItems.slice(0, 4).map((app, index) => (
                <Link
                  key={app.id}
                  to={`/app/${app.id}`}
                  className="press flex items-center gap-3 py-2.5 pl-3 pr-4"
                  style={{ borderTop: index === 0 ? 'none' : '1px solid var(--border-subtle)' }}
                >
                  <AppIcon name={app.name} size={44} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[var(--text-primary)]">
                      {app.name}
                    </span>
                    <span className="block truncate text-xs text-[var(--text-tertiary)]">
                      {app.developer}
                    </span>
                  </span>
                  <span
                    className="rounded-full px-2.5 py-1 text-[11px] font-bold"
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

      <p className="mt-10 text-center text-xs text-[var(--text-tertiary)]">
        SDKWork App Store · 每天发现新应用
      </p>
    </div>
  );
}

/** Compact platform badge row inline with the rating. */
function PlatformBadgesInline({ platforms }: { platforms: string[] }) {
  if (platforms.length === 0) {
    return null;
  }
  // Grouped Chinese labels (安卓 / PC网页 / H5网页 / ...) via the shared
  // badges component instead of raw platform codes.
  return <PlatformBadges platforms={platforms} max={2} className="ml-2" />;
}
