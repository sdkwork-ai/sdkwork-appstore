/**
 * User custom store (个人自定义分类 / 分享) service access for H5.
 *
 * Mirrors the PC-side contract in `@sdkwork/appstore-pc-core` userStore
 * service. The authenticated surface binds `getStoreClient()` through the
 * generated `userStore` facade; the anonymous public share view binds the
 * open-api client (`/store/v3/api`) `userStores.public` operations. Wire
 * shapes follow the OpenAPI contracts (int64 fields such as `viewCount` and
 * `downloadCount` are strings per API_SPEC §13.6).
 */
import type { AppStoreClient } from '@sdkwork/appstore-app-sdk';
import { getOpenApiClient } from '@/services/openApiClient';

export type UserStoreShareScope = 'all' | 'selected';
export type UserStoreShareVisibility = 'public' | 'unlisted';

export interface UserStoreListingCard {
  listingId: string;
  displayName: string;
  subtitle?: string;
  iconMediaResourceId?: string;
  averageRating?: string;
  /** int64 serialized as a decimal string. */
  downloadCount?: string;
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
  categories: PublicUserStoreCategorySummary[];
}

function toPage(result: { pageInfo?: { nextCursor?: string | null; hasMore?: boolean } }): {
  cursor?: string;
  hasMore: boolean;
} {
  return {
    cursor: result.pageInfo?.nextCursor ?? undefined,
    hasMore: result.pageInfo?.hasMore ?? false,
  };
}

/** Authenticated owner operations (app-api, DualToken). */
export const userStoreService = {
  async listCategories(client: AppStoreClient): Promise<UserCategory[]> {
    const page = await client.userStore.listCategories();
    return page.items;
  },
  async createCategory(
    client: AppStoreClient,
    input: { name: string; description?: string },
  ): Promise<UserCategory> {
    return client.userStore.createCategory(input);
  },
  async deleteCategory(client: AppStoreClient, categoryId: string): Promise<void> {
    await client.userStore.deleteCategory(categoryId);
  },
  async listItems(client: AppStoreClient, categoryId: string): Promise<UserStoreItemPage> {
    const page = await client.userStore.listCategoryItems(categoryId);
    return {
      items: page.items,
      ...toPage(page),
    };
  },
  /** Adds a listing to one of the user's custom categories. */
  async addToCategory(
    client: AppStoreClient,
    categoryId: string,
    listingId: string,
  ): Promise<UserCategoryItemWithCard> {
    return client.userStore.addCategoryItem(categoryId, { listingId });
  },
  async removeItem(client: AppStoreClient, categoryId: string, itemId: string): Promise<void> {
    await client.userStore.removeCategoryItem(categoryId, itemId);
  },
  async listShares(client: AppStoreClient): Promise<UserStoreShare[]> {
    const page = await client.userStore.listShares();
    return page.items;
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
    return client.userStore.createShare(input);
  },
  async updateShare(
    client: AppStoreClient,
    shareId: string,
    input: UserStoreShareUpdateInput,
  ): Promise<UserStoreShare> {
    return client.userStore.updateShare(shareId, input);
  },
  async revokeShare(client: AppStoreClient, shareId: string): Promise<void> {
    await client.userStore.revokeShare(shareId);
  },
};

/** Anonymous visitor operations (open-api, no auth). */
export const publicUserStoreService = {
  async getView(shareToken: string): Promise<PublicUserStoreView> {
    const openClient = getOpenApiClient();
    const view = await openClient.getPublicUserStore(shareToken);
    return {
      shareToken: view.shareToken,
      title: view.title,
      description: view.description,
      categories: view.categories,
    };
  },
  async listItems(
    shareToken: string,
    categoryId?: string,
  ): Promise<PublicUserStoreItemPage> {
    const openClient = getOpenApiClient();
    if (!categoryId) {
      // The open-api public surface pages items per category; the "全部" tab
      // renders the union by walking the categories of the shared view.
      const view = await openClient.getPublicUserStore(shareToken);
      const pages = await Promise.all(
        view.categories.map((category) =>
          openClient.listPublicUserStoreItems(shareToken, category.userCategoryId),
        ),
      );
      return {
        items: pages.flatMap((page) =>
          page.items.map((card) => ({
            listingId: card.listingId,
            displayName: card.displayName,
            subtitle: card.subtitle,
            iconMediaResourceId: card.iconMediaResourceId,
            averageRating: card.averageRating,
          })),
        ),
        hasMore: false,
      };
    }
    const page = await openClient.listPublicUserStoreItems(shareToken, categoryId);
    return {
      items: page.items.map((card) => ({
        listingId: card.listingId,
        displayName: card.displayName,
        subtitle: card.subtitle,
        iconMediaResourceId: card.iconMediaResourceId,
        averageRating: card.averageRating,
      })),
      ...toPage(page),
    };
  },
};
