/**
 * App platform presentation metadata (storefront side).
 *
 * Source of truth for platform codes: `appstore_platform_dictionary`
 * (database/seeds/common/011_platform_dictionary.sql). This module maps raw
 * platform codes onto the user-facing display groups used on catalog cards
 * and platform filters:
 *
 *   android / ios / harmonyos            -> 移动端各平台
 *   windows / macos / linux              -> PC 桌面 (pcDesktop)
 *   web / pwa                            -> PC 网页 (pcWeb)
 *   h5 / mobile-web                      -> H5 网页 (h5Web)
 *   miniprogram-*                        -> 小程序 (miniprogram)
 *   browser-extension-*                  -> 浏览器扩展 (browserExtension)
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
  /** i18n key under `common.platformGroups` */
  i18nKey: string;
  /** Exact platform codes that map to this group. */
  codes: string[];
  /** Platform code prefixes that map to this group (e.g. miniprogram-*). */
  codePrefixes: string[];
  /** Lucide icon name for card badges. */
  icon: string;
  /** Tailwind badge classes (light + dark). */
  badgeClass: string;
  /** Tailwind dot classes for compact badges. */
  dotClass: string;
}

/** Canonical display order for badges and filters. */
export const APP_PLATFORM_GROUPS: readonly AppPlatformGroupMeta[] = [
  {
    key: 'android',
    i18nKey: 'android',
    codes: ['android'],
    codePrefixes: [],
    icon: 'Smartphone',
    badgeClass:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    dotClass: 'bg-emerald-500',
  },
  {
    key: 'ios',
    i18nKey: 'ios',
    codes: ['ios', 'ipados'],
    codePrefixes: [],
    icon: 'Apple',
    badgeClass:
      'bg-gray-500/10 text-gray-600 dark:text-gray-300 border-gray-500/20',
    dotClass: 'bg-gray-500',
  },
  {
    key: 'harmonyos',
    i18nKey: 'harmonyos',
    codes: ['harmonyos'],
    codePrefixes: [],
    icon: 'Smartphone',
    badgeClass:
      'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    dotClass: 'bg-rose-500',
  },
  {
    key: 'pcDesktop',
    i18nKey: 'pcDesktop',
    codes: ['windows', 'macos', 'linux', 'desktop'],
    codePrefixes: [],
    icon: 'Monitor',
    badgeClass:
      'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    dotClass: 'bg-indigo-500',
  },
  {
    key: 'pcWeb',
    i18nKey: 'pcWeb',
    codes: ['web', 'web-pc', 'pwa'],
    codePrefixes: [],
    icon: 'Globe',
    badgeClass:
      'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    dotClass: 'bg-sky-500',
  },
  {
    key: 'h5Web',
    i18nKey: 'h5Web',
    codes: ['h5', 'web-h5', 'mobile-web'],
    codePrefixes: [],
    icon: 'Globe',
    badgeClass:
      'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    dotClass: 'bg-teal-500',
  },
  {
    key: 'miniprogram',
    i18nKey: 'miniprogram',
    codes: [],
    codePrefixes: ['miniprogram-'],
    icon: 'Blocks',
    badgeClass:
      'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    dotClass: 'bg-violet-500',
  },
  {
    key: 'browserExtension',
    i18nKey: 'browserExtension',
    codes: [],
    codePrefixes: ['browser-extension-'],
    icon: 'Puzzle',
    badgeClass:
      'bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20',
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

function normalizeCode(code: string): string {
  return code.trim().toLowerCase().replace(/_/g, '-');
}

/** Map a raw platform code onto its display group. */
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

/**
 * Deduplicated display groups for a listing, in canonical order.
 * Accepts raw platform codes such as `android`, `windows`,
 * `browser-extension-chrome`, `miniprogram-wechat`, `h5`.
 */
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

/** True when the listing supports at least one platform in the given group. */
export function appSupportsPlatformGroup(
  platforms: readonly string[] | undefined | null,
  group: AppPlatformGroupKey,
): boolean {
  return platformGroupsForCodes(platforms).includes(group);
}
