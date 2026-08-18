import type { AppStoreClient } from '@sdkwork/appstore-app-sdk';
import {
  configureTemplatesServicePort,
  type TemplatesServicePort,
} from '@sdkwork/appstore-pc-core';

import type { TemplateItem } from '../types';

const templatePageSize = 200;

/** Template metadata keys shared with the storefront template API. */
const metaKeys = {
  authorName: 'authorName',
  category: 'category',
  demoUrl: 'demoUrl',
  features: 'features',
  isOfficial: 'isOfficial',
  license: 'license',
  previewImage: 'previewImage',
  rating: 'rating',
  relatedAppId: 'relatedAppId',
  screenshots: 'screenshots',
  tags: 'tags',
  techStack: 'techStack',
  usageCount: 'usageCount',
  version: 'version',
};

export function configureAppstorePcTemplates(client: AppStoreClient): void {
  configureTemplatesServicePort(createTemplatesServicePort(client));
}

export function createTemplatesServicePort(client: AppStoreClient): TemplatesServicePort {
  return {
    async getTemplates(category = '全部', query = ''): Promise<TemplateItem[]> {
      const response = await client.catalog.listTemplates({
        limit: templatePageSize,
        q: query.trim() || undefined,
      });
      const templates = readPageItems<Record<string, unknown>>(response);
      const filtered = category === '全部' || category === 'All'
        ? templates
        : templates.filter((template) => {
            const meta = readMetadata(template);
            const templateCategory = readString(meta, metaKeys.category) ||
              readString(template, 'categoryCode', 'category_code');
            return templateCategory.toLocaleLowerCase().includes(category.toLocaleLowerCase());
          });
      return filtered.map(mapTemplateRecord);
    },

    async getTemplateById(id: string): Promise<TemplateItem | null> {
      const template = await client.catalog.getTemplate(id);
      return mapTemplateRecord(template as unknown as Record<string, unknown>);
    },

    async publishTemplate(templateData: Partial<TemplateItem>): Promise<TemplateItem> {
      const template = await client.catalog.createTemplate({
        templateName: templateData.title || '未命名模板',
        description: templateData.description,
        templateType: 'APP',
        categoryCode: templateData.category,
        framework: templateData.framework,
        gitRepoUrl: templateData.repoUrl || templateData.githubUrl,
        metadata: {
          ...(templateData.category ? { category: templateData.category } : {}),
          ...(templateData.tags?.length ? { tags: templateData.tags } : {}),
          ...(templateData.isOfficial !== undefined ? { isOfficial: templateData.isOfficial } : {}),
          ...(templateData.license ? { license: templateData.license } : {}),
          ...(templateData.demoUrl ? { demoUrl: templateData.demoUrl } : {}),
          ...(templateData.previewUrl || templateData.previewImage
            ? { previewImage: templateData.previewUrl || templateData.previewImage }
            : {}),
          ...(templateData.screenshots?.length ? { screenshots: templateData.screenshots } : {}),
          ...(templateData.features?.length ? { features: templateData.features } : {}),
          ...(templateData.techStack?.length ? { techStack: templateData.techStack } : {}),
          ...(templateData.architecture ? { architecture: templateData.architecture } : {}),
          ...(templateData.usageCount !== undefined ? { usageCount: templateData.usageCount } : {}),
          ...(templateData.rating !== undefined ? { rating: templateData.rating } : {}),
          ...(templateData.relatedAppId ? { relatedAppId: templateData.relatedAppId } : {}),
        },
      });
      return mapTemplateRecord(template as unknown as Record<string, unknown>);
    },

    async starTemplate(id: string): Promise<{ stars: number; isStarred: boolean }> {
      const result = await client.catalog.recordTemplateUsage(id, { usageType: 'STAR' });
      return {
        stars: readNumber(result as unknown as Record<string, unknown>, 'starCount') ?? 0,
        isStarred: readBoolean(result as unknown as Record<string, unknown>, 'isStarred') ?? true,
      };
    },

    async forkTemplate(id: string): Promise<{ forks: number }> {
      const result = await client.catalog.recordTemplateUsage(id, { usageType: 'FORK' });
      return {
        forks: readNumber(result as unknown as Record<string, unknown>, 'forkCount') ?? 0,
      };
    },

    async getTemplateCliCommand(id: string): Promise<string> {
      const template = await client.catalog.getTemplate(id).catch(() => undefined);
      const code = readString(
        template as unknown as Record<string, unknown> | undefined,
        'templateCode',
        'template_code',
      );
      return `npx create-sdkwork-app my-app --template ${code || id}`;
    },
  };
}

function mapTemplateRecord(record: Record<string, unknown>): TemplateItem {
  const id = readString(record, 'id');
  const meta = readMetadata(record);
  return {
    id,
    title: readString(record, 'templateName', 'template_name'),
    author: readString(meta, metaKeys.authorName) || 'SDKWork',
    framework: readString(record, 'framework') || 'React + Vite + Tailwind',
    category: readString(meta, metaKeys.category) ||
      readString(record, 'categoryCode', 'category_code') ||
      '开发者工具',
    description: readString(record, 'description') || '',
    icon: 'Boxes',
    iconColor: 'bg-indigo-600',
    stars: readNumber(record, 'starCount', 'star_count') ?? 0,
    forks: readNumber(record, 'forkCount', 'fork_count') ?? 0,
    tags: readStringArray(meta, metaKeys.tags),
    demoUrl: readString(meta, metaKeys.demoUrl) || undefined,
    githubUrl: readString(record, 'gitRepoUrl', 'git_repo_url') || undefined,
    repoUrl: readString(record, 'gitRepoUrl', 'git_repo_url') || undefined,
    previewUrl: readString(meta, metaKeys.previewImage) || undefined,
    previewImage: readString(meta, metaKeys.previewImage) || undefined,
    publishedAt: formatDate(readString(record, 'publishedAt', 'published_at')),
    isOfficial: readBoolean(meta, metaKeys.isOfficial) ?? false,
    screenshots: readStringArray(meta, metaKeys.screenshots),
    features: readStringArray(meta, metaKeys.features),
    techStack: readStringArray(meta, metaKeys.techStack),
    architecture: readString(meta, 'architecture') || undefined,
    usageCount: readNumber(meta, metaKeys.usageCount),
    rating: readNumber(meta, metaKeys.rating),
    license: readString(meta, metaKeys.license) || undefined,
    overviewMarkdown: readString(meta, 'overviewMarkdown') || undefined,
    relatedAppId: readString(meta, metaKeys.relatedAppId) || undefined,
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
  if (!value || typeof value !== 'object' || !Array.isArray((value as Record<string, unknown>).items)) {
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

function readNumber(record: Record<string, unknown> | undefined, ...keys: string[]): number | undefined {
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

function readBoolean(record: Record<string, unknown> | undefined, ...keys: string[]): boolean | undefined {
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

function formatDate(value: string): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString().slice(0, 10);
}
