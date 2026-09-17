import { createAppstoreMpAppSdkClient } from "@sdkwork/appstore-mp-core";

import { readRuntimeEnv } from "./environment";

/**
 * Construct the generated App Store app SDK client.
 *
 * Authority: `APP_SDK_INTEGRATION_SPEC.md`. Feature packages receive this
 * client by injection and never construct one themselves.
 */
export function createSdkClients(accessToken?: string) {
  const env = readRuntimeEnv();
  return createAppstoreMpAppSdkClient({
    baseUrl: env.appstoreAppApiBaseUrl,
    accessToken,
    platform: "mini-program",
  });
}
