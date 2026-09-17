const APP_API_SUFFIX: string = '/app/v3/api';

export interface AppstoreHarmonyEnvironment {
  readonly profileId: string;
  readonly deploymentProfile: string;
  readonly environment: string;
  readonly appstoreAppApiBaseUrl: string;
}

/**
 * Runtime environment for the entry module.
 *
 * Concrete per-environment values materialize from
 * `config/app/runtime-env.<deploymentProfile>.<environment>.json` into the
 * HAP resource layer; this module owns only the typed projection and the
 * base-URL contract.
 */
export function readEnvironment(): AppstoreHarmonyEnvironment {
  const profileId: string = 'standalone.development';
  return {
    profileId,
    deploymentProfile: profileId.split('.')[0],
    environment: profileId.split('.')[1],
    appstoreAppApiBaseUrl: 'http://127.0.0.1:8090/app/v3/api',
  };
}

export function assertAppstoreAppApiBaseUrl(baseUrl: string): string {
  const normalized: string = baseUrl.trim().replace(/\/+$/u, '');
  if (normalized.length === 0) {
    throw new Error('SDKWORK_APPSTORE_APP_API_BASE_URL is required');
  }
  if (!normalized.endsWith(APP_API_SUFFIX)) {
    throw new Error('app-api base URL must end with ' + APP_API_SUFFIX);
  }
  return normalized;
}
