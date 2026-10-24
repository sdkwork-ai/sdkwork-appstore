import {
  configureAppstorePcAdminRuntime as bindAppstoreAdminServicePorts,
  createAppstorePcAdminBackendClient,
  createAppstorePcAdminCompanyBackendClient,
  type AppstoreAdminServicePorts,
} from '@sdkwork/appstore-pc-admin-core';
import type { AuthTokenManager } from '@sdkwork/sdk-common';

import type { AppstorePcRuntimeConfig } from './environment';

/**
 * Wire the App Store `backend-admin` surface during runtime bootstrap.
 *
 * `APP_PC_ARCHITECTURE_SPEC.md` §7 and `BACKEND_UI_SPEC.md` §6 keep the
 * generated backend SDKs behind the backend-admin package boundary: this
 * bootstrap only invokes `pc-admin-core`'s approved client factories and
 * runtime entrypoint, and never imports either generated SDK itself. Demand
 * data belongs to the `sdkwork-company` domain, so its client is built from
 * that domain's backend origin while the App Store console keeps its own.
 *
 * The admin surface shares the host's single TokenManager so operator requests
 * carry the same credentials as every other SDK client
 * (`APP_SDK_INTEGRATION_SPEC.md` closure rule).
 *
 * @param config - resolved runtime config supplying the backend base URLs.
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
  const companyBackendClient = createAppstorePcAdminCompanyBackendClient({
    baseUrl: config.companyBackendApiBaseUrl,
    tokenManager,
  });
  return bindAppstoreAdminServicePorts(backendClient, companyBackendClient);
}
