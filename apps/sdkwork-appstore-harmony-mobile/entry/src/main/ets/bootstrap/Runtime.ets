import common from '@ohos.app.ability.common';

import { createSdkClients, AppstoreAppSdkClients } from './SdkClients';
import { registerHostAdapters } from './HostAdapters';
import { createRoutes, SdkworkUiRouteContribution } from './Routes';
import { createIamRuntime } from './IamRuntime';
import { readEnvironment, AppstoreHarmonyEnvironment } from './Environment';

export interface AppstoreHarmonyRuntime {
  readonly environment: AppstoreHarmonyEnvironment;
  readonly sdkClients: AppstoreAppSdkClients;
  readonly routes: SdkworkUiRouteContribution[];
}

let runtime: AppstoreHarmonyRuntime | null = null;

/** Composition root for the HarmonyOS entry module. */
export function bootstrap(context: common.UIAbilityContext): AppstoreHarmonyRuntime {
  if (runtime !== null) {
    return runtime;
  }
  createIamRuntime(context);
  registerHostAdapters();
  const environment = readEnvironment();
  const sdkClients = createSdkClients(environment);
  const routes = createRoutes();
  runtime = { environment, sdkClients, routes };
  return runtime;
}

export function getRuntime(): AppstoreHarmonyRuntime {
  if (runtime === null) {
    throw new Error('AppstoreHarmonyRuntime must be bootstrapped first');
  }
  return runtime;
}
