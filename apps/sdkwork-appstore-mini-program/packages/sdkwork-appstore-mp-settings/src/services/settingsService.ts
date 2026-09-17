import type { AppstoreAppClient } from "@sdkwork/appstore-mp-core";

import type { SettingsPageResult } from "../types/settingsModels.js";

/**
 * Settings service.
 *
 * The generated App Store app SDK client is injected by the root bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export interface SettingsService {
  readonly capability: "settings";
}

export function createSettingsService(client: AppstoreAppClient): SettingsService {
  void client;
  return { capability: "settings" };
}

export function emptySettingsResult(): SettingsPageResult<never> {
  return { items: [] };
}
