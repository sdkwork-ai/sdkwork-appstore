import type { AppstoreAppClient } from "@sdkwork/appstore-mp-core";

import type { UpdatesPageResult } from "../types/updatesModels.js";

/**
 * Updates service.
 *
 * The generated App Store app SDK client is injected by the root bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export interface UpdatesService {
  readonly capability: "updates";
}

export function createUpdatesService(client: AppstoreAppClient): UpdatesService {
  void client;
  return { capability: "updates" };
}

export function emptyUpdatesResult(): UpdatesPageResult<never> {
  return { items: [] };
}
