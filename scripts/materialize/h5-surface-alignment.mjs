#!/usr/bin/env node

// Aligns `apps/sdkwork-appstore-h5` with the canonical App Store route identity
// contract (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` sections 2.1 and 7).
//
// The H5 root already exists and owns real pages, so this script is additive
// where it can be and surgical where it must be:
//
//   1. application-root `specs/component.spec.json` with the route identity
//      projection shared by every client architecture
//   2. the canonical route table in `h5-core` plus the standard
//      `SdkworkUiRouteContribution` contract
//   3. `<capability>RouteContributions` published by every owning capability
//      package, and package barrels reduced to integration contracts
//      (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 6)
//   4. the capability packages the H5 root was missing entirely: `ai-hub`,
//      `user-store`, and `console-settings`
//   5. shell-owned layout modules moved into `h5-shell`
//   6. concrete repairs: unrunnable declared `typecheck` entrypoints, the
//      `@@sdkwork` typo in ten component specs, two double-prefixed package
//      names, and package barrel exports that pointed at files that do not
//      exist
//
// Route ids are the cross-client contract, not route spelling: the H5 root
// keeps the physical paths it already ships (`/browse/apps`) and only aligns
// the ids and path parameter names.
//
// Deliberately NOT done here: relocating the ~2.4k lines of screens currently
// under `apps/sdkwork-appstore-h5/src/pages/` into capability packages. That is
// a reviewed change, not a scaffold step (see `AGENTS.md` human review rules).

import fs from 'node:fs';
import path from 'node:path';

import {
  appRootName,
  titleCase,
} from './client-app-documents.mjs';
import {
  camelCase,
  capabilities,
  createWriter,
  pascalCase,
  routeContributionLiteral,
  routesForCapability,
  sdkworkUiRouteContributionTs,
  writeCompatibilityShims,
} from './client-app-scaffold-lib.mjs';

const SUFFIX = 'h5';
const ROOT = appRootName(SUFFIX);

const h5Package = (capability) => `@sdkwork/appstore-h5-${capability}`;
const h5PackageDir = (capability) => `sdkwork-appstore-h5-${capability}`;

/**
 * Canonical capability token -> owning H5 package token.
 *
 * Route ids are a cross-client contract, and each client root owns its own
 * package family (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` sections 2 and 7),
 * so the mapping is explicit rather than assumed. The H5 root predates this
 * scaffold and already ships fewer, wider packages than the freshly
 * materialized roots; restructuring those packages is a reviewed change.
 */
const H5_PACKAGE_FOR_CAPABILITY = {
  discover: 'catalog',
  apps: 'catalog',
  games: 'catalog',
  charts: 'catalog',
  category: 'catalog',
  collection: 'catalog',
  search: 'search',
  'app-detail': 'listing',
  events: 'listing',
  library: 'library',
  updates: 'library',
  wishlist: 'library',
  'ai-hub': 'ai-hub',
  'user-store': 'user-store',
  publisher: 'console-publisher',
  settings: 'console-settings',
};

/** H5 package tokens that own at least one canonical route. */
const owningPackages = [
  ...new Set(Object.values(H5_PACKAGE_FOR_CAPABILITY)),
].sort();

/** Capabilities owned by one H5 package token, in table order. */
function capabilitiesOfPackage(packageToken) {
  return capabilities.filter(
    (capability) => H5_PACKAGE_FOR_CAPABILITY[capability] === packageToken,
  );
}

/** Route entries owned by one H5 package token. */
function routesOfPackage(packageToken) {
  return capabilitiesOfPackage(packageToken).flatMap((capability) =>
    routesForCapability(capability),
  );
}

/**
 * H5 packages that must exist but are not part of the coarse pre-existing set.
 *
 * `ai-hub` owns the AI Lab sidebar group, `user-store` the personal store and
 * its public share view, and `console-settings` the console settings screen.
 */
const NEW_PACKAGES = ['ai-hub', 'user-store', 'console-settings'];

export function alignH5Surface(appsDir) {
  const appRoot = path.join(appsDir, ROOT);
  if (!fs.existsSync(appRoot)) {
    throw new Error(`${ROOT} is missing; nothing to align`);
  }
  const writer = createWriter(appRoot);
  const { write, writeJson } = writer;
  // Route tables and route contributions are derived from the canonical table,
  // so they are regenerated rather than kept; the rest of a package is only
  // materialized when missing.
  const overwrite = (relativePath, content) => {
    const absolute = path.join(appRoot, relativePath);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    fs.writeFileSync(absolute, content);
  };

  // -------------------------------------------------------------------------
  // 1. Application-root component spec
  // -------------------------------------------------------------------------

  const rootSpecPath = path.join(appRoot, 'specs/component.spec.json');
  if (!fs.existsSync(rootSpecPath)) {
    writeJson('specs/component.spec.json', h5RootComponentSpec(appRoot));
  }

  // -------------------------------------------------------------------------
  // 2. Canonical route table in h5-core
  // -------------------------------------------------------------------------

  overwrite(
    `${pkgDir('core')}/src/composition/route-table.ts`,
    `/**
 * Canonical App Store route identity table for the H5 root.
 *
 * Authority: \`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md\` section 7 — the id
 * format is \`<surface>.<domain>.<capability>.<screen>\` and the same route id
 * names the same workflow in every client architecture. Cross-checked against
 * the PC root router \`AppstorePcRoutes\`
 * (\`apps/sdkwork-appstore-pc/packages/sdkwork-appstore-pc-embed/src/index.tsx\`).
 *
 * Physical paths are this root's own; only the ids and the path parameter
 * names are shared contracts.
 */
${sdkworkUiRouteContributionTs}
export const APPSTORE_H5_ROUTE_TABLE: readonly SdkworkUiRouteContribution[] = [
${routeTableLiteral()}
] as const;

export function listAppstoreRouteIdentities(): readonly SdkworkUiRouteContribution[] {
  return APPSTORE_H5_ROUTE_TABLE;
}

/** Path lookup by canonical route id. */
export function appstoreRoutePath(routeId: string): string {
  const entry = APPSTORE_H5_ROUTE_TABLE.find((item) => item.id === routeId);
  if (!entry) {
    throw new Error(\`unknown App Store route id: \${routeId}\`);
  }
  return entry.path;
}
`,
  );

  appendLine(
    path.join(appRoot, pkgDir('core'), 'src/composition/index.ts'),
    'export * from "./route-table.js";',
  );
  appendLine(
    path.join(appRoot, pkgDir('core'), 'src/index.ts'),
    "export * from './composition/route-table';",
  );

  // -------------------------------------------------------------------------
  // 3. New capability packages
  // -------------------------------------------------------------------------

  for (const packageToken of NEW_PACKAGES) {
    materializeCapabilityPackage(appRoot, write, writeJson, overwrite, packageToken);
  }

  // A capability package that owns route ids owns a component contract too.
  // `console-publisher` predates `NEW_PACKAGES`, so its spec has to be
  // backfilled here instead of falling out of section 3 -- otherwise the only
  // H5 package with a route contribution and no `specs/component.spec.json`
  // is invisible to every contract check.
  for (const entry of fs.readdirSync(path.join(appRoot, 'packages'), {
    withFileTypes: true,
  })) {
    if (!entry.isDirectory()) continue;
    const packageToken = entry.name.replace(/^sdkwork-appstore-h5-/u, '');
    const specRelative = `${pkgDir(packageToken)}/specs/component.spec.json`;
    if (fs.existsSync(path.join(appRoot, specRelative))) continue;
    let routes;
    try {
      routes = routesOfPackage(packageToken);
    } catch {
      continue;
    }
    if (routes.length === 0) continue;
    writeJson(specRelative, capabilityComponentSpec(packageToken, routes));
  }

  // -------------------------------------------------------------------------
  // 4. Route contributions + integration-contract barrels
  // -------------------------------------------------------------------------

  for (const packageToken of owningPackages) {
    const dir = pkgDir(packageToken);
    if (!fs.existsSync(path.join(appRoot, dir))) {
      continue;
    }
    materializeRouteContributions(appRoot, overwrite, dir, packageToken);
    ensureCoreDependency(appRoot, packageToken);
  }

  // Every H5 package declares `package.json#scripts.typecheck` as its runtime
  // entrypoint; make the declared verification actually runnable.
  for (const entry of fs.readdirSync(path.join(appRoot, 'packages'), {
    withFileTypes: true,
  })) {
    if (!entry.isDirectory()) continue;
    const packageToken = entry.name.replace(/^sdkwork-appstore-h5-/u, '');
    ensurePackageScripts(appRoot, packageToken);
    ensureTypeScriptConfig(appRoot, packageToken);
  }

  // -------------------------------------------------------------------------
  // 5. Shell-owned layout
  // -------------------------------------------------------------------------

  materializeShellLayout(appRoot, write, writeJson, overwrite);
  materializeConsoleShellComposition(appRoot, write, writeJson);

  // -------------------------------------------------------------------------
  // 6. Repairs
  // -------------------------------------------------------------------------

  repairDeclaredVerificationCommands(appRoot);
  repairDoublePrefixedPackageNames(appRoot);
  repairConsoleCoreBarrel(appRoot);
  repairDanglingBarrelExports(appRoot);
  wireCanonicalRoutes(appRoot, write, overwrite);

  writeCompatibilityShims(write, ROOT);

  writer.report(ROOT);
  return { created: true };
}

// ---------------------------------------------------------------------------
// Application-root component spec
// ---------------------------------------------------------------------------

/**
 * H5 application-root `specs/component.spec.json`.
 *
 * Mirrors the PC root spec shape; identity and release metadata come from the
 * root's own `sdkwork.app.config.json`, which owns them.
 */
function h5RootComponentSpec(appRoot) {
  const manifestPath = path.join(appRoot, 'sdkwork.app.config.json');
  const manifest = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    : { app: {} };

  return {
    schemaVersion: 1,
    kind: 'sdkwork.component.spec',
    component: {
      name: ROOT,
      displayName: manifest.app?.name ?? 'SDKWork App Store H5',
      version: '1.0.0',
      type: 'h5-app-root',
      root: `apps/${ROOT}`,
      domain: manifest.metadata?.domain ?? 'appstore',
      capability: manifest.metadata?.capability ?? 'store',
      surface: 'app',
      languages: ['typescript'],
      generated: false,
      status: manifest.publish?.status ?? 'DRAFT',
      manifests: [
        'package.json',
        'sdkwork.app.config.json',
        'specs/component.spec.json',
      ],
    },
    canonicalSpecs: [
      {
        file: 'APP_H5_ARCHITECTURE_SPEC.md',
        path: '../../../sdkwork-specs/APP_H5_ARCHITECTURE_SPEC.md',
        purpose: 'H5 mobile plus Capacitor application root architecture.',
      },
      {
        file: 'APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md',
        path: '../../../sdkwork-specs/APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md',
        purpose: 'Cross-client package taxonomy, route identity, and dependency direction.',
      },
      {
        file: 'APP_SDK_INTEGRATION_SPEC.md',
        path: '../../../sdkwork-specs/APP_SDK_INTEGRATION_SPEC.md',
        purpose: 'Injected SDK clients and global TokenManager integration.',
      },
      {
        file: 'IAM_LOGIN_INTEGRATION_SPEC.md',
        path: '../../../sdkwork-specs/IAM_LOGIN_INTEGRATION_SPEC.md',
        purpose: 'Credential entry, session recovery, and route authorization.',
      },
      {
        file: 'TEST_SPEC.md',
        path: '../../../sdkwork-specs/TEST_SPEC.md',
        purpose: 'H5 application verification.',
      },
    ],
    contracts: {
      layerRole: 'frontend-shell',
      publicExports: ['src/main.tsx'],
      // `APPLICATION_LAYERED_ARCHITECTURE_SPEC.md` section 154: a new
      // composable module MUST declare these, using `[]` when it offers or
      // needs no ports.
      providedPorts: [],
      requiredPorts: [],
      runtimeEntrypoints: ['src/main.tsx', 'package.json#scripts.dev'],
      // `COMPONENT_SPEC.md` section "contracts.sdkClients": the key lists
      // generated SDK client classes only when the component owns a generated
      // SDK family. This app root consumes `sdkwork-appstore-app-sdk` without
      // owning it, so the value stays empty. Mining `package.json` dependency
      // names into this key would turn it into the app-SDK injection list the
      // same rule forbids.
      sdkClients: [],
      // `APP_COMPOSITION_SPEC.md`: each entry must carry an explicit `surface`
      // and `credentialMode`.
      sdkDependencies: [
        {
          workspace: 'sdkwork-appstore-app-sdk',
          surface: 'app-api',
          credentialMode: 'authenticated-app-api',
        },
      ],
      dependencyApiExports: [],
      dependencyApiSurfaces: [],
      // No route identity table here: `APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md`
      // section 7 owns the id format, and the package taxonomy table in that
      // standard assigns the route registry to the `core` package, so it is
      // emitted as `packages/sdkwork-appstore-h5-core/src/composition/route-table.ts`.
    },
    verification: {
      commands: ['pnpm typecheck', 'pnpm test', 'pnpm build'],
    },
  };
}

// ---------------------------------------------------------------------------
// Capability packages
// ---------------------------------------------------------------------------

function pkgDir(packageToken) {
  return `packages/${h5PackageDir(packageToken)}`;
}

function packageTokenOf(capability) {
  const token = H5_PACKAGE_FOR_CAPABILITY[capability];
  if (!token) {
    throw new Error(`no H5 package owns capability "${capability}"`);
  }
  return token;
}

/** Materialize one H5 capability package that does not exist yet. */
function materializeCapabilityPackage(appRoot, write, writeJson, overwrite, packageToken) {
  const dir = pkgDir(packageToken);
  const name = h5Package(packageToken);
  const pascal = pascalCase(packageToken);
  const camel = camelCase(packageToken);
  const routes = routesOfPackage(packageToken);

  writeJson(`${dir}/package.json`, {
    name,
    version: '0.1.0',
    private: true,
    type: 'module',
    main: './src/index.ts',
    types: './src/index.ts',
    exports: {
      '.': {
        types: './src/index.ts',
        import: './src/index.ts',
        default: './src/index.ts',
      },
    },
    scripts: { typecheck: 'tsc --noEmit -p tsconfig.json' },
    dependencies: {
      [h5Package('core')]: 'workspace:*',
      [h5Package('commons')]: 'workspace:*',
      react: 'catalog:',
      'react-router-dom': 'catalog:',
    },
    peerDependencies: {
      react: '>=18.2.0 <20',
      'react-router-dom': '>=6.0.0 <8',
    },
  });

  writeJson(`${dir}/specs/component.spec.json`, capabilityComponentSpec(packageToken, routes));

  write(
    `${dir}/README.md`,
    `# ${name}

${titleCase(packageToken)} capability package for the SDKWork App Store H5 root.

Owns route ids: ${routes.map((entry) => `\`${entry.id}\``).join(', ')}.

Integration contracts only: public exports are route contributions, the service
port, the package state slice, and domain models
(\`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md\` section 6). Screens stay private
to the package.
`,
  );

  overwrite(
    `${dir}/src/routes/routeContributions.ts`,
    `import type { SdkworkUiRouteContribution } from '${h5Package('core')}';

/**
 * Route contributions for the ${packageToken} capability.
 *
 * Route ids are shared with the PC, Flutter, mini program, and HarmonyOS roots
 * (\`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md\` section 7). The H5 router
 * resolves each id through its own physical path.
 */
export const ${camel}RouteContributions: readonly SdkworkUiRouteContribution[] = [
${routes.map((entry) => routeContributionLiteral(entry, '  ')).join(',\n')}
] as const;
`,
  );

  write(
    `${dir}/src/types/${camel}Models.ts`,
    `/** Domain models owned by the ${packageToken} capability. */
export interface ${pascal}RouteParams {
  readonly routeId: string;
  readonly path: string;
}

export interface ${pascal}PageResult<TItem> {
  readonly items: TItem[];
  readonly nextCursor?: string;
}
`,
  );

  write(
    `${dir}/src/state/${camel}State.ts`,
    `import type { ${pascal}PageResult } from '../types/${camel}Models';

export type ${pascal}Status = 'idle' | 'loading' | 'ready' | 'error';

export interface ${pascal}State<TItem> {
  readonly status: ${pascal}Status;
  readonly result?: ${pascal}PageResult<TItem>;
  readonly error?: string;
}

export const initial${pascal}State: ${pascal}State<never> = { status: 'idle' };
`,
  );

  write(
    `${dir}/src/services/${camel}Service.ts`,
    `import type { AppstoreAppSdkClient } from '${h5Package('core')}';

import type { ${pascal}PageResult } from '../types/${camel}Models';

/**
 * ${titleCase(packageToken)} service.
 *
 * The generated app SDK clients are injected by the application root bootstrap
 * (\`APP_SDK_INTEGRATION_SPEC.md\`); this package never constructs a client and
 * never issues raw HTTP.
 */
export class ${pascal}Service {
  readonly capability = '${packageToken}';

  constructor(private readonly client: AppstoreAppSdkClient) {}

  empty(): ${pascal}PageResult<never> {
    return { items: [] };
  }
}
`,
  );

  overwrite(
    `${dir}/src/index.ts`,
    `export * from './routes/routeContributions';
export * from './types/${camel}Models';
export * from './state/${camel}State';
export * from './services/${camel}Service';
`,
  );
}

// ---------------------------------------------------------------------------
// Existing package wiring
// ---------------------------------------------------------------------------

/** Publish `<capability>RouteContributions` for every capability a package owns. */
function materializeRouteContributions(appRoot, overwrite, dir, packageToken) {
  const routes = routesOfPackage(packageToken);
  const camel = camelCase(packageToken);
  overwrite(
    `${dir}/src/routes/routeContributions.ts`,
    `import type { SdkworkUiRouteContribution } from '${h5Package('core')}';

/**
 * Route contributions owned by the ${packageToken} capability package.
 *
 * Route ids are shared with the PC, Flutter, mini program, and HarmonyOS roots;
 * this package owns the H5 implementation of each of them
 * (\`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md\` section 7).
 */
export const ${camel}RouteContributions: readonly SdkworkUiRouteContribution[] = [
${routes.map((entry) => routeContributionLiteral(entry, '  ')).join(',\n')}
] as const;
`,
  );

  // Section 6: package roots expose integration contracts, not page files.
  const indexPath = path.join(appRoot, dir, 'src/index.ts');
  const existing = fs.existsSync(indexPath)
    ? fs.readFileSync(indexPath, 'utf8')
    : '';
  const kept = dropUnresolvedExports(appRoot, dir, existing);
  const next = [`export * from './routes/routeContributions';`, kept]
    .filter((block) => block.trim())
    .join('\n');
  fs.mkdirSync(path.dirname(indexPath), { recursive: true });
  fs.writeFileSync(indexPath, `${next.trimEnd()}\n`);
}

/**
 * Remove `export ... from './relative'` statements whose target does not exist.
 *
 * Operates on whole statements, not lines: a multi-line `export { a, b } from`
 * block must survive or fall as one unit.
 */
function dropUnresolvedExports(appRoot, dir, text) {
  return text
    .replace(
      /^[ \t]*export\s+(?:\*|\{[\s\S]*?\})\s+from\s+'(\.\/[^']+)';?[ \t]*\r?\n?/gmu,
      (statement, specifier) =>
        resolvesWithinPackage(appRoot, dir, specifier) ? statement : '',
    )
    .trim();
}

/** Whether a relative specifier resolves to a real module in the package. */
function resolvesWithinPackage(appRoot, dir, specifier) {
  const base = path.join(appRoot, dir, 'src', specifier);
  return ['', '.ts', '.tsx', '.js', '/index.ts', '/index.tsx'].some((suffix) =>
    fs.existsSync(`${base}${suffix}`),
  );
}

/** Give every package the `typecheck` entrypoint its component spec declares. */
function ensurePackageScripts(appRoot, packageToken) {
  const packageJsonPath = path.join(appRoot, pkgDir(packageToken), 'package.json');
  if (!fs.existsSync(packageJsonPath)) return;
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.scripts = packageJson.scripts ?? {};
  if (!packageJson.scripts.typecheck) {
    packageJson.scripts.typecheck = 'tsc --noEmit -p tsconfig.json';
  }
  fs.writeFileSync(
    packageJsonPath,
    `${JSON.stringify(packageJson, null, 2)}\n`,
  );
}

/** Per-package tsconfig so the declared `typecheck` script can actually run. */
function ensureTypeScriptConfig(appRoot, packageToken) {
  const dir = pkgDir(packageToken);
  const packageDir = path.join(appRoot, dir);
  if (!fs.existsSync(packageDir)) return;
  fs.writeFileSync(
    path.join(packageDir, 'tsconfig.json'),
    `${JSON.stringify(
      {
        extends: '../../tsconfig.json',
        compilerOptions: { noEmit: true },
        include: ['src'],
      },
      null,
      2,
    )}\n`,
  );
}

/** Capability packages consume core public exports, never generated SDK modules. */
function ensureCoreDependency(appRoot, packageToken) {
  const packageJsonPath = path.join(appRoot, pkgDir(packageToken), 'package.json');
  if (!fs.existsSync(packageJsonPath)) return;
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.dependencies = packageJson.dependencies ?? {};
  if (!(h5Package('core') in packageJson.dependencies)) {
    packageJson.dependencies[h5Package('core')] = 'workspace:*';
    packageJson.dependencies = Object.fromEntries(
      Object.entries(packageJson.dependencies).sort(([a], [b]) =>
        a.localeCompare(b),
      ),
    );
    fs.writeFileSync(
      packageJsonPath,
      `${JSON.stringify(packageJson, null, 2)}\n`,
    );
  }
}

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------

/**
 * The H5 shell owns the app layout (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md`
 * section 4). The root keeps a thin re-export so both import paths resolve
 * while the ownership moves to the package.
 */
function materializeShellLayout(appRoot, write, writeJson, overwrite) {
  const dir = pkgDir('shell');
  overwrite(
    `${dir}/src/navigation/TabBar.tsx`,
    `import { NavLink } from 'react-router-dom';
import type { ComponentType } from 'react';
import { clsx } from 'clsx';

export interface TabBarItem {
  readonly path: string;
  readonly label: string;
  readonly icon: ComponentType<{
    readonly className?: string;
    readonly strokeWidth?: number;
  }>;
  readonly end?: boolean;
}

export interface TabBarProps {
  readonly items: readonly TabBarItem[];
}

/**
 * H5 bottom tab bar.
 *
 * Tab ownership sits with the shell so every capability package renders inside
 * the same navigation container
 * (\`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md\` section 4).
 */
export function TabBar({ items }: TabBarProps) {
  return (
    <nav className="tab-bar" aria-label="主导航">
      <div className="flex items-stretch justify-around h-16 max-w-lg mx-auto px-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              clsx(
                'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors min-w-0',
                isActive ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]',
              )
            }
          >
            <item.icon className="w-6 h-6 flex-shrink-0" strokeWidth={1.75} />
            <span className="truncate max-w-full px-0.5">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
`,
  );
  overwrite(
    `${dir}/src/layout/MobileLayout.tsx`,
    `import { Outlet, useLocation } from 'react-router-dom';
import { Compass, Grid3X3, Gamepad2, Search, Download } from 'lucide-react';

import { TabBar, type TabBarItem } from '../navigation/TabBar';

/**
 * H5 application layout.
 *
 * Moved verbatim from the application root: the shell package owns the app
 * surface shell, the navigation container, and tab ownership, while capability
 * packages own the screens it renders
 * (\`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md\` section 4).
 *
 * Tab paths stay on the H5 root's own spelling: route identity, not route
 * spelling, is the cross-client contract (section 7).
 */
const tabs: readonly TabBarItem[] = [
  { path: '/', icon: Compass, label: '发现', end: true },
  { path: '/browse/apps', icon: Grid3X3, label: '应用' },
  { path: '/browse/games', icon: Gamepad2, label: '游戏' },
  { path: '/search', icon: Search, label: '搜索' },
  { path: '/library', icon: Download, label: '库' },
];

const HIDE_TAB_PATHS = ['/app/', '/login', '/publisher'];

export function MobileLayout() {
  const { pathname } = useLocation();
  const hideTabBar = HIDE_TAB_PATHS.some((prefix) => pathname.startsWith(prefix));

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--bg-canvas)',
        paddingBottom: hideTabBar ? 0 : '4.5rem',
      }}
    >
      <main>
        <Outlet />
      </main>

      {!hideTabBar ? <TabBar items={tabs} /> : null}
    </div>
  );
}
`,
  );
  const shellPackageJsonPath = path.join(appRoot, dir, 'package.json');
  const shellPackageJson = fs.existsSync(shellPackageJsonPath)
    ? JSON.parse(fs.readFileSync(shellPackageJsonPath, 'utf8'))
    : { name: h5Package('shell'), version: '0.1.0', private: true, type: 'module' };
  shellPackageJson.dependencies = {
    ...(shellPackageJson.dependencies ?? {}),
    [h5Package('core')]: 'workspace:*',
    clsx: 'catalog:',
    'lucide-react': 'catalog:',
    react: 'catalog:',
    'react-router-dom': 'catalog:',
  };
  shellPackageJson.dependencies = Object.fromEntries(
    Object.entries(shellPackageJson.dependencies).sort(([a], [b]) =>
      a.localeCompare(b),
    ),
  );
  fs.writeFileSync(
    shellPackageJsonPath,
    `${JSON.stringify(shellPackageJson, null, 2)}\n`,
  );
  write(
    `${dir}/src/index.ts`,
    `export * from './layout/MobileLayout';
export * from './navigation/TabBar';
`,
  );

  // The root keeps a thin re-export; the implementation now lives in the shell.
  const rootLayout = path.join(
    appRoot,
    'src/components/layout/MobileLayout.tsx',
  );
  if (fs.existsSync(rootLayout)) {
    fs.writeFileSync(
      rootLayout,
      `// Ownership moved to ${h5Package('shell')} (\`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md\` section 4).
export { MobileLayout } from '${h5Package('shell')}';
`,
    );
  }
}

/** `console-shell` owns console route composition. */
function materializeConsoleShellComposition(appRoot, write, writeJson) {
  const dir = pkgDir('console-shell');
  if (!fs.existsSync(path.join(appRoot, dir))) return;
  write(
    `${dir}/src/navigation/consoleRouteContributions.ts`,
    `import type { SdkworkUiRouteContribution } from '${h5Package('core')}';
import { consolePublisherRouteContributions } from '${h5Package('console-publisher')}';
import { consoleSettingsRouteContributions } from '${h5Package('console-settings')}';

/**
 * Console route composition.
 *
 * \`console-shell\` owns user-facing console navigation and route composition
 * only; the console capability packages own the workflows behind each route
 * (\`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md\` section 4).
 */
export const consoleShellRouteContributions: readonly SdkworkUiRouteContribution[] = [
  ...consolePublisherRouteContributions,
  ...consoleSettingsRouteContributions,
];
`,
  );
  fs.writeFileSync(
    path.join(appRoot, dir, 'src/index.ts'),
    `export * from './navigation/consoleRouteContributions';
`,
  );
  const packageJsonPath = path.join(appRoot, dir, 'package.json');
  const packageJson = fs.existsSync(packageJsonPath)
    ? JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    : { name: h5Package('console-shell'), version: '0.1.0', private: true, type: 'module' };
  packageJson.dependencies = {
    ...(packageJson.dependencies ?? {}),
    [h5Package('console-settings')]: 'workspace:*',
    [h5Package('console-publisher')]: 'workspace:*',
    [h5Package('core')]: 'workspace:*',
  };
  packageJson.dependencies = Object.fromEntries(
    Object.entries(packageJson.dependencies).sort(([a], [b]) =>
      a.localeCompare(b),
    ),
  );
  fs.writeFileSync(
    packageJsonPath,
    `${JSON.stringify(packageJson, null, 2)}\n`,
  );
}

/**
 * `console-core` published a `ConsoleShell` layout that does not exist, and a
 * layout belongs to `console-shell` anyway
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 4). Point the barrel at
 * the modules the package actually owns.
 */
function repairConsoleCoreBarrel(appRoot) {
  const indexPath = path.join(appRoot, pkgDir('console-core'), 'src/index.ts');
  const srcDir = path.join(appRoot, pkgDir('console-core'), 'src');
  if (!fs.existsSync(srcDir)) return;
  const entries = fs
    .readdirSync(srcDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => fs.existsSync(path.join(srcDir, name, 'index.ts')))
    .sort();
  if (entries.length === 0) return;
  fs.writeFileSync(
    indexPath,
    `${[
      '// Integration-contract surface of the console runtime helpers',
      '// (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` sections 4 and 6).',
      ...entries.map((name) => `export * from './${name}';`),
    ].join('\n')}\n`,
  );
}

// ---------------------------------------------------------------------------
// Repairs
// ---------------------------------------------------------------------------

/** Ten component specs declared `pnpm --filter @@sdkwork/... typecheck`. */
function repairDeclaredVerificationCommands(appRoot) {
  const packagesDir = path.join(appRoot, 'packages');
  if (!fs.existsSync(packagesDir)) return;
  for (const entry of fs.readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const specPath = path.join(
      packagesDir,
      entry.name,
      'specs/component.spec.json',
    );
    if (!fs.existsSync(specPath)) continue;
    const text = fs.readFileSync(specPath, 'utf8');
    if (!text.includes('@@sdkwork')) continue;
    fs.writeFileSync(specPath, text.replaceAll('@@sdkwork', '@sdkwork'));
  }
}

/** `@sdkwork/appstore-appstore-h5-{console-shell,host}` carried the segment twice. */
function repairDoublePrefixedPackageNames(appRoot) {
  for (const packageToken of ['console-shell', 'host']) {
    const wrong = `@sdkwork/appstore-appstore-h5-${packageToken}`;
    const right = h5Package(packageToken);
    for (const file of ['package.json', 'specs/component.spec.json']) {
      const target = path.join(appRoot, pkgDir(packageToken), file);
      if (!fs.existsSync(target)) continue;
      const text = fs.readFileSync(target, 'utf8');
      if (text.includes(wrong)) {
        fs.writeFileSync(target, text.replaceAll(wrong, right));
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Canonical route wiring
// ---------------------------------------------------------------------------

/**
 * Route ids the H5 root already implements with a dedicated screen.
 *
 * Everything else in the canonical table is mounted through a table-driven
 * placeholder so the H5 route surface never silently lags the PC surface. The
 * list is the only place a route id is written twice, which is why the
 * alignment verifier cross-checks it against the canonical table.
 */
const IMPLEMENTED_ROUTE_IDS = [
  'app.store.discover.index',
  'app.store.search.index',
  'app.store.app-detail.detail',
  'app.store.library.index',
  'app.store.library.wishlist',
  'app.store.updates.index',
  'app.store.user-store.index',
  'app.store.user-store.public',
  'console.store.publisher.overview',
  'console.store.publisher.app-create',
  'console.store.publisher.app-manage',
];

/**
 * Canonical route ids whose canonical path differs from the path the H5 root
 * already ships, but whose screen already exists under that other path.
 *
 * The canonical route is mounted on the existing screen instead of a
 * placeholder, so the H5 root serves both its own spelling and the shared one.
 */
const ROUTE_ELEMENT_OVERRIDES = {
  'app.store.apps.index': { module: '../pages/BrowsePage', exportName: 'AppsBrowsePage' },
  'app.store.games.index': { module: '../pages/BrowsePage', exportName: 'GamesBrowsePage' },
  'console.system.settings.index': {
    module: '../pages/settings/SettingsPage',
    exportName: 'SettingsPage',
  },
};

/**
 * Mount every canonical route id that has no dedicated screen yet.
 *
 * The paths come from the shared table in `@sdkwork/appstore-h5-core`, so a
 * placeholder can never disagree with the contract.
 */
function wireCanonicalRoutes(appRoot, write, overwrite) {
  overwrite(
    'src/routes/RoutePlaceholder.tsx',
    `import { useLocation } from 'react-router-dom';

export interface RoutePlaceholderProps {
  readonly routeId: string;
  readonly titleKey: string;
}

/**
 * Route placeholder for a canonical route id whose capability screen is not
 * implemented yet.
 *
 * Route assembly is a root responsibility
 * (\`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md\` section 1); the id and title key
 * come from the shared route table so this page can never drift from the
 * cross-client contract.
 */
export function RoutePlaceholder({ routeId, titleKey }: RoutePlaceholderProps) {
  const location = useLocation();
  return (
    <section className="px-4 py-10" data-route-id={routeId} data-title-key={titleKey}>
      <h1 className="text-lg font-semibold text-[var(--text)]">{titleKey}</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        {location.pathname}
      </p>
    </section>
  );
}
`,
  );

  overwrite(
    'src/routes/pendingRoutes.tsx',
    `import { lazy } from 'react';
import { Route } from 'react-router-dom';
import type { ReactElement } from 'react';

import {
  listAppstoreRouteIdentities,
  type SdkworkUiRouteContribution,
} from '@sdkwork/appstore-h5-core';

import { RoutePlaceholder } from './RoutePlaceholder';

/** Canonical route ids that already render a dedicated H5 screen. */
export const IMPLEMENTED_ROUTE_IDS: readonly string[] = [
${IMPLEMENTED_ROUTE_IDS.map((id) => `  '${id}',`).join('\n')}
];

/**
 * Screens the H5 root already ships under its own path spelling.
 *
 * The canonical route is mounted on the existing screen so both spellings keep
 * working while the root converges on the shared path.
 */
const AppsBrowsePage = lazy(() =>
  import('../pages/BrowsePage').then((module) => ({
    default: module.AppsBrowsePage,
  })),
);
const GamesBrowsePage = lazy(() =>
  import('../pages/BrowsePage').then((module) => ({
    default: module.GamesBrowsePage,
  })),
);
const SettingsPage = lazy(() =>
  import('../pages/settings/SettingsPage').then((module) => ({
    default: module.SettingsPage,
  })),
);

const ROUTE_ELEMENT_OVERRIDES: Readonly<Record<string, ReactElement>> = {
  'app.store.apps.index': <AppsBrowsePage />,
  'app.store.games.index': <GamesBrowsePage />,
  'console.system.settings.index': <SettingsPage />,
};

/**
 * Canonical route ids that have no dedicated screen yet.
 *
 * Derived from the shared route table, so adding a capability route there and
 * forgetting to implement it shows up as a placeholder instead of a 404.
 */
export const pendingRouteContributions: readonly SdkworkUiRouteContribution[] =
  listAppstoreRouteIdentities().filter(
    (entry) => !IMPLEMENTED_ROUTE_IDS.includes(entry.id),
  );

/** React Router elements for the remaining canonical routes. */
export const pendingRouteElements: ReactElement[] = pendingRouteContributions.map(
  (entry) => (
    <Route
      key={entry.id}
      path={entry.path}
      element={
        ROUTE_ELEMENT_OVERRIDES[entry.id] ?? (
          <RoutePlaceholder routeId={entry.id} titleKey={entry.titleKey} />
        )
      }
    />
  ),
);
`,
  );

  // Mount the pending routes inside the shell layout. The checkout may use
  // either LF or CRLF, so match on normalised line endings.
  const appTsxPath = path.join(appRoot, 'src/App.tsx');
  if (!fs.existsSync(appTsxPath)) return;
  const text = fs.readFileSync(appTsxPath, 'utf8');
  if (text.includes('pendingRouteElements')) return;
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const importAnchor = `import { lazy, Suspense } from 'react';${eol}`;
  const routeAnchor = `          {/* Catch-all */}`;
  if (!text.includes(importAnchor) || !text.includes(routeAnchor)) return;
  fs.writeFileSync(
    appTsxPath,
    text
      .replace(
        importAnchor,
        `${importAnchor}import { pendingRouteElements } from './routes/pendingRoutes';${eol}`,
      )
      .replace(
        routeAnchor,
        `          {/* Canonical routes whose capability screen is not implemented yet */}${eol}          {pendingRouteElements}${eol}${eol}${routeAnchor}`,
      ),
  );
}

/** Drop barrel exports that point at files the package does not contain. */
function repairDanglingBarrelExports(appRoot) {
  const packagesDir = path.join(appRoot, 'packages');
  if (!fs.existsSync(packagesDir)) return;
  for (const entry of fs.readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = `packages/${entry.name}`;
    const indexPath = path.join(packagesDir, entry.name, 'src/index.ts');
    if (!fs.existsSync(indexPath)) continue;
    const text = fs.readFileSync(indexPath, 'utf8');
    const next = dropUnresolvedExports(appRoot, dir, text);
    if (next.trim() !== text.trim()) {
      fs.writeFileSync(indexPath, `${next.trimEnd()}\n`);
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function appendLine(filePath, line) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, 'utf8');
  if (text.includes(line)) return;
  fs.writeFileSync(filePath, `${text.trimEnd()}\n${line}\n`);
}

/** Canonical table order, so every projection stays diffable across roots. */
function routeTableEntries() {
  return capabilities.flatMap((capability) => routesForCapability(capability));
}

function routeTableLiteral() {
  return routeTableEntries()
    .map((entry) => routeContributionLiteral(entry, '  '))
    .join(',\n');
}

/** Shared capability component spec, including the routes it owns. */
function capabilityComponentSpec(packageToken, routes) {
  const name = h5Package(packageToken);
  return {
    schemaVersion: 1,
    kind: 'sdkwork.component.spec',
    component: {
      name,
      displayName: `${titleCase(packageToken)} (H5)`,
      version: '0.1.0',
      type: 'react-package',
      root: `apps/${ROOT}/packages/${h5PackageDir(packageToken)}`,
      domain: 'appstore',
      capability: packageToken,
      surface: 'app',
      languages: ['typescript'],
      generated: false,
      manifests: ['package.json'],
    },
    canonicalSpecs: [
      {
        file: 'APP_H5_ARCHITECTURE_SPEC.md',
        path: '../../../sdkwork-specs/APP_H5_ARCHITECTURE_SPEC.md',
        purpose: 'H5 application root architecture.',
      },
      {
        file: 'APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md',
        path: '../../../sdkwork-specs/APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md',
        purpose: 'Cross-client package role and route identity alignment.',
      },
    ],
    contracts: {
      // `FRONTEND_SPEC.md` section 1.2: capability packages declare
      // `frontend-feature`. The field lives in `contracts`, which is what
      // `check-component-port-bindings.mjs` reads.
      layerRole: 'frontend-feature',
      publicExports: ['.'],
      providedPorts: [],
      requiredPorts: [],
      // Route identity is owned by the root's core route registry, not by a
      // capability package contract; see the note in `h5RootComponentSpec`.
    },
    verification: {
      commands: [`pnpm --filter ${name} typecheck`],
    },
  };
}
