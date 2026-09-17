import type { AppstoreAppClient } from "@sdkwork/appstore-mp-core";

import type { SearchPageResult } from "../types/searchModels.js";

/**
 * Search service.
 *
 * The generated App Store app SDK client is injected by the root bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export interface SearchService {
  readonly capability: "search";
}

export function createSearchService(client: AppstoreAppClient): SearchService {
  void client;
  return { capability: "search" };
}

export function emptySearchResult(): SearchPageResult<never> {
  return { items: [] };
}
