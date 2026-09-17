import { seedRuntimeEnvFromBundle } from "./runtimeBundle";
import { createSdkClients } from "./sdkClients";
import { registerHostAdapters } from "./hostAdapters";
import { createRoutes } from "./routes";

/**
 * Mini program bootstrap: environment selection, host adapters, SDK client
 * construction, route assembly. Mirrors the Flutter and Harmony roots.
 */
export function bootstrapAppstoreMiniProgram(options: {
  appApiBaseUrl?: string;
  accessToken?: string;
} = {}) {
  seedRuntimeEnvFromBundle();
  registerHostAdapters();
  const sdkClients = createSdkClients(options.accessToken);
  const routes = createRoutes();
  return { sdkClients, routes };
}
