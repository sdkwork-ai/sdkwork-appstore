import { seedRuntimeEnv } from "./environment";

declare const __SDKWORK_RUNTIME_ENV__: Record<string, string> | undefined;

const fallback: Record<string, string> = {
  SDKWORK_PROFILE_ID: "standalone.development",
  SDKWORK_APPSTORE_APP_API_BASE_URL: "http://127.0.0.1:8090/app/v3/api",
};

/**
 * Seed the runtime environment from the build-time bundle.
 *
 * `scripts/build-runtime.mjs` injects `__SDKWORK_RUNTIME_ENV__` from the
 * selected `config/mini-program/runtime-env.<profile>.<environment>.json`.
 */
export function seedRuntimeEnvFromBundle(): void {
  const source =
    typeof __SDKWORK_RUNTIME_ENV__ === "undefined"
      ? fallback
      : __SDKWORK_RUNTIME_ENV__;
  seedRuntimeEnv({
    profileId: source.SDKWORK_PROFILE_ID,
    appstoreAppApiBaseUrl: source.SDKWORK_APPSTORE_APP_API_BASE_URL,
  });
}
