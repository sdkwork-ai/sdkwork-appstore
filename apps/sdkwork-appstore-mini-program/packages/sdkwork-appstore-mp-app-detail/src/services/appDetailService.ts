import type { AppstoreAppClient } from "@sdkwork/appstore-mp-core";

import type { AppDetailPageResult } from "../types/appDetailModels.js";

/**
 * App Detail service.
 *
 * The generated App Store app SDK client is injected by the root bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export interface AppDetailService {
  readonly capability: "app-detail";
}

export function createAppDetailService(client: AppstoreAppClient): AppDetailService {
  void client;
  return { capability: "app-detail" };
}

export function emptyAppDetailResult(): AppDetailPageResult<never> {
  return { items: [] };
}
