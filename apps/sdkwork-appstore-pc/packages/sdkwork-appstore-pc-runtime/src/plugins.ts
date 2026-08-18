import type { AppStoreClient } from '@sdkwork/appstore-app-sdk';
import {
  configurePluginsServicePort,
  type PluginsServicePort,
} from '@sdkwork/appstore-pc-core';

import type { PluginItem } from '../types';

const pluginPageSize = 200;
const pluginType = 'PLUGIN';

export function configureAppstorePcPlugins(client: AppStoreClient): void {
  configurePluginsServicePort(createPluginsServicePort(client));
}

export function createPluginsServicePort(client: AppStoreClient): PluginsServicePort {
  return {
    async getPlugins(category = '全部', query = ''): Promise<PluginItem[]> {
      const response = await client.catalog.listTemplates({
        templateType: pluginType,
        limit: pluginPageSize,
        q: query.trim() || undefined,
      });
      const templates = readPageItems<Record<string, unknown>>(response);
      const filtered = category === '全部' || category === 'All'
        ? templates
        : templates.filter((template) => {
            const meta = readMetadata(template);
            const pluginCategory = readString(meta, 'category') ||
              readString(template, 'categoryCode', 'category_code');
            return pluginCategory.toLocaleLowerCase().includes(category.toLocaleLowerCase());
          });
      return filtered.map(mapPluginRecord);
    },

    async togglePlugin(id: string): Promise<boolean> {
      // Plugin enable/disable is recorded as a per-user template usage state.
      const current = await client.catalog.getTemplate(id);
      const enabled = readBoolean(
        current as unknown as Record<string, unknown>,
        'isEnabled',
      );
      const nextEnabled = enabled === false;
      await client.catalog.recordTemplateUsage(id, {
        usageType: nextEnabled ? 'ENABLE' : 'DISABLE',
        metadata: { action: nextEnabled ? 'enable' : 'disable' },
      });
      return nextEnabled;
    },

    async registerPlugin(pluginData: Partial<PluginItem>): Promise<PluginItem> {
      const template = await client.catalog.createTemplate({
        templateName: pluginData.name || '自定义扩展插件',
        description: pluginData.description,
        templateType: pluginType,
        categoryCode: pluginData.category,
        metadata: {
          authorName: pluginData.developer || '独立开发者',
          category: pluginData.category || '代码与开发',
          apiSchemaType: pluginData.apiSchemaType || 'OpenAPI',
          capabilities: pluginData.capabilities || ['自定义 API 调用', '数据加工'],
          version: pluginData.version || '1.0.0',
          docUrl: pluginData.docUrl || '',
          downloadsCount: 1,
          rating: 5.0,
        },
      });
      return mapPluginRecord(template as unknown as Record<string, unknown>);
    },

    async executePluginApi(): Promise<{ success: boolean; result: string; latencyMs: number }> {
      throw new Error('Plugin capability execution is not exposed by the App Store app API.');
    },

    async getPluginSchema(): Promise<string> {
      throw new Error('Plugin API schema execution is not exposed by the App Store app API.');
    },
  };
}

function mapPluginRecord(record: Record<string, unknown>): PluginItem {
  const id = readString(record, 'id');
  const meta = readMetadata(record);
  const version = readString(meta, 'version') || '1.0.0';
  const category = readString(meta, 'category') ||
    readString(record, 'categoryCode', 'category_code') ||
    '代码与开发';
  const visual = categoryVisuals[category] ?? categoryVisuals.default;
  return {
    id,
    name: readString(record, 'templateName', 'template_name'),
    version,
    developer: readString(meta, 'authorName') || 'SDKWork',
    category,
    description: readString(record, 'description') || '',
    icon: visual.icon,
    iconColor: visual.color,
    downloadsCount: readNumber(meta, 'downloadsCount') ?? 0,
    rating: readNumber(meta, 'rating') ?? 5.0,
    enabled: false,
    apiSchemaType: (readString(meta, 'apiSchemaType') as PluginItem['apiSchemaType']) || 'OpenAPI',
    capabilities: readStringArray(meta, 'capabilities'),
    docUrl: readString(meta, 'docUrl') || undefined,
  };
}

const categoryVisuals: Record<string, { icon: string; color: string }> = {
  '代码与开发': { icon: 'Terminal', color: 'bg-slate-800' },
  '搜索与信息': { icon: 'Search', color: 'bg-cyan-600' },
  '数据处理': { icon: 'FileJson', color: 'bg-emerald-600' },
  '数据与存储': { icon: 'Database', color: 'bg-blue-700' },
  '图像与识别': { icon: 'ScanText', color: 'bg-violet-600' },
  '支付与电商': { icon: 'CreditCard', color: 'bg-amber-600' },
  default: { icon: 'Plug', color: 'bg-slate-600' },
};

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
