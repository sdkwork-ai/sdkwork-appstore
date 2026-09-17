import type { AppstoreAppClient } from "@sdkwork/appstore-mp-core";

import type { ChartsPageResult } from "../types/chartsModels.js";

/**
 * Charts service.
 *
 * The generated App Store app SDK client is injected by the root bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export interface ChartsService {
  readonly capability: "charts";
}

export function createChartsService(client: AppstoreAppClient): ChartsService {
  void client;
  return { capability: "charts" };
}

export function emptyChartsResult(): ChartsPageResult<never> {
  return { items: [] };
}
