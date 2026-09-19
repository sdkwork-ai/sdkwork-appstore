import { resolveBaseUrl } from "@sdkwork/sdk-common";

/**
 * Runtime env key carrying the App Store app-api base-url candidates.
 *
 * Candidates are owned by `config/mini-program/runtime-env.<profileId>.json` and
 * reach the runtime through `__SDKWORK_RUNTIME_ENV__`; no origin is hardcoded in
 * source (`ENVIRONMENT_SPEC.md` §6.3).
 */
export const APPSTORE_APP_API_BASE_URL_ENV_KEY =
  "SDKWORK_APPSTORE_APP_API_BASE_URL";

/**
 * Resolve the App Store app-api base URL for the mini-program runtime.
 *
 * `ENVIRONMENT_SPEC.md` §6.3 requires every base-url read to go through the
 * shared `resolveBaseUrl` family from `@sdkwork/sdk-common` so host, environment
 * label, deployment mode, and page protocol are resolved by one implementation.
 *
 * A mini program has no `window.location`, so the resolver runs in its
 * non-browser mode: the absent page host is classified as the local development
 * environment, the host-match passes cannot fire, and the configured candidate
 * is selected directly. `preservePath` keeps the `/app/v3/api` suffix that
 * `@sdkwork/appstore-app-sdk` requires.
 */
export function resolveAppstoreAppApiBaseUrl(options: {
  /** Explicit candidate override; when omitted the runtime env key is read. */
  baseUrls?: string;
  /** Runtime env accessor; defaults to the shared `readRuntimeEnv`. */
  readEnv?: (key: string) => string | undefined;
} = {}): string {
  return resolveBaseUrl({
    baseUrls: options.baseUrls,
    envKey: APPSTORE_APP_API_BASE_URL_ENV_KEY,
    readEnv: options.readEnv,
    preservePath: true,
  }).url;
}
