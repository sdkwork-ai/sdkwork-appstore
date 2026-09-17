import type { AppstoreAppClient } from "@sdkwork/appstore-mp-core";

import type { AiHubPageResult } from "../types/aiHubModels.js";

/**
 * Ai Hub service.
 *
 * The generated App Store app SDK client is injected by the root bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export interface AiHubService {
  readonly capability: "ai-hub";
}

export function createAiHubService(client: AppstoreAppClient): AiHubService {
  void client;
  return { capability: "ai-hub" };
}

export function emptyAiHubResult(): AiHubPageResult<never> {
  return { items: [] };
}
