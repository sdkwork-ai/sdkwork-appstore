import type { AppstoreAppClient } from "@sdkwork/appstore-mp-core";

import type { DiscoverPageResult } from "../types/discoverModels.js";

/**
 * Discover service.
 *
 * The generated App Store app SDK client is injected by the root bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export interface DiscoverService {
  readonly capability: "discover";
}

export function createDiscoverService(client: AppstoreAppClient): DiscoverService {
  void client;
  return { capability: "discover" };
}

export function emptyDiscoverResult(): DiscoverPageResult<never> {
  return { items: [] };
}
