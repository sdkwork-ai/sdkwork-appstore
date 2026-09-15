import {
  configureAppstorePcAdminRuntime as bindAppstoreAdminServicePorts,
  createAppstorePcAdminBackendClient,
  type AppstoreAdminServicePorts,
} from '@sdkwork/appstore-pc-admin-core';
import type { AuthTokenManager } from '@sdkwork/sdk-common';

import type { AppstorePcRuntimeConfig } from './environment';

/**
 * Wire the App Store `backend-admin` surface during runtime bootstrap.
 *
 * `APP_PC_ARCHITECTURE_SPEC.md` §7 and `BACKEND_UI_SPEC.md` §6 keep the
 * generated backend SDK behind the backend-admin package boundary: this
 * bootstrap only invokes `pc-admin-core`'s approved client factory and runtime
 * entrypoint, and never imports `@sdkwork/appstore-backend-sdk` itself.
 *
 * The admin surface shares the host's single TokenManager so operator requests
 * carry the same credentials as every other SDK client
 * (`APP_SDK_INTEGRATION_SPEC.md` closure rule).
 *
 * @param config - resolved runtime config supplying `backendApiBaseUrl`.
 * @param tokenManager - the TokenManager shared by every SDK client.
 * @returns the bound backend-admin service ports, for hosts that hold them.
 */
export function configureAppstorePcAdminRuntime(
  config: AppstorePcRuntimeConfig,
  tokenManager: AuthTokenManager,
): AppstoreAdminServicePorts {
  const backendClient = createAppstorePcAdminBackendClient({
    baseUrl: config.backendApiBaseUrl,
    tokenManager,
  });
  return bindAppstoreAdminServicePorts(backendClient);
}
