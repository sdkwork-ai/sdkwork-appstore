import {
  createAppStoreClient,
  type AppStoreClient,
} from '@sdkwork/appstore-app-sdk';
import {
  createClient as createCommentsAppClient,
  type SdkworkAppClient as CommentsAppClient,
} from '@sdkwork/comments-app-sdk';
import {
  createClient as createAgentsAppClient,
  type SdkworkAppClient as AgentsAppClient,
  type AgentRuntimeExecutionRecord,
} from '@sdkwork/agents-app-sdk';
import {
  createClient as createMcpAppClient,
  type SdkworkMcpAppClient as McpAppClient,
  type McpServerRecord,
} from '@sdkwork/mcp-app-sdk';
import {
  createClient as createSkillsAppClient,
  type SdkworkSkillsAppClient as SkillsAppClient,
  type SkillArtifactRecord,
  type SkillInstallationRecord,
  type SkillRecord,
} from '@sdkwork/skills-app-sdk';
import { createClient as createIamAppClient, type SdkworkAppClient } from '@sdkwork/iam-app-sdk';
import type { AuthTokenManager } from '@sdkwork/sdk-common';

export type {
  AgentRuntimeExecutionRecord,
  AgentsAppClient,
  AppStoreClient,
  CommentsAppClient,
  McpAppClient,
  McpServerRecord,
  SkillArtifactRecord,
  SkillInstallationRecord,
  SkillRecord,
  SkillsAppClient,
  SdkworkAppClient as AppstorePcIamAppClient,
};

export interface AppstorePcSdkClientInventory {
  agents: AgentsAppClient;
  app: AppStoreClient;
  comments: CommentsAppClient;
  mcp: McpAppClient;
  sdkFamilies: {
    app: readonly string[];
  };
  skills: SkillsAppClient;
}

/** SDK base URLs consumed when constructing the generated app clients. */
export interface AppstorePcSdkBaseUrls {
  agentsAppApiBaseUrl: string;
  appApiBaseUrl: string;
  commentsAppApiBaseUrl: string;
  iamAppApiBaseUrl: string;
  mcpAppApiBaseUrl: string;
  skillsAppApiBaseUrl: string;
}

export function createAppstorePcSdkClients(
  config: AppstorePcSdkBaseUrls,
  tokenManager: AuthTokenManager,
): AppstorePcSdkClientInventory {
  const app = createAppStoreClient({
    authMode: 'dual-token',
    baseUrl: normalizeGeneratedSdkBaseUrl(config.appApiBaseUrl, '/app/v3/api'),
    platform: 'pc',
    tokenManager,
  });
  const comments = createCommentsAppClient({
    authMode: 'dual-token',
    baseUrl: normalizeGeneratedSdkBaseUrl(config.commentsAppApiBaseUrl, '/app/v3/api'),
    platform: 'pc',
    tokenManager,
  });
  const agents = createAgentsAppClient({
    authMode: 'dual-token',
    baseUrl: normalizeGeneratedSdkBaseUrl(config.agentsAppApiBaseUrl, '/app/v3/api'),
    platform: 'pc',
    tokenManager,
  });
  const skills = createSkillsAppClient({
    authMode: 'dual-token',
    baseUrl: normalizeGeneratedSdkBaseUrl(config.skillsAppApiBaseUrl, '/app/v3/api'),
    platform: 'pc',
    tokenManager,
  });
  const mcp = createMcpAppClient({
    authMode: 'dual-token',
    baseUrl: normalizeGeneratedSdkBaseUrl(config.mcpAppApiBaseUrl, '/app/v3/api'),
    platform: 'pc',
    tokenManager,
  });

  return {
    agents,
    app,
    comments,
    mcp,
    sdkFamilies: {
      app: [
        'sdkwork-appstore-app-sdk',
        'sdkwork-iam-app-sdk',
        'sdkwork-agents-app-sdk',
        'sdkwork-skills-app-sdk',
        'sdkwork-mcp-app-sdk',
        'sdkwork-comments-app-sdk',
      ],
    },
    skills,
  };
}

/** IAM app client owned by the app core layer (used by auth runtime wiring). */
export function createAppstorePcIamAppClient(
  config: AppstorePcSdkBaseUrls,
  tokenManager: AuthTokenManager,
): SdkworkAppClient {
  return createIamAppClient({
    authMode: 'dual-token',
    baseUrl: normalizeGeneratedSdkBaseUrl(config.iamAppApiBaseUrl, '/app/v3/api'),
    platform: 'pc',
    tokenManager,
  });
}

export function normalizeGeneratedSdkBaseUrl(baseUrl: string, apiPrefix: string): string {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/u, '');
  const normalizedApiPrefix = apiPrefix.replace(/\/+$/u, '');
  if (!normalizedBaseUrl.endsWith(normalizedApiPrefix)) {
    return normalizedBaseUrl;
  }
  return normalizedBaseUrl.slice(0, -normalizedApiPrefix.length) || '/';
}