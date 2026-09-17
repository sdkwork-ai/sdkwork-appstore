/**
 * App Store app-api SDK port and factory contract.
 *
 * Authority: `APP_SDK_INTEGRATION_SPEC.md` and
 * `HARMONY_APP_MOBILE_ARCHITECTURE_SPEC.md` section 6.
 *
 * The Harmony root consumes `/app/v3/api` through a generated
 * ArkTS/TypeScript app SDK client adapted for the Harmony runtime. This file
 * owns the injected port contract, base-URL normalization, and the credential
 * resolution boundary; concrete transport construction stays in the root
 * bootstrap.
 *
 * PREREQUISITE: the SDK generation chain emits the TypeScript target of
 * `sdkwork-appstore-app-sdk` only. No ArkTS target exists yet, so this module
 * declares the port and the adapter seam instead of vendoring a transport copy.
 * Feature packages must never fill this gap with raw request APIs or manual
 * auth headers.
 */

const APP_API_SUFFIX: string = '/app/v3/api';

export class AppstoreAppSdkClients {
  readonly appApiBaseUrl: string;
  readonly transportBaseUrl: string;
  readonly platform: string = 'harmony-native';

  constructor(appApiBaseUrl: string, transportBaseUrl: string) {
    this.appApiBaseUrl = appApiBaseUrl;
    this.transportBaseUrl = transportBaseUrl;
  }
}

/** Normalize and validate the App Store app-api base URL. */
export function normalizeAppstoreAppApiBaseUrl(baseUrl: string): string {
  const normalized: string = baseUrl.trim().replace(/\/+$/u, '');
  if (normalized.length === 0) {
    throw new Error('SDKWORK_APPSTORE_APP_API_BASE_URL is required');
  }
  if (!normalized.endsWith(APP_API_SUFFIX)) {
    throw new Error('app-api base URL must end with ' + APP_API_SUFFIX);
  }
  return normalized;
}

/** Transport base URL: the app-api prefix is stripped from the client base. */
export function resolveAppstoreTransportBaseUrl(baseUrl: string): string {
  const normalized: string = normalizeAppstoreAppApiBaseUrl(baseUrl);
  return normalized
    .substring(0, normalized.length - APP_API_SUFFIX.length)
    .replace(/\/+$/u, '');
}

export function createAppstoreHarmonyAppSdkClients(baseUrl: string): AppstoreAppSdkClients {
  const normalized: string = normalizeAppstoreAppApiBaseUrl(baseUrl);
  return new AppstoreAppSdkClients(normalized, resolveAppstoreTransportBaseUrl(normalized));
}
