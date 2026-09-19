import {
  APPSTORE_APP_API_BASE_URL_ENV_KEY,
  resolveAppstoreAppApiBaseUrl,
} from "@sdkwork/appstore-mp-core";

import { seedRuntimeEnv } from "./environment";

declare const __SDKWORK_RUNTIME_ENV__: Record<string, string> | undefined;

/** Runtime env key carrying the selected deployment profile id. */
const RUNTIME_ENV_PROFILE_ID_KEY = "SDKWORK_PROFILE_ID";

function readBundledRuntimeEnv(): Record<string, string> {
  return typeof __SDKWORK_RUNTIME_ENV__ === "undefined"
    ? {}
    : __SDKWORK_RUNTIME_ENV__;
}

/**
 * Seed the runtime environment from the build-time bundle.
 *
 * `scripts/build-runtime.mjs` injects `__SDKWORK_RUNTIME_ENV__` from the
 * selected `config/mini-program/runtime-env.<profileId>.json`, so every runtime
 * value has a single configuration owner and no origin is hardcoded in source.
 *
 * The app-api base URL is resolved through `@sdkwork/sdk-common`'s
 * `resolveBaseUrl` (`ENVIRONMENT_SPEC.md` §6.3); a missing configuration fails
 * closed in `configureAppstoreAppSdkBaseUrl` instead of silently pointing at a
 * developer machine.
 */
export function seedRuntimeEnvFromBundle(
  overrides: { appApiBaseUrl?: string } = {},
): void {
  const bundled = readBundledRuntimeEnv();
  seedRuntimeEnv({
    profileId: bundled[RUNTIME_ENV_PROFILE_ID_KEY] ?? "",
    appstoreAppApiBaseUrl: resolveAppstoreAppApiBaseUrl({
      baseUrls: overrides.appApiBaseUrl,
      readEnv: (key) => bundled[key],
    }),
  });
}
