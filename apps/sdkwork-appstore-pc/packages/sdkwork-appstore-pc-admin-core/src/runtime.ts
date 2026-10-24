import type { SdkworkAppstoreBackendClient } from '@sdkwork/appstore-backend-sdk';
import type { SdkworkBackendClient as SdkworkCompanyBackendClient } from '@sdkwork/company-backend-sdk';

import {
  configureAppstoreAdminServicePorts,
  createAppstoreAdminServicePorts,
  type AppstoreAdminServicePorts,
} from './services/registry';

/**
 * Bind the App Store backend-admin runtime.
 *
 * Bootstrap code inside the host product owns credential resolution and calls
 * `createAppstorePcAdminBackendClient` / `createAppstorePcAdminCompanyBackendClient`
 * from this package (`./sdk`) to build the generated clients; this entrypoint
 * turns them into the service ports every `pc-admin-*` capability package
 * consumes. Demand data is owned by the company domain, so that domain's client
 * is required for the demand capability module.
 *
 * @param backendClient - App Store backend client bound to a TokenManager.
 * @param companyBackendClient - company backend client bound to the same TokenManager.
 * @returns the bound ports, so a host may also hold them directly.
 */
export function configureAppstorePcAdminRuntime(
  backendClient: SdkworkAppstoreBackendClient,
  companyBackendClient: SdkworkCompanyBackendClient,
): AppstoreAdminServicePorts {
  const ports = createAppstoreAdminServicePorts(backendClient, companyBackendClient);
  configureAppstoreAdminServicePorts(ports);
  return ports;
}

/**
 * Return the backend-admin runtime to its unconfigured state.
 * Used by host teardown and tests so a stale client is never reused.
 */
export function resetAppstorePcAdminRuntime(): void {
  configureAppstoreAdminServicePorts(undefined);
}
