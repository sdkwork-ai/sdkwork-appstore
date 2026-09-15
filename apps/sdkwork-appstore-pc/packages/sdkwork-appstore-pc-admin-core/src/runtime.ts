import type { SdkworkAppstoreBackendClient } from '@sdkwork/appstore-backend-sdk';

import {
  configureAppstoreAdminServicePorts,
  createAppstoreAdminServicePorts,
  type AppstoreAdminServicePorts,
} from './services/registry';

/**
 * Bind the App Store backend-admin runtime.
 *
 * Bootstrap code inside the host product owns credential resolution and calls
 * `createAppstorePcAdminBackendClient` from this package (`./sdk`) to build the
 * generated backend client; this entrypoint turns that client into the service
 * ports every `pc-admin-*` capability package consumes.
 *
 * @param backendClient - generated backend client bound to a TokenManager.
 * @returns the bound ports, so a host may also hold them directly.
 */
export function configureAppstorePcAdminRuntime(
  backendClient: SdkworkAppstoreBackendClient,
): AppstoreAdminServicePorts {
  const ports = createAppstoreAdminServicePorts(backendClient);
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
