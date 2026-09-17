import type { AppstoreAppClient } from "@sdkwork/appstore-mp-core";

import type { WishlistPageResult } from "../types/wishlistModels.js";

/**
 * Wishlist service.
 *
 * The generated App Store app SDK client is injected by the root bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export interface WishlistService {
  readonly capability: "wishlist";
}

export function createWishlistService(client: AppstoreAppClient): WishlistService {
  void client;
  return { capability: "wishlist" };
}

export function emptyWishlistResult(): WishlistPageResult<never> {
  return { items: [] };
}
