/**
 * User custom store (个人自定义分类 / 分享) service access for H5.
 *
 * Mirrors the PC-side contract in `@sdkwork/appstore-pc-core` userStore
 * service. The authenticated surface binds `getStoreClient()`; the anonymous
 * public share view targets the open-api (`/store/v3/api`) userStores.public
 * operations. Wire shapes follow the OpenAPI contracts (int64 fields such as
 * `viewCount` and `downloadCount` are strings per API_SPEC §13.6).
 *
 * NOTE (SDK wiring TODO): the generated `@sdkwork/appstore-app-sdk` does not
 * yet expose the `userCategory` / `userStoreShare` / `publicUserStores`
 * namespaces (generated output is never hand-edited). Once the SDK is
 * regenerated from `apis/app-api/store/openapi.yaml` and
 * `apis/open-api/store/openapi.yaml`, replace the pending-port bodies with
 * the generated client calls — nothing else in the pages should change.
 */
import type { AppStoreClient } from '@sdkwork/appstore-app-sdk';

export type UserStoreShareScope = 'all' | 'selected';
export type UserStoreShareVisibility = 'public' | 'unlisted';

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
  sortOrder: number;
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
  status: 'active' | 'revoked';
  expiresAt?: string;
  /** int64 serialized as a decimal string. */
  viewCount: string;
  createdAt: string;
  updatedAt: string;
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

/** Open-api summary: `userCategoryId` field name, int64 itemCount as string. */
export interface PublicUserStoreCategorySummary {
  userCategoryId: string;
  name: string;
  iconMediaResourceId?: string;
  sortOrder: number;
  itemCount: string;
}

export interface UserStoreShareUpdateInput {
  title?: string;
  description?: string;
  scope?: UserStoreShareScope;
  selectedCategoryIds?: string[];
  visibility?: UserStoreShareVisibility;
}

export interface PublicUserStoreView {
  shareToken: string;
  title: string;
  description?: string;
  scope: UserStoreShareScope;
  categories: PublicUserStoreCategorySummary[];
}

function pendingSdkPort(method: string): never {
  throw new Error(
    `userStore.${method}: the @sdkwork/appstore-app-sdk userStore namespaces `
      + 'are not generated yet. Regenerate the SDK and wire the client here.',
  );
}

/** Authenticated owner operations (app-api, DualToken). */
export const userStoreService = {
  async listCategories(client: AppStoreClient): Promise<UserCategory[]> {
    void client;
    pendingSdkPort('listCategories');
  },
  async createCategory(
    client: AppStoreClient,
    input: { name: string; description?: string },
  ): Promise<UserCategory> {
    void client;
    void input;
    pendingSdkPort('createCategory');
  },
  async deleteCategory(client: AppStoreClient, categoryId: string): Promise<void> {
    void client;
    void categoryId;
    pendingSdkPort('deleteCategory');
  },
  async listItems(client: AppStoreClient, categoryId: string): Promise<UserStoreItemPage> {
    void client;
    void categoryId;
    pendingSdkPort('listItems');
  },
  async removeItem(client: AppStoreClient, categoryId: string, itemId: string): Promise<void> {
    void client;
    void categoryId;
    void itemId;
    pendingSdkPort('removeItem');
  },
  async listShares(client: AppStoreClient): Promise<UserStoreShare[]> {
    void client;
    pendingSdkPort('listShares');
  },
  async createShare(
    client: AppStoreClient,
    input: {
      title: string;
      description?: string;
      scope: UserStoreShareScope;
      selectedCategoryIds?: string[];
      visibility: UserStoreShareVisibility;
    },
  ): Promise<UserStoreShare> {
    void client;
    void input;
    pendingSdkPort('createShare');
  },
  async updateShare(
    client: AppStoreClient,
    shareId: string,
    input: UserStoreShareUpdateInput,
  ): Promise<UserStoreShare> {
    void client;
    void shareId;
    void input;
    pendingSdkPort('updateShare');
  },
  async revokeShare(client: AppStoreClient, shareId: string): Promise<void> {
    void client;
    void shareId;
    pendingSdkPort('revokeShare');
  },
};

/** Anonymous visitor operations (open-api, no auth). */
export const publicUserStoreService = {
  async getView(shareToken: string): Promise<PublicUserStoreView> {
    void shareToken;
    pendingSdkPort('public.getView');
  },
  async listItems(shareToken: string, categoryId?: string): Promise<PublicUserStoreItemPage> {
    void shareToken;
    void categoryId;
    pendingSdkPort('public.listItems');
  },
};
