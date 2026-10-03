import {
  createAppStoreClient,
  type AppStoreClient,
  type TokenManager,
} from "@sdkwork/appstore-app-sdk";
import { createTokenManager } from "@sdkwork/sdk-common";

import {
  readAppSdkSessionTokens,
  resolveAppSdkAccessToken,
  resolveAppSdkAuthToken,
  setAppSdkSession,
  type AppstoreMpSession,
} from "../session/session.js";

export type AppstoreAppClient = AppStoreClient;

const APP_API_PREFIX = "/app/v3/api";

let client: AppstoreAppClient | null = null;
let tokenManager: TokenManager | null = null;
let configuredBaseUrl: string | null = null;
let bootstrapAccessToken: string | null = null;

/**
 * Normalize and pin the App Store app-api gateway origin.
 *
 * Accepts the origin with or without the `/app/v3/api` suffix and stores the
 * bare origin: the composed client adds the API prefix per operation path.
 */
export function configureAppstoreAppSdkBaseUrl(baseUrl: string): void {
  const normalized = baseUrl.trim().replace(/\/+$/u, "");
  if (normalized.length === 0) {
    throw new Error("SDKWORK_APPSTORE_APP_API_BASE_URL is required");
  }
  if (normalized.endsWith(APP_API_PREFIX)) {
    configuredBaseUrl = normalized.slice(0, -APP_API_PREFIX.length) || "/";
    return;
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

function resolveSessionTokens(session?: AppstoreMpSession | null): {
  accessToken?: string;
  authToken?: string;
} {
  const current = session ?? readAppSdkSessionTokens();
  return {
    accessToken: resolveAppSdkAccessToken(current),
    authToken: resolveAppSdkAuthToken(current),
  };
}

export function createAppstoreMpAppSdkClient(config: {
  baseUrl: string;
  accessToken?: string;
  authToken?: string;
  platform?: string;
}): AppstoreAppClient {
  configureAppstoreAppSdkBaseUrl(config.baseUrl);
  if (!tokenManager) {
    tokenManager = createTokenManager();
  }
  const tokens = resolveSessionTokens();
  const authToken = config.authToken ?? tokens.authToken ?? bootstrapAccessToken ?? undefined;
  const accessToken = config.accessToken ?? tokens.accessToken ?? undefined;
  if (authToken) {
    tokenManager.setAuthToken(authToken);
  }
  if (accessToken) {
    tokenManager.setAccessToken(accessToken);
  }
  client = createAppStoreClient({
    baseUrl: resolveAppstoreAppSdkBaseUrl(),
    tokenManager,
  });
  return client;
}

export function getAppstoreAppSdkClient(): AppstoreAppClient {
  return client ?? (() => {
    throw new Error("App Store app SDK client is not initialized");
  })();
}

/**
 * Project a session change into the live SDK client.
 *
 * `setAppSdkSession` only updates the in-memory session, which the client
 * reads at construction time. Session changes that arrive after construction
 * (login, logout, relaunch re-seed) must also reach the client's token
 * manager, or every subsequent request keeps the stale token state.
 */
export function syncAppSdkSessionTokens(next: AppstoreMpSession): void {
  setAppSdkSession(next);
  if (!tokenManager) {
    return;
  }
  const authToken = resolveAppSdkAuthToken(next);
  const accessToken = resolveAppSdkAccessToken(next);
  if (authToken) {
    tokenManager.setAuthToken(authToken);
  } else {
    tokenManager.clearAuthToken();
  }
  if (accessToken) {
    tokenManager.setAccessToken(accessToken);
  } else {
    tokenManager.clearAccessToken();
  }
}

export function resetAppstoreAppSdkClient(): void {
  client = null;
  tokenManager = null;
  bootstrapAccessToken = null;
}
