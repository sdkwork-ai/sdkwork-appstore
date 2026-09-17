import type { AppstoreAppClient } from "@sdkwork/appstore-mp-core";

import type { PublisherPageResult } from "../types/publisherModels.js";

/**
 * Publisher service.
 *
 * The generated App Store app SDK client is injected by the root bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export interface PublisherService {
  readonly capability: "publisher";
}

export function createPublisherService(client: AppstoreAppClient): PublisherService {
  void client;
  return { capability: "publisher" };
}

export function emptyPublisherResult(): PublisherPageResult<never> {
  return { items: [] };
}
