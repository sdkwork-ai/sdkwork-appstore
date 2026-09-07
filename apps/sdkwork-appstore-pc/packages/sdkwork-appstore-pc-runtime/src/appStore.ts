import type { AppStoreClient, CommentsAppClient } from '@sdkwork/appstore-pc-core';
import {
  configureAppStoreServicePort,
  type AppStoreServicePort,
} from '@sdkwork/appstore-pc-core';

import type { AppItem, EditorialCollection, EventItem, Review } from '../types';

/** Bounded storefront page for catalog grid views (PAGINATION_SPEC §3: max 200,
 * keep interactive surfaces small). */
const storefrontPageSize = 50;
const reviewPageSize = 20;

interface CategoryRef {
  id: string;
  code: string;
  displayName: string;
}

/** Deterministic visual mapping (Lucide icon + Tailwind gradient) per storefront category. */
const categoryVisuals: Record<string, { icon: string; color: string }> = {
  'ai-assistants': { icon: 'Sparkles', color: 'bg-indigo-600' },
  'ai-coding': { icon: 'Code', color: 'bg-slate-900' },
  'ai-creative': { icon: 'Palette', color: 'bg-fuchsia-600' },
  'ai-productivity': { icon: 'Briefcase', color: 'bg-sky-600' },
  'ai-games': { icon: 'Gamepad2', color: 'bg-rose-700' },
  'board-games': { icon: 'Dices', color: 'bg-amber-800' },
  'mini-games': { icon: 'Smartphone', color: 'bg-teal-700' },
  'mobile-games': { icon: 'Gamepad', color: 'bg-indigo-900' },
  utilities: { icon: 'Wrench', color: 'bg-blue-700' },
  apps: { icon: 'AppWindow', color: 'bg-gray-800' },
  games: { icon: 'Gamepad2', color: 'bg-emerald-700' },
  tools: { icon: 'Wrench', color: 'bg-orange-700' },
  productivity: { icon: 'Zap', color: 'bg-violet-600' },
  education: { icon: 'GraduationCap', color: 'bg-sky-700' },
  entertainment: { icon: 'Clapperboard', color: 'bg-pink-700' },
};
const fallbackVisual = { icon: 'AppWindow', color: 'bg-slate-600' };

export function configureAppstorePcAppStore(
  client: AppStoreClient,
  comments: CommentsAppClient,
): void {
  configureAppStoreServicePort(createAppStoreServicePort(client, comments));
}

export function createAppStoreServicePort(
  client: AppStoreClient,
  comments: CommentsAppClient,
): AppStoreServicePort {
  let categoryCache: CategoryRef[] | null = null;

  async function getCategories(): Promise<CategoryRef[]> {
    if (categoryCache) {
      return categoryCache;
    }
    const response = await client.catalog.listCategories({ limit: 200, locale: 'zh-CN' });
    const items = readPageItems<Record<string, unknown>>(response);
    categoryCache = items.map((item) => ({
      id: readString(item, 'id'),
      code: readString(item, 'categoryCode', 'category_code'),
      displayName: readLocalizedName(item) || readString(item, 'displayName', 'display_name'),
    }));
    return categoryCache;
  }

  function categoryName(categoryId: string | undefined): string {
    if (!categoryId) {
      return '';
    }
    const found = categoryCache?.find((category) => category.id === categoryId);
    return found?.displayName ?? '';
  }

  function categoryVisual(categoryId: string | undefined): { icon: string; color: string } {
    const code = categoryCache?.find((category) => category.id === categoryId)?.code;
    return (code && categoryVisuals[code]) || fallbackVisual;
  }

  async function resolveCategoryIdByName(name: string): Promise<string | undefined> {
    if (!name || name === 'All' || name === '全部' || name === 'all') {
      return undefined;
    }
    const categories = await getCategories();
    const filterCodeAliases: Record<string, string[]> = {
      apps: ['apps'],
      games: ['games'],
      productivity: ['productivity', 'ai-productivity'],
      miniGames: ['mini-games'],
      utilities: ['utilities', 'tools'],
      ai: ['ai-assistants', 'ai-coding', 'ai-creative', 'ai-productivity', 'ai-games'],
    };
    const aliasCodes = filterCodeAliases[name];
    if (aliasCodes?.length) {
      const byCode = categories.find((category) => aliasCodes.includes(category.code));
      if (byCode) {
        return byCode.id;
      }
    }
    const exact = categories.find((category) => category.displayName === name);
    if (exact) {
      return exact.id;
    }
    const normalized = name.toLocaleLowerCase();
    return categories.find((category) => category.displayName.toLocaleLowerCase().includes(normalized))?.id;
  }

  function mapListingSummary(item: Record<string, unknown>, index = 0): AppItem {
    const id = readString(item, 'id');
    const categoryId = readString(item, 'primaryCategoryId', 'primary_category_id');
    const visual = categoryVisual(categoryId);
    return {
      id,
      name: readString(item, 'displayName', 'display_name') || id,
      developer: readString(item, 'developerName', 'developer_name') || 'SDKWork',
      category: categoryName(categoryId) || readString(item, 'category', 'categoryName'),
      price: pricingToPrice(readString(item, 'pricingModel', 'pricing_model')),
      rating: readNumber(item, 'averageRating', 'average_rating') ?? 0,
      reviewsCount: readNumber(item, 'ratingCount', 'rating_count') ?? 0,
      description: readString(item, 'description') || '',
      screenshots: readStringArray(item, 'screenshots', 'mediaScreenshots'),
      platforms: readPlatformCodes(item),
      icon: visual.icon,
      iconColor: visual.color,
      version: readString(item, 'currentVersion', 'current_version') || '1.0.0',
      size: formatSize(readString(item, 'fileSizeBytes', 'file_size_bytes')),
      ageRating: '4+',
      chartRank: index + 1,
      seller: readString(item, 'developerName', 'developer_name') || undefined,
      language: '简体中文',
      whatsNew: mapWhatsNew(item),
    };
  }

  function mapWhatsNew(item: Record<string, unknown>): AppItem['whatsNew'] {
    const version = readString(item, 'currentVersion', 'current_version');
    const notes = readString(item, 'whatsNewSummary', 'whats_new_summary');
    if (!version && !notes) {
      return undefined;
    }
    return {
      version: version || '1.0.0',
      date: formatDate(readString(item, 'releasedAt', 'released_at')),
      notes: notes || '',
    };
  }

  return {
    async getCategories(): Promise<{ id: string; name: string; icon: string }[]> {
      const categories = await getCategories();
      return categories.map((category) => ({
        id: category.id,
        name: category.displayName,
        icon: (categoryVisuals[category.code] ?? fallbackVisual).icon,
      }));
    },

    async getCategoryDetail(id: string) {
      if (!id) {
        return undefined;
      }
      const category = await client.catalog.getCategory(id).catch(() => undefined);
      const row = category as unknown as Record<string, unknown> | undefined;
      if (!row || !readString(row, 'id')) {
        return undefined;
      }
      const code = readString(row, 'categoryCode', 'category_code');
      return {
        id: readString(row, 'id'),
        name: readLocalizedName(row) || readString(row, 'displayName', 'display_name') || id,
        description: readLocalizedDescription(row) || readString(row, 'description'),
        icon: (categoryVisuals[code] ?? fallbackVisual).icon,
      };
    },

    async getCollections(): Promise<EditorialCollection[]> {
      const response = await client.catalog.listCollections({ limit: 200 });
      const items = readPageItems<Record<string, unknown>>(response);
      return items.map((item, index) => ({
        id: readString(item, 'id'),
        title: readLocalizedName(item) || `合集 ${index + 1}`,
        subtitle: readLocalizedDescription(item),
        apps: readCollectionListingIds(item),
        bannerColor: 'bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600',
      }));
    },

    async getCollectionDetail(id: string) {
      if (!id) {
        return undefined;
      }
      const collection = await client.catalog.getCollection(id).catch(() => undefined);
      const row = collection as unknown as Record<string, unknown> | undefined;
      if (!row || !readString(row, 'id')) {
        return undefined;
      }
      return {
        id: readString(row, 'id'),
        title: readLocalizedName(row) || id,
        subtitle: readLocalizedDescription(row),
        apps: readCollectionListingIds(row),
        bannerColor: 'bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600',
      };
    },

    async getEvents(): Promise<EventItem[]> {
      const response = await client.catalog.listEvents({ status: 'active', limit: 50 });
      return readPageItems<Record<string, unknown>>(response).map((item) =>
        mapEventItem(item),
      ).filter((event) => event.id);
    },

    async getEventDetail(id: string) {
      if (!id) {
        return undefined;
      }
      const event = await client.catalog.getEvent(id).catch(() => undefined);
      const row = event as unknown as Record<string, unknown> | undefined;
      if (!row || !readString(row, 'id')) {
        return undefined;
      }
      return mapEventItem(row);
    },

    async getDiscoverApps(): Promise<{
      editorial: AppItem[];
      newAndNoteworthy: AppItem[];
      secondaryEditorial: AppItem[];
    }> {
      const [home, allApps] = await Promise.all([
        client.catalog.getHome(),
        this.getAllApps(),
      ]);
      const homeRow = (home ?? {}) as unknown as Record<string, unknown>;
      const featuredSlots = readArray(homeRow, 'featuredSlots', 'featured_slots');
      const collections = readArray(homeRow, 'collections');
      const featuredListingIds = featuredSlots
        .map((slot) => readString(slot, 'listingId', 'listing_id'))
        .filter(Boolean);
      const collectionListingIds = collections
        .flatMap((collection) => readCollectionListingIds(collection))
        .slice(0, 6);

      const byId = new Map(allApps.map((app) => [app.id, app]));
      const editorial = featuredListingIds
        .map((id) => byId.get(id))
        .filter((app): app is AppItem => Boolean(app))
        .slice(0, 6);
      const secondaryEditorial = collectionListingIds
        .map((id) => byId.get(id))
        .filter((app): app is AppItem => Boolean(app))
        .slice(0, 6);
      const newAndNoteworthy = allApps.slice(0, 8);

      return {
        editorial: editorial.length ? editorial : allApps.slice(0, 6),
        newAndNoteworthy,
        secondaryEditorial: secondaryEditorial.length ? secondaryEditorial : allApps.slice(2, 8),
      };
    },

    async listRecentlyUpdated(): Promise<AppItem[]> {
      const response = await client.catalog.listRecentlyUpdated({ limit: 12 });
      return readPageItems<Record<string, unknown>>(response).map((item) =>
        mapListingSummary(item),
      );
    },

    async getAllApps(): Promise<AppItem[]> {
      const response = await client.catalog.searchListings({ limit: storefrontPageSize });
      return readPageItems<Record<string, unknown>>(response).map((item) =>
        mapListingSummary(item),
      );
    },

    async getTopCharts(type: 'free' | 'paid' | 'all' = 'all'): Promise<AppItem[]> {
      const chartCode = type === 'all' ? 'top' : type;
      const chart = await client.catalog.getChart(chartCode);
      const ranking = readArray(chart as unknown as Record<string, unknown>, 'ranking', 'rankingJson');
      const rankedIds = ranking.map((entry, index) => ({
        id: readString(entry, 'listingId', 'listing_id'),
        rank: index + 1,
      }));
      const ids = rankedIds.map((entry) => entry.id).filter(Boolean);
      if (ids.length === 0) {
        return [];
      }
      const response = await client.catalog.searchListings({ ids, limit: ids.length });
      const byId = new Map(
        readPageItems<Record<string, unknown>>(response).map((item) => [
          readString(item, 'id'),
          mapListingSummary(item),
        ]),
      );
      return rankedIds
        .map((entry) => byId.get(entry.id))
        .filter((app): app is AppItem => Boolean(app))
        .map((app, index) => ({ ...app, chartRank: index + 1 }));
    },

    async searchApps(query: string, filter: string = 'All'): Promise<AppItem[]> {
      const categoryId = await resolveCategoryIdByName(filter);
      const response = await client.catalog.searchListings({
        q: query.trim() || undefined,
        categoryId,
        limit: storefrontPageSize,
      });
      return readPageItems<Record<string, unknown>>(response).map((item) =>
        mapListingSummary(item),
      );
    },

    async getTrendingSearches(): Promise<string[]> {
      const response = await client.catalog.listTrendingSearchTerms({ locale: 'zh-CN', limit: 20 });
      return readPageItems<Record<string, unknown>>(response).map((item) =>
        readString(item, 'term'),
      ).filter(Boolean);
    },

    async getSearchSuggestions(keyword: string): Promise<string[]> {
      if (!keyword.trim()) {
        return [];
      }
      const response = await client.catalog.listSearchSuggestions({
        q: keyword.trim(),
        locale: 'zh-CN',
      });
      return readPageItems<Record<string, unknown>>(response)
        .map((item) => readString(item, 'text', 'term', 'suggestion'))
        .filter(Boolean)
        .slice(0, 5);
    },

    async getSearchHistory(): Promise<string[]> {
      const response = await client.catalog.listSearchHistory({ limit: 20 });
      return readPageItems<Record<string, unknown>>(response)
        .map((item) => readString(item, 'queryText', 'term'))
        .filter(Boolean);
    },

    async saveSearchTerm(term: string): Promise<void> {
      const queryText = term.trim();
      if (!queryText) {
        return;
      }
      await client.catalog.upsertSearchHistory({ queryText });
    },

    async clearSearchHistory(): Promise<void> {
      await client.catalog.clearSearchHistory();
    },

    async getAppById(id: string): Promise<AppItem | undefined> {
      const listing = await client.listings.get(id);
      const row = listing as unknown as Record<string, unknown>;
      const app = mapListingSummary(row);
      app.description = readString(row, 'description') || app.description;
      const [releases] = await Promise.all([
        client.listings.listReleases(id).catch(() => undefined),
      ]);
      if (releases) {
        const releaseRows = readPageItems<Record<string, unknown>>(releases);
        const latest = releaseRows[0];
        if (latest) {
          const version = readString(latest, 'versionName', 'version_name');
          if (version) {
            app.version = version;
            app.whatsNew = {
              version,
              date: formatDate(readString(latest, 'publishedAt', 'published_at')),
              notes: app.whatsNew?.notes ?? '',
            };
          }
        }
      }
      return app;
    },

    async getReviewsByAppId(id: string): Promise<Review[]> {
      const listing = await client.listings.get(id).catch(() => undefined);
      const threadId = readString(
        listing as unknown as Record<string, unknown>,
        'commentsThreadId',
        'comments_thread_id',
      );
      const ratingsResponse = await client.listings.listRatings(id, { limit: reviewPageSize }).catch(() => undefined);
      const ratings = ratingsResponse
        ? readPageItems<Record<string, unknown>>(ratingsResponse)
        : [];
      const ratingsByUser = new Map(
        ratings.map((rating) => [
          readString(rating, 'userId', 'user_id'),
          {
            rating: readNumber(rating, 'rating') ?? 0,
            title: readString(rating, 'title'),
          },
        ]),
      );

      if (!threadId) {
        return ratings
          .filter((rating) => readNumber(rating, 'rating'))
          .map((rating) => ({
            id: readString(rating, 'id'),
            appId: id,
            user: readString(rating, 'userId', 'user_id') || '匿名用户',
            rating: readNumber(rating, 'rating') ?? 0,
            title: readString(rating, 'title') || '好评推荐',
            comment: '',
            date: formatDate(readString(rating, 'createdAt', 'created_at')),
            likes: 0,
          }));
      }

      const commentsResponse = await comments.comments.comments.list(threadId, {
        page: 1,
        pageSize: reviewPageSize,
      });
      const commentItems = readPageItems<Record<string, unknown>>(commentsResponse as unknown);
      return commentItems
        .filter((comment) => readString(comment, 'status') !== 'deleted')
        .map((comment) => {
          const authorId = readString(comment, 'authorId', 'author_id');
          const ratingEntry = ratingsByUser.get(authorId);
          return {
            id: readString(comment, 'id'),
            appId: id,
            user: authorId || '匿名用户',
            rating: ratingEntry?.rating ?? 0,
            title: ratingEntry?.title ?? '好评推荐',
            comment: readString(comment, 'body', 'content'),
            date: formatDate(readString(comment, 'createdAt', 'created_at')),
            likes: 0,
          };
        });
    },

    async submitReview(reviewData: {
      appId: string;
      user: string;
      rating: number;
      title: string;
      comment: string;
    }): Promise<Review> {
      const listing = await client.listings
        .get(reviewData.appId)
        .catch(() => undefined);
      const threadId = readString(
        listing as unknown as Record<string, unknown>,
        'commentsThreadId',
        'comments_thread_id',
      );
      const rating = await client.listings.updateRating(reviewData.appId, {
        rating: reviewData.rating,
        title: reviewData.title,
      });
      if (threadId) {
        await comments.comments.comments.create(threadId, {
          body: reviewData.comment,
        });
      }
      return {
        id: readString(rating as unknown as Record<string, unknown>, 'id'),
        appId: reviewData.appId,
        user: reviewData.user || '匿名用户',
        rating: reviewData.rating,
        title: reviewData.title || '好评推荐',
        comment: reviewData.comment,
        date: '刚刚',
        likes: 0,
      };
    },

    async likeReview(reviewId: string): Promise<boolean> {
      await comments.engagement.likes.update('comment', reviewId);
      return true;
    },

    async getMoreByDeveloper(_developer: string, excludeAppId: string): Promise<AppItem[]> {
      const response = await client.listings.listDeveloperOther(excludeAppId, { limit: 6 });
      return readPageItems<Record<string, unknown>>(response).map((item) =>
        mapListingSummary(item),
      );
    },

    async getSimilarApps(appId: string): Promise<AppItem[]> {
      const response = await client.listings.listSimilar(appId, { limit: 6 });
      return readPageItems<Record<string, unknown>>(response).map((item) =>
        mapListingSummary(item),
      );
    },

    async getBoardGameRecommendations(appId: string): Promise<AppItem[]> {
      return this.getSimilarApps(appId);
    },

    async getWishlist(): Promise<AppItem[]> {
      const response = await client.wishlist.listItems();
      const wishlistItems = readPageItems<Record<string, unknown>>(response);
      const ids = wishlistItems
        .map((item) => readString(item, 'listingId', 'listing_id'))
        .filter(Boolean);
      if (ids.length === 0) {
        return [];
      }
      const listings = await client.catalog.searchListings({ ids, limit: ids.length });
      const byId = new Map(
        readPageItems<Record<string, unknown>>(listings).map((item) => [
          readString(item, 'id'),
          mapListingSummary(item),
        ]),
      );
      return ids
        .map((id) => byId.get(id))
        .filter((app): app is AppItem => Boolean(app));
    },

    async addToWishlist(listingId: string): Promise<void> {
      await client.wishlist.addItem(listingId);
    },

    async removeFromWishlist(listingId: string): Promise<void> {
      await client.wishlist.removeItem(listingId);
    },

    async getPendingUpdates(): Promise<AppItem[]> {
      const libraryResponse = await client.library.listItems({ limit: 200 });
      const libraryItems = readPageItems<Record<string, unknown>>(libraryResponse);
      const checkItems = libraryItems
        .map((item) => ({
          appKey: readString(item, 'appKey', 'app_key'),
          platform: readString(item, 'platform') || 'pc',
          installedVersionCode: readString(item, 'installedVersionCode', 'installed_version_code'),
        }))
        .filter((item) => item.appKey);
      if (checkItems.length === 0) {
        return [];
      }
      const updatesResponse = await client.library.checkUpdates({ items: checkItems });
      const updates = readPageItems<Record<string, unknown>>(updatesResponse);
      const results = await Promise.all(
        updates.map(async (update) => {
          const appKey = readString(update, 'appKey', 'app_key');
          const libraryItem = libraryItems.find(
            (item) => readString(item, 'appKey', 'app_key') === appKey,
          );
          const listingId = libraryItem
            ? readString(libraryItem, 'listingId', 'listing_id')
            : undefined;
          if (!listingId) {
            return undefined;
          }
          const listing = await client.listings.get(listingId).catch(() => undefined);
          if (!listing) {
            return undefined;
          }
          const app = mapListingSummary(listing as unknown as Record<string, unknown>);
          app.whatsNew = {
            version: readString(update, 'latestVersionName', 'latest_version_name') || app.version,
            date: formatDate(readString(update, 'releasedAt', 'released_at')),
            notes: readString(update, 'releaseNotes', 'release_notes') || '新版本已就绪',
          };
          return app;
        }),
      );
      return results.filter((app): app is AppItem => Boolean(app));
    },

    async updateApp(id: string): Promise<boolean> {
      await client.library.install({ listingId: id, platform: 'pc' });
      return true;
    },

    async updateAllApps(ids: string[]): Promise<boolean> {
      await Promise.all(ids.map((id) => this.updateApp(id)));
      return true;
    },

    async getInstalledApps(): Promise<AppItem[]> {
      const response = await client.library.listItems({ limit: 200 });
      const libraryItems = readPageItems<Record<string, unknown>>(response);
      const ids = libraryItems
        .map((item) => readString(item, 'listingId', 'listing_id'))
        .filter(Boolean);
      if (ids.length === 0) {
        return [];
      }
      const listings = await client.catalog.searchListings({ ids, limit: ids.length });
      const byId = new Map(
        readPageItems<Record<string, unknown>>(listings).map((item) => [
          readString(item, 'id'),
          mapListingSummary(item),
        ]),
      );
      return ids
        .map((id) => byId.get(id))
        .filter((app): app is AppItem => Boolean(app));
    },

    async submitFeedback(feedbackData: {
      appId?: string;
      type: string;
      content: string;
      contact?: string;
    }): Promise<boolean> {
      await client.catalog.submitFeedback({
        type: feedbackData.type,
        content: feedbackData.content,
        contact: feedbackData.contact,
        listingId: feedbackData.appId,
      });
      return true;
    },
  };
}

function pricingToPrice(pricingModel: string): number {
  switch (pricingModel.toLocaleUpperCase()) {
    case 'FREE':
      return 0;
    case 'PAID':
      return 1;
    default:
      return 0;
  }
}

/**
 * Raw platform codes for a listing row (appstore_app_platform / catalog
 * projection). Accepts arrays or comma-joined strings under several key
 * spellings. Falls back to the PC storefront context (Windows) when the
 * backend row carries no platform projection yet.
 */
function readPlatformCodes(item: Record<string, unknown>): string[] {
  const raw = readStringArray(
    item,
    'platforms',
    'platformCodes',
    'platform_codes',
    'platformFamilies',
    'platform_families',
  );
  const codes = raw
    .flatMap((entry) => entry.split(','))
    .map((code) => code.trim())
    .filter(Boolean);
  return codes.length > 0 ? Array.from(new Set(codes)) : ['windows'];
}

function formatSize(fileSizeBytes: string | undefined): string {
  const bytes = Number.parseInt(fileSizeBytes ?? '', 10);
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '—';
  }
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(1)} GB`;
  }
  return `${mb.toFixed(1)} MB`;
}

function formatDate(value: string | undefined): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString().slice(0, 10);
}

function readLocalizedName(item: Record<string, unknown>): string {
  const localizations = readArray(item, 'localizations');
  const zh = localizations.find((entry) => {
    const locale = readString(entry, 'locale');
    return locale === 'zh-CN' || locale === 'zh_CN';
  });
  return readString(zh ?? {}, 'displayName', 'display_name');
}

function readLocalizedDescription(item: Record<string, unknown>): string {
  const localizations = readArray(item, 'localizations');
  const zh = localizations.find((entry) => {
    const locale = readString(entry, 'locale');
    return locale === 'zh-CN' || locale === 'zh_CN';
  });
  return readString(zh ?? {}, 'description', 'subtitle');
}

function readCollectionListingIds(item: Record<string, unknown>): string[] {
  const items = readArray(item, 'items', 'listingItems', 'listing_items');
  if (items.length > 0) {
    return items
      .map((entry) => readString(entry, 'listingId', 'listing_id'))
      .filter(Boolean);
  }
  return readString(item, 'listingIds', 'listing_ids')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

function mapEventItem(item: Record<string, unknown>): EventItem {
  return {
    id: readString(item, 'id'),
    title: readLocalizedName(item) || readString(item, 'title'),
    subtitle: readLocalizedDescription(item) || readString(item, 'subtitle'),
    bannerColor: 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600',
    startsAt: formatDate(readString(item, 'startsAt', 'starts_at')),
    endsAt: formatDate(readString(item, 'endsAt', 'ends_at')),
    status: readString(item, 'status'),
    apps: readCollectionListingIds(item),
    ctaText: readString(item, 'ctaText', 'cta_text'),
    ctaLink: readString(item, 'ctaLink', 'cta_link'),
  };
}

function readPageItems<T>(value: unknown): T[] {
  if (!value || typeof value !== 'object' || !Array.isArray((value as Record<string, unknown>).items)) {
    return [];
  }
  return (value as Record<string, unknown>).items as T[];
}

function readArray(record: Record<string, unknown>, ...keys: string[]): Record<string, unknown>[] {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value as Record<string, unknown>[];
    }
  }
  return [];
}

function readString(record: Record<string, unknown> | undefined, ...keys: string[]): string {
  if (!record) {
    return '';
  }
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }
  return '';
}

function readStringArray(
  record: Record<string, unknown> | undefined,
  ...keys: string[]
): string[] {
  if (!record) {
    return [];
  }
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) {
      const items = value.filter((entry): entry is string => typeof entry === 'string');
      if (items.length > 0) {
        return items;
      }
      const nested = value
        .map((entry) =>
          entry && typeof entry === 'object'
            ? (entry as Record<string, unknown>)['url'] ??
              (entry as Record<string, unknown>)['cdnUrl']
            : undefined,
        )
        .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
      if (nested.length > 0) {
        return nested;
      }
    }
    if (typeof value === 'string' && value.trim()) {
      return [value.trim()];
    }
  }
  return [];
}

function readNumber(record: Record<string, unknown> | undefined, ...keys: string[]): number | undefined {
  if (!record) {
    return undefined;
  }
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number.parseFloat(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return undefined;
}
