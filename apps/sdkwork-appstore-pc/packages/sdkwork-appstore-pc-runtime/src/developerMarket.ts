import { configureAppstorePcDeveloperMarket } from '@sdkwork/appstore-pc-developer-market/runtime';
import { createAppstorePcDocumentsAppClient } from '@sdkwork/appstore-pc-core';
import type { AuthTokenManager } from '@sdkwork/sdk-common';

/**
 * Bind the developer-market documents reference runtime (API market / SDK
 * market). The storefront's developer-market routes read the bound runtime,
 * and its documents app SDK client shares the App Store's single TokenManager.
 *
 * The catalog roster and OpenAPI documents live in the documents database and
 * are read through that documents client, so the reference surfaces never fetch
 * static gateway JSON.
 */
export function configureAppstorePcDeveloperMarketSurface(config: {
  baseUrl: string;
  tokenManager: AuthTokenManager;
  locale: string;
}): void {
  configureAppstorePcDeveloperMarket({
    baseUrl: config.baseUrl,
    documentsAppClient: createAppstorePcDocumentsAppClient(
      { appApiBaseUrl: config.baseUrl },
      config.tokenManager,
      config.locale,
    ),
  });
}
