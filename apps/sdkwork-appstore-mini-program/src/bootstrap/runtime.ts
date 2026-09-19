import { seedRuntimeEnvFromBundle } from "./runtimeBundle";
import { createSdkClients } from "./sdkClients";
import { registerHostAdapters } from "./hostAdapters";
import { createRoutes } from "./routes";

/**
 * Mini program bootstrap: environment selection, host adapters, SDK client
 * construction, route assembly. Mirrors the Flutter and Harmony roots.
 *
 * `appApiBaseUrl` is forwarded into the runtime-env resolution, so a host that
 * already resolved a gateway origin can override the bundled profile value
 * without bypassing `resolveBaseUrl` (`ENVIRONMENT_SPEC.md` §6.3).
 */
export function bootstrapAppstoreMiniProgram(options: {
  appApiBaseUrl?: string;
  accessToken?: string;
} = {}) {
  seedRuntimeEnvFromBundle({ appApiBaseUrl: options.appApiBaseUrl });
  registerHostAdapters();
  const sdkClients = createSdkClients(options.accessToken);
  const routes = createRoutes();
  return { sdkClients, routes };
}
