import type { McpServerItem } from '../types';

export interface McpToolExecutionResult {
  latencyMs: number;
  output: string;
  success: boolean;
}

/**
 * One category of the MCP connector registry.
 *
 * The catalog's chips come from the MCP module's own category registry rather
 * than from the codes present in the current page, so a registry category with
 * no connector filed under it stays a real (empty-state) filter and retired
 * categories do not appear.
 */
export interface McpCategoryOption {
  /** Category code the MCP server records are filed under. */
  code: string;
  /** Operator-facing category name. */
  name: string;
  /** Registry ordering weight; smaller sorts first. */
  sortWeight: number;
}

export interface IMcpSDK {
  addMcpServer(serverData: Partial<McpServerItem>): Promise<McpServerItem>;
  executeMcpTool(
    serverId: string,
    toolName: string,
    argsJson?: string,
  ): Promise<McpToolExecutionResult>;
  getMcpCategories(): Promise<McpCategoryOption[]>;
  getMcpConfigSnippet(serverId: string): Promise<string>;
  getMcpServers(query?: string): Promise<McpServerItem[]>;
  toggleConnectServer(
    id: string,
  ): Promise<{ connected: boolean; status: McpServerItem['status'] }>;
}

export type McpServicePort = IMcpSDK;

let mcpPort: McpServicePort = createUnconfiguredMcpPort();

export function configureMcpServicePort(port: McpServicePort): void {
  mcpPort = port;
}

export const McpService: IMcpSDK = {
  addMcpServer: (serverData) => mcpPort.addMcpServer(serverData),
  executeMcpTool: (serverId, toolName, argsJson = '{}') =>
    mcpPort.executeMcpTool(serverId, toolName, argsJson),
  getMcpCategories: () => mcpPort.getMcpCategories(),
  getMcpConfigSnippet: (serverId) => mcpPort.getMcpConfigSnippet(serverId),
  getMcpServers: (query = '') => mcpPort.getMcpServers(query),
  toggleConnectServer: (id) => mcpPort.toggleConnectServer(id),
};

function createUnconfiguredMcpPort(): McpServicePort {
  const unavailable = (): never => {
    throw new Error('The MCP app SDK runtime is not configured.');
  };
  return {
    addMcpServer: async () => unavailable(),
    executeMcpTool: async () => unavailable(),
    getMcpCategories: async () => unavailable(),
    getMcpConfigSnippet: async () => unavailable(),
    getMcpServers: async () => unavailable(),
    toggleConnectServer: async () => unavailable(),
  };
}
