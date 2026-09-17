import type { AppstoreAppClient } from "@sdkwork/appstore-mp-core";

import type { AppsPageResult } from "../types/appsModels.js";

/**
 * Apps service.
 *
 * The generated App Store app SDK client is injected by the root bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export interface AppsService {
  readonly capability: "apps";
}

export function createAppsService(client: AppstoreAppClient): AppsService {
  void client;
  return { capability: "apps" };
}

export function emptyAppsResult(): AppsPageResult<never> {
  return { items: [] };
}
