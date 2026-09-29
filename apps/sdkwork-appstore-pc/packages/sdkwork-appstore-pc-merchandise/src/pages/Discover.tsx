import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Clock, Compass, Sparkles, Tags } from 'lucide-react';
import { AppStoreService } from '../services/api';
import { AppItem, CategoryDetail, EditorialCollection, EventItem } from '../types';
import { Button, EmptyState, LoadingSpinner } from '../components/common';
import { DiscoverHeader } from '../components/discover/DiscoverHeader';
import { EssentialAppsGrid } from '../components/discover/EssentialAppsGrid';
import { FeaturedTodayCard } from '../components/discover/FeaturedTodayCard';
import { CollectionGridSection } from '../components/discover/CollectionGridSection';
import { AppRow } from '../components/AppRow';
import { CategoryItem } from '../components/CategoryItem';

interface DiscoverFeed {
  editorial: AppItem[];
  newAndNoteworthy: AppItem[];
  secondaryEditorial: AppItem[];
}

const EMPTY_FEED: DiscoverFeed = { editorial: [], newAndNoteworthy: [], secondaryEditorial: [] };

export default function Discover() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [feed, setFeed] = useState<DiscoverFeed>(EMPTY_FEED);
  const [collections, setCollections] = useState<EditorialCollection[]>([]);
  const [categories, setCategories] = useState<CategoryDetail[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [recentlyUpdated, setRecentlyUpdated] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const [discoverFeed, collectionList, categoryList, eventList, recent] = await Promise.all([
          AppStoreService.getDiscoverApps().catch(() => EMPTY_FEED),
          AppStoreService.getCollections().catch(() => []),
          AppStoreService.getCategories().catch(() => []),
          AppStoreService.getEvents().catch(() => []),
          AppStoreService.listRecentlyUpdated().catch(() => []),
        ]);
        if (cancelled) {
          return;
        }
        setFeed(discoverFeed);
        setCollections(collectionList);
        setCategories(categoryList);
        setEvents(eventList);
        setRecentlyUpdated(recent);
      } catch (error) {
        console.error('Failed to load discover data', error);
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
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  const heroApps = feed.editorial.length > 0 ? feed.editorial : feed.newAndNoteworthy;
  const featuredTodayApp = feed.editorial[0] || feed.newAndNoteworthy[0];
  // Every section below is conditional, so an empty-but-reachable feed used to
  // leave the page as a bare heading. `feed.newAndNoteworthy` needs no entry of
  // its own: `heroApps` already falls back to it.
  const hasContent =
    heroApps.length > 0 ||
    categories.length > 0 ||
    collections.length > 0 ||
    feed.secondaryEditorial.length > 0 ||
    recentlyUpdated.length > 0 ||
    events.length > 0;

  return (
    <div className="p-5 md:p-6 space-y-7 w-full max-w-full transition-colors duration-200 select-none">
      {/* Subcomponent: Page Title Header */}
      <DiscoverHeader />

      {/* An empty store still owes the reader a complete surface —
          `UI_DESIGN_SPEC.md` §4.10: an illustration, a title and a call to
          action. This renders only when no section below can, so it never
          competes with real content. */}
      {!hasContent && (
        <EmptyState
          boxed
          icon={<Compass className="h-7 w-7" />}
          title={t('discover.empty.title')}
          description={t('discover.empty.subtitle')}
          action={<Button onClick={() => navigate('/apps')}>{t('discover.empty.action')}</Button>}
        />
      )}

      {/* Top Hero Section: 编辑精选 + 今日焦点 */}
      {heroApps.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2">
            <EssentialAppsGrid apps={heroApps.slice(0, 8)} />
          </div>
          {featuredTodayApp && (
            <div className="xl:col-span-1">
              <FeaturedTodayCard app={featuredTodayApp} />
            </div>
          )}
        </div>
      )}

      {/* Category Navigation */}
      {categories.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-bold tracking-tight text-store-ink flex items-center gap-2 ">
            <Tags className="w-4 h-4 text-store-brand" />
            {t('discover.sections.categories')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories.slice(0, 10).map((category, index) => (
              <CategoryItem
                key={category.id}
                category={{ id: category.id, name: category.name, icon: category.icon ?? 'AppWindow' }}
                index={index}
                onClick={() => navigate(`/category/${category.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Editorial Collections */}
      {collections.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-bold tracking-tight text-store-ink ">
            {t('discover.sections.collections')}
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
            {collections.slice(0, 8).map((collection) => (
              <button
                key={collection.id}
                onClick={() => navigate(`/collection/${collection.id}`)}
                className="shrink-0 w-64 p-5 rounded-store-control text-left text-white bg-gradient-to-br from-store-brand via-purple-600 to-fuchsia-600 hover:opacity-90 transition-opacity cursor-pointer shadow-sm text-sm font-medium"
              >
                <p className="text-[10px] font-bold text-store-brand uppercase tracking-wider">
                  {t('collection.header.subtitle')}
                </p>
                <h3 className="text-sm font-bold mt-1.5 line-clamp-2">{collection.title}</h3>
                {collection.subtitle && (
                  <p className="text-[11px] text-store-brand mt-1 line-clamp-2">{collection.subtitle}</p>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] font-bold mt-3">
                  {t('discover.sections.viewAll')}
                  <ChevronRight className="w-3 h-3" />
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Editor-curated picks. The two rails are independent: nesting
          "recently updated" inside the editorial branch hid a populated list
          whenever the editorial feed happened to be empty. */}
      {(feed.secondaryEditorial.length > 0 || recentlyUpdated.length > 0) && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {feed.secondaryEditorial.length > 0 && (
            <CollectionGridSection
              title={t('discover.sections.editorialPicks')}
              categoryQuery=""
              apps={feed.secondaryEditorial.slice(0, 6)}
            />
          )}
          {recentlyUpdated.length > 0 && (
            <CollectionGridSection
              title={t('discover.sections.recentlyUpdated')}
              categoryQuery=""
              apps={recentlyUpdated.slice(0, 6)}
            />
          )}
        </div>
      )}

      {/* 为你推荐 */}
      {feed.newAndNoteworthy.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-bold tracking-tight text-store-ink flex items-center gap-2 ">
            <Sparkles className="w-4 h-4 text-store-brand" />
            {t('discover.sections.recommended')}
          </h2>
          <div className="flex flex-col gap-2.5">
            {feed.newAndNoteworthy.slice(0, 10).map((app) => (
              <AppRow key={app.id} app={app} />
            ))}
          </div>
        </section>
      )}

      {/* Events */}
      {events.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-bold tracking-tight text-store-ink flex items-center gap-2 ">
            <Clock className="w-4 h-4 text-store-danger" />
            {t('discover.sections.events')}
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
            {events.slice(0, 6).map((event) => (
              <button
                key={event.id}
                onClick={() => navigate(`/events/${event.id}`)}
                className={`shrink-0 w-72 p-5 rounded-store-control text-left text-white text-sm font-medium${event.bannerColor} hover:opacity-90 transition-opacity cursor-pointer shadow-sm`}
              >
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider">
                  {t('events.header.subtitle')}
                </p>
                <h3 className="text-sm font-bold mt-1.5 line-clamp-2">{event.title}</h3>
                {event.subtitle && (
                  <p className="text-[11px] text-white/80 mt-1 line-clamp-2">{event.subtitle}</p>
                )}
                {event.endsAt && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold mt-3">
                    <Clock className="w-3 h-3" />
                    {t('events.meta.endsAt', { date: event.endsAt })}
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
