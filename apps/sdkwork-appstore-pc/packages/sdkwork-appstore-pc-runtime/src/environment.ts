import manifest from '../../../sdkwork.app.config.json';

export type AppstorePcEnvironment = 'development' | 'test' | 'staging' | 'production';
export type AppstorePcDeploymentProfile = 'cloud' | 'standalone';
export type AppstorePcRuntimeTarget = 'browser' | 'desktop';

export interface AppstorePcRuntimeConfig {
  agentsAppApiBaseUrl: string;
  commentsAppApiBaseUrl: string;
  aiPreviewAgentId?: string;
  appApiBaseUrl: string;
  appDisplayName: string;
  appKey: string;
  backendApiBaseUrl: string;
  deploymentProfile: AppstorePcDeploymentProfile;
  environment: AppstorePcEnvironment;
  iamAppApiBaseUrl: string;
  locale: string;
  mcpAppApiBaseUrl: string;
  runtimeTarget: AppstorePcRuntimeTarget;
  skillsAppApiBaseUrl: string;
}

const environmentAliases: Record<string, AppstorePcEnvironment> = {
  dev: 'development',
  development: 'development',
  prod: 'production',
  production: 'production',
  staging: 'staging',
  test: 'test',
};

function readEnv(key: string): string | undefined {
  const value = import.meta.env[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function resolveEnvironment(mode: string): AppstorePcEnvironment {
  return environmentAliases[mode] ?? 'development';
}

export interface AppstorePcRuntimeConfigOverrides {
  agentsAppApiBaseUrl?: string
  commentsAppApiBaseUrl?: string
  appApiBaseUrl?: string
  backendApiBaseUrl?: string
  iamAppApiBaseUrl?: string
  mcpAppApiBaseUrl?: string
  skillsAppApiBaseUrl?: string
  locale?: string
  deploymentProfile?: AppstorePcDeploymentProfile
  runtimeTarget?: AppstorePcRuntimeTarget
  appKey?: string
  appDisplayName?: string
  aiPreviewAgentId?: string
}

export function resolveAppstorePcRuntimeConfig(
  modeOrOverrides: string | AppstorePcRuntimeConfigOverrides = import.meta.env.MODE,
): AppstorePcRuntimeConfig {
  const mode = typeof modeOrOverrides === 'string' ? modeOrOverrides : import.meta.env.MODE
  const overrides = typeof modeOrOverrides === 'string' ? {} : modeOrOverrides
  const environment = resolveEnvironment(readEnv('VITE_SDKWORK_ENVIRONMENT') ?? mode);
  const deploymentProfile =
    readEnv('VITE_SDKWORK_DEPLOYMENT_PROFILE') === 'cloud' ? 'cloud' : 'standalone';
  const runtimeTarget =
    readEnv('VITE_SDKWORK_RUNTIME_TARGET') === 'desktop' ? 'desktop' : 'browser';
  const applicationPublicUrl =
    readEnv('VITE_SDKWORK_APPSTORE_APPLICATION_PUBLIC_HTTP_URL') ??
    readEnv('VITE_SDKWORK_APPSTORE_APP_API_BASE_URL') ??
    resolveBrowserOrigin();
  const platformApiGatewayUrl =
    readEnv('VITE_SDKWORK_APPSTORE_PLATFORM_API_GATEWAY_HTTP_URL') ??
    readEnv('VITE_SDKWORK_IAM_APP_API_BASE_URL') ??
    applicationPublicUrl;

  return {
    agentsAppApiBaseUrl:
      overrides.agentsAppApiBaseUrl ?? readEnv('VITE_SDKWORK_AGENTS_APP_API_BASE_URL') ?? platformApiGatewayUrl,
    aiPreviewAgentId: overrides.aiPreviewAgentId ?? readEnv('VITE_SDKWORK_APPSTORE_AI_PREVIEW_AGENT_ID'),
    commentsAppApiBaseUrl:
      overrides.commentsAppApiBaseUrl ?? readEnv('VITE_SDKWORK_COMMENTS_APP_API_BASE_URL') ?? platformApiGatewayUrl,
    appApiBaseUrl: overrides.appApiBaseUrl ?? applicationPublicUrl,
    appDisplayName: overrides.appDisplayName ?? manifest.app.displayName,
    appKey: overrides.appKey ?? manifest.app.key,
    backendApiBaseUrl:
      overrides.backendApiBaseUrl ?? readEnv('VITE_SDKWORK_APPSTORE_BACKEND_API_BASE_URL') ?? applicationPublicUrl,
    deploymentProfile: overrides.deploymentProfile ?? deploymentProfile,
    environment,
    iamAppApiBaseUrl: overrides.iamAppApiBaseUrl ?? platformApiGatewayUrl,
    locale: overrides.locale ?? readEnv('VITE_SDKWORK_APPSTORE_DEFAULT_LOCALE') ?? 'zh-CN',
    mcpAppApiBaseUrl:
      overrides.mcpAppApiBaseUrl ?? readEnv('VITE_SDKWORK_MCP_APP_API_BASE_URL') ?? platformApiGatewayUrl,
    runtimeTarget: overrides.runtimeTarget ?? runtimeTarget,
    skillsAppApiBaseUrl:
      overrides.skillsAppApiBaseUrl ?? readEnv('VITE_SDKWORK_SKILLS_APP_API_BASE_URL') ?? platformApiGatewayUrl,
  };
}

function resolveBrowserOrigin(): string {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return '/';
}
