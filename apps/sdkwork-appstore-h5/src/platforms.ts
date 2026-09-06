/**
 * H5 端应用平台展示元数据。
 *
 * 平台代码权威来源：`appstore_platform_dictionary`
 * （database/seeds/common/011_platform_dictionary.sql）。本模块把原始平台代码
 * 归并到卡片标识与平台过滤使用的展示分组：安卓 / iOS / 鸿蒙 / PC桌面 /
 * PC网页 / H5网页 / 小程序 / 浏览器扩展。
 */

export type AppPlatformGroupKey =
  | 'android'
  | 'ios'
  | 'harmonyos'
  | 'pcDesktop'
  | 'pcWeb'
  | 'h5Web'
  | 'miniprogram'
  | 'browserExtension';

export interface AppPlatformGroupMeta {
  key: AppPlatformGroupKey;
  /** 展示名（H5 页面为简体中文语境）。 */
  label: string;
  codes: string[];
  codePrefixes: string[];
  /** Tailwind 徽标配色。 */
  badgeClass: string;
  dotClass: string;
}

/** 展示与过滤的固定顺序。 */
export const APP_PLATFORM_GROUPS: readonly AppPlatformGroupMeta[] = [
  {
    key: 'android',
    label: '安卓',
    codes: ['android'],
    codePrefixes: [],
    badgeClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    dotClass: 'bg-emerald-500',
  },
  {
    key: 'ios',
    label: 'iOS',
    codes: ['ios', 'ipados'],
    codePrefixes: [],
    badgeClass: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    dotClass: 'bg-gray-500',
  },
  {
    key: 'harmonyos',
    label: '鸿蒙',
    codes: ['harmonyos'],
    codePrefixes: [],
    badgeClass: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    dotClass: 'bg-rose-500',
  },
  {
    key: 'pcDesktop',
    label: 'PC桌面',
    codes: ['windows', 'macos', 'linux', 'desktop'],
    codePrefixes: [],
    badgeClass: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    dotClass: 'bg-indigo-500',
  },
  {
    key: 'pcWeb',
    label: 'PC网页',
    codes: ['web', 'web-pc', 'pwa'],
    codePrefixes: [],
    badgeClass: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
    dotClass: 'bg-sky-500',
  },
  {
    key: 'h5Web',
    label: 'H5网页',
    codes: ['h5', 'web-h5', 'mobile-web'],
    codePrefixes: [],
    badgeClass: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
    dotClass: 'bg-teal-500',
  },
  {
    key: 'miniprogram',
    label: '小程序',
    codes: [],
    codePrefixes: ['miniprogram-'],
    badgeClass: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
    dotClass: 'bg-violet-500',
  },
  {
    key: 'browserExtension',
    label: '浏览器扩展',
    codes: [],
    codePrefixes: ['browser-extension-'],
    badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    dotClass: 'bg-amber-500',
  },
] as const;

const GROUP_BY_CODE: Map<string, AppPlatformGroupKey> = (() => {
  const map = new Map<string, AppPlatformGroupKey>();
  for (const group of APP_PLATFORM_GROUPS) {
    for (const code of group.codes) {
      map.set(code, group.key);
    }
  }
  return map;
})();

const GROUP_BY_KEY = new Map<AppPlatformGroupKey, AppPlatformGroupMeta>(
  APP_PLATFORM_GROUPS.map((group) => [group.key, group]),
);

function normalizeCode(code: string): string {
  return code.trim().toLowerCase().replace(/_/g, '-');
}

/** 把原始平台代码归并到展示分组。 */
export function resolveAppPlatformGroup(code: string): AppPlatformGroupKey | undefined {
  const normalized = normalizeCode(code);
  if (!normalized) {
    return undefined;
  }
  const exact = GROUP_BY_CODE.get(normalized);
  if (exact) {
    return exact;
  }
  for (const group of APP_PLATFORM_GROUPS) {
    if (group.codePrefixes.some((prefix) => normalized.startsWith(prefix))) {
      return group.key;
    }
  }
  return undefined;
}

/** 去重后的展示分组列表（按固定顺序）。 */
export function platformGroupsForCodes(
  platforms: readonly string[] | undefined | null,
): AppPlatformGroupKey[] {
  if (!platforms || platforms.length === 0) {
    return [];
  }
  const seen = new Set<AppPlatformGroupKey>();
  for (const code of platforms) {
    const group = resolveAppPlatformGroup(code);
    if (group) {
      seen.add(group);
    }
  }
  return APP_PLATFORM_GROUPS.map((group) => group.key).filter((key) => seen.has(key));
}

/** 该应用是否支持给定分组中的至少一个平台。 */
export function appSupportsPlatformGroup(
  platforms: readonly string[] | undefined | null,
  group: AppPlatformGroupKey,
): boolean {
  return platformGroupsForCodes(platforms).includes(group);
}

export function getPlatformGroupMeta(key: AppPlatformGroupKey): AppPlatformGroupMeta | undefined {
  return GROUP_BY_KEY.get(key);
}

/**
 * 从目录行读取原始平台代码：兼容数组与逗号分隔字符串。
 * 缺省回退 H5 门店语境（H5网页）。
 */
export function readListingPlatformCodes(row: Record<string, unknown>): string[] {
  for (const key of [
    'platforms',
    'platformCodes',
    'platform_codes',
    'platformFamilies',
    'platform_families',
  ]) {
    const value = row[key];
    if (Array.isArray(value)) {
      const codes = value
        .filter((entry): entry is string => typeof entry === 'string')
        .flatMap((entry) => entry.split(','))
        .map((code) => code.trim())
        .filter(Boolean);
      if (codes.length > 0) {
        return Array.from(new Set(codes));
      }
    }
    if (typeof value === 'string' && value.trim()) {
      const codes = value
        .split(',')
        .map((code) => code.trim())
        .filter(Boolean);
      if (codes.length > 0) {
        return Array.from(new Set(codes));
      }
    }
  }
  return ['h5'];
}
