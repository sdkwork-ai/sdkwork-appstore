/**
 * AI Lab dependency clients (agents / skills / mcp) for the H5 root.
 *
 * Construction happens in `@sdkwork/appstore-h5-core` (the only package allowed
 * to import the dependency app SDKs, `specs/AGENTS_DEPENDENCY_BOUNDARY_SPEC.md`
 * section 3); this module only binds the H5 root's single token manager and
 * gateway origin, and hands the clients to pages through hooks/services.
 */
import {
  createAppstoreH5AgentsClient,
  createAppstoreH5McpClient,
  createAppstoreH5SkillsClient,
  type AgentsAppClient,
  type McpAppClient,
  type SkillsAppClient,
} from '@sdkwork/appstore-h5-core/sdk';
import { appstoreTokenManager } from '@/bootstrap/iamRuntime';
import { getEnvironment } from '@/bootstrap/environment';

let agentsClient: AgentsAppClient | null = null;
let skillsClient: SkillsAppClient | null = null;
let mcpClient: McpAppClient | null = null;

export function getAgentsClient(): AgentsAppClient {
  if (!agentsClient) {
    const env = getEnvironment();
    agentsClient = createAppstoreH5AgentsClient(
      {
        agentsAppApiBaseUrl:
          import.meta.env.VITE_AGENTS_API_URL || env.appbaseBaseUrl,
        mcpAppApiBaseUrl: env.appbaseBaseUrl,
        skillsAppApiBaseUrl: env.appbaseBaseUrl,
      },
      appstoreTokenManager,
    );
  }
  return agentsClient;
}

export function getSkillsClient(): SkillsAppClient {
  if (!skillsClient) {
    const env = getEnvironment();
    skillsClient = createAppstoreH5SkillsClient(
      {
        agentsAppApiBaseUrl: env.appbaseBaseUrl,
        mcpAppApiBaseUrl: env.appbaseBaseUrl,
        skillsAppApiBaseUrl:
          import.meta.env.VITE_SKILLS_API_URL || env.appbaseBaseUrl,
      },
      appstoreTokenManager,
    );
  }
  return skillsClient;
}

export function getMcpClient(): McpAppClient {
  if (!mcpClient) {
    const env = getEnvironment();
    mcpClient = createAppstoreH5McpClient(
      {
        agentsAppApiBaseUrl: env.appbaseBaseUrl,
        mcpAppApiBaseUrl: import.meta.env.VITE_MCP_API_URL || env.appbaseBaseUrl,
        skillsAppApiBaseUrl: env.appbaseBaseUrl,
      },
      appstoreTokenManager,
    );
  }
  return mcpClient;
}

/** Agents preview agent bound to the AI sandbox (empty when unconfigured). */
export function getAiPreviewAgentId(): string {
  return import.meta.env.VITE_AI_PREVIEW_AGENT_ID?.trim() ?? '';
}
