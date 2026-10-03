import type { AppstorePcSdkClientInventory } from './sdkClients';

import {
  configureUserStoreServicePort,
  type PublicUserStoreItemPage,
  type PublicUserStoreView,
  type UserCategory,
  type UserCategoryItemWithCard,
  type UserStoreItemPage,
  type UserStoreListingCard,
  type UserStoreServicePort,
  type UserStoreShare,
} from '@sdkwork/appstore-pc-core';

type PageMeta = { cursor?: string; hasMore: boolean };

function pageMeta(page: { pageInfo?: { nextCursor?: string | null; hasMore?: boolean } | null }): PageMeta {
  return {
    cursor: page.pageInfo?.nextCursor ?? undefined,
    hasMore: page.pageInfo?.hasMore ?? false,
  };
}

function toListingCard(card: {
  listingId: string;
  displayName: string;
  subtitle?: string;
  iconMediaResourceId?: string;
  averageRating?: string;
  downloadCount?: string;
}): UserStoreListingCard {
  return {
    listingId: card.listingId,
    displayName: card.displayName,
    ...(card.subtitle === undefined ? {} : { subtitle: card.subtitle }),
    ...(card.iconMediaResourceId === undefined
      ? {}
      : { iconMediaResourceId: card.iconMediaResourceId }),
    ...(card.averageRating === undefined ? {} : { averageRating: card.averageRating }),
    downloadCount: card.downloadCount ?? '0',
  };
}

/**
 * User custom store (个人自定义分类 / 分享) service port over the generated
 * SDK facades.
 *
 * The authenticated owner surface binds the app-api `userStore` facade; the
 * anonymous public share view binds the open-api client (`/store/v3/api`)
 * `userStores.public` operations. Wire shapes follow the OpenAPI contracts —
 * int64 fields such as `viewCount` and `downloadCount` stay decimal strings
 * (API_SPEC §13.6). This replaces the fail-fast default port once the SDK
 * carries the `userStore` namespaces (generated output is never hand-edited).
 */
export function createUserStoreServicePort(
  sdkClients: AppstorePcSdkClientInventory,
): UserStoreServicePort {
  const app = sdkClients.app;
  const open = sdkClients.open;

  return {
    // ── Categories ─────────────────────────────────────────────────────────
    async listUserCategories(): Promise<UserCategory[]> {
      const page = await app.userStore.listCategories();
      return page.items;
    },

    async createUserCategory(input: {
      name: string;
      description?: string;
      iconMediaResourceId?: string;
    }): Promise<UserCategory> {
      return app.userStore.createCategory(input);
    },

    async updateUserCategory(
      categoryId: string,
      input: {
        name?: string;
        description?: string;
        iconMediaResourceId?: string;
        sortOrder?: number;
      },
    ): Promise<UserCategory> {
      return app.userStore.updateCategory(categoryId, input);
    },

    async deleteUserCategory(categoryId: string): Promise<void> {
      await app.userStore.deleteCategory(categoryId);
    },

    // ── Category items ─────────────────────────────────────────────────────
    async listUserCategoryItems(categoryId: string, cursor?: string): Promise<UserStoreItemPage> {
      const page = await app.userStore.listCategoryItems(
        categoryId,
        cursor === undefined ? undefined : { cursor },
      );
      const rows = (page.items ?? []) as UserCategoryItemWithCard[];
      return { items: rows, ...pageMeta(page) };
    },

    async addUserCategoryItem(
      categoryId: string,
      listingId: string,
    ): Promise<UserCategoryItemWithCard> {
      return app.userStore.addCategoryItem(categoryId, { listingId });
    },

    async removeUserCategoryItem(categoryId: string, itemId: string): Promise<void> {
      await app.userStore.removeCategoryItem(categoryId, itemId);
    },

    async reorderUserCategoryItems(categoryId: string, itemIds: string[]): Promise<void> {
      await app.userStore.reorderCategoryItems(categoryId, { itemIds });
    },

    // ── Shares ─────────────────────────────────────────────────────────────
    async listUserStoreShares(): Promise<UserStoreShare[]> {
      const page = await app.userStore.listShares();
      return page.items;
    },

    async createUserStoreShare(input: {
      title: string;
      description?: string;
      scope: 'all' | 'selected';
      selectedCategoryIds?: string[];
      visibility: 'public' | 'unlisted';
      expiresAt?: string;
    }): Promise<UserStoreShare> {
      return app.userStore.createShare({
        title: input.title,
        ...(input.description === undefined ? {} : { description: input.description }),
        scope: input.scope,
        ...(input.selectedCategoryIds === undefined
          ? {}
          : { selectedCategoryIds: input.selectedCategoryIds }),
        visibility: input.visibility,
      });
    },

    async updateUserStoreShare(
      shareId: string,
      input: {
        title?: string;
        description?: string;
        scope?: 'all' | 'selected';
        selectedCategoryIds?: string[];
        visibility?: 'public' | 'unlisted';
      },
    ): Promise<UserStoreShare> {
      return app.userStore.updateShare(shareId, input);
    },

    async revokeUserStoreShare(shareId: string): Promise<void> {
      await app.userStore.revokeShare(shareId);
    },

    async refreshUserStoreShareToken(shareId: string): Promise<UserStoreShare> {
      return app.userStore.refreshShare(shareId);
    },

    // ── Anonymous public view (open-api) ───────────────────────────────────
    async getPublicUserStore(shareToken: string): Promise<PublicUserStoreView> {
      const view = await open.getPublicUserStore(shareToken);
      return {
        shareToken: view.shareToken,
        title: view.title,
        ...(view.description === undefined ? {} : { description: view.description }),
        scope: 'all',
        categories: view.categories ?? [],
      };
    },

    async listPublicUserStoreItems(
      shareToken: string,
      categoryId?: string,
      cursor?: string,
    ): Promise<PublicUserStoreItemPage> {
      if (!categoryId) {
        // The open-api public surface pages items per category; the "全部"
        // tab renders the union by walking the categories of the shared view
        // (same contract as the H5 public share page).
        const view = await open.getPublicUserStore(shareToken);
        const pages = await Promise.all(
          (view.categories ?? []).map((category) =>
            open.listPublicUserStoreItems(shareToken, category.userCategoryId),
          ),
        );
        return {
          items: pages.flatMap((page) =>
            (page.items ?? []).map((card) => toListingCard(card)),
          ),
          hasMore: false,
        };
      }
      const page = await open.listPublicUserStoreItems(
        shareToken,
        categoryId,
        cursor === undefined ? undefined : { cursor },
      );
      return {
        items: (page.items ?? []).map((card) => toListingCard(card)),
        ...pageMeta(page),
      };
    },
  };
}

/** Bind the SDK-backed user store port (called once by the runtime). */
export function configureAppstorePcUserStore(sdkClients: AppstorePcSdkClientInventory): void {
  configureUserStoreServicePort(createUserStoreServicePort(sdkClients));
}
