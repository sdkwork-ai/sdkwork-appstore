#!/usr/bin/env node

// Shared scaffold library for the SDKWork App Store client application roots
// (`apps/sdkwork-appstore-{flutter-mobile,mini-program,harmony-mobile}`).
//
// Authority:
// - `sdkwork-specs/APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` (root family,
//   package segment, route identity, dependency direction)
// - `sdkwork-specs/FLUTTER_APP_MOBILE_ARCHITECTURE_SPEC.md`
// - `sdkwork-specs/MINI_PROGRAM_APP_ARCHITECTURE_SPEC.md`
// - `sdkwork-specs/HARMONY_APP_MOBILE_ARCHITECTURE_SPEC.md`
// - `sdkwork-specs/I18N_SPEC.md` section 6.1 (canonical authored layouts)
//
// Design rules (mirrors `sdkwork-agents/scripts/materialize-harmony-app-surface.mjs`):
// - Idempotent: existing files are never overwritten.
// - Scope: only writes under the three target roots.
// - Never writes `apps/README.md` (owned by sdkwork-specs align tooling).
// - Never writes a nested app-level `pnpm-workspace.yaml`.
// - Never declares an SDK dependency whose workspace does not exist.

import fs from 'node:fs';
import path from 'node:path';

export const applicationCode = 'appstore';
export const appId = 'sdkwork-appstore';
export const bundleName = 'com.sdkwork.appstore.mobile';
export const appApiSuffix = '/app/v3/api';
export const publicHttpUrl = 'http://127.0.0.1:8090';
export const runtimeEnvElementId = 'runtime-env';

/**
 * Deployment profiles and environments.
 *
 * `demo` is included because `etc/sdkwork.deployment.config.json` at the
 * repository root declares `standalone.demo` / `cloud.demo`.
 */
export const deploymentProfiles = ['standalone', 'cloud'];
export const environments = ['development', 'test', 'staging', 'production', 'demo'];
export const profileIds = deploymentProfiles.flatMap((profile) =>
  environments.map((environment) => `${profile}.${environment}`),
);

/** Environment alias vocabulary shared with the browser build tooling. */
export const environmentAlias = {
  development: 'dev',
  test: 'test',
  staging: 'staging',
  production: 'prod',
  demo: 'demo',
};

/** Per-environment gateway origins, mirroring the repository root etc index. */
export const environmentOrigins = {
  development: 'http://appstore-dev.sdkwork.com:3900/',
  test: 'https://appstore-test.sdkwork.com/',
  staging: 'https://appstore-staging.sdkwork.com/',
  production: 'https://appstore.sdkwork.com/',
  demo: 'https://appstore-demo.sdkwork.com/',
};

export const cloudApiBaseUrls = {
  development: 'https://api-dev.sdkwork.com',
  test: 'https://api-test.sdkwork.com',
  staging: 'https://api-staging.sdkwork.com',
  production: 'https://api.sdkwork.com',
  demo: 'https://api-demo.sdkwork.com',
};

/**
 * Canonical route identity table.
 *
 * Route ids are the cross-client alignment contract
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7): the id format is
 * `<surface>.<domain>.<capability>.<screen>`, and every client architecture
 * owns the same route id for the same workflow. Physical paths MAY differ per
 * platform, so this table carries the PC path as the canonical spelling and
 * each root may remap it.
 *
 * Authoritative source: the PC root router, `AppstorePcRoutes` in
 * `apps/sdkwork-appstore-pc/packages/sdkwork-appstore-pc-host/src/index.tsx`.
 * The AI Lab sidebar group order (专家 `/experts`, 扩展插件 `/plugins`,
 * 技能中心 `/skills`, MCP 服务 `/mcp`, 应用模板 `/templates`) is fixed by the
 * repository `AGENTS.md`.
 *
 * Every entry is a `SdkworkUiRouteContribution`-shaped record, so a root can
 * publish it from a capability package unchanged.
 */

/** Default presentation hints per surface. */
const appSurfacePresentation = Object.freeze({
  pc: 'page',
  h5Mobile: 'stack',
  flutterMobile: 'route',
  miniProgram: 'page',
  harmonyNative: 'page',
});

const consoleSurfacePresentation = Object.freeze({
  pc: 'page',
  h5Mobile: 'stack',
  flutterMobile: 'route',
  miniProgram: 'subpackagePage',
  harmonyNative: 'page',
});

function appRoute(capability, screen, routePath, options = {}) {
  return {
    id: `app.store.${capability}.${screen}`,
    surface: 'app',
    domain: 'store',
    capability,
    screen,
    path: routePath,
    titleKey: `appstore.${capability}.${screen}.title`,
    auth: options.auth ?? 'public',
    ...(options.params ? { params: options.params } : {}),
    presentation: appSurfacePresentation,
  };
}

function consoleRoute(domain, capability, screen, routePath, options = {}) {
  return {
    id: `console.${domain}.${capability}.${screen}`,
    surface: 'console',
    domain,
    capability,
    screen,
    path: routePath,
    titleKey: `appstore.${capability}.${screen}.title`,
    auth: 'required',
    ...(options.params ? { params: options.params } : {}),
    presentation: consoleSurfacePresentation,
  };
}

const idParam = [{ name: 'id', required: true }];

export const routeTable = [
  // --- Store catalog -------------------------------------------------------
  appRoute('discover', 'index', '/'),
  appRoute('apps', 'index', '/apps'),
  appRoute('games', 'index', '/games'),
  appRoute('charts', 'index', '/charts'),
  appRoute('category', 'detail', '/category/:id', { params: idParam }),
  appRoute('collection', 'detail', '/collection/:id', { params: idParam }),
  // --- AI Lab group (AGENTS.md sidebar order) ------------------------------
  appRoute('ai-hub', 'index', '/ai-hub'),
  appRoute('ai-hub', 'experts', '/experts'),
  appRoute('ai-hub', 'plugins', '/plugins'),
  appRoute('ai-hub', 'skills', '/skills'),
  appRoute('ai-hub', 'mcp', '/mcp'),
  appRoute('ai-hub', 'templates', '/templates'),
  appRoute('ai-hub', 'template-detail', '/template/:id', { params: idParam }),
  // The PC router registers both spellings for the template detail screen, so
  // every root accepts both deep links.
  appRoute('ai-hub', 'template-detail-alias', '/templates/:id', {
    params: idParam,
  }),
  // --- Discovery -----------------------------------------------------------
  appRoute('search', 'index', '/search'),
  appRoute('app-detail', 'detail', '/app/:id', { params: idParam }),
  appRoute('events', 'detail', '/events/:id', { params: idParam }),
  // --- Library (authenticated) ---------------------------------------------
  appRoute('library', 'index', '/library', { auth: 'required' }),
  appRoute('updates', 'index', '/updates', { auth: 'required' }),
  appRoute('wishlist', 'index', '/wishlist', { auth: 'required' }),
  // --- Personal store ------------------------------------------------------
  appRoute('user-store', 'index', '/user-store', { auth: 'required' }),
  appRoute('user-store', 'public', '/store/:shareToken', {
    params: [{ name: 'shareToken', required: true }],
  }),
  // --- Publisher console ---------------------------------------------------
  consoleRoute('store', 'publisher', 'overview', '/publisher'),
  consoleRoute('store', 'publisher', 'app-create', '/publisher/apps/new'),
  consoleRoute('store', 'publisher', 'app-manage', '/publisher/apps/:id', {
    params: idParam,
  }),
  // --- Console settings ----------------------------------------------------
  consoleRoute('system', 'settings', 'index', '/console/settings'),
];

/**
 * Capability package set, in build order.
 *
 * One token per owning capability package; the token is also the third segment
 * of every route id in `routeTable`, so package ownership and route identity
 * stay provably in sync.
 */
export const capabilities = [
  'discover',
  'apps',
  'games',
  'charts',
  'category',
  'collection',
  'ai-hub',
  'search',
  'app-detail',
  'events',
  'library',
  'updates',
  'wishlist',
  'user-store',
  'publisher',
  'settings',
];

/** Route entries owned by one capability token. */
export function routesForCapability(capability) {
  return routeTable.filter((entry) => entry.capability === capability);
}

/**
 * Serialize one route entry as a `SdkworkUiRouteContribution` object literal.
 *
 * `indent` is the leading indentation for the `{` line.
 */
export function routeContributionLiteral(entry, indent = '  ') {
  const fields = [
    `id: '${entry.id}'`,
    `surface: '${entry.surface}'`,
    `domain: '${entry.domain}'`,
    `capability: '${entry.capability}'`,
    `screen: '${entry.screen}'`,
    `path: '${entry.path}'`,
    `titleKey: '${entry.titleKey}'`,
    `auth: '${entry.auth}'`,
    ...(entry.params
      ? [
          `params: [${entry.params
            .map((param) => `{ name: '${param.name}', required: ${param.required} }`)
            .join(', ')}]`,
        ]
      : []),
    `presentation: ${JSON.stringify(entry.presentation)}`,
  ];
  return `${indent}{ ${fields.join(', ')} }`;
}

/**
 * Shared TypeScript declaration for the standard route contribution shape.
 *
 * Authority: `APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7. Every React
 * client root publishes route contributions in exactly this shape so the four
 * roots stay diffable against each other.
 */
export const sdkworkUiRouteContributionTs = `/** Where each architecture renders this route. */
export interface SdkworkRoutePresentation {
  readonly pc?: "page" | "drawer" | "dialog";
  readonly h5Mobile?: "stack" | "tab" | "modal" | "sheet";
  readonly flutterMobile?: "route" | "tab" | "bottomSheet";
  readonly miniProgram?: "page" | "subpackagePage";
  readonly harmonyNative?: "page" | "tab" | "dialog" | "sheet";
}

/**
 * Standard route contribution.
 *
 * \`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md\` section 7: route id, surface,
 * domain, capability, screen, title key, and auth hint are identical on every
 * client architecture that implements the same workflow. Route metadata never
 * declares HTTP API paths, SDK methods, or transport details.
 */
export interface SdkworkUiRouteContribution {
  readonly id: string;
  readonly surface: "app" | "console" | "admin";
  readonly domain: string;
  readonly capability: string;
  readonly screen: string;
  readonly path: string;
  readonly titleKey: string;
  readonly auth: "public" | "required";
  readonly permissionHint?: string;
  readonly params?: ReadonlyArray<{ readonly name: string; readonly required: boolean }>;
  readonly presentation?: SdkworkRoutePresentation;
}
`;

/**
 * Serialize the whole route table as a `SdkworkUiRouteContribution[]` literal
 * (`indent` prefixes each entry line).
 */
export function tsRouteTableLiteral(indent = '  ') {
  return routeTable
    .map((entry) => routeContributionLiteral(entry, indent))
    .join(',\n');
}

/**
 * Dart declaration for the same standard route contribution shape.
 *
 * Dart has no structural typing and no optional-prop bag, so presentation hints
 * stay per-architecture and the ordered path parameter names are carried
 * explicitly.
 */
export const sdkworkUiRouteContributionDart = `/// Client surface that owns the route.
enum SdkworkRouteSurface { app, console, admin }

/// Standard route contribution.
///
/// \`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md\` section 7: route id, surface,
/// domain, capability, screen, title key, and auth hint are identical on every
/// client architecture that implements the same workflow. Route metadata never
/// declares HTTP API paths, SDK methods, or transport details.
class SdkworkUiRouteContribution {
  const SdkworkUiRouteContribution({
    required this.id,
    required this.surface,
    required this.domain,
    required this.capability,
    required this.screen,
    required this.path,
    required this.titleKey,
    required this.auth,
    this.paramNames = const <String>[],
  });

  final String id;
  final SdkworkRouteSurface surface;
  final String domain;
  final String capability;
  final String screen;
  final String path;
  final String titleKey;

  /// \`public\` or \`required\`; route guards remain a shell responsibility.
  final String auth;

  /// Path parameter names in path order.
  final List<String> paramNames;

  /// Presentation hint for this architecture.
  String get presentation => 'route';
}
`;

/** Serialize one route entry as a Dart `SdkworkUiRouteContribution(...)`. */
export function dartRouteContributionLiteral(entry, indent = '  ') {
  const lines = [
    `${indent}SdkworkUiRouteContribution(`,
    `${indent}  id: '${entry.id}',`,
    `${indent}  surface: SdkworkRouteSurface.${entry.surface},`,
    `${indent}  domain: '${entry.domain}',`,
    `${indent}  capability: '${entry.capability}',`,
    `${indent}  screen: '${entry.screen}',`,
    `${indent}  path: '${entry.path}',`,
    `${indent}  titleKey: '${entry.titleKey}',`,
    `${indent}  auth: '${entry.auth}',`,
    ...(entry.params
      ? [
          `${indent}  paramNames: <String>[${entry.params
            .map((param) => `'${param.name}'`)
            .join(', ')}],`,
        ]
      : []),
    `${indent})`,
  ];
  return lines.join('\n');
}

/** Serialize the whole table as Dart entries. */
export function dartRouteTableLiteral(indent = '  ') {
  return routeTable
    .map((entry) => dartRouteContributionLiteral(entry, indent))
    .join(',\n');
}

/**
 * ArkTS declaration for the same standard route contribution shape.
 *
 * ArkTS restricts anonymous object literal types inside generics, so path
 * parameters are carried as an ordered name list and presentation hints stay
 * per-architecture.
 */
export const sdkworkUiRouteContributionArkTs = `/** Client surface that owns the route. */
export type SdkworkRouteSurface = 'app' | 'console' | 'admin';

/**
 * Standard route contribution.
 *
 * \`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md\` section 7: route id, surface,
 * domain, capability, screen, title key, and auth hint are identical on every
 * client architecture that implements the same workflow. Route metadata never
 * declares HTTP API paths, SDK methods, or transport details.
 */
export interface SdkworkUiRouteContribution {
  readonly id: string;
  readonly surface: SdkworkRouteSurface;
  readonly domain: string;
  readonly capability: string;
  readonly screen: string;
  readonly path: string;
  readonly titleKey: string;
  /** 'public' or 'required'; route guards remain a shell responsibility. */
  readonly auth: string;
  /** Path parameter names in path order. */
  readonly paramNames?: string[];
}
`;

/** Serialize one route entry as an ArkTS object literal. */
export function arkTsRouteContributionLiteral(entry, indent = '  ') {
  const fields = [
    `id: '${entry.id}'`,
    `surface: '${entry.surface}'`,
    `domain: '${entry.domain}'`,
    `capability: '${entry.capability}'`,
    `screen: '${entry.screen}'`,
    `path: '${entry.path}'`,
    `titleKey: '${entry.titleKey}'`,
    `auth: '${entry.auth}'`,
    ...(entry.params
      ? [`paramNames: [${entry.params.map((param) => `'${param.name}'`).join(', ')}]`]
      : []),
  ];
  return `${indent}{ ${fields.join(', ')} }`;
}

/** Serialize the whole table as ArkTS entries. */
export function arkTsRouteTableLiteral(indent = '  ') {
  return routeTable
    .map((entry) => arkTsRouteContributionLiteral(entry, indent))
    .join(',\n');
}

/** Generated SDK family shared by every App Store client architecture. */
export const sdkFamily = {
  workspace: 'sdkwork-appstore-app-sdk',
  typescriptPackageName: '@sdkwork/appstore-app-sdk',
  dartPackageName: 'sdkwork_appstore_app_sdk',
  apiAuthority: 'sdkwork-appstore-app-api',
  apiPrefix: appApiSuffix,
};

/**
 * Per-capability screen copy used by the generated i18n fragments.
 *
 * One entry per capability token in `capabilities`; `titleZh` is the zh-CN
 * screen title. Kept here so all client roots ship the same copy table and
 * cannot drift apart.
 */
export const capabilityMessages = {
  discover: {
    title: 'Discover',
    titleZh: '发现',
    sections: 'Sections',
    featured: 'Featured',
  },
  apps: {
    title: 'Apps',
    titleZh: '应用',
    categories: 'Categories',
    featured: 'Featured',
  },
  games: {
    title: 'Games',
    titleZh: '游戏',
    featured: 'Featured',
    newest: 'New',
  },
  charts: {
    title: 'Charts',
    titleZh: '排行榜',
    top: 'Top charts',
    trending: 'Trending',
  },
  category: {
    title: 'Category',
    titleZh: '分类',
    apps: 'Apps',
    seeAll: 'See all',
  },
  collection: {
    title: 'Collection',
    titleZh: '合集',
    apps: 'Apps',
    curated: 'Curated',
  },
  'ai-hub': {
    title: 'AI Lab',
    titleZh: 'AI 实验室',
    experts: 'Experts',
    plugins: 'Plugins',
  },
  search: {
    title: 'Search',
    titleZh: '搜索',
    placeholder: 'Search apps and capabilities',
    results: 'Results',
  },
  'app-detail': {
    title: 'App detail',
    titleZh: '应用详情',
    install: 'Install',
    wishlist: 'Save',
  },
  events: {
    title: 'Event',
    titleZh: '活动',
    apps: 'Apps',
    endsAt: 'Ends',
  },
  library: {
    title: 'My library',
    titleZh: '我的库',
    installed: 'Installed',
    updates: 'Updates',
  },
  updates: {
    title: 'Updates',
    titleZh: '更新',
    update: 'Update',
    updateAll: 'Update all',
  },
  wishlist: {
    title: 'Wishlist',
    titleZh: '愿望单',
    remove: 'Remove',
    save: 'Save',
  },
  'user-store': {
    title: 'Personal store',
    titleZh: '个人商店',
    share: 'Share',
    publicView: 'Public view',
  },
  publisher: {
    title: 'Publisher console',
    titleZh: '发布者控制台',
    apps: 'Apps',
    newApp: 'New app',
  },
  settings: {
    title: 'Console settings',
    titleZh: '控制台设置',
    general: 'General',
    account: 'Account',
  },
};

/** Screen copy for one capability token; throws on an unknown token. */
export function capabilityCopy(capability) {
  const copy = capabilityMessages[capability];
  if (!copy) {
    throw new Error(`no capability copy registered for "${capability}"`);
  }
  return copy;
}

/** Title-cased capability label used in docs and human-readable names. */
export function titleCase(value) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/** lowerCamelCase identifier for a capability key. */
export function camelCase(value) {
  const pascal = value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/** PascalCase identifier for a capability key. */
export function pascalCase(value) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

export function createWriter(appRoot) {
  const created = [];
  const skipped = [];
  const write = (relativePath, content) => {
    const absolute = path.join(appRoot, relativePath);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    if (fs.existsSync(absolute)) {
      skipped.push(relativePath);
      return false;
    }
    fs.writeFileSync(absolute, content);
    created.push(relativePath);
    return true;
  };
  const writeJson = (relativePath, value) =>
    write(relativePath, `${JSON.stringify(value, null, 2)}\n`);
  const report = (label) => {
    for (const relativePath of created) {
      console.log(`  + ${label}/${relativePath}`);
    }
    for (const relativePath of skipped) {
      console.log(`  = ${label}/${relativePath} (exists, kept)`);
    }
    console.log(`  ${label}: ${created.length} created, ${skipped.length} kept`);
  };
  return { write, writeJson, report, created, skipped };
}

/** `.sdkwork/` baseline required by `SDKWORK_WORKSPACE_SPEC.md` section 1. */
export function writeSdkworkBaseline(write, depth) {
  const specsPrefix = `${'../'.repeat(depth)}sdkwork-specs`;
  write(
    '.sdkwork/README.md',
    `# .sdkwork/

Source-controlled local AI metadata for this application root.

- Specs: \`${specsPrefix}/README.md\`
- Behavior contract: \`${specsPrefix}/AGENTS_SPEC.md\`

Only metadata intended for version control belongs here. Local state, caches,
and secrets are ignored through \`.sdkwork/{local,tmp,cache,secrets}/\`.
`,
  );
  write(
    '.sdkwork/skills/README.md',
    `# .sdkwork/skills/

Root-local skill extensions for this application root.

Skills defined here extend, and never replace, the shared skills under
\`${specsPrefix}/skills/\`.
`,
  );
  write(
    '.sdkwork/plugins/README.md',
    `# .sdkwork/plugins/

Root-local plugin integrations for this application root.

Plugin metadata here is additive and must keep the shared port and composition
contracts from \`${specsPrefix}/APP_COMPOSITION_SPEC.md\`.
`,
  );
}

/** Compatibility shims (CLAUDE.md / GEMINI.md / CODEX.md) pointing at AGENTS.md. */
export function writeCompatibilityShims(write, label) {
  const body = (tool) =>
    `# ${tool} Compatibility Shim

SDKWORK-GEMINI-SHIM: v1

This file exists only so ${tool} discovers the repository execution entrypoint.
The authoritative instructions live in [AGENTS.md](AGENTS.md).

## Read First

1. \`AGENTS.md\` in this directory
2. \`../../../sdkwork-specs/SOUL.md\`
3. The task row in \`../../../sdkwork-specs/README.md\`
`;
  write('CLAUDE.md', body('Claude Code'));
  write('GEMINI.md', body('Gemini CLI'));
  write('CODEX.md', body('Codex CLI'));
  void label;
}
