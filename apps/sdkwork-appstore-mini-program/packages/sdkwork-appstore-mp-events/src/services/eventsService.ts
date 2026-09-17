import type { AppstoreAppClient } from "@sdkwork/appstore-mp-core";

import type { EventsPageResult } from "../types/eventsModels.js";

/**
 * Events service.
 *
 * The generated App Store app SDK client is injected by the root bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export interface EventsService {
  readonly capability: "events";
}

export function createEventsService(client: AppstoreAppClient): EventsService {
  void client;
  return { capability: "events" };
}

export function emptyEventsResult(): EventsPageResult<never> {
  return { items: [] };
}
