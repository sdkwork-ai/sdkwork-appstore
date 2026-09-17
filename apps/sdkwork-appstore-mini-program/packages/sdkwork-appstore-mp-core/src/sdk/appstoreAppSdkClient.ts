import {
  createClient,
  type SdkworkAppClient as GeneratedAppstoreAppClient,
  type SdkworkAppConfig,
} from "@sdkwork/appstore-app-sdk";

import {
  readAppSdkSessionTokens,
  resolveAppSdkAccessToken,
  resolveAppSdkAuthToken,
  type AppstoreMpSession,
} from "../session/session.js";

export type AppstoreAppClient = GeneratedAppstoreAppClient;
export type AppstoreAppClientConfig = SdkworkAppConfig;

let client: AppstoreAppClient | null = null;
let configuredBaseUrl: string | null = null;
let bootstrapAccessToken: string | null = null;

/** Normalize and pin the App Store app-api base URL. */
export function configureAppstoreAppSdkBaseUrl(baseUrl: string): void {
  const normalized = baseUrl.trim().replace(/\/+$/u, "");
  if (normalized.length === 0) {
    throw new Error("SDKWORK_APPSTORE_APP_API_BASE_URL is required");
  }
  if (!normalized.endsWith("/app/v3/api")) {
    throw new Error(
      `app-api base URL must end with /app/v3/api: ${normalized}`,
    );
  }
  configuredBaseUrl = normalized;
}

export function configureAppstoreAppSdkBootstrapAccessToken(
  accessToken?: string,
): void {
  const normalized = accessToken?.trim();
  bootstrapAccessToken = normalized && normalized.length > 0 ? normalized : null;
}

export function resolveAppstoreAppSdkBaseUrl(): string {
  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }
  throw new Error(
    "SDKWORK_APPSTORE_APP_API_BASE_URL must be configured before SDK bootstrap",
  );
}

export function createAppstoreAppSdkClientConfig(
  session?: AppstoreMpSession | null,
): AppstoreAppClientConfig {
  const current = session ?? readAppSdkSessionTokens();
  return {
    baseUrl: resolveAppstoreAppSdkBaseUrl(),
    accessToken:
      resolveAppSdkAccessToken(current) ?? bootstrapAccessToken ?? undefined,
    authToken: resolveAppSdkAuthToken(current),
    platform: "mini-program",
  };
}

export function createAppstoreMpAppSdkClient(config: {
  baseUrl: string;
  accessToken?: string;
  authToken?: string;
  platform?: string;
}): AppstoreAppClient {
  configureAppstoreAppSdkBaseUrl(config.baseUrl);
  client = createClient({
    baseUrl: resolveAppstoreAppSdkBaseUrl(),
    accessToken: config.accessToken,
    authToken: config.authToken,
    platform: config.platform ?? "mini-program",
  });
  return client;
}

export function getAppstoreAppSdkClient(): AppstoreAppClient {
  return client ?? (() => {
    throw new Error("App Store app SDK client is not initialized");
  })();
}

export function resetAppstoreAppSdkClient(): void {
  client = null;
  bootstrapAccessToken = null;
}
