import { uuid } from '@sdkwork/utils/id';
import { createClient as createGeneratedClient, SdkworkAppstoreAppClient } from '../generated/server-openapi/src/index';
import type { AuthTokenManager } from '../generated/server-openapi/src/auth/index';
import type { SdkworkAppConfig } from '../generated/server-openapi/src/types/common';
import type {
  AppTemplateCreateRequest, AppTemplateUsageCreateRequest, DownloadGrantCreateRequest,
  FeedbackCreateRequest, LibraryInstallRequest, LibraryUninstallRequest,
  LibraryUpdatesCheckRequest, ListingCategoryBindRequest, ListingCreateRequest,
  ListingLocalizationUpsertRequest, ListingMediaAttachRequest, ListingRatingUpsertRequest,
  ListingSubmissionCreateRequest, ListingUpdateRequest, PublisherAppBootstrapRequest,
  PublisherCreateRequest, PublisherMemberInviteRequest, PublisherUpdateRequest,
  PublisherVerificationSubmitRequest, ReleaseArtifactAttachRequest, ReleaseCreateRequest,
  ReleaseNotesUpsertRequest, ReleaseRolloutUpdateRequest, ReleaseUpdateRequest,
  SearchHistoryUpsertRequest,
} from '../generated/server-openapi/src/types/index';

export type TokenManager = AuthTokenManager;
export interface AppStoreClientConfig extends SdkworkAppConfig { tokenManager: AuthTokenManager }
export interface AppStoreApiError {
  status: number;
  code?: number;
  traceId?: string;
  title?: string;
  detail?: string;
  type?: string;
}

export function isAppStoreApiError(error: unknown): error is AppStoreApiError {
  return typeof error === 'object' && error !== null && 'status' in error
    && typeof (error as AppStoreApiError).status === 'number';
}

const commandOptions = () => ({ idempotencyKey: uuid() });
const pageParams = (params?: { cursor?: string; limit?: number }) =>
  params ? { cursor: params.cursor, pageSize: params.limit } : undefined;

function createCatalogFacade(client: SdkworkAppstoreAppClient) {
  const api = client.catalog.appstore.catalog;
  return {
    getHome: () => api.home.retrieve(),
    listCategories: (p?: { cursor?: string; limit?: number; locale?: string }) =>
      api.categories.list({ cursor: p?.cursor, pageSize: p?.limit, locale: p?.locale }),
    getCategory: (id: string) => api.categories.retrieve(id),
    listCollections: (p?: { cursor?: string; limit?: number }) => api.collections.list(pageParams(p)),
    getCollection: (id: string) => api.collections.retrieve(id),
    listFeatured: () => api.featured.list(),
    getChart: (code: string) => api.charts.retrieve(code),
    searchListings: (p?: { q?: string; categoryId?: string; ids?: string[]; cursor?: string; limit?: number }) =>
      api.listings.list({ q: p?.q, categoryId: p?.categoryId, ids: p?.ids?.join(','), cursor: p?.cursor, pageSize: p?.limit }),
    listRecommendations: (p?: { locale?: string; platform?: string; cursor?: string; limit?: number }) =>
      api.recommendations.list({ locale: p?.locale, platform: p?.platform, cursor: p?.cursor, pageSize: p?.limit }),
    listRecentlyUpdated: (p?: { locale?: string; cursor?: string; limit?: number }) =>
      api.recentlyUpdated.list({ locale: p?.locale, cursor: p?.cursor, pageSize: p?.limit }),
    listEvents: (p?: { status?: string; cursor?: string; limit?: number }) =>
      api.events.list({ status: p?.status, cursor: p?.cursor, pageSize: p?.limit }),
    getEvent: (id: string) => api.events.retrieve(id),
    listSearchSuggestions: (p: { q: string; locale?: string }) => api.search.suggestions.list(p),
    listTrendingSearchTerms: (p?: { locale?: string; limit?: number }) =>
      api.search.trending.list({ locale: p?.locale, pageSize: p?.limit }),
    listSearchHistory: (p?: { cursor?: string; limit?: number }) => api.search.history.list(pageParams(p)),
    upsertSearchHistory: (body: SearchHistoryUpsertRequest) => api.search.history.update(body),
    clearSearchHistory: () => api.search.history.delete(),
    listTemplates: (p?: { q?: string; categoryCode?: string; templateType?: 'APP' | 'PLUGIN' | 'AGENT'; cursor?: string; limit?: number }) =>
      api.templates.list({ q: p?.q, categoryCode: p?.categoryCode, templateType: p?.templateType, cursor: p?.cursor, pageSize: p?.limit }),
    getTemplate: (id: string) => api.templates.retrieve(id),
    createTemplate: (body: AppTemplateCreateRequest) => api.templates.create(body, commandOptions()),
    recordTemplateUsage: (id: string, body: AppTemplateUsageCreateRequest) =>
      api.templates.usage.create(id, body, commandOptions()),
    submitFeedback: (body: FeedbackCreateRequest) => api.feedback.create(body, commandOptions()),
  };
}

function createListingsFacade(client: SdkworkAppstoreAppClient) {
  const api = client.listings.appstore.listings;
  return {
    get: (id: string) => api.retrieve(id),
    create: (body: ListingCreateRequest) => api.create(body, commandOptions()),
    update: (id: string, body: ListingUpdateRequest) => api.update(id, body),
    upsertLocalization: (id: string, locale: string, body: ListingLocalizationUpsertRequest) =>
      api.localization.update(id, locale, body),
    listMedia: (id: string) => api.media.list(id),
    attachMedia: (id: string, body: ListingMediaAttachRequest) => api.media.create(id, body),
    removeMedia: (id: string, mediaId: string) => api.media.delete(id, mediaId),
    bindCategories: (id: string, body: ListingCategoryBindRequest) => api.categories.update(id, body),
    createSubmission: (id: string, body: ListingSubmissionCreateRequest) =>
      api.submissions.create(id, body, commandOptions()),
    listReleases: (id: string) => api.releases.list(id),
    listReleaseHistory: (id: string, p?: { cursor?: string; limit?: number }) => api.releases.history.list(id, pageParams(p)),
    listSimilar: (id: string, p?: { cursor?: string; limit?: number }) => api.similar.list(id, pageParams(p)),
    listDeveloperOther: (id: string, p?: { cursor?: string; limit?: number }) => api.developerOther.list(id, pageParams(p)),
    getEditorial: (id: string) => api.editorial.retrieve(id),
    listRatings: (id: string, p?: { cursor?: string; limit?: number }) => api.ratings.list(id, pageParams(p)),
    updateRating: (id: string, body: ListingRatingUpsertRequest) => api.ratings.update(id, body),
  };
}

function createPublishersFacade(client: SdkworkAppstoreAppClient) {
  const api = client.publishers.appstore.publishers;
  return {
    getMe: () => api.me.retrieve(),
    listMyListings: (p?: { cursor?: string; limit?: number }) => api.me.listings.list(pageParams(p)),
    bootstrapApp: (body: PublisherAppBootstrapRequest) => api.me.apps.create(body, commandOptions()),
    create: (body: PublisherCreateRequest) => api.create(body),
    update: (id: string, body: PublisherUpdateRequest) => api.update(id, body),
    listMembers: (id: string) => api.members.list(id),
    inviteMember: (id: string, body: PublisherMemberInviteRequest) => api.members.create(id, body),
    submitVerification: (id: string, body: PublisherVerificationSubmitRequest) => api.verifications.create(id, body),
  };
}

function createReleasesFacade(client: SdkworkAppstoreAppClient) {
  const api = client.releases.appstore.releases;
  return {
    get: (id: string) => api.retrieve(id),
    create: (listingId: string, body: ReleaseCreateRequest) => api.create(listingId, body, commandOptions()),
    update: (id: string, body: ReleaseUpdateRequest) => api.update(id, body),
    upsertNotes: (id: string, locale: string, body: ReleaseNotesUpsertRequest) => api.notes.update(id, locale, body),
    attachArtifact: (id: string, body: ReleaseArtifactAttachRequest) => api.artifacts.create(id, body),
    updateRollout: (id: string, body: ReleaseRolloutUpdateRequest) => api.rollout.update(id, body),
    retire: (id: string) => api.retire(id),
  };
}

function createLibraryFacade(client: SdkworkAppstoreAppClient) {
  const api = client.library.appstore.library;
  return {
    listItems: (p?: { cursor?: string; limit?: number }) => api.items.list(pageParams(p)),
    getItem: (id: string) => api.items.retrieve(id),
    install: (body: LibraryInstallRequest) => api.install(body, commandOptions()),
    uninstall: (body: LibraryUninstallRequest) => api.uninstall(body),
    checkUpdates: (body: LibraryUpdatesCheckRequest) => api.updates.check(body),
  };
}

function createWishlistFacade(client: SdkworkAppstoreAppClient) {
  const api = client.wishlist.appstore.wishlist.items;
  return {
    listItems: (p?: { cursor?: string; limit?: number }) =>
      api.list({ cursor: p?.cursor, pageSize: p?.limit }),
    addItem: (listingId: string) => api.create({ listingId }),
    removeItem: (listingId: string) => api.delete(listingId),
  };
}

function createDownloadGrantFacade(client: SdkworkAppstoreAppClient) {
  const api = client.downloadGrants.appstore.downloadGrants;
  return {
    create: (body: DownloadGrantCreateRequest) => api.create(body, commandOptions()),
    consume: (id: string) => api.consume(id),
  };
}

function createComplianceFacade(client: SdkworkAppstoreAppClient) {
  const api = client.compliance.appstore.compliance.iapItems;
  return {
    listIapItems: (id: string, p?: { cursor?: string; limit?: number }) => api.list(id, pageParams(p)),
  };
}

export class AppStoreClient {
  readonly generated: SdkworkAppstoreAppClient;
  readonly catalog: ReturnType<typeof createCatalogFacade>;
  readonly listings: ReturnType<typeof createListingsFacade>;
  readonly publishers: ReturnType<typeof createPublishersFacade>;
  readonly releases: ReturnType<typeof createReleasesFacade>;
  readonly library: ReturnType<typeof createLibraryFacade>;
  readonly wishlist: ReturnType<typeof createWishlistFacade>;
  readonly downloadGrants: ReturnType<typeof createDownloadGrantFacade>;
  readonly compliance: ReturnType<typeof createComplianceFacade>;

  constructor(config: AppStoreClientConfig) {
    this.generated = createGeneratedClient(config);
    this.catalog = createCatalogFacade(this.generated);
    this.listings = createListingsFacade(this.generated);
    this.publishers = createPublishersFacade(this.generated);
    this.releases = createReleasesFacade(this.generated);
    this.library = createLibraryFacade(this.generated);
    this.wishlist = createWishlistFacade(this.generated);
    this.downloadGrants = createDownloadGrantFacade(this.generated);
    this.compliance = createComplianceFacade(this.generated);
  }
}

export const createAppStoreClient = (config: AppStoreClientConfig) => new AppStoreClient(config);
