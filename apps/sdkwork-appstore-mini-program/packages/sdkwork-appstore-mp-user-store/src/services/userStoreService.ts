import type { AppstoreAppClient } from "@sdkwork/appstore-mp-core";

import type { UserStorePageResult } from "../types/userStoreModels.js";

/**
 * User Store service.
 *
 * The generated App Store app SDK client is injected by the root bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export interface UserStoreService {
  readonly capability: "user-store";
}

export function createUserStoreService(client: AppstoreAppClient): UserStoreService {
  void client;
  return { capability: "user-store" };
}

export function emptyUserStoreResult(): UserStorePageResult<never> {
  return { items: [] };
}
