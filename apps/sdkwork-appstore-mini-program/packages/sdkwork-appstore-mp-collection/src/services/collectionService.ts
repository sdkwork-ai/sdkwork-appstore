import type { AppstoreAppClient } from "@sdkwork/appstore-mp-core";

import type { CollectionPageResult } from "../types/collectionModels.js";

/**
 * Collection service.
 *
 * The generated App Store app SDK client is injected by the root bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export interface CollectionService {
  readonly capability: "collection";
}

export function createCollectionService(client: AppstoreAppClient): CollectionService {
  void client;
  return { capability: "collection" };
}

export function emptyCollectionResult(): CollectionPageResult<never> {
  return { items: [] };
}
