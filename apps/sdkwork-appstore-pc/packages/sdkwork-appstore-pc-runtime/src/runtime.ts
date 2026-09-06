import type { AuthTokenManager } from '@sdkwork/sdk-common';
import type { CreateSdkworkSessionAuthUnauthorizedIntegrationOptions } from '@sdkwork/auth-runtime-pc-react';

import {
  resolveAppstorePcRuntimeConfig,
  type AppstorePcRuntimeConfig,
} from './environment';
import { createAppstorePcIamRuntime, type AppstorePcIamRuntime } from './iamRuntime';
import {
  createAppstorePcSdkClients,
  type AppstorePcSdkClientInventory,
} from './sdkClients';
import { createAppstorePcSessionStore, type AppstorePcSessionStore } from './sessionStore';
import {
  createAppstorePcSessionTokenManager,
  hydrateAppstorePcSessionTokenManager,
} from './sessionTokenManager';
import { configureAppstorePcAdminMonitorRuntime } from './adminMonitor';
import { configureAppstorePcAIHub } from './aiHub';
import { configureAppstorePcAppStore } from './appStore';
import { configureAppstorePcConsole } from './console';
import { configureAppstorePcInstall } from './install';
import { configureAppstorePcMcp } from './mcp';
import { configureAppstorePcPlugins } from './plugins';
import { configureAppstorePcSkills } from './skills';
import { configureAppstorePcTemplates } from './templates';

export interface AppstorePcRuntime {
  config: AppstorePcRuntimeConfig;
  iamRuntime: AppstorePcIamRuntime;
  sdkClients: AppstorePcSdkClientInventory;
  session: AppstorePcSessionStore;
}

export interface CreateAppstorePcRuntimeOptions {
  /**
   * Token manager shared with the embedding application. Host-managed surfaces
   * pass the host's instance so every SDK client uses exactly one TokenManager
   * (APP_SDK_INTEGRATION_SPEC closure rule); standalone runtimes omit it and
   * the runtime mints its own session-backed instance.
   */
  tokenManager?: AuthTokenManager;
  /**
   * Session-auth boundary policy for every SDK client (`iamRuntime.ts`).
   * Standalone runtimes omit it: an unauthorized response redirects the window
   * to the sign-in route, which the standalone app owns. Embedded surfaces
   * pass `shouldRedirectOnUnauthorized: () => false` — the window belongs to
   * the embedding application, so a 401 must never navigate it away; the
   * embedded AuthGate owns the sign-in flow at the route level instead.
   */
  sessionAuth?: boolean | CreateSdkworkSessionAuthUnauthorizedIntegrationOptions;
}

export function createAppstorePcRuntime(
  config = resolveAppstorePcRuntimeConfig(),
  options: CreateAppstorePcRuntimeOptions = {},
): AppstorePcRuntime {
  const session = createAppstorePcSessionStore(
    typeof window === 'undefined' ? undefined : window.sessionStorage,
  );
  if (options.tokenManager) {
    // One TokenManager for every SDK client (APP_SDK_INTEGRATION_SPEC closure
    // rule): bind the host's instance and mirror session-store tokens into it.
    hydrateAppstorePcSessionTokenManager(options.tokenManager, session);
  }
  const tokenManager = options.tokenManager ?? createAppstorePcSessionTokenManager(session);
  const sdkClients = createAppstorePcSdkClients(config, tokenManager);
  const iamRuntime = createAppstorePcIamRuntime({
    config,
    sdkClients,
    session,
    tokenManager,
    ...(options.sessionAuth === undefined ? {} : { sessionAuth: options.sessionAuth }),
  });
  configureAppstorePcAIHub(sdkClients.agents, sdkClients.app, config.aiPreviewAgentId);
  configureAppstorePcSkills(sdkClients.skills);
  configureAppstorePcMcp(sdkClients.mcp);
  configureAppstorePcAppStore(sdkClients.app, sdkClients.comments);
  configureAppstorePcTemplates(sdkClients.app);
  configureAppstorePcPlugins(sdkClients.app);
  configureAppstorePcConsole(sdkClients.app);
  configureAppstorePcInstall(sdkClients.app);
  configureAppstorePcAdminMonitorRuntime(config, tokenManager);

  return { config, iamRuntime, sdkClients, session };
}
