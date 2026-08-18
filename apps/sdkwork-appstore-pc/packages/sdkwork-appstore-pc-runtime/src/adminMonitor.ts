import {
  configureAppstorePcAdminMonitor,
  createAppstorePcAdminBackendClient,
} from '@sdkwork/appstore-pc-admin-core';
import type { AuthTokenManager } from '@sdkwork/sdk-common';

import type { AppstorePcRuntimeConfig } from './environment';

/**
 * Wires the backend-admin monitor surface. The backend SDK client is created
 * inside the `sdkwork-appstore-pc-admin-core` backend-admin boundary; this
 * bootstrap only invokes the approved factory and configuration entrypoints.
 */
export function configureAppstorePcAdminMonitorRuntime(
  config: AppstorePcRuntimeConfig,
  tokenManager: AuthTokenManager,
): void {
  const backendClient = createAppstorePcAdminBackendClient({
    baseUrl: config.backendApiBaseUrl,
    tokenManager,
  });
  configureAppstorePcAdminMonitor(backendClient);
}
