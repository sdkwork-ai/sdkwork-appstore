import type { AgentRuntimeExecutionRecord, SdkworkAppClient } from '@sdkwork/agents-app-sdk';
import type { AppStoreClient } from '@sdkwork/appstore-app-sdk';
import type { AppItem } from '../types';
import {
  configureAICompletionPort,
  configureAIHubServicePort,
  type AICompletionResult,
  type AIModelInfo,
} from '@sdkwork/appstore-pc-core';

/** Maximum AI storefront inventory for the AI Hub apps tab. */
const aiHubPageSize = 200;

export function configureAppstorePcAIHub(
  agentsClient: SdkworkAppClient,
  appstoreClient: AppStoreClient,
  agentId: string | undefined,
): void {
  configureAICompletionPort({
    async generateCompletion(prompt, modelId): Promise<AICompletionResult> {
      if (!agentId) {
        throw new Error('The App Store AI preview agent is not configured.');
      }

      const result = await agentsClient.ai.agents.previewResponses.create(agentId, {
        content: prompt,
        executionId: crypto.randomUUID(),
        inputPayload: { source: 'sdkwork-appstore-pc' },
        model: modelId,
        requestedAt: new Date().toISOString(),
      });
      return mapAgentPreviewResult(result, modelId);
    },
  });
  configureAIHubServicePort({
    async getAIApps(): Promise<AppItem[]> {
      // AI Hub apps are storefront catalog listings in AI categories; the
      // storefront catalog runtime owns them, this port only filters them.
      const [categoriesResponse, listingsResponse] = await Promise.all([
        appstoreClient.catalog
          .listCategories({ limit: 200, locale: 'zh-CN' })
          .catch(() => undefined),
        appstoreClient.catalog
          .searchListings({ limit: aiHubPageSize })
          .catch(() => undefined),
      ]);
      if (!listingsResponse) {
        return [];
      }
      const aiCategoryIds = new Set(
        readPageItems<Record<string, unknown>>(categoriesResponse as unknown)
          .filter((item) =>
            readString(item, 'categoryCode', 'category_code')
              .toLocaleLowerCase()
              .startsWith('ai'),
          )
          .map((item) => readString(item, 'id'))
          .filter(Boolean),
      );
      return readPageItems<Record<string, unknown>>(listingsResponse)
        .filter((row) =>
          aiCategoryIds.has(readString(row, 'primaryCategoryId', 'primary_category_id')),
        )
        .map((row) => mapListingSummary(row))
        .slice(0, 24);
    },
    async getModels(): Promise<AIModelInfo[]> {
      const response = await agentsClient.ai.agents.modelConfigurations.list();
      const configurations = readPageItems<Record<string, unknown>>(response as unknown);
      const models: AIModelInfo[] = [];
      for (const configuration of configurations) {
        const provider = readString(configuration, 'engineId', 'engine_id');
        const defaultModel = readString(configuration, 'defaultModelId', 'default_model_id');
        const supported = readStringArray(configuration, 'supportedModelIds', 'supported_model_ids');
        const candidates = defaultModel ? [defaultModel, ...supported] : supported;
        for (const modelId of candidates) {
          if (!modelId || models.some((model) => model.id === modelId)) {
            continue;
          }
          models.push({
            id: modelId,
            name: modelId,
            provider,
            badge: '已配置',
            description: `${provider} 模型 · 状态 ${readString(configuration, 'status') || 'active'}`,
            isPopular: modelId === defaultModel,
          });
        }
      }
      return models;
    },
    async getPromptPresets(): Promise<string[]> {
      return [
        '推荐一款适合写代码和整理 PDF 论文的 AI 工具',
        '比较通义千问与 ima.copilot 的多端同步与知识库能力',
        '如何在本地沙盒环境高安全地运行 Python 分析脚本？',
        '总结 Model Context Protocol (MCP) 在智能体连接中的价值',
      ];
    },
  });
}

function readPageItems<T>(value: unknown): T[] {
  if (!value || typeof value !== 'object' || !Array.isArray((value as Record<string, unknown>).items)) {
    return [];
  }
  return (value as Record<string, unknown>).items as T[];
}

function mapListingSummary(item: Record<string, unknown>, index = 0): AppItem {
  return {
    id: readString(item, 'id'),
    name: readString(item, 'displayName', 'display_name') || readString(item, 'id'),
    developer: readString(item, 'developerName', 'developer_name') || 'SDKWork',
    category: readString(item, 'category', 'categoryName') || 'AI',
    price: readString(item, 'pricingModel', 'pricing_model').toLocaleUpperCase() === 'PAID' ? 1 : 0,
    rating: readNumber(item, 'averageRating', 'average_rating') ?? 0,
    reviewsCount: readNumber(item, 'ratingCount', 'rating_count') ?? 0,
    description: readString(item, 'description') || '',
    screenshots: [],
    icon: 'Sparkles',
    iconColor: 'bg-indigo-600',
    version: readString(item, 'currentVersion', 'current_version') || '1.0.0',
    size: '—',
    ageRating: '4+',
    chartRank: index + 1,
  };
}

function mapAgentPreviewResult(
  result: AgentRuntimeExecutionRecord,
  requestedModel: string,
): AICompletionResult {
  const output = result.outputPayload;
  const response = readString(output, 'response', 'content', 'text');
  if (!response) {
    throw new Error('The Agents preview completed without response content.');
  }

  const startedAt = Date.parse(result.requestedAt);
  const completedAt = Date.parse(result.completedAt);
  return {
    latencyMs:
      Number.isFinite(startedAt) && Number.isFinite(completedAt)
        ? Math.max(0, completedAt - startedAt)
        : 0,
    modelUsed: readString(output, 'model', 'modelId') || requestedModel,
    response,
    tokenCount: readNumber(output, 'tokenCount', 'totalTokens') ?? 0,
  };
}

function readString(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

function readNumber(record: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }
  return undefined;
}

function readStringArray(record: Record<string, unknown>, ...keys: string[]): string[] {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value.filter((entry): entry is string => typeof entry === 'string');
    }
    if (typeof value === 'string' && value.trim()) {
      return value
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);
    }
  }
  return [];
}
