import type { AppItem, Review, EditorialCollection, CategoryDetail, EventItem } from '../types';

/**
 * Cursor-paged catalog window (PAGINATION_SPEC §4: keyset cursor, bounded
 * page). `nextCursor` is `null` when the server has no further rows.
 */
export interface AppItemPage {
  items: AppItem[];
  nextCursor: string | null;
}

export interface AppItemPageParams {
  /** Opaque keyset cursor from a previous {@link AppItemPage}. */
  cursor?: string;
  /** Page size; clamped server-side to the canonical maximum. */
  limit?: number;
}

/**
 * AppStore SDK Contract Interface
 * Implemented by the bootstrap-configured service port backed by the
 * `@sdkwork/appstore-app-sdk` and `@sdkwork/comments-app-sdk` clients.
 */
export interface IAppStoreSDK {
  getCategories(): Promise<{ id: string; name: string; icon: string }[]>;
  getCategoryDetail(id: string): Promise<CategoryDetail | undefined>;
  getCollections(): Promise<EditorialCollection[]>;
  getCollectionDetail(id: string): Promise<EditorialCollection | undefined>;
  getEvents(): Promise<EventItem[]>;
  getEventDetail(id: string): Promise<EventItem | undefined>;
  getDiscoverApps(): Promise<{ editorial: AppItem[]; newAndNoteworthy: AppItem[]; secondaryEditorial: AppItem[] }>;
  listRecentlyUpdated(): Promise<AppItem[]>;
  /** One bounded, cursor-paged catalog window. Never fabricates completeness. */
  listAppsPage(params?: AppItemPageParams): Promise<AppItemPage>;
  /** Exact, bounded resolution of known listing ids (editorial content). */
  getAppsByIds(ids: string[]): Promise<AppItem[]>;
  getTopCharts(type: 'free' | 'paid' | 'all'): Promise<AppItem[]>;
  searchApps(query: string, filter?: string): Promise<AppItem[]>;
  getTrendingSearches(): Promise<string[]>;
  getSearchSuggestions(keyword: string): Promise<string[]>;
  getSearchHistory(): Promise<string[]>;
  saveSearchTerm(term: string): Promise<void>;
  clearSearchHistory(): Promise<void>;
  getAppById(id: string): Promise<AppItem | undefined>;
  getReviewsByAppId(id: string): Promise<Review[]>;
  submitReview(reviewData: { appId: string; user: string; rating: number; title: string; comment: string }): Promise<Review>;
  likeReview(reviewId: string): Promise<boolean>;
  getMoreByDeveloper(developer: string, excludeAppId: string): Promise<AppItem[]>;
  getSimilarApps(appId: string): Promise<AppItem[]>;
  getBoardGameRecommendations(appId: string): Promise<AppItem[]>;
  getWishlist(): Promise<AppItem[]>;
  addToWishlist(listingId: string): Promise<void>;
  removeFromWishlist(listingId: string): Promise<void>;
  getInstalledApps(): Promise<AppItem[]>;
  getPendingUpdates(): Promise<AppItem[]>;
  updateApp(id: string): Promise<boolean>;
  updateAllApps(ids: string[]): Promise<boolean>;
  submitFeedback(feedbackData: { appId?: string; type: string; content: string; contact?: string }): Promise<boolean>;
}

export type AppStoreServicePort = IAppStoreSDK;

let appStorePort: AppStoreServicePort = createUnconfiguredAppStorePort();

/** Bind the real SDK-backed implementation during app bootstrap. */
export function configureAppStoreServicePort(port: AppStoreServicePort): void {
  appStorePort = port;
}

export const AppStoreService: IAppStoreSDK = {
  getCategories: () => appStorePort.getCategories(),
  getCategoryDetail: (id) => appStorePort.getCategoryDetail(id),
  getCollections: () => appStorePort.getCollections(),
  getCollectionDetail: (id) => appStorePort.getCollectionDetail(id),
  getEvents: () => appStorePort.getEvents(),
  getEventDetail: (id) => appStorePort.getEventDetail(id),
  getDiscoverApps: () => appStorePort.getDiscoverApps(),
  listRecentlyUpdated: () => appStorePort.listRecentlyUpdated(),
  listAppsPage: (params) => appStorePort.listAppsPage(params),
  getAppsByIds: (ids) => appStorePort.getAppsByIds(ids),
  getTopCharts: (type = 'all') => appStorePort.getTopCharts(type),
  searchApps: (query, filter = 'All') => appStorePort.searchApps(query, filter),
  getTrendingSearches: () => appStorePort.getTrendingSearches(),
  getSearchSuggestions: (keyword) => appStorePort.getSearchSuggestions(keyword),
  getSearchHistory: () => appStorePort.getSearchHistory(),
  saveSearchTerm: (term) => appStorePort.saveSearchTerm(term),
  clearSearchHistory: () => appStorePort.clearSearchHistory(),
  getAppById: (id) => appStorePort.getAppById(id),
  getReviewsByAppId: (id) => appStorePort.getReviewsByAppId(id),
  submitReview: (reviewData) => appStorePort.submitReview(reviewData),
  likeReview: (reviewId) => appStorePort.likeReview(reviewId),
  getMoreByDeveloper: (developer, excludeAppId) =>
    appStorePort.getMoreByDeveloper(developer, excludeAppId),
  getSimilarApps: (appId) => appStorePort.getSimilarApps(appId),
  getBoardGameRecommendations: (appId) => appStorePort.getBoardGameRecommendations(appId),
  getWishlist: () => appStorePort.getWishlist(),
  addToWishlist: (listingId) => appStorePort.addToWishlist(listingId),
  removeFromWishlist: (listingId) => appStorePort.removeFromWishlist(listingId),
  getInstalledApps: () => appStorePort.getInstalledApps(),
  getPendingUpdates: () => appStorePort.getPendingUpdates(),
  updateApp: (id) => appStorePort.updateApp(id),
  updateAllApps: (ids) => appStorePort.updateAllApps(ids),
  submitFeedback: (feedbackData) => appStorePort.submitFeedback(feedbackData),
};

function createUnconfiguredAppStorePort(): AppStoreServicePort {
  const unavailable = (): never => {
    throw new Error('The App Store app SDK runtime is not configured.');
  };
  return {
    getCategories: async () => unavailable(),
    getCategoryDetail: async () => unavailable(),
    getCollections: async () => unavailable(),
    getCollectionDetail: async () => unavailable(),
    getEvents: async () => unavailable(),
    getEventDetail: async () => unavailable(),
    getDiscoverApps: async () => unavailable(),
    listRecentlyUpdated: async () => unavailable(),
    listAppsPage: async () => unavailable(),
    getAppsByIds: async () => unavailable(),
    getTopCharts: async () => unavailable(),
    searchApps: async () => unavailable(),
    getTrendingSearches: async () => unavailable(),
    getSearchSuggestions: async () => unavailable(),
    getSearchHistory: async () => unavailable(),
    saveSearchTerm: async () => unavailable(),
    clearSearchHistory: async () => unavailable(),
    getAppById: async () => unavailable(),
    getReviewsByAppId: async () => unavailable(),
    submitReview: async () => unavailable(),
    likeReview: async () => unavailable(),
    getMoreByDeveloper: async () => unavailable(),
    getSimilarApps: async () => unavailable(),
    getBoardGameRecommendations: async () => unavailable(),
    getWishlist: async () => unavailable(),
    addToWishlist: async () => unavailable(),
    removeFromWishlist: async () => unavailable(),
    getInstalledApps: async () => unavailable(),
    getPendingUpdates: async () => unavailable(),
    updateApp: async () => unavailable(),
    updateAllApps: async () => unavailable(),
    submitFeedback: async () => unavailable(),
  };
}
