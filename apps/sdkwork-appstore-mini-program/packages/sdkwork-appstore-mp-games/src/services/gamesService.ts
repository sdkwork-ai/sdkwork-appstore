import type { AppstoreAppClient } from "@sdkwork/appstore-mp-core";

import type { GamesPageResult } from "../types/gamesModels.js";

/**
 * Games service.
 *
 * The generated App Store app SDK client is injected by the root bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export interface GamesService {
  readonly capability: "games";
}

export function createGamesService(client: AppstoreAppClient): GamesService {
  void client;
  return { capability: "games" };
}

export function emptyGamesResult(): GamesPageResult<never> {
  return { items: [] };
}
