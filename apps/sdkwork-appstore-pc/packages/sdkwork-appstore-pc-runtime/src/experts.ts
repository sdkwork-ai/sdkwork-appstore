import type { AppStoreClient } from '@sdkwork/appstore-pc-core';
import {
  configureExpertsServicePort,
  deriveExpertScenarios,
  type ExpertsServicePort,
} from '@sdkwork/appstore-pc-core';

import type { ExpertItem } from '../types';

const expertPageSize = 200;
const expertType = 'EXPERT';

export function configureAppstorePcExperts(client: AppStoreClient): void {
  configureExpertsServicePort(createExpertsServicePort(client));
}

export function createExpertsServicePort(client: AppStoreClient): ExpertsServicePort {
  return {
    async getExperts(category = '', query = ''): Promise<ExpertItem[]> {
      const response = await client.catalog.listTemplates({
        templateType: expertType,
        limit: expertPageSize,
      });
      const templates = readPageItems<Record<string, unknown>>(response);
      {
        const normalizedQuery = query.trim().toLocaleLowerCase();
        const normalizedCategory = category.trim();
        const mapped = templates.map(mapExpertRecord);
        const filtered = mapped.filter((expert) => {
          const matchesCategory =
            !normalizedCategory ||
            normalizedCategory === '全部' ||
            normalizedCategory === 'All' ||
            expert.filterTag === normalizedCategory;
          if (!matchesCategory) {
            return false;
          }
          if (!normalizedQuery) {
            return true;
          }
          return (
            expert.name.toLocaleLowerCase().includes(normalizedQuery) ||
            expert.nickname.toLocaleLowerCase().includes(normalizedQuery) ||
            expert.description.toLocaleLowerCase().includes(normalizedQuery) ||
            expert.tags.some((tag) => tag.toLocaleLowerCase().includes(normalizedQuery))
          );
        });
        return filtered;
      }
    },

    async getExpertById(id: string): Promise<ExpertItem | null> {
      if (!id.trim()) {
        return null;
      }
      const template = await client.catalog.getTemplate(id);
      const record = template as unknown as Record<string, unknown>;
      if (readString(record, 'templateType', 'template_type') !== expertType) {
        return null;
      }
      return mapExpertRecord(record);
    },

    async getExpertScenarios() {
      const experts = await client.catalog.listTemplates({
        templateType: expertType,
        limit: expertPageSize,
      });
      return deriveExpertScenarios(
        readPageItems<Record<string, unknown>>(experts).map(mapExpertRecord),
      );
    },

    async createCustomExpert(expertData: Partial<ExpertItem>): Promise<ExpertItem> {
      const template = await client.catalog.createTemplate({
        templateName: expertData.name || '自定义专家',
        description: expertData.description,
        templateType: expertType,
        categoryCode: expertData.scenarioCategory,
        metadata: {
          authorName: '自定义专家',
          nickname: expertData.nickname || expertData.name || '自定义专家',
          filterTag: expertData.filterTag || '我的专家',
          tags: expertData.tags || [],
          systemPrompt: expertData.systemPrompt || '',
          welcomeMessage: `你好，我是${expertData.name || '自定义专家'}。`,
          avatarIcon: expertData.avatarIcon || 'Bot',
          popularity: 0,
          rating: 5.0,
          isOfficial: false,
          usageCount: 0,
        },
      });
      return mapExpertRecord(template as unknown as Record<string, unknown>);
    },
  };
}

const scenarioVisuals: Record<string, string> = {
  '工程开发': 'bg-store-brand',
  '小微企业': 'bg-store-success',
  '数据分析': 'bg-store-info',
  '专业文档': 'bg-store-info',
  '产品设计': 'bg-fuchsia-600',
  '投资分析': 'bg-store-success',
  '电商运营': 'bg-pink-600',
  '内容创作': 'bg-purple-600',
  '法律咨询': 'bg-store-brand',
  '销售商务': 'bg-store-warning',
  '教育学习': 'bg-store-warning',
};

function mapExpertRecord(record: Record<string, unknown>): ExpertItem {
  const meta = readMetadata(record);
  const scenarioCategory =
    readString(record, 'categoryCode', 'category_code') || '综合';
  return {
    id: readString(record, 'id'),
    name: readString(record, 'templateName', 'template_name'),
    nickname: readString(meta, 'nickname') || '专家',
    avatarBg: scenarioVisuals[scenarioCategory] ?? 'bg-slate-600',
    avatarIcon: readString(meta, 'avatarIcon') || 'Bot',
    scenarioCategory,
    filterTag: readString(meta, 'filterTag') || scenarioCategory,
    description: readString(record, 'description'),
    systemPrompt: readString(meta, 'systemPrompt') || undefined,
    tags: readStringArray(meta, 'tags'),
    popularity: readNumber(meta, 'popularity') ?? readNumber(meta, 'usageCount') ?? 0,
    rating: readNumber(meta, 'rating') ?? 5.0,
    isFeatured: readBoolean(meta, 'isFeatured') === true,
    isOfficial: readBoolean(meta, 'isOfficial') === true,
    badge: readString(meta, 'badge') || undefined,
  };
}

function readMetadata(record: Record<string, unknown>): Record<string, unknown> {
  const raw = record.metadata;
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  if (typeof raw === 'string' && raw) {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
}

function readPageItems<T>(value: unknown): T[] {
  if (
    !value ||
    typeof value !== 'object' ||
    !Array.isArray((value as Record<string, unknown>).items)
  ) {
    return [];
  }
  return (value as Record<string, unknown>).items as T[];
}

function readStringArray(record: Record<string, unknown>, key: string): string[] {
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
  return [];
}

function readString(record: Record<string, unknown> | undefined, ...keys: string[]): string {
  if (!record) {
    return '';
  }
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

function readNumber(
  record: Record<string, unknown> | undefined,
  ...keys: string[]
): number | undefined {
  if (!record) {
    return undefined;
  }
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number.parseFloat(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return undefined;
}

function readBoolean(
  record: Record<string, unknown> | undefined,
  ...keys: string[]
): boolean | undefined {
  if (!record) {
    return undefined;
  }
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'boolean') {
      return value;
    }
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
  }
  return undefined;
}
