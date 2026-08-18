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
import { createAppstorePcSessionTokenManager } from './sessionTokenManager';
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

export function createAppstorePcRuntime(
  config = resolveAppstorePcRuntimeConfig(),
): AppstorePcRuntime {
  const session = createAppstorePcSessionStore(
    typeof window === 'undefined' ? undefined : window.sessionStorage,
  );
  const tokenManager = createAppstorePcSessionTokenManager(session);
  const sdkClients = createAppstorePcSdkClients(config, tokenManager);
  const iamRuntime = createAppstorePcIamRuntime({
    config,
    sdkClients,
    session,
    tokenManager,
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
