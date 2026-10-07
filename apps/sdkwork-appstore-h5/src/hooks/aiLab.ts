import { useApi } from '@/hooks/useApi';
import { readRecordNumber, readRecordString } from '@sdkwork/appstore-h5-commons';
import { getStoreClient } from '@/services/storeClient';
import { getAgentsClient, getSkillsClient, getMcpClient } from '@/services/aiLabClients';

/** Storefront card for the AI Hub apps tab (catalog listings in AI categories). */
export interface AiAppCard {
  id: string;
  name: string;
  developer: string;
  rating: number;
  pricingModel: string;
}

function toAiAppCard(row: Record<string, unknown>): AiAppCard {
  return {
    id: String(row.listingSlug ?? row.id ?? ''),
    name: String(row.displayName ?? row.title ?? 'AI 应用'),
    developer: String(row.developerName ?? row.publisherName ?? '开发者'),
    rating: Number(row.averageRating ?? row.rating ?? 0),
    pricingModel: String(row.pricingModel ?? 'FREE'),
  };
}

/** AI category storefront listings (categoryCode prefix `ai`). */
export function useAiHubApps() {
  return useApi(async () => {
    const store = getStoreClient();
    const [categoriesResponse, listingsResponse] = await Promise.all([
      store.catalog.listCategories({ limit: 200, locale: 'zh-CN' }).catch(() => undefined),
      store.catalog.searchListings({ limit: 200 }).catch(() => undefined),
    ]);
    if (!listingsResponse) {
      return [];
    }
    const aiCategoryIds = new Set(
      ((categoriesResponse?.items ?? []) as unknown as Record<string, unknown>[])
        .filter((item) =>
          readRecordString(item, 'categoryCode', 'category_code')
            .toLocaleLowerCase()
            .startsWith('ai'),
        )
        .map((item) => readRecordString(item, 'id'))
        .filter(Boolean),
    );
    return (listingsResponse.items as unknown as Record<string, unknown>[])
      .filter(
        (row) =>
          aiCategoryIds.size === 0 ||
          aiCategoryIds.has(readRecordString(row, 'primaryCategoryId', 'primary_category_id')),
      )
      .map(toAiAppCard)
      .slice(0, 24);
  });
}

/** Configured model cards from the agents domain. */
export interface AiModelCard {
  id: string;
  name: string;
  provider: string;
  description: string;
  isPopular: boolean;
}

export function useAiModels() {
  return useApi(async () => {
    const response = await getAgentsClient().ai.agents.modelConfigurations.list();
    const models: AiModelCard[] = [];
    for (const configuration of (response.items ?? []) as unknown as Record<string, unknown>[]) {
      const provider = readRecordString(configuration, 'engineId', 'engine_id');
      const defaultModel = readRecordString(configuration, 'defaultModelId', 'default_model_id');
      const raw = configuration.supportedModelIds;
      const supported = Array.isArray(raw)
        ? raw.filter((entry): entry is string => typeof entry === 'string')
        : [];
      const candidates = defaultModel ? [defaultModel, ...supported] : supported;
      for (const modelId of candidates) {
        if (!modelId || models.some((model) => model.id === modelId)) {
          continue;
        }
        models.push({
          id: modelId,
          name: modelId,
          provider,
          description: `${provider} 模型 · 状态 ${readRecordString(configuration, 'status') || 'active'}`,
          isPopular: modelId === defaultModel,
        });
      }
    }
    return models;
  });
}

/** Prompt presets mirrored from the PC AI sandbox. */
export const AI_PROMPT_PRESETS: readonly string[] = [
  '推荐一款适合写代码和整理 PDF 论文的 AI 工具',
  '比较通义千问与 ima.copilot 的多端同步与知识库能力',
  '如何在本地沙盒环境高安全地运行 Python 分析脚本？',
  '总结 Model Context Protocol (MCP) 在智能体连接中的价值',
];

/** Agents preview completion used by the AI sandbox tab. */
export async function generateAiCompletion(
  prompt: string,
  modelId: string,
  agentId: string,
): Promise<{ response: string; modelUsed: string }> {
  const { uuid } = await import('@sdkwork/utils/id');
  const result = await getAgentsClient().ai.agents.previewResponses.create(agentId, {
    content: prompt,
    executionId: uuid(),
    inputPayload: { source: 'sdkwork-appstore-h5' },
    model: modelId,
    requestedAt: new Date().toISOString(),
  });
  const output = (result.outputPayload ?? {}) as Record<string, unknown>;
  const response = readRecordString(output, 'response', 'content', 'text');
  if (!response) {
    throw new Error('AI 预览已完成，但未返回内容。');
  }
  return {
    response,
    modelUsed: readRecordString(output, 'model', 'modelId') || modelId,
  };
}

/** Extension plugin card mapped from the catalog template domain. */
export interface AiPluginCard {
  id: string;
  name: string;
  developer: string;
  category: string;
  description: string;
  capabilities: string[];
  enabled: boolean;
}

function readMetadata(row: Record<string, unknown>): Record<string, unknown> {
  const raw = row.metadata;
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string')
    : [];
}

function toPluginCard(row: Record<string, unknown>): AiPluginCard {
  const meta = readMetadata(row);
  return {
    id: readRecordString(row, 'id'),
    name: readRecordString(row, 'templateName', 'template_name'),
    developer: readRecordString(meta, 'authorName') || 'SDKWork',
    category:
      readRecordString(meta, 'category') ||
      readRecordString(row, 'categoryCode', 'category_code') ||
      '代码与开发',
    description: readRecordString(row, 'description'),
    capabilities: toStringArray(meta.capabilities),
    enabled: false,
  };
}

const PLUGIN_CATEGORIES = [
  '全部',
  '代码与开发',
  '数据检索',
  '文档处理',
  '数据库应用',
  '图像处理',
  '商业应用',
] as const;

export { PLUGIN_CATEGORIES };

export function usePlugins(category: string, query: string) {
  return useApi(
    async () => {
      const page = await getStoreClient().catalog.listTemplates({
        templateType: 'PLUGIN',
        q: query.trim() || undefined,
        limit: 100,
      });
      const normalized = category.trim().toLocaleLowerCase();
      return (page.items as unknown as Record<string, unknown>[])
        .map(toPluginCard)
        .filter(
          (plugin) =>
            normalized === '' ||
            normalized === '全部' ||
            plugin.category.toLocaleLowerCase().includes(normalized),
        );
    },
    { refreshKey: `${category}:${query}` },
  );
}

/** Toggle plugin enable state through per-user template usage records. */
export async function togglePluginEnabled(id: string, currentlyEnabled: boolean): Promise<boolean> {
  const nextEnabled = !currentlyEnabled;
  await getStoreClient().catalog.recordTemplateUsage(id, {
    usageType: nextEnabled ? 'ENABLE' : 'DISABLE',
    metadata: { action: nextEnabled ? 'enable' : 'disable' },
  });
  return nextEnabled;
}

/** Skill marketplace card mapped from the skills domain. */
export interface AiSkillCard {
  id: string;
  name: string;
  version: string;
  category: string;
  description: string;
  installs: number;
  installed: boolean;
}

export function useSkills(query: string) {
  return useApi(async () => {
    const client = getSkillsClient();
    const [marketplace, installations] = await Promise.all([
      client.skills.marketplace.list({
        page: 1,
        pageSize: 48,
        q: query.trim() || undefined,
      }),
      client.skills.skillInstallations.list({ page: 1, pageSize: 200 }).catch(() => undefined),
    ]);
    const installedSkillIds = new Set<string>();
    const installedPackageIds = new Set<string>();
    for (const installation of (installations?.items ?? []) as unknown as Record<string, unknown>[]) {
      if (installation.enabled && installation.installStatus !== 'deleted') {
        installedSkillIds.add(readRecordString(installation, 'skillId'));
        installedPackageIds.add(readRecordString(installation, 'packageId'));
      }
    }
    return ((marketplace.items ?? []) as unknown as Record<string, unknown>[]).map(
      (record): AiSkillCard => ({
        id: readRecordString(record, 'id'),
        name: readRecordString(record, 'name'),
        version: readRecordString(record, 'version') || '1.0.0',
        category: toStringArray(record.categories)[0] ?? 'General',
        description:
          readRecordString(record, 'summary') || readRecordString(record, 'description'),
        installs: readRecordNumber(record, 'installCount'),
        installed:
          installedSkillIds.has(readRecordString(record, 'id')) ||
          installedPackageIds.has(readRecordString(record, 'packageId')),
      }),
    );
  });
}

/** Install a skill through its published package artifact. */
export async function installSkill(
  skill: { id: string; packageId: string; version: string },
): Promise<void> {
  const client = getSkillsClient();
  const artifacts = await client.skills.skillPackages.artifacts.list(skill.packageId, {
    page: 1,
    pageSize: 20,
  });
  const artifact =
    (artifacts.items ?? []).find(
      (row) =>
        (row as unknown as Record<string, unknown>).status === 'published' &&
        (row as unknown as Record<string, unknown>).versionLabel === skill.version,
    ) ??
    (artifacts.items ?? []).find(
      (row) => (row as unknown as Record<string, unknown>).status === 'published',
    );
  if (!artifact) {
    throw new Error('该技能暂无可安装的发布工件。');
  }
  await client.skills.skillPackages.installations.create(skill.packageId, {
    artifactId: (artifact as unknown as Record<string, unknown>).id as string,
  });
}

/** MCP registry card mapped from the mcp domain. */
export interface McpServerCard {
  id: string;
  name: string;
  publisher: string;
  description: string;
  transportType: string;
  status: 'idle' | 'error' | 'disconnected';
  configSnippet: string;
}

export function useMcpServers(query: string) {
  return useApi(
    async () => {
      const response = await getMcpClient().mcp.servers.list({
        page: 1,
        pageSize: 48,
        q: query.trim() || undefined,
      });
      return ((response.items ?? []) as unknown as Record<string, unknown>[]).map(
        (record): McpServerCard => {
          const transport = readRecordString(record, 'transport').toLocaleLowerCase();
          const health = readRecordString(record, 'health_status', 'healthStatus').toLocaleLowerCase();
          const lifecycle = readRecordString(
            record,
            'lifecycle_status',
            'lifecycleStatus',
          ).toLocaleLowerCase();
          return {
            id: readRecordString(record, 'id'),
            name: readRecordString(record, 'name'),
            publisher: readRecordString(record, 'category_code', 'categoryCode') || 'SDKWork MCP',
            description: readRecordString(record, 'description'),
            transportType:
              transport === 'sse'
                ? 'SSE'
                : transport === 'http' || transport === 'streamable-http'
                  ? 'HTTP'
                  : transport === 'websocket' || transport === 'ws'
                    ? 'WebSocket'
                    : 'stdio',
            status:
              health.includes('error') || health.includes('unhealthy')
                ? 'error'
                : lifecycle === 'active'
                  ? 'idle'
                  : 'disconnected',
            configSnippet: JSON.stringify(
              {
                serverKey: readRecordString(record, 'server_key', 'serverKey'),
                transport: readRecordString(record, 'transport'),
              },
              null,
              2,
            ),
          };
        },
      );
    },
    { refreshKey: query },
  );
}
