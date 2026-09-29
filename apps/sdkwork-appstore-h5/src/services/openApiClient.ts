import { createAppStoreOpenClient, type AppStoreOpenClient } from '@sdkwork/appstore-sdk';
import { getEnvironment } from '@/bootstrap/environment';

let client: AppStoreOpenClient | null = null;

export function getOpenApiClient(): AppStoreOpenClient {
  if (!client) {
    const env = getEnvironment();
    client = createAppStoreOpenClient({
      baseUrl: import.meta.env.VITE_APPSTORE_OPEN_API_URL || env.appstoreOpenApiBaseUrl,
    });
  }
  return client;
}

export function resetOpenApiClient(): void {
  client = null;
}
