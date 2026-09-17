import type { AppstoreAppClient } from "@sdkwork/appstore-mp-core";

import type { LibraryPageResult } from "../types/libraryModels.js";

/**
 * Library service.
 *
 * The generated App Store app SDK client is injected by the root bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export interface LibraryService {
  readonly capability: "library";
}

export function createLibraryService(client: AppstoreAppClient): LibraryService {
  void client;
  return { capability: "library" };
}

export function emptyLibraryResult(): LibraryPageResult<never> {
  return { items: [] };
}
