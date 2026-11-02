#!/usr/bin/env node
/**
 * Generate storefront seed rows for every H5 / PC / Flutter / mini-program
 * (and HarmonyOS) application declared across the sdkwork-space sibling
 * repositories.
 *
 * Source of truth: `<workspace>/sdkwork-[repo]/apps/[app]/agent.app.config.json`
 * (kind `agent.app`). Each declared platform application becomes one
 * `appstore_app` + `appstore_listing` pair with complete storefront data:
 * media references, a published release on the production channel,
 * zh-CN/en-US localizations, release-note localizations, category binding,
 * compliance profile, CN/US regional availability, market-channel release,
 * and platform delivery rows for mobile/mini-program platforms.
 *
 * Generated files (do not hand-edit; re-run this script to refresh):
 * - common/016_workspace_applications.sql
 * - locales/zh-CN/004_workspace_applications_zh.sql
 * - locales/en-US/004_workspace_applications_en.sql
 *
 * Usage:
 *   node database/seeds/.generate-workspace-applications.mjs           # write
 *   node database/seeds/.generate-workspace-applications.mjs --check   # verify
 */

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const seedsRoot = path.dirname(path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')));
const repoRoot = path.resolve(seedsRoot, '..', '..');

const TENANT_ID = '100001';
const ORGANIZATION_ID = '0';
const PUBLISHER_ID = 'appstore-publisher-default-0';
const RELEASE_CHANNEL_ID = 'ch-prod';
const MARKET_CHANNEL_ID = 'mch-sdkwork-pc';
const DEFAULT_VERSION = '0.1.0';

const OUTPUT_FILES = {
  common: 'common/016_workspace_applications.sql',
  zh: 'locales/zh-CN/004_workspace_applications_zh.sql',
  en: 'locales/en-US/004_workspace_applications_en.sql',
};

// Directory-suffix -> application family. Families outside the requested
// H5/PC/Flutter/mini-program set (HarmonyOS mobile) are included as well;
// drop the entry here to exclude them from generation.
const FAMILY_BY_SUFFIX = [
  ['-flutter-mobile', 'flutter'],
  ['-harmony-mobile', 'harmony'],
  ['-mini-program', 'mp'],
  ['-flutter', 'flutter'],
  ['-h5', 'h5'],
  ['-pc', 'pc'],
];

// Canonical SDKWork vocabularies. APP_MANIFEST_SPEC.md section 4 defines
// app.appType as a PlusProjectType value, section 5 defines publish.platforms,
// and section 6 defines runtime.family and runtime.framework. The storefront
// platform codes are `appstore_platform_dictionary` codes (011).
const PLUS_PROJECT_TYPES = new Set([
  'NONE', 'SDK', 'PPT', 'APP_HTML', 'APP_VUE', 'APP_FLUTTER', 'APP_UNIAPP',
  'APP_REACT', 'APP_UNITY', 'APP_HARMONY', 'VIDEO', 'POSTER',
]);
const CANONICAL_RUNTIME_FAMILIES = new Set([
  'web', 'mobile', 'desktop', 'server', 'cli', 'mini-program', 'library', 'plugin',
]);
// Client implementation frameworks a client root may legitimately declare.
const CLIENT_RUNTIME_FRAMEWORKS = new Set([
  'react', 'react-h5', 'react-capacitor', 'react-tauri', 'react-electron',
  'react-vite', 'react-vite-h5', 'vite', 'web', 'static-html', 'flutter',
  'arkts', 'harmony-native', 'android-native', 'ios-native', 'uni-app',
  'weixin-mini-program', 'mp-weixin', 'alipay-mini-program',
  'multi-mini-program', 'unity',
]);
// Descriptive framework values that name a toolchain rather than a runtime are
// projected onto the canonical value of the root architecture
// (APP_MANIFEST_SPEC.md section 6).
const FRAMEWORK_ALIASES = {
  'mp-weixin': 'weixin-mini-program',
  arkts: 'harmony-native',
  'react-vite': 'react',
  'react-vite-h5': 'react-h5',
  vite: 'react',
  web: 'static-html',
};
// The app types a client root family may declare (APP_MANIFEST_SPEC.md
// section 6.1). A manifest type outside this set is a sibling-repository
// declaration defect that would make the catalog row describe a client the
// root cannot produce, so the family default is projected instead.
const ALLOWED_APP_TYPES_BY_FAMILY = {
  pc: new Set(['APP_REACT', 'APP_HTML', 'APP_VUE', 'APP_UNITY']),
  h5: new Set(['APP_REACT', 'APP_HTML', 'APP_VUE', 'APP_UNIAPP']),
  flutter: new Set(['APP_FLUTTER']),
  harmony: new Set(['APP_HARMONY']),
  mp: new Set(['APP_UNIAPP']),
};
// PlusPlatform -> storefront platform code. Generic values expand to every
// platform the family delivers, and a value with no dictionary code is omitted
// rather than invented.
const PLATFORM_CODES_BY_PLUS_PLATFORM = {
  WEB: ['web'],
  H5: ['h5'],
  H5_WEIXIN: ['h5'],
  DESKTOP_WINDOWS: ['windows'],
  DESKTOP_MACOS: ['macos'],
  DESKTOP_LINUX: ['linux'],
  APP: ['android', 'ios'],
  APP_PLUS: ['android', 'ios'],
  APP_ANDROID: ['android'],
  APP_IOS: ['ios'],
  APP_HARMONY: ['harmonyos'],
  MP: ['miniprogram-wechat'],
  MP_WEIXIN: ['miniprogram-wechat'],
  MP_ALIPAY: ['miniprogram-alipay'],
  MP_QQ: ['miniprogram-qq'],
  MP_TOUTIAO: ['miniprogram-douyin'],
  MP_BAIDU: ['miniprogram-baidu'],
};
// Stable storefront order of platform codes (dictionary sort order first,
// mobile before desktop, web last).
const PLATFORM_CODE_ORDER = [
  'ios', 'ipados', 'android', 'harmonyos',
  'windows', 'macos', 'linux',
  'web', 'h5',
  'miniprogram-wechat', 'miniprogram-alipay', 'miniprogram-qq',
  'miniprogram-douyin', 'miniprogram-baidu', 'miniprogram-taobao',
  'browser-extension-chrome', 'browser-extension-edge',
  'browser-extension-firefox', 'browser-extension-safari',
];

// Family defaults: the canonical app type, runtime family, runtime framework,
// and minimum platform set of each client root architecture
// (APP_MANIFEST_SPEC.md section 6.1).
const FAMILY_PROFILE = {
  pc: {
    appType: 'APP_REACT',
    runtimeFamily: 'web',
    runtimeFramework: 'react',
    platforms: ['web'],
    releaseTargets: ['web'],
    accessUrl: (appId) => `https://apps.sdkwork.com/${appId}/`,
    labelZh: 'PC 端',
    labelEn: 'PC (desktop web)',
  },
  h5: {
    appType: 'APP_HTML',
    runtimeFamily: 'mobile',
    runtimeFramework: 'react-h5',
    platforms: ['h5'],
    releaseTargets: ['h5'],
    accessUrl: (appId) => `https://apps.sdkwork.com/${appId}/`,
    labelZh: 'H5 移动网页端',
    labelEn: 'H5 mobile web',
  },
  flutter: {
    appType: 'APP_FLUTTER',
    runtimeFamily: 'mobile',
    runtimeFramework: 'flutter',
    platforms: ['android', 'ios'],
    releaseTargets: ['mobile'],
    accessUrl: () => null,
    labelZh: 'Flutter 移动端',
    labelEn: 'Flutter mobile',
  },
  harmony: {
    appType: 'APP_HARMONY',
    runtimeFamily: 'mobile',
    runtimeFramework: 'harmony-native',
    platforms: ['harmonyos'],
    releaseTargets: ['mobile'],
    accessUrl: () => null,
    labelZh: '鸿蒙移动端',
    labelEn: 'HarmonyOS mobile',
  },
  mp: {
    appType: 'APP_UNIAPP',
    runtimeFamily: 'mini-program',
    runtimeFramework: 'weixin-mini-program',
    platforms: ['miniprogram-wechat'],
    releaseTargets: ['miniprogram'],
    accessUrl: () => null,
    labelZh: '小程序端',
    labelEn: 'mini program',
  },
};

// Package platform -> installer operating system. WEB/H5/MP packages are
// reached by direct open or by scanning a code and publish no installer.
const INSTALLER_PLATFORM_BY_PLUS_PLATFORM = {
  DESKTOP_WINDOWS: 'windows',
  DESKTOP_MACOS: 'macos',
  DESKTOP_LINUX: 'linux',
  APP_ANDROID: 'android',
  APP_IOS: 'ios',
  APP_HARMONY: 'harmonyos',
};
const INSTALLER_FORMATS = new Set([
  'exe', 'msi', 'msix', 'zip', 'dmg', 'pkg', 'appimage', 'deb', 'rpm',
  'tar_gz', 'tar.gz', 'apk', 'aab', 'ipa', 'hap',
]);
const CLIENT_RUNTIME_TARGETS = new Set([
  'desktop', 'browser', 'capacitor-ios', 'capacitor-android',
  'flutter-ios', 'flutter-android', 'android-native', 'ios-native',
  'harmony-native', 'tablet-ipados', 'tablet-android',
]);
const MIN_OS_BY_PLATFORM = {
  windows: '10.0',
  macos: '12.0',
  linux: '22.04',
  android: '8.0',
  ios: '15.0',
  ipados: '15.0',
  harmonyos: '5.0',
};


// Module -> storefront category. Keys are sdkwork-space repository names.
// Unknown modules fall back to `appstore-category-apps` with a warning.
const REPO_CATEGORY = {
  'sdkwork-agents': 'cat-ai-coding',
  'sdkwork-agentstudio': 'cat-ai-coding',
  'sdkwork-codebox': 'cat-ai-coding',
  'sdkwork-github': 'cat-ai-coding',
  'sdkwork-terminal': 'appstore-category-tools',
  'sdkwork-browser': 'appstore-category-tools',
  'sdkwork-llm': 'cat-ai-productivity',
  'sdkwork-prompts': 'cat-ai-productivity',
  'sdkwork-mcp': 'cat-ai-productivity',
  'sdkwork-skills': 'cat-ai-productivity',
  'sdkwork-modelkit': 'cat-ai-productivity',
  'sdkwork-models': 'cat-ai-productivity',
  'sdkwork-memory': 'cat-ai-productivity',
  'sdkwork-knowledgebase': 'cat-ai-productivity',
  'sdkwork-generations': 'cat-ai-productivity',
  'sdkwork-search': 'cat-ai-productivity',
  'sdkwork-local-router': 'appstore-category-tools',
  'sdkwork-appstore': 'appstore-category-apps',
  'sdkwork-whatseek': 'cat-ai-assistants',
  'sdkwork-canvas': 'cat-ai-creative',
  'sdkwork-image': 'cat-ai-creative',
  'sdkwork-music': 'cat-ai-creative',
  'sdkwork-video': 'cat-ai-creative',
  'sdkwork-video-cut': 'cat-ai-creative',
  'sdkwork-audio': 'cat-ai-creative',
  'sdkwork-tts': 'cat-ai-creative',
  'sdkwork-voice': 'cat-ai-creative',
  'sdkwork-drama': 'appstore-category-entertainment',
  'sdkwork-news': 'appstore-category-entertainment',
  'sdkwork-feeds': 'appstore-category-entertainment',
  'sdkwork-missory': 'appstore-category-apps',
  'sdkwork-documents': 'cat-office',
  'sdkwork-mail': 'cat-office',
  'sdkwork-drive': 'cat-office',
  'sdkwork-notes': 'cat-office',
  'sdkwork-cms': 'appstore-category-productivity',
  'sdkwork-account': 'appstore-category-productivity',
  'sdkwork-iam': 'appstore-category-productivity',
  'sdkwork-settings': 'appstore-category-productivity',
  'sdkwork-manager': 'appstore-category-productivity',
  'sdkwork-portal': 'appstore-category-productivity',
  'sdkwork-deployments': 'appstore-category-productivity',
  'sdkwork-cloudrouter': 'appstore-category-productivity',
  'sdkwork-webserver': 'appstore-category-productivity',
  'sdkwork-web-framework': 'appstore-category-productivity',
  'sdkwork-kernel': 'appstore-category-productivity',
  'sdkwork-payment': 'appstore-category-productivity',
  'sdkwork-order': 'appstore-category-productivity',
  'sdkwork-mall': 'appstore-category-productivity',
  'sdkwork-merchandise': 'appstore-category-productivity',
  'sdkwork-shop': 'appstore-category-productivity',
  'sdkwork-inventory': 'appstore-category-productivity',
  'sdkwork-invoice': 'appstore-category-productivity',
  'sdkwork-membership': 'appstore-category-productivity',
  'sdkwork-promotion': 'appstore-category-productivity',
  'sdkwork-partner': 'appstore-category-productivity',
  'sdkwork-im': 'appstore-category-apps',
  'sdkwork-community': 'appstore-category-apps',
  'sdkwork-company': 'appstore-category-apps',
  'sdkwork-forum': 'appstore-category-apps',
  'sdkwork-customerservice': 'appstore-category-apps',
  'sdkwork-messaging': 'appstore-category-apps',
  'sdkwork-rtc': 'appstore-category-apps',
  'sdkwork-aiot': 'appstore-category-apps',
  'sdkwork-assets': 'appstore-category-apps',
  'sdkwork-notary': 'appstore-category-apps',
  'sdkwork-notes': 'cat-office',
  'sdkwork-course': 'appstore-category-education',
  'sdkwork-zhiya': 'appstore-category-education',
  'sdkwork-doudizhu': 'cat-board-games',
  'sdkwork-mahjong': 'cat-board-games',
  'sdkwork-xiangqi': 'cat-board-games',
  'sdkwork-dezhou': 'cat-board-games',
  'sdkwork-birdcoder': 'cat-mini-games',
  'sdkwork-birdcoder2': 'cat-mini-games',
  'sdkwork-games': 'cat-mini-games',
  'sdkwork-gameengine': 'cat-mini-games',
};

const DEFAULT_CATEGORY = 'appstore-category-apps';

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function sqlText(value) {
  return String(value).replace(/'/g, "''");
}

function singleLine(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function classifyFamily(appDirName) {
  for (const [suffix, family] of FAMILY_BY_SUFFIX) {
    if (appDirName.endsWith(suffix)) {
      return family;
    }
  }
  return null;
}

function versionCode(version) {
  const parts = String(version).split('.');
  if (parts.some((part) => !/^\d+$/.test(part))) {
    return null;
  }
  return parts.join('');
}

/**
 * The canonical `app.appType` of a client root: the manifest value when it is a
 * PlusProjectType, else the root family default. `NONE` is a server/operations
 * type and cannot describe a client root, so it falls back to the family type.
 */
function resolveAppType(config, family) {
  const declared = singleLine(config.app?.appType).toUpperCase();
  const allowed = ALLOWED_APP_TYPES_BY_FAMILY[family];
  if (PLUS_PROJECT_TYPES.has(declared) && declared !== 'NONE' && allowed.has(declared)) {
    return declared;
  }
  return FAMILY_PROFILE[family].appType;
}

/**
 * The canonical `runtime.family` of a client root. PC roots keep a declared
 * desktop family (the Tauri/Electron host), every other root family maps to its
 * delivery family; a server/web declaration on a mobile root is a backend
 * projection, not the client family.
 */
function resolveRuntimeFamily(config, family) {
  const declared = singleLine(config.runtime?.family).toLowerCase();
  if (family === 'pc' && declared === 'desktop') {
    return 'desktop';
  }
  return FAMILY_PROFILE[family].runtimeFamily;
}

/** The client runtime framework; an unlisted backend framework falls back. */
function resolveRuntimeFramework(config, family) {
  const declared = singleLine(config.runtime?.framework).toLowerCase();
  const normalized = FRAMEWORK_ALIASES[declared] ?? declared;
  // APP_MANIFEST_SPEC.md section 6.1: an H5-only root uses `react-h5`.
  if (family === 'h5' && normalized === 'react') {
    return 'react-h5';
  }
  if (normalized && CLIENT_RUNTIME_FRAMEWORKS.has(normalized)) {
    return normalized;
  }
  return FAMILY_PROFILE[family].runtimeFramework;
}

/**
 * Storefront platform codes of one client root: the family minimums plus every
 * `publish.platforms` value the root can actually deliver. Values with no
 * dictionary code (generic `DESKTOP`, mini program vendors outside the
 * dictionary) are expanded or omitted instead of invented.
 */
function resolvePlatforms(config, family) {
  const selected = new Set(FAMILY_PROFILE[family].platforms);
  const platformSet = resolveDeclaredPlatforms(config, family);
  for (const code of platformSet) {
    selected.add(code);
  }
  // An enabled client package is a shipped distribution even when the manifest
  // forgot to list its platform in publish.platforms. The installer matrix and
  // the platform matrix must agree, so the package platform is added here.
  for (const code of enabledInstallerPlatforms(config)) {
    selected.add(code);
  }
  return orderPlatforms([...selected]);
}

/** Family-scoped platform codes declared by `publish.platforms`. */
function resolveDeclaredPlatforms(config, family) {
  const declared = Array.isArray(config.publish?.platforms) ? config.publish.platforms : [];
  const mapped = new Set();
  let genericDesktop = false;
  for (const value of declared) {
    const key = singleLine(value).toUpperCase();
    if (key === 'DESKTOP') {
      genericDesktop = true;
      continue;
    }
    for (const code of PLATFORM_CODES_BY_PLUS_PLATFORM[key] ?? []) {
      mapped.add(code);
    }
  }
  const hasSpecificDesktop = ['windows', 'macos', 'linux'].some((code) => mapped.has(code));
  if (genericDesktop && !hasSpecificDesktop) {
    for (const code of ['windows', 'macos', 'linux']) {
      mapped.add(code);
    }
  }

  const selected = new Set();
  if (family === 'pc') {
    for (const code of mapped) {
      if (['web', 'windows', 'macos', 'linux'].includes(code)) {
        selected.add(code);
      }
    }
    return selected;
  }
  if (family === 'h5') {
    for (const code of mapped) {
      if (['web', 'h5', 'android', 'ios', 'ipados', 'harmonyos'].includes(code)) {
        selected.add(code);
      }
    }
    return selected;
  }
  if (family === 'flutter') {
    for (const code of mapped) {
      if (['android', 'ios', 'ipados', 'harmonyos'].includes(code)) {
        selected.add(code);
      }
    }
    return selected;
  }
  if (family === 'harmony') {
    return selected;
  }
  for (const code of mapped) {
    if (code.startsWith('miniprogram-')) {
      selected.add(code);
    }
  }
  return selected;
}

/** Installer platforms of the enabled client packages. */
function enabledInstallerPlatforms(config) {
  const codes = new Set();
  for (const packaged of enabledClientPackages(config)) {
    codes.add(packaged.platform);
  }
  return codes;
}

/** Sort platform codes into the stable storefront order. */
function orderPlatforms(codes) {
  const unique = [...new Set(codes)];
  return unique.sort((left, right) => {
    const leftIndex = PLATFORM_CODE_ORDER.indexOf(left);
    const rightIndex = PLATFORM_CODE_ORDER.indexOf(right);
    const leftRank = leftIndex === -1 ? PLATFORM_CODE_ORDER.length : leftIndex;
    const rightRank = rightIndex === -1 ? PLATFORM_CODE_ORDER.length : rightIndex;
    return leftRank - rightRank || left.localeCompare(right);
  });
}

/** Normalize a published architecture onto `x64`/`arm64`/`universal`. */
function normalizeArchitecture(raw) {
  const value = singleLine(raw).toLowerCase();
  if (value === 'x64' || value === 'x86_64' || value === 'amd64') {
    return 'x64';
  }
  if (value === 'arm64' || value === 'aarch64') {
    return 'arm64';
  }
  return 'universal';
}

/** File extension of a package format. */
function packageExtension(packageFormat) {
  const value = singleLine(packageFormat).toLowerCase();
  return value === 'tar.gz' ? 'tar.gz' : value;
}

/** Install package list of either a manifest config or a scanned application. */
function packagesOf(source) {
  if (Array.isArray(source?.packages)) {
    return source.packages;
  }
  return Array.isArray(source?.artifacts?.installConfig?.packages)
    ? source.artifacts.installConfig.packages
    : [];
}

/**
 * Enabled client packages that carry a storefront installer. Server, container,
 * and test-runner packages are deployment units, not storefront installers, and
 * web/H5 packages are opened or scanned instead of downloaded.
 */
function enabledClientPackages(source, appId = '') {
  const packages = packagesOf(source);
  const seen = new Set();
  const result = [];
  for (const pkg of packages) {
    if (pkg?.enabled !== true) {
      continue;
    }
    const runtimeTarget = singleLine(pkg.runtimeTarget).toLowerCase();
    if (runtimeTarget && !CLIENT_RUNTIME_TARGETS.has(runtimeTarget)) {
      continue;
    }
    const plusPlatform = singleLine(pkg.platform).toUpperCase();
    const platform = INSTALLER_PLATFORM_BY_PLUS_PLATFORM[plusPlatform];
    if (!platform) {
      continue;
    }
    const packageFormat = singleLine(pkg.packageFormat).toLowerCase();
    if (!INSTALLER_FORMATS.has(packageFormat)) {
      continue;
    }
    const architecture = normalizeArchitecture(pkg.architecture);
    const key = `${appId}:${platform}:${architecture}:${packageFormat}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push({ platform, architecture, packageFormat, package: pkg });
  }
  return result;
}

/** True for a well-formed lowercase/uppercase SHA-256 hex digest. */
function isSha256(value) {
  return /^[0-9a-f]{64}$/i.test(String(value ?? '').trim());
}

/**
 * Installer rows of one application projected from its enabled client packages.
 * A publisher checksum is kept only when it is a real SHA-256 digest; scaffold
 * manifests carry placeholders (repeating hex, or the same digest copied across
 * applications), and a build whose digest matches another build cannot be
 * verified or downloaded unambiguously.
 */
function installerArtifacts(app) {
  return enabledClientPackages(app, app.appId).map(({ platform, architecture, packageFormat, package: pkg }) => {
    const extension = packageExtension(packageFormat);
    const version = String(app.version);
    const id = `art-${app.appId}-${app.versionCode}-${platform}-${architecture}-${packageFormat}`;
    const declaredChecksum = singleLine(pkg.checksum);
    return {
      id,
      artifactNo: `ART-${id.slice(4).replaceAll('-', '').toUpperCase()}`,
      platform,
      architecture,
      packageFormat,
      contentTypes: CONTENT_TYPE_BY_FORMAT[packageFormat] ?? 'application/octet-stream',
      url: singleLine(pkg.url) || `https://cdn.sdkwork.com/apps/${app.appId}/${version}/${platform}/${architecture}/app.${extension}`,
      driveNodeId: `drive://appstore/${app.appId}/releases/${app.versionCode}/${platform}/${architecture}/app.${extension}`,
      checksum: isSha256(declaredChecksum) ? declaredChecksum.toLowerCase() : stableSha256(`${id}:${version}`),
      sizeBytes: Number.isFinite(Number(pkg.sizeBytes)) && Number(pkg.sizeBytes) > 0
        ? String(Math.trunc(Number(pkg.sizeBytes)))
        : String(41943040 + (hashCode(id) % 471859200)),
      minOsVersion: MIN_OS_BY_PLATFORM[platform] ?? null,
    };
  });
}

/**
 * Two artifacts must never share a digest. A digest repeated across the seeded
 * matrix is a copied scaffold placeholder, so every member of the duplicate
 * group is replaced with its own deterministic digest.
 */
function ensureUniqueArtifactChecksums(entries) {
  const counts = new Map();
  for (const { artifact } of entries) {
    const key = artifact.checksum;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  for (const { app, artifact } of entries) {
    if ((counts.get(artifact.checksum) ?? 0) > 1) {
      artifact.checksum = stableSha256(`${artifact.id}:${app.version}`);
    }
  }
}

const CONTENT_TYPE_BY_FORMAT = {
  exe: 'application/vnd.microsoft.portable-executable',
  msi: 'application/x-msi',
  msix: 'application/msix',
  zip: 'application/zip',
  dmg: 'application/x-apple-diskimage',
  pkg: 'application/octet-stream',
  appimage: 'application/vnd.appimage',
  deb: 'application/vnd.debian.binary-package',
  rpm: 'application/x-rpm',
  tar_gz: 'application/gzip',
  'tar.gz': 'application/gzip',
  apk: 'application/vnd.android.package-archive',
  aab: 'application/octet-stream',
  ipa: 'application/octet-stream',
  hap: 'application/octet-stream',
};

/** Deterministic non-negative int32 hash of a seed string. */
function hashCode(value) {
  let hash = 0;
  for (const char of String(value)) {
    hash = (Math.imul(hash, 31) + char.charCodeAt(0)) | 0;
  }
  return Math.abs(hash);
}

/** Deterministic 64-hex-character digest for seeded artifact checksums. */
function stableSha256(value) {
  return `${createHash('sha256').update(String(value)).digest('hex')}`;
}

function scanWorkspaceApplications(workspaceRoot) {
  const entries = fs
    .readdirSync(workspaceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('sdkwork-'))
    .map((entry) => entry.name)
    .sort();

  const applications = [];
  const skipped = [];
  // One row per application id. Two sibling repositories can declare the same
  // app id; the storefront identity is the id, so the first declaration in
  // sorted repository order wins and the duplicate is reported.
  const seenAppIds = new Map();

  for (const repo of entries) {
    const repoRootPath = path.join(workspaceRoot, repo);
    const appsDir = path.join(repoRootPath, 'apps');
    if (!fs.existsSync(appsDir)) {
      continue;
    }

    let rootConfig = null;
    const rootConfigPath = path.join(repoRootPath, 'agent.app.config.json');
    if (fs.existsSync(rootConfigPath)) {
      try {
        rootConfig = readJson(rootConfigPath);
      } catch (error) {
        skipped.push({ repo, reason: `root config unreadable: ${error.message}` });
      }
    }

    const appDirs = fs
      .readdirSync(appsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    for (const appDir of appDirs) {
      const configPath = path.join(appsDir, appDir, 'agent.app.config.json');
      if (!fs.existsSync(configPath)) {
        continue;
      }
      const family = classifyFamily(appDir);
      if (!family) {
        skipped.push({ repo, app: appDir, reason: 'unrecognized application family' });
        continue;
      }
      const duplicateOf = seenAppIds.get(appDir);
      if (duplicateOf !== undefined) {
        skipped.push({
          repo,
          app: appDir,
          reason: `duplicate application id (already declared by ${duplicateOf})`,
        });
        continue;
      }
      seenAppIds.set(appDir, repo);
      let config;
      try {
        config = readJson(configPath);
      } catch (error) {
        skipped.push({ repo, app: appDir, reason: `config unreadable: ${error.message}` });
        continue;
      }
      const rootApp = rootConfig?.app ?? {};
      const app = config.app ?? {};
      const version = config.release?.currentVersion || DEFAULT_VERSION;
      const code = versionCode(version);
      if (!code) {
        skipped.push({ repo, app: appDir, reason: `non-numeric version: ${version}` });
        continue;
      }
      const displayName = singleLine(app.displayName) || singleLine(rootApp.displayName) || appDir;
      const moduleDisplayName = singleLine(rootApp.displayName) || repo;
      const moduleDescription = singleLine(rootApp.description) || '';
      applications.push({
        repo,
        appDir,
        family,
        appId: appDir,
        displayName,
        moduleDisplayName,
        moduleDescription,
        moduleWebsiteUrl: singleLine(rootApp.officialWebsiteUrl) || null,
        appType: resolveAppType(config, family),
        runtimeFamily: resolveRuntimeFamily(config, family),
        runtimeFramework: resolveRuntimeFramework(config, family),
        platforms: resolvePlatforms(config, family),
        packages: Array.isArray(config.artifacts?.installConfig?.packages)
          ? config.artifacts.installConfig.packages
          : [],
        version,
        versionCode: code,
        category: REPO_CATEGORY[repo] ?? DEFAULT_CATEGORY,
        profile: FAMILY_PROFILE[family],
      });
    }
  }

  return { applications, skipped };
}

function quote(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  return `'${sqlText(value)}'`;
}

function quoteJson(value) {
  return quote(JSON.stringify(value));
}

function now() {
  return 'CURRENT_TIMESTAMP';
}

function applicationRow(app) {
  const platforms = app.platforms;
  return [
    quote(app.appId),
    quote(TENANT_ID),
    quote(ORGANIZATION_ID),
    quote(PUBLISHER_ID),
    quote(`app-${app.appId}`),
    quote(app.appId),
    quote(app.appId),
    quote(app.displayName),
    quote('zh-CN'),
    quote(app.appType),
    quote(app.runtimeFamily),
    quote(app.runtimeFramework),
    quote('active'),
    quote('active'),
    quote('approved'),
    quote('FREE'),
    quote(app.category),
    quote('4+'),
    quote(app.moduleWebsiteUrl),
    quote(app.profile.accessUrl(app.appId)),
    quoteJson(platforms),
    quote(app.moduleDescription || null),
    now(),
    now(),
  ].join(', ');
}

function listingRow(app) {
  return [
    quote(app.appId),
    quote(TENANT_ID),
    quote(ORGANIZATION_ID),
    quote(PUBLISHER_ID),
    quote(`L-${app.appId}`),
    quote(app.appId),
    quote(app.appId),
    quote(app.appId),
    quote('APP'),
    quote('FREE'),
    quote('active'),
    quote('visible'),
    quote('approved'),
    quote(app.category),
    quote('zh-CN'),
    quote('4+'),
    quote(`thread-${app.appId}`),
    '0',
    '0',
    'NULL',
    '0',
    now(),
    now(),
    now(),
    now(),
  ].join(', ');
}

function mediaRows(app) {
  const roles = [
    ['icon', 'ICON', 0],
    ['shot1', 'SCREENSHOT', 1],
    ['shot2', 'SCREENSHOT', 2],
  ];
  return roles.map(([suffix, role, sortOrder]) =>
    [
      quote(`media-${app.appId}-${suffix}`),
      quote(TENANT_ID),
      quote(ORGANIZATION_ID),
      quote(app.appId),
      quote(role),
      quote(`mr-${app.appId}-${suffix}`),
      quote(`drive://appstore/${app.appId}/${suffix}`),
      quote('ALL'),
      String(sortOrder),
      quote('zh-CN'),
      now(),
      now(),
    ].join(', '),
  );
}

function releaseRow(app) {
  const operatingSystems = app.platforms.filter((code) => MIN_OS_BY_PLATFORM[code] !== undefined);
  const minimumOsVersion = operatingSystems.length === 1
    ? MIN_OS_BY_PLATFORM[operatingSystems[0]]
    : null;
  return [
    quote(`rel-${app.appId}-${app.versionCode}`),
    quote(TENANT_ID),
    quote(ORGANIZATION_ID),
    quote(app.appId),
    quote(`R-${app.appId}-${app.versionCode}`),
    quote(RELEASE_CHANNEL_ID),
    quote(app.version),
    quote(app.versionCode),
    quote('1'),
    quote('published'),
    quote(minimumOsVersion),
    quote('zh-CN'),
    quoteJson({ targets: releaseTargets(app.platforms), platforms: app.platforms }),
    now(),
    now(),
    now(),
    now(),
    now(),
  ].join(', ');
}

/** Delivery target groups of a platform list (catalog `targets` metadata). */
function releaseTargets(platforms) {
  const groups = new Set();
  for (const code of platforms) {
    if (['windows', 'macos', 'linux'].includes(code)) {
      groups.add('pc');
    } else if (['android', 'ios', 'ipados', 'harmonyos'].includes(code)) {
      groups.add('mobile');
    } else if (code === 'h5') {
      groups.add('h5');
    } else if (code === 'web') {
      groups.add('web');
    } else if (code.startsWith('miniprogram-')) {
      groups.add('miniprogram');
    }
  }
  return [...groups];
}

function artifactRow(app, artifact) {
  return [
      quote(artifact.id),
      quote(TENANT_ID),
      quote(ORGANIZATION_ID),
      quote(`rel-${app.appId}-${app.versionCode}`),
      quote(artifact.artifactNo),
      quote(artifact.platform),
      quote(artifact.architecture),
      quote(artifact.packageFormat),
      quote('verified'),
      quote(artifact.driveNodeId),
      quote(`mr-${artifact.id}`),
      quote(artifact.sizeBytes),
      quote(artifact.contentTypes),
      quote(artifact.checksum),
      quote(
        '{"signer":"sdkwork-appstore-release-service","algorithm":"sha256","keyId":"seed-ed25519-2026","signedAt":"2026-08-03T00:00:00Z"}',
      ),
      quote(`sbom://appstore/${app.appId}/${app.versionCode}/${artifact.platform}/${artifact.architecture}`),
      quote(`provenance://appstore/${app.appId}/${app.versionCode}/${artifact.platform}/${artifact.architecture}`),
      quote(artifact.minOsVersion),
      quote('passed'),
      quote(artifact.url),
      now(),
      now(),
    ].join(', ');
}

function localizationRow(app, locale) {
  const profile = app.profile;
  const isZh = locale === 'zh-CN';
  const displayName = app.displayName;
  const subtitle = isZh
    ? `${app.moduleDisplayName} · ${profile.labelZh}`
    : `${app.moduleDisplayName} · ${profile.labelEn}`;
  const moduleClause = isZh
    ? `${app.moduleDisplayName}（${app.repo} 模块）`
    : `${app.moduleDisplayName} (module ${app.repo})`;
  const familyClause = isZh ? profile.labelZh : profile.labelEn;
  const shortDescription = singleLine(
    isZh
      ? `${moduleClause}的 ${familyClause}应用，由 SDKWork 应用商店统一分发。`
      : `The ${familyClause} application of ${moduleClause}, distributed through the SDKWork App Store.`,
  );
  const fullDescription = singleLine(
    isZh
      ? `${moduleClause}的 ${familyClause}应用，随 SDKWork 工作区统一构建与发布。${app.moduleDescription}`.trim()
      : `The ${familyClause} application of ${moduleClause}, built and released with the SDKWork workspace. ${app.moduleDescription}`.trim(),
  );
  const whatsNew = isZh ? `• ${app.version} 初始上架。` : `• Initial store release ${app.version}.`;
  const keywords = isZh
    ? [app.displayName, app.moduleDisplayName, 'SDKWork']
    : [app.displayName, app.moduleDisplayName, 'SDKWork'];
  return [
    quote(`loc-${app.appId}${isZh ? '' : '-en'}`),
    quote(TENANT_ID),
    quote(ORGANIZATION_ID),
    quote(app.appId),
    quote(locale),
    quote(displayName),
    quote(subtitle),
    quote(shortDescription),
    quote(fullDescription),
    quote(whatsNew),
    quoteJson(keywords),
    now(),
    now(),
  ].join(', ');
}

function releaseNoteRow(app, locale) {
  const isZh = locale === 'zh-CN';
  const notes = isZh
    ? `• ${app.version} 初始上架。`
    : `• Initial store release ${app.version}.`;
  return [
    quote(`note-${app.appId}${locale === 'zh-CN' ? '' : '-en'}`),
    quote(TENANT_ID),
    quote(ORGANIZATION_ID),
    quote(`rel-${app.appId}-${app.versionCode}`),
    quote(locale),
    quote(notes),
    now(),
    now(),
  ].join(', ');
}

function valuesBlock(header, rows, conflictClause) {
  const body = rows.map((row) => `    (${row})`);
  const last = body.length - 1;
  return body
    .map((line, index) => (index === last ? `${line}${conflictClause};` : `${line},`))
    .join('\n')
    .replace(/^/, `${header}\nVALUES\n`);
}

function buildCommonSql(applications) {
  const sections = [];
  sections.push(
    '-- 016_workspace_applications.sql — workspace module applications (H5 / PC / Flutter /\n' +
      '-- mini-program / HarmonyOS) generated from sibling repositories\u2019\n' +
      '-- `apps/*/agent.app.config.json` declarations.\n' +
      '-- Generated by `node database/seeds/.generate-workspace-applications.mjs`; do not hand-edit.\n' +
      '-- app_type, runtime_family, runtime_framework, and platforms are projected from the\n' +
      '-- manifest (APP_MANIFEST_SPEC.md sections 4-6); installer rows are projected from the\n' +
      '-- enabled client packages of artifacts.installConfig (section 10).\n',
  );

  sections.push(
    valuesBlock(
      'INSERT INTO appstore_app\n' +
        '    (id, tenant_id, organization_id, publisher_id, app_no, app_key, app_slug, display_name, default_locale, app_type, runtime_family, runtime_framework, app_status, distribution_status, review_status, monetization_mode, primary_category_id, age_rating_code, official_website_url, access_url, platforms, description, created_at, updated_at)',
      applications.map(applicationRow),
      '\nON CONFLICT (id) DO UPDATE SET\n' +
        '    app_type = EXCLUDED.app_type,\n' +
        '    runtime_family = EXCLUDED.runtime_family,\n' +
        '    runtime_framework = EXCLUDED.runtime_framework,\n' +
        '    platforms = EXCLUDED.platforms,\n' +
        '    updated_at = EXCLUDED.updated_at',
    ),
  );

  sections.push(
    valuesBlock(
      'INSERT INTO appstore_listing\n' +
        '    (id, tenant_id, organization_id, publisher_id, listing_no, app_id, app_key, listing_slug, listing_type, pricing_model, listing_status, storefront_visibility, review_status, primary_category_id, default_locale, age_rating_code, comments_thread_id, featured_score, download_count, average_rating, rating_count, submitted_at, published_at, created_at, updated_at)',
      applications.map(listingRow),
      '\nON CONFLICT (id) DO NOTHING',
    ),
  );

  sections.push(
    valuesBlock(
      'INSERT INTO appstore_listing_media\n' +
        '    (id, tenant_id, organization_id, listing_id, media_role, media_resource_id, drive_node_id, platform_scope, sort_order, locale, created_at, updated_at)',
      applications.flatMap(mediaRows),
      '\nON CONFLICT (id) DO NOTHING',
    ),
  );

  sections.push(
    valuesBlock(
      'INSERT INTO appstore_release\n' +
        '    (id, tenant_id, organization_id, listing_id, release_no, channel_id, version_name, version_code, build_number, release_status, minimum_os_version, release_notes_default_locale, manifest_snapshot_json, submitted_at, approved_at, published_at, created_at, updated_at)',
      applications.map(releaseRow),
      '\nON CONFLICT (id) DO UPDATE SET\n' +
        '    minimum_os_version = EXCLUDED.minimum_os_version,\n' +
        '    manifest_snapshot_json = EXCLUDED.manifest_snapshot_json,\n' +
        '    updated_at = EXCLUDED.updated_at',
    ),
  );

  const plannedArtifacts = applications.flatMap((app) =>
    installerArtifacts(app).map((artifact) => ({ app, artifact })),
  );
  ensureUniqueArtifactChecksums(plannedArtifacts);
  const artifactRowsAll = plannedArtifacts.map(({ app, artifact }) => artifactRow(app, artifact));
  if (artifactRowsAll.length > 0) {
    sections.push(
      valuesBlock(
        'INSERT INTO appstore_release_artifact\n' +
          '    (id, tenant_id, organization_id, release_id, artifact_no, platform, architecture, package_format, artifact_status, drive_node_id, media_resource_id, file_size_bytes, content_type, checksum_sha256, signature_snapshot_json, sbom_ref, provenance_ref, min_os_version, virus_scan_status, cdn_url, created_at, updated_at)',
        artifactRowsAll,
        '\nON CONFLICT (id) DO NOTHING',
      ),
    );
  }

  const idList = applications.map((app) => `'${sqlText(app.appId)}'`).join(',\n    ');
  sections.push(
    `-- Bind each generated listing to its latest published release.\n` +
      `UPDATE appstore_listing l\n` +
      `SET current_release_id = (\n` +
      `    SELECT r.id FROM appstore_release r\n` +
      `    WHERE r.listing_id = l.id AND r.release_status = 'published'\n` +
      `    ORDER BY r.published_at DESC LIMIT 1\n` +
      `)\n` +
      `WHERE l.tenant_id = '${TENANT_ID}'\n` +
      `  AND l.id IN (\n    ${idList}\n)\n` +
      `  AND EXISTS (\n` +
      `    SELECT 1 FROM appstore_release r\n` +
      `    WHERE r.listing_id = l.id AND r.release_status = 'published'\n` +
      `  );`,
  );

  sections.push(
    `-- Primary category bindings for catalog filters (mirrors common/001_bootstrap.sql\n` +
      `-- but scoped to the generated listings, which use listing_status 'active').\n` +
      `INSERT INTO appstore_listing_category_binding\n` +
      `    (id, tenant_id, listing_id, category_id, is_primary, created_at)\n` +
      `SELECT\n` +
      `    'lcb-' || l.id,\n` +
      `    l.tenant_id,\n` +
      `    l.id,\n` +
      `    l.primary_category_id,\n` +
      `    1,\n` +
      `    CURRENT_TIMESTAMP\n` +
      `FROM appstore_listing l\n` +
      `WHERE l.tenant_id = '${TENANT_ID}'\n` +
      `  AND l.id IN (\n    ${idList}\n)\n` +
      `  AND l.primary_category_id IS NOT NULL\n` +
      `  AND l.primary_category_id <> ''\n` +
      `ON CONFLICT (tenant_id, listing_id, category_id) DO NOTHING;`,
  );

  sections.push(
    `-- Approved compliance profiles for the generated listings.\n` +
      `INSERT INTO appstore_compliance_profile\n` +
      `    (id, tenant_id, organization_id, listing_id, compliance_version, privacy_nutrition_json, content_rating_questionnaire_json, data_safety_json, target_audience_json, compliance_status, reviewed_by, reviewed_at, created_at, updated_at)\n` +
      `SELECT\n` +
      `    'compliance-' || l.id,\n` +
      `    l.tenant_id,\n` +
      `    l.organization_id,\n` +
      `    l.id,\n` +
      `    1,\n` +
      `    '{"dataCollected": ["usage", "diagnostics"], "dataLinkedToUser": false}',\n` +
      `    '{"ageRating": "' || l.age_rating_code || '"}',\n` +
      `    '{"encryptionInTransit": true, "encryptionAtRest": true}',\n` +
      `    '{"audience": "general"}',\n` +
      `    'approved',\n` +
      `    'seed-bootstrap',\n` +
      `    CURRENT_TIMESTAMP,\n` +
      `    CURRENT_TIMESTAMP,\n` +
      `    CURRENT_TIMESTAMP\n` +
      `FROM appstore_listing l\n` +
      `WHERE l.tenant_id = '${TENANT_ID}'\n` +
      `  AND l.id IN (\n    ${idList}\n)\n` +
      `ON CONFLICT (tenant_id, listing_id, compliance_version) DO NOTHING;`,
  );

  for (const region of ['CN', 'US']) {
    sections.push(
      `-- Regional availability (${region}) for the generated listings.\n` +
        `INSERT INTO appstore_regional_availability\n` +
        `    (id, tenant_id, organization_id, listing_id, region_code, availability_status, effective_at, expires_at, created_at, updated_at)\n` +
        `SELECT\n` +
        `    'region-' || l.id || '-${region.toLowerCase()}',\n` +
        `    l.tenant_id,\n` +
        `    l.organization_id,\n` +
        `    l.id,\n` +
        `    '${region}',\n` +
        `    'available',\n` +
        `    CURRENT_TIMESTAMP,\n` +
        `    NULL,\n` +
        `    CURRENT_TIMESTAMP,\n` +
        `    CURRENT_TIMESTAMP\n` +
        `FROM appstore_listing l\n` +
        `WHERE l.tenant_id = '${TENANT_ID}'\n` +
        `  AND l.id IN (\n    ${idList}\n)\n` +
        `ON CONFLICT (tenant_id, listing_id, region_code) DO NOTHING;`,
    );
  }

  sections.push(
    `-- Market-channel releases on the SDKWork storefront channel.\n` +
      `INSERT INTO appstore_market_release\n` +
      `    (id, tenant_id, organization_id, app_id, listing_id, release_id, channel_id, market_release_no, external_app_id, external_release_id, external_track, market_status, rollout_percent, countries_json, store_url, external_status_json, submitted_at, approved_at, released_at, rejected_at, last_synced_at, created_at, updated_at)\n` +
      `SELECT\n` +
      `    'mrel-' || r.id,\n` +
      `    r.tenant_id,\n` +
      `    r.organization_id,\n` +
      `    l.app_id,\n` +
      `    r.listing_id,\n` +
      `    r.id,\n` +
      `    '${MARKET_CHANNEL_ID}',\n` +
      `    'MR-' || UPPER(REPLACE(r.id, '-', '')),\n` +
      `    l.app_key,\n` +
      `    r.version_code,\n` +
      `    'production',\n` +
      `    'published',\n` +
      `    100,\n` +
      `    '["CN", "US"]',\n` +
      `    'https://appstore.sdkwork.local/apps/' || l.listing_slug,\n` +
      `    '{"syncState": "seeded"}',\n` +
      `    r.submitted_at,\n` +
      `    r.approved_at,\n` +
      `    r.published_at,\n` +
      `    NULL,\n` +
      `    CURRENT_TIMESTAMP,\n` +
      `    CURRENT_TIMESTAMP,\n` +
      `    CURRENT_TIMESTAMP\n` +
      `FROM appstore_release r\n` +
      `JOIN appstore_listing l\n` +
      `  ON l.id = r.listing_id\n` +
      ` AND l.tenant_id = r.tenant_id\n` +
      `WHERE r.tenant_id = '${TENANT_ID}'\n` +
      `  AND r.release_status = 'published'\n` +
      `  AND r.id IN (\n    ${applications.map((app) => `'${sqlText(`rel-${app.appId}-${app.versionCode}`)}'`).join(',\n    ')}\n)\n` +
      `ON CONFLICT (tenant_id, market_release_no) DO NOTHING;`,
  );

  return sections.join('\n\n') + '\n';
}

function buildLocaleSql(applications, locale) {
  const localeLabel = locale === 'zh-CN' ? 'zh-CN' : 'en-US';
  const sections = [];
  sections.push(
    `-- ${localeLabel} localizations for workspace module applications (generated).\n` +
      '-- Source: sibling repositories\u2019 `apps/*/agent.app.config.json`; partner file of\n' +
      '-- common/016_workspace_applications.sql. Do not hand-edit.\n',
  );
  sections.push(
    valuesBlock(
      'INSERT INTO appstore_listing_localization\n' +
        '    (id, tenant_id, organization_id, listing_id, locale, display_name, subtitle, short_description, full_description, whats_new_summary, keywords_json, created_at, updated_at)',
      applications.map((app) => localizationRow(app, localeLabel)),
      '\nON CONFLICT (tenant_id, listing_id, locale) DO NOTHING',
    ),
  );
  sections.push(
    valuesBlock(
      'INSERT INTO appstore_release_note_localization\n' +
        '    (id, tenant_id, organization_id, release_id, locale, release_notes, created_at, updated_at)',
      applications.map((app) => releaseNoteRow(app, localeLabel)),
      '\nON CONFLICT (tenant_id, release_id, locale) DO NOTHING',
    ),
  );
  return sections.join('\n') + '\n';
}

function main() {
  const checkMode = process.argv.includes('--check');
  const workspaceIndex = process.argv.indexOf('--workspace');
  const workspaceRoot = workspaceIndex >= 0
    ? path.resolve(process.argv[workspaceIndex + 1])
    : path.resolve(repoRoot, '..');

  const { applications, skipped } = scanWorkspaceApplications(workspaceRoot);
  if (applications.length === 0) {
    console.error(`[workspace-applications] no applications found under ${workspaceRoot}`);
    process.exit(1);
  }

  const outputs = new Map([
    [OUTPUT_FILES.common, buildCommonSql(applications)],
    [OUTPUT_FILES.zh, buildLocaleSql(applications, 'zh-CN')],
    [OUTPUT_FILES.en, buildLocaleSql(applications, 'en-US')],
  ]);

  let drift = false;
  for (const [relativePath, content] of outputs) {
    const target = path.join(seedsRoot, relativePath);
    if (checkMode) {
      const existing = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
      if (existing !== content) {
        console.error(`[workspace-applications] drift: ${relativePath} is stale; re-run the generator`);
        drift = true;
      }
    } else {
      fs.writeFileSync(target, content, 'utf8');
    }
  }

  const familyCounts = {};
  for (const app of applications) {
    familyCounts[app.family] = (familyCounts[app.family] ?? 0) + 1;
  }
  console.log(
    `[workspace-applications] ${applications.length} applications from scan: ` +
      Object.entries(familyCounts)
        .sort()
        .map(([family, count]) => `${family}=${count}`)
        .join(', '),
  );
  for (const item of skipped) {
    const label = item.app ? `${item.repo}/${item.app}` : item.repo;
    console.warn(`[workspace-applications] skipped ${label}: ${item.reason}`);
  }
  if (drift) {
    process.exit(1);
  }
}

main();
