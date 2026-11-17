import type { AppStoreClient } from '@sdkwork/appstore-pc-core';
import {
  configureExpertsServicePort,
  deriveExpertScenarios,
  type ExpertsServicePort,
} from '@sdkwork/appstore-pc-core';

import type { ExpertItem } from '../types';

const expertPageSize = 200;

export function configureAppstorePcExperts(client: AppStoreClient): void {
  configureExpertsServicePort(createExpertsServicePort(client));
}

export function createExpertsServicePort(client: AppStoreClient): ExpertsServicePort {
  return {
    async getExperts(category = '', query = ''): Promise<ExpertItem[]> {
      // The roster is its own catalog store (`appstore_expert_catalog`) served by
      // `catalog.experts.*`; it no longer rides the retired app-template shelf.
      const response = await client.catalog.listExperts({
        limit: expertPageSize,
      });
      const experts = readPageItems<Record<string, unknown>>(response);
      {
        const normalizedQuery = query.trim().toLocaleLowerCase();
        const normalizedCategory = category.trim();
        const mapped = experts.map(mapExpertRecord);
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
      // `expertRef` accepts the catalog row id or the stable expert code; a
      // draft, soft-deleted or unknown expert resolves to 404, which is the
      // "no such expert" answer the modal expects.
      const expert = await client.catalog.getExpert(id).catch(() => undefined);
      if (!expert) {
        return null;
      }
      return mapExpertRecord(expert as unknown as Record<string, unknown>);
    },

    async getExpertScenarios() {
      const experts = await client.catalog.listExperts({
        limit: expertPageSize,
      });
      return deriveExpertScenarios(
        readPageItems<Record<string, unknown>>(experts).map(mapExpertRecord),
      );
    },

    async createCustomExpert(_expertData: Partial<ExpertItem>): Promise<ExpertItem> {
      // The expert catalog is a read-only curated roster: it exposes list and
      // detail operations only. Authoring a new expert needs a dedicated
      // expert-write contract, which does not exist yet, so this fails loudly
      // instead of faking a created row.
      throw new Error(
        'Creating a custom expert is not exposed by the App Store app API; the expert catalog is a read-only curated roster.',
      );
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

/** Maps one `CatalogExpert` wire record onto the storefront expert card. */
function mapExpertRecord(record: Record<string, unknown>): ExpertItem {
  const profile = readProfile(record);
  const scenarioCategory =
    readString(record, 'categoryCode', 'category_code') || '综合';
  return {
    id: readString(record, 'id'),
    name: readString(record, 'expertName', 'expert_name'),
    nickname: readString(profile, 'nickname') || '专家',
    avatarBg: scenarioVisuals[scenarioCategory] ?? 'bg-slate-600',
    avatarIcon: readString(profile, 'avatarIcon') || 'Bot',
    scenarioCategory,
    filterTag: readString(profile, 'filterTag') || scenarioCategory,
    description: readString(record, 'description'),
    systemPrompt: readString(profile, 'systemPrompt') || undefined,
    tags: readStringArray(profile, 'tags'),
    popularity: readNumber(profile, 'popularity') ?? readNumber(profile, 'usageCount') ?? 0,
    rating: readNumber(profile, 'rating') ?? 5.0,
    isFeatured: readBoolean(record, 'featured') === true,
    isOfficial: readBoolean(profile, 'isOfficial') === true,
    badge: readString(profile, 'badge') || undefined,
  };
}

/** The presentation payload of one expert (`CatalogExpert.profile`). */
function readProfile(record: Record<string, unknown>): Record<string, unknown> {
  const raw = record.profile;
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
