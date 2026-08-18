import type { McpServerRecord, SdkworkMcpAppClient } from '@sdkwork/mcp-app-sdk';
import {
  configureMcpServicePort,
  type McpServicePort,
} from '@sdkwork/appstore-pc-core';

import type { McpServerItem } from '../types';

const registryPageSize = 48;

export function configureAppstorePcMcp(client: SdkworkMcpAppClient): void {
  configureMcpServicePort(createMcpServicePort(client));
}

export function createMcpServicePort(client: SdkworkMcpAppClient): McpServicePort {
  const serversById = new Map<string, McpServerItem>();

  return {
    async getMcpServers(query = ''): Promise<McpServerItem[]> {
      const response = await client.mcp.listServers({
        page: 1,
        pageSize: registryPageSize,
        q: query.trim() || undefined,
      });
      const servers = readPageItems<McpServerRecord>(response).map(mapMcpServerRecord);
      serversById.clear();
      for (const server of servers) {
        serversById.set(server.id, server);
      }
      return servers;
    },

    async getMcpConfigSnippet(serverId: string): Promise<string> {
      const server = serversById.get(serverId);
      if (!server) {
        throw new Error('The selected MCP server is no longer available.');
      }
      return server.configSnippet;
    },

    async addMcpServer(): Promise<never> {
      throw new Error('MCP server deployment is not exposed by the MCP app SDK.');
    },

    async executeMcpTool(): Promise<never> {
      throw new Error('MCP tool execution is not exposed by the MCP app SDK.');
    },

    async toggleConnectServer(): Promise<never> {
      throw new Error('MCP connect and disconnect are not exposed by the MCP app SDK.');
    },
  };
}

function readPageItems<T>(value: Record<string, unknown>): T[] {
  const items = value.items;
  if (!Array.isArray(items)) {
    throw new Error('The MCP registry returned an invalid paginated response.');
  }
  return items as T[];
}

function mapMcpServerRecord(record: McpServerRecord): McpServerItem {
  return {
    configSnippet: JSON.stringify(
      {
        notice: 'Connection configuration is not exposed by the MCP app API.',
        serverKey: record.server_key,
        transport: record.transport,
      },
      null,
      2,
    ),
    connected: false,
    description: record.description ?? '',
    icon: 'Server',
    iconColor: 'bg-cyan-600',
    id: record.id,
    name: record.name,
    protocolVersion: 'MCP',
    publisher: record.category_code ?? 'SDKWork MCP',
    resourcesProvided: [],
    status: mapMcpStatus(record),
    toolsProvided: [],
    transportType: mapTransport(record.transport),
  };
}

function mapMcpStatus(record: McpServerRecord): McpServerItem['status'] {
  const health = record.health_status.toLocaleLowerCase();
  if (health.includes('error') || health.includes('unhealthy')) {
    return 'error';
  }
  return record.lifecycle_status.toLocaleLowerCase() === 'active' ? 'idle' : 'disconnected';
}

function mapTransport(value: string): McpServerItem['transportType'] {
  const normalized = value.toLocaleLowerCase();
  if (normalized === 'sse') {
    return 'sse';
  }
  if (normalized === 'http' || normalized === 'streamable-http') {
    return 'http';
  }
  if (normalized === 'websocket' || normalized === 'ws') {
    return 'WebSocket';
  }
  return 'stdio';
}
