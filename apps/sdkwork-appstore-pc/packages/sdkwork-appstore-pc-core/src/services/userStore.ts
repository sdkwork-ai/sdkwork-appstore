/**
 * User custom store (个人自定义分类 / 自定义 Appstore 分享) service contract.
 *
 * Mirrors the `appstore.userStore.*` and `appstore.userStores.public.*` API
 * operations exposed by `sdkwork-routes-user-store-app-api` and
 * `sdkwork-routes-user-store-open-api`. Wire shapes follow the OpenAPI
 * contracts in `apis/app-api/store/openapi.yaml` and
 * `apis/open-api/store/openapi.yaml` (int64 fields such as `viewCount` and
 * `downloadCount` are strings per API_SPEC §13.6).
 *
 * NOTE (SDK wiring TODO): the generated `@sdkwork/appstore-app-sdk` does not
 * yet carry the `userCategory` / `userStoreShare` / `publicUserStores`
 * namespaces — regenerated SDK output is never hand-edited. Once the SDK is
 * regenerated, bind the real client facade through
 * `configureUserStoreServicePort` during app bootstrap (same pattern as the
 * AppStore port). Until then the default port fails fast so pages degrade to
 * their empty/error states instead of hanging.
 */

export type UserCategoryStatus = 'active' | 'archived';
export type UserStoreShareScope = 'all' | 'selected';
export type UserStoreShareVisibility = 'public' | 'unlisted';
export type UserStoreShareStatus = 'active' | 'revoked';

/**
 * Listing card resolved through the ListingCardProviderPort anti-corruption
 * layer. Shape matches the shared `ListingCard` OpenAPI schema.
 */
export interface UserStoreListingCard {
  listingId: string;
  displayName: string;
  subtitle?: string;
  iconMediaResourceId?: string;
  averageRating?: string;
  /** int64 serialized as a decimal string. */
  downloadCount: string;
}

export interface UserCategory {
  id: string;
  name: string;
  description?: string;
  iconMediaResourceId?: string;
  sortOrder: number;
  status: UserCategoryStatus;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserCategoryItem {
  id: string;
  userCategoryId: string;
  listingId: string;
  note?: string;
  sortOrder: number;
  createdAt: string;
}

/** Owner-side list row: the stored item plus its resolved listing card. */
export interface UserCategoryItemWithCard {
  item: UserCategoryItem;
  listingCard?: UserStoreListingCard;
}

export interface UserStoreShare {
  id: string;
  shareToken: string;
  title: string;
  description?: string;
  scope: UserStoreShareScope;
  selectedCategoryIds: string[];
  visibility: UserStoreShareVisibility;
  status: UserStoreShareStatus;
  expiresAt?: string;
  /** int64 serialized as a decimal string. */
  viewCount: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserCategoryCreateInput {
  name: string;
  description?: string;
  iconMediaResourceId?: string;
}

export interface UserCategoryUpdateInput {
  name?: string;
  description?: string;
  iconMediaResourceId?: string;
  sortOrder?: number;
}

export interface UserStoreShareCreateInput {
  /** Human-readable share headline shown on the public view (1–128 chars). */
  title: string;
  description?: string;
  scope: UserStoreShareScope;
  /** Required when scope === 'selected'. */
  selectedCategoryIds?: string[];
  visibility: UserStoreShareVisibility;
  /** ISO 8601 datetime; omit for a never-expiring share. */
  expiresAt?: string;
}

export interface UserStoreShareUpdateInput {
  title?: string;
  description?: string;
  scope?: UserStoreShareScope;
  /** Required (non-empty) when scope is being switched to 'selected'. */
  selectedCategoryIds?: string[];
  visibility?: UserStoreShareVisibility;
}

export interface UserStoreItemPage {
  items: UserCategoryItemWithCard[];
  cursor?: string;
  hasMore: boolean;
}

export interface PublicUserStoreItemPage {
  items: UserStoreListingCard[];
  cursor?: string;
  hasMore: boolean;
}

/**
 * Open-api public category summary. Field name is `userCategoryId` and
 * `itemCount` is an int64 serialized as a decimal string (API_SPEC §13.6).
 */
export interface PublicUserStoreCategorySummary {
  userCategoryId: string;
  name: string;
  iconMediaResourceId?: string;
  sortOrder: number;
  itemCount: string;
}

export interface PublicUserStoreView {
  shareToken: string;
  title: string;
  description?: string;
  scope: UserStoreShareScope;
  categories: PublicUserStoreCategorySummary[];
}

/**
 * SDK contract for the user custom store surface. Implemented by the
 * bootstrap-configured service port once the regenerated app-sdk exposes the
 * userStore namespaces.
 */
export interface IUserStoreSDK {
  // ── Categories (appstore.userStore.category.*) ─────────────────────────
  listUserCategories(): Promise<UserCategory[]>;
  createUserCategory(input: UserCategoryCreateInput): Promise<UserCategory>;
  updateUserCategory(categoryId: string, input: UserCategoryUpdateInput): Promise<UserCategory>;
  deleteUserCategory(categoryId: string): Promise<void>;

  // ── Category items (appstore.userStore.item.*) ─────────────────────────
  listUserCategoryItems(categoryId: string, cursor?: string): Promise<UserStoreItemPage>;
  addUserCategoryItem(categoryId: string, listingId: string): Promise<UserCategoryItemWithCard>;
  removeUserCategoryItem(categoryId: string, itemId: string): Promise<void>;
  /** Full-order reorder: submit every item id of the category in display order. */
  reorderUserCategoryItems(categoryId: string, itemIds: string[]): Promise<void>;

  // ── Shares (appstore.userStore.share.*) ────────────────────────────────
  listUserStoreShares(): Promise<UserStoreShare[]>;
  createUserStoreShare(input: UserStoreShareCreateInput): Promise<UserStoreShare>;
  updateUserStoreShare(shareId: string, input: UserStoreShareUpdateInput): Promise<UserStoreShare>;
  revokeUserStoreShare(shareId: string): Promise<void>;
  refreshUserStoreShareToken(shareId: string): Promise<UserStoreShare>;

  // ── Anonymous public view (appstore.userStores.public.*) ───────────────
  getPublicUserStore(shareToken: string): Promise<PublicUserStoreView>;
  listPublicUserStoreItems(
    shareToken: string,
    categoryId?: string,
    cursor?: string,
  ): Promise<PublicUserStoreItemPage>;
}

export type UserStoreServicePort = IUserStoreSDK;

let userStorePort: UserStoreServicePort = createUnconfiguredUserStorePort();

/** Bind the real SDK-backed implementation during app bootstrap. */
export function configureUserStoreServicePort(port: UserStoreServicePort): void {
  userStorePort = port;
}

export const UserStoreService: IUserStoreSDK = {
  listUserCategories: () => userStorePort.listUserCategories(),
  createUserCategory: (input) => userStorePort.createUserCategory(input),
  updateUserCategory: (categoryId, input) => userStorePort.updateUserCategory(categoryId, input),
  deleteUserCategory: (categoryId) => userStorePort.deleteUserCategory(categoryId),
  listUserCategoryItems: (categoryId, cursor) =>
    userStorePort.listUserCategoryItems(categoryId, cursor),
  addUserCategoryItem: (categoryId, listingId) =>
    userStorePort.addUserCategoryItem(categoryId, listingId),
  removeUserCategoryItem: (categoryId, itemId) =>
    userStorePort.removeUserCategoryItem(categoryId, itemId),
  reorderUserCategoryItems: (categoryId, itemIds) =>
    userStorePort.reorderUserCategoryItems(categoryId, itemIds),
  listUserStoreShares: () => userStorePort.listUserStoreShares(),
  createUserStoreShare: (input) => userStorePort.createUserStoreShare(input),
  updateUserStoreShare: (shareId, input) => userStorePort.updateUserStoreShare(shareId, input),
  revokeUserStoreShare: (shareId) => userStorePort.revokeUserStoreShare(shareId),
  refreshUserStoreShareToken: (shareId) => userStorePort.refreshUserStoreShareToken(shareId),
  getPublicUserStore: (shareToken) => userStorePort.getPublicUserStore(shareToken),
  listPublicUserStoreItems: (shareToken, categoryId, cursor) =>
    userStorePort.listPublicUserStoreItems(shareToken, categoryId, cursor),
};

function createUnconfiguredUserStorePort(): UserStoreServicePort {
  const unavailable = (): never => {
    throw new Error(
      'The user store SDK runtime is not configured. Bind it after the '
        + '@sdkwork/appstore-app-sdk userStore namespaces are regenerated.',
    );
  };
  return {
    listUserCategories: async () => unavailable(),
    createUserCategory: async () => unavailable(),
    updateUserCategory: async () => unavailable(),
    deleteUserCategory: async () => unavailable(),
    listUserCategoryItems: async () => unavailable(),
    addUserCategoryItem: async () => unavailable(),
    removeUserCategoryItem: async () => unavailable(),
    reorderUserCategoryItems: async () => unavailable(),
    listUserStoreShares: async () => unavailable(),
    createUserStoreShare: async () => unavailable(),
    updateUserStoreShare: async () => unavailable(),
    revokeUserStoreShare: async () => unavailable(),
    refreshUserStoreShareToken: async () => unavailable(),
    getPublicUserStore: async () => unavailable(),
    listPublicUserStoreItems: async () => unavailable(),
  };
}
