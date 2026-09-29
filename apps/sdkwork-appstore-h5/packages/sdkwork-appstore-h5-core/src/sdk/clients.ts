/**
 * Dependency SDK client inventory for the H5 root.
 *
 * `specs/AGENTS_DEPENDENCY_BOUNDARY_SPEC.md` section 3: only `*-core` packages
 * may import the dependency app SDKs and construct their clients. Capability
 * packages and pages receive the clients through these exports (or service
 * ports bound to them) and never construct one. Every client shares the H5
 * root's single `appstoreTokenManager` instance, which the application root
 * passes in — this package never owns a token store.
 */
import {
  createClient as createAgentsAppClient,
  type SdkworkAppClient as AgentsAppClient,
} from '@sdkwork/agents-app-sdk';
import {
  createClient as createMcpAppClient,
  type SdkworkMcpAppClient as McpAppClient,
} from '@sdkwork/mcp-app-sdk';
import {
  createClient as createSkillsAppClient,
  type SdkworkSkillsAppClient as SkillsAppClient,
} from '@sdkwork/skills-app-sdk';
import type { AuthTokenManager } from '@sdkwork/sdk-common';

export type { AgentsAppClient, McpAppClient, SkillsAppClient };

/** Base URLs consumed when constructing the dependency app clients. */
export interface AppstoreH5DependencySdkBaseUrls {
  agentsAppApiBaseUrl: string;
  mcpAppApiBaseUrl: string;
  skillsAppApiBaseUrl: string;
}

export function createAppstoreH5AgentsClient(
  config: AppstoreH5DependencySdkBaseUrls,
  tokenManager: AuthTokenManager,
): AgentsAppClient {
  return createAgentsAppClient({
    authMode: 'dual-token',
    baseUrl: normalizeGeneratedSdkBaseUrl(config.agentsAppApiBaseUrl, '/app/v3/api'),
    platform: 'h5',
    tokenManager,
  });
}

export function createAppstoreH5SkillsClient(
  config: AppstoreH5DependencySdkBaseUrls,
  tokenManager: AuthTokenManager,
): SkillsAppClient {
  return createSkillsAppClient({
    authMode: 'dual-token',
    baseUrl: normalizeGeneratedSdkBaseUrl(config.skillsAppApiBaseUrl, '/app/v3/api'),
    platform: 'h5',
    tokenManager,
  });
}

export function createAppstoreH5McpClient(
  config: AppstoreH5DependencySdkBaseUrls,
  tokenManager: AuthTokenManager,
): McpAppClient {
  return createMcpAppClient({
    authMode: 'dual-token',
    baseUrl: normalizeGeneratedSdkBaseUrl(config.mcpAppApiBaseUrl, '/app/v3/api'),
    platform: 'h5',
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
