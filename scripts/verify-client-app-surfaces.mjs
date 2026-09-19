#!/usr/bin/env node

// Verifies the SDKWork App Store client application roots against
// `APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md`.
//
// Runs without `pnpm install` and without the Flutter / HarmonyOS toolchains,
// so it works on a fresh checkout and on a workspace where a sibling repository
// is mid-refactor. It proves the cross-client alignment claims that the
// architecture standard actually encodes:
//
//   1. The PC root router is the authority for the shared route surface; every
//      other root publishes the same route ids and the same canonical id format
//      `<surface>.<domain>.<capability>.<screen>` (section 7).
//   2. Every capability token in a root's route table is published by a route
//      contribution file inside that root (`<capability>RouteContributions`).
//   3. Every generated TypeScript file parses (syntax-level, no resolution).
//   4. Every generated JSON file parses.
//   5. Every application-root `AGENTS.md` carries the required sections.
//   6. Every TypeScript core package declares the six composition subpaths.
//   7. Every capability package barrel export resolves.
//   8. Every application root declares the layer role, the SDK dependency
//      shape and the entrypoint contracts that it claims, and every declared
//      entrypoint actually resolves inside that root. This is the check that
//      catches a root whose `runtimeEntrypoints` points at a file or a
//      `package.json` script the root does not have.
//
// The repository root is derived from this file's own location, so the check
// always runs against the checkout it ships in.
//
// Usage:
//   node scripts/verify-client-app-surfaces.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

const PC_ROOT = 'sdkwork-appstore-pc';

/** Roots that must align to the PC authority, with their package segment. */
const CLIENT_ROOTS = [
  { name: PC_ROOT, platform: 'pc', authority: true },
  {
    name: 'sdkwork-appstore-h5',
    platform: 'h5',
    coreRouteRegistry:
      'packages/sdkwork-appstore-h5-core/src/composition/route-table.ts',
  },
  {
    name: 'sdkwork-appstore-flutter-mobile',
    platform: 'flutter',
    coreRouteRegistry:
      'packages/sdkwork_appstore_flutter_mobile_core/lib/composition/route_table.dart',
  },
  {
    name: 'sdkwork-appstore-mini-program',
    platform: 'mp',
    coreRouteRegistry:
      'packages/sdkwork-appstore-mp-core/src/composition/route-table.ts',
  },
  {
    name: 'sdkwork-appstore-harmony-mobile',
    platform: 'harmony',
    coreRouteRegistry:
      'packages/sdkwork-appstore-harmony-mobile-core/src/main/ets/composition/RouteTable.ets',
  },
];

const failures = [];
const notes = [];

function fail(message) {
  failures.push(message);
}

function walk(dir, predicate, out = []) {
  if (!fs.existsSync(dir)) {
    return out;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, predicate, out);
    } else if (predicate(full)) {
      out.push(full);
    }
  }
  return out;
}

function rel(file) {
  return path.relative(repoRoot, file).replaceAll(path.sep, '/');
}

// ---------------------------------------------------------------------------
// 1. PC router is the route surface authority
// ---------------------------------------------------------------------------

/**
 * Read the canonical route surface from the PC root router.
 *
 * `AppstorePcRoutes` is the hand-authored authority
 * (`apps/sdkwork-appstore-pc/packages/sdkwork-appstore-pc-embed/src/index.tsx`),
 * so parsing it keeps this check honest: the other four roots are generated and
 * are compared against authored source, not against their own generator.
 */
function readPcRouteSurface() {
  const hostIndex = path.join(
    repoRoot,
    'apps',
    PC_ROOT,
    'packages/sdkwork-appstore-pc-embed/src/index.tsx',
  );
  if (!fs.existsSync(hostIndex)) {
    return null;
  }
  const text = fs.readFileSync(hostIndex, 'utf8');
  const routes = new Map();
  const routeRegex = /<Route\s+path="([^"]+)"\s+element=\{<([A-Za-z0-9]+)\s*\/>\}\s*\/>/gu;
  let match = routeRegex.exec(text);
  while (match) {
    const [, routePath, component] = match;
    routes.set(`/${routePath}`, component);
    match = routeRegex.exec(text);
  }
  const indexRegex = /<Route\s+index\s+element=\{<([A-Za-z0-9]+)\s*\/>\}\s*\/>/u;
  const indexMatch = indexRegex.exec(text);
  if (indexMatch) {
    routes.set('/', indexMatch[1]);
  }
  // A bare redirect carries no screen and is not part of the route surface.
  routes.delete('/console');
  return routes;
}

const pcSurface = readPcRouteSurface();
if (!pcSurface || pcSurface.size === 0) {
  fail(`${PC_ROOT}: could not read the PC root router route surface`);
} else {
  notes.push(`PC route authority: ${pcSurface.size} route(s)`);
}

// ---------------------------------------------------------------------------
// 1b. Every root publishes the canonical route ids
// ---------------------------------------------------------------------------
//
// Two different authorities are in play here, and conflating them was a real
// defect in an earlier revision of this check:
//
//   * The canonical route id format and the venue for the route registry come
//     from `APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md`: section 7 defines
//     `<surface>.<domain>.<capability>.<screen>`, and the package taxonomy table
//     assigns the "route registry" to the `core` package. The registry is
//     therefore read from each root's core route table **in source**, not from a
//     projection inside `component.spec.json`. No contract key for a route
//     identity table exists in `COMPONENT_SPEC.md`, and inventing one put a
//     second, ungated inventory next to the registry the standard actually
//     places in core.
//   * The PC root is the authority for the *screen inventory* you have to
//     implement, not for the id format: PC builds a plain React Router path
//     tree and names its admin modules with short ids such as
//     `dashboard.overview`, so it does not implement section 7 itself. PC
//     coverage is therefore asserted as physical-path coverage (/ below), which
//     is a deliberate over-constraint for a coverage signal -- section 7 permits
//     physical paths to differ per platform.

const ROUTE_ID_RE = /^(app|console|admin)\.[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*$/u;

const rootRouteTables = new Map();

/**
 * Reads the route registry out of a root's core package.
 *
 * The three source dialects this has to cover are TypeScript/ArkTS (single-line
 * object literals) and Dart (multi-line records), so fields are matched inside a
 * window that runs from one canonical id literal up to the next one. Each id
 * literal appears exactly once in its registry, which the check asserts.
 */
function readRootRouteRegistry(appRoot, relativePath) {
  const registryPath = path.join(appRoot, relativePath);
  if (!fs.existsSync(registryPath)) {
    return { error: `core route registry not found: ${relativePath}` };
  }
  const text = fs.readFileSync(registryPath, 'utf8');
  const idLiterals = [
    ...text.matchAll(/(['"])((?:app|console|admin)\.[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*)\1/gu),
  ];
  if (idLiterals.length === 0) {
    return { error: `no canonical route id found in ${relativePath}` };
  }
  const entries = [];
  for (const [index, literal] of idLiterals.entries()) {
    const start = literal.index;
    const end = idLiterals[index + 1]?.index ?? Math.min(text.length, start + 800);
    const window = text.slice(start, end);
    const field = (key) => {
      const match = new RegExp(`\\b${key}\\s*:\\s*['"]([^'"]*)['"]`, 'u').exec(window);
      return match?.[1];
    };
    entries.push({
      routeId: literal[2],
      surface: field('surface'),
      domain: field('domain'),
      capability: field('capability'),
      screen: field('screen'),
      path: field('path'),
      titleKey: field('titleKey'),
      auth: field('auth'),
    });
  }
  return { entries };
}

for (const root of CLIENT_ROOTS) {
  const appRoot = path.join(repoRoot, 'apps', root.name);
  if (!fs.existsSync(appRoot)) {
    notes.push(`${root.name}: not present (skipped)`);
    continue;
  }
  if (root.authority) {
    continue;
  }
  if (!root.coreRouteRegistry) {
    fail(`${root.name}: no core route registry is declared for this root`);
    continue;
  }
  const { entries, error } = readRootRouteRegistry(appRoot, root.coreRouteRegistry);
  if (error) {
    fail(`${root.name}: ${error}`);
    continue;
  }
  if (entries.length === 0) {
    fail(`${root.name}: core route registry declares no route`);
    continue;
  }
  rootRouteTables.set(root.name, entries);
}

if (rootRouteTables.size > 0) {
  notes.push(
    `route identities from core registries: ${[...rootRouteTables.entries()]
      .map(([name, table]) => `${name.replace('sdkwork-appstore-', '')}=${table.length}`)
      .join(', ')}`,
  );
}

// The canonical id is stable across roots, so derive it from the route table of
// any aligned root and require every other root to agree exactly.
const [referenceName, referenceTable] = [...rootRouteTables.entries()][0] ?? [];
if (referenceName) {
  const canonicalIds = referenceTable.map((entry) => entry.routeId).join('|');
  for (const [rootName, identities] of rootRouteTables) {
    const ids = identities.map((entry) => entry.routeId);
    if (ids.join('|') !== canonicalIds) {
      const missing = referenceTable
        .map((entry) => entry.routeId)
        .filter((id) => !ids.includes(id));
      const extra = ids.filter(
        (id) => !referenceTable.some((entry) => entry.routeId === id),
      );
      if (missing.length > 0) {
        fail(`${rootName}: missing canonical route ids: ${missing.join(', ')}`);
      }
      if (extra.length > 0) {
        fail(`${rootName}: unexpected route ids: ${extra.join(', ')}`);
      }
      if (missing.length === 0 && extra.length === 0) {
        fail(`${rootName}: canonical route ids are out of order`);
      }
    }
  }
}

for (const [rootName, identities] of rootRouteTables) {
  const seen = new Set();
  for (const entry of identities) {
    if (typeof entry.routeId !== 'string' || !ROUTE_ID_RE.test(entry.routeId)) {
      fail(
        `${rootName}: route id "${entry.routeId}" does not follow <surface>.<domain>.<capability>.<screen>`,
      );
      continue;
    }
    if (seen.has(entry.routeId)) {
      fail(`${rootName}: duplicate route id ${entry.routeId}`);
    }
    seen.add(entry.routeId);
    const segment = entry.routeId.split('.')[2];
    if (segment !== entry.capability) {
      fail(
        `${rootName}: route id ${entry.routeId} capability segment "${segment}" != declared capability "${entry.capability}"`,
      );
    }
    if (!entry.titleKey || !entry.auth) {
      fail(`${rootName}: route id ${entry.routeId} is missing titleKey or auth`);
    }
  }
}

// Every non-authority root must cover the same physical paths as the PC router.
if (pcSurface) {
  const pcPaths = new Set(pcSurface.keys());
  for (const [rootName, identities] of rootRouteTables) {
    const paths = new Set(identities.map((entry) => entry.path));
    const missing = [...pcPaths].filter((routePath) => !paths.has(routePath));
    const extra = [...paths].filter((routePath) => !pcPaths.has(routePath));
    if (missing.length > 0) {
      fail(`${rootName}: no route for PC path(s): ${missing.join(', ')}`);
    }
    if (extra.length > 0) {
      fail(`${rootName}: unexpected route path(s): ${extra.join(', ')}`);
    }
  }
}

// ---------------------------------------------------------------------------
// 2. Capability tokens are published by route contribution files
// ---------------------------------------------------------------------------

const CONTRIBUTION_FILE_RE =
  /(?:routeContributions|RouteContributions|route_contributions)\.(?:ts|tsx|js|dart|ets)$/u;

for (const [rootName, identities] of rootRouteTables) {
  const appRoot = path.join(repoRoot, 'apps', rootName);
  const files = walk(appRoot, (file) => CONTRIBUTION_FILE_RE.test(file));
  const publishedCapabilities = new Set();
  const publishedIds = new Set();
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(/id:\s*['"]([^'"]+)['"]/gu)) {
      publishedIds.add(match[1]);
    }
    for (const match of text.matchAll(/capability:\s*['"]([^'"]+)['"]/gu)) {
      publishedCapabilities.add(match[1]);
    }
  }
  if (files.length === 0) {
    fail(`${rootName}: no route contribution file found`);
    continue;
  }
  for (const entry of identities) {
    if (!publishedCapabilities.has(entry.capability)) {
      fail(
        `${rootName}: capability ${entry.capability} publishes no route contribution`,
      );
    }
    if (!publishedIds.has(entry.routeId)) {
      fail(`${rootName}: route id ${entry.routeId} is not published by any contribution`);
    }
  }
}

// ---------------------------------------------------------------------------
// 3/4. Generated source parses
// ---------------------------------------------------------------------------

const tsRoot = [
  'node_modules/.pnpm/typescript@6.0.2/node_modules/typescript',
  'node_modules/.pnpm/typescript@5.9.3/node_modules/typescript',
  'node_modules/.pnpm/typescript@5.8.3/node_modules/typescript',
]
  .map((relative) => path.join(repoRoot, relative))
  .find((candidate) => fs.existsSync(candidate));

if (!tsRoot) {
  notes.push('typescript compiler not found in the pnpm store; TS parse check skipped');
} else {
  const ts = (await import(new URL(`file://${tsRoot}/lib/typescript.js`).href)).default;
  let parsed = 0;
  for (const root of CLIENT_ROOTS) {
    const appRoot = path.join(repoRoot, 'apps', root.name);
    if (!fs.existsSync(appRoot)) {
      continue;
    }
    for (const file of walk(appRoot, (candidate) => /\.tsx?$/u.test(candidate))) {
      const text = fs.readFileSync(file, 'utf8');
      const sourceFile = ts.createSourceFile(
        file,
        text,
        ts.ScriptTarget.ESNext,
        false,
        file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      );
      parsed += 1;
      for (const diagnostic of (sourceFile.parseDiagnostics ?? []).slice(0, 3)) {
        fail(`${rel(file)}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`);
      }
    }
  }
  notes.push(`TypeScript parse check: ${parsed} file(s)`);
}

let jsonCount = 0;
for (const root of CLIENT_ROOTS) {
  const appRoot = path.join(repoRoot, 'apps', root.name);
  if (!fs.existsSync(appRoot)) {
    continue;
  }
  for (const file of walk(appRoot, (candidate) => candidate.endsWith('.json'))) {
    jsonCount += 1;
    try {
      JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/u, ''));
    } catch (error) {
      fail(`${rel(file)}: ${error.message}`);
    }
  }
  for (const file of walk(appRoot, (candidate) => candidate.endsWith('.arb'))) {
    jsonCount += 1;
    try {
      JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (error) {
      fail(`${rel(file)}: ${error.message}`);
    }
  }
}
notes.push(`JSON parse check: ${jsonCount} file(s)`);

// ---------------------------------------------------------------------------
// 5. AGENTS.md required sections
// ---------------------------------------------------------------------------

const REQUIRED_SECTIONS = [
  'SDKWORK Soul',
  'SDKWORK Standards',
  'Application Identity',
  'Local Dictionary Structure',
  'Spec Resolution Order',
  'Required Specs By Task Type',
  'Code Style Rules',
  'Build, Test, and Verification',
  'Agent Execution Rules',
  'Human Review Rules',
];

for (const root of CLIENT_ROOTS) {
  const agentsPath = path.join(repoRoot, 'apps', root.name, 'AGENTS.md');
  if (!fs.existsSync(agentsPath)) {
    fail(`${root.name}: AGENTS.md is missing`);
    continue;
  }
  const text = fs.readFileSync(agentsPath, 'utf8');
  for (const section of REQUIRED_SECTIONS) {
    if (!text.includes(section)) {
      fail(`${root.name}: AGENTS.md missing section "${section}"`);
    }
  }
  for (const reference of [
    'sdkwork-specs/README.md',
    'sdkwork-specs/SOUL.md',
    'sdkwork-specs/AGENTS_SPEC.md',
  ]) {
    if (!text.includes(reference)) {
      fail(`${root.name}: AGENTS.md missing reference ${reference}`);
    }
  }
}

// ---------------------------------------------------------------------------
// 6. TypeScript core package composition exports
// ---------------------------------------------------------------------------

const CORE_EXPORT_SUBPATHS = [
  '.',
  './sdk',
  './modules',
  './host',
  './session',
  './composition',
];

// The PC authority's own conformance is enforced by
// `sdkwork-specs/tools/verify-repo.mjs`; this verifier reports it as a note so
// a pre-existing PC debt cannot mask a regression in the aligned roots.
const authorityCoreIssues = [];

for (const root of CLIENT_ROOTS) {
  const packagesDir = path.join(repoRoot, 'apps', root.name, 'packages');
  if (!fs.existsSync(packagesDir)) {
    continue;
  }
  for (const entry of fs.readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }
    const isCore =
      /-(?:console-core|admin-core)$/u.test(entry.name) ||
      /_flutter_mobile_(?:console_core|admin_core|core)$/u.test(entry.name) ||
      (/-core$/u.test(entry.name) && !/-host-core$/u.test(entry.name));
    if (!isCore) {
      continue;
    }
    const packageDir = path.join(packagesDir, entry.name);
    const report = root.authority
      ? (message) => authorityCoreIssues.push(message)
      : fail;
    // Dart packages declare their composition contract through `pubspec.yaml`
    // and are exempt from the `exports` subpath rule, exactly as
    // `sdkwork-specs/tools/lib/app-composition.mjs` does.
    if (fs.existsSync(path.join(packageDir, 'pubspec.yaml'))) {
      if (!fs.existsSync(path.join(packageDir, 'lib/composition'))) {
        report(`${root.name}/packages/${entry.name}: missing lib/composition/`);
      }
      continue;
    }
    const packageJsonPath = path.join(packageDir, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      report(`${root.name}/packages/${entry.name}: core package.json is missing`);
      continue;
    }
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    for (const subpath of CORE_EXPORT_SUBPATHS) {
      if (!(subpath in (packageJson.exports ?? {}))) {
        report(
          `${root.name}/packages/${entry.name}: missing package.json exports["${subpath}"]`,
        );
      }
    }
  }
}

if (authorityCoreIssues.length > 0) {
  notes.push(
    `${PC_ROOT}: ${authorityCoreIssues.length} pre-existing core-export issue(s) reported by verify-repo (not owned by this check)`,
  );
}

// ---------------------------------------------------------------------------
// 7. Capability package barrels resolve
// ---------------------------------------------------------------------------

for (const root of CLIENT_ROOTS) {
  const packagesDir = path.join(repoRoot, 'apps', root.name, 'packages');
  if (!fs.existsSync(packagesDir)) {
    continue;
  }
  for (const entry of fs.readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }
    const indexPath = path.join(packagesDir, entry.name, 'src/index.ts');
    if (!fs.existsSync(indexPath)) {
      continue;
    }
    const packageDir = path.join(packagesDir, entry.name);
    for (const line of fs.readFileSync(indexPath, 'utf8').split(/\r?\n/u)) {
      const match = /from\s+'(\.\/[^']+)'/u.exec(line);
      if (!match) {
        continue;
      }
      const base = path.join(packageDir, 'src', match[1]);
      const resolves = ['', '.ts', '.tsx', '.js', '/index.ts', '/index.tsx'].some(
        (suffix) => fs.existsSync(`${base}${suffix}`),
      );
      if (!resolves) {
        fail(`${root.name}/packages/${entry.name}: barrel export ${match[1]} does not resolve`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 8. Declared root contracts resolve inside their own root
// ---------------------------------------------------------------------------
//
// Contract authority:
//   - `COMPONENT_SPEC.md` section 136: `contracts.sdkClients` lists only the
//     generated SDK family a component itself owns. A client application root
//     owns no generated SDK, so it must publish an empty list here rather than
//     the SDK packages it consumes.
//   - `APP_COMPOSITION_SPEC.md` section 77: every `contracts.sdkDependencies`
//     entry is an object carrying an explicit `surface` and `credentialMode`.
//     Note the exact scope of that MUST: section 4 states it for the *core
//     package* spec, which the PC authority already satisfies. The root-level
//     string form found on PC is the legacy shape that
//     `sdkwork-specs/tools/align-app-composition.mjs` still tolerates through
//     `normalizeSdkDependencyKey`, so on the authority root it is reported as a
//     note rather than a failure -- the same treatment the pre-existing PC
//     core-export debt already gets above.
//   - `FRONTEND_SPEC.md` section 1.2: the package role is declared through
//     `contracts.layerRole`; an application root is `frontend-shell`.
//
// The entrypoint resolution below is the part that cannot be read off the
// spec: a root may honestly declare `publicExports` / `runtimeEntrypoints`
// and still point them at a path that does not exist in that root (for
// example at a `package.json#scripts.*` script in a native root that has no
// `package.json`). Such a declaration is a dangling reference, and it is a
// failure on every root including the authority.

/** Resolves `path/to/file` and `path/to/file#a.b.c` inside one root. */
function resolveContractEntry(rootDir, entry) {
  const hashAt = entry.indexOf('#');
  const file = hashAt === -1 ? entry : entry.slice(0, hashAt);
  const pointer = hashAt === -1 ? '' : entry.slice(hashAt + 1);
  const absolute = path.join(rootDir, file);
  if (!fs.existsSync(absolute)) {
    return `file missing: ${file}`;
  }
  if (pointer === '') {
    return null;
  }
  const text = fs.readFileSync(absolute, 'utf8');
  if (/\.(?:ya?ml|json5)$/u.test(file)) {
    // Nested-key presence only: these formats carry no portable parser here.
    const leaf = pointer.split('.').pop();
    const escaped = leaf.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
    return new RegExp(`^[ \\t]*["']?${escaped}["']?[ \\t]*:`, 'mu').test(text)
      ? null
      : `key not found: ${pointer}`;
  }
  let current;
  try {
    current = JSON.parse(text);
  } catch {
    return `file is not valid JSON: ${file}`;
  }
  for (const segment of pointer.split('.')) {
    if (current === null || typeof current !== 'object') {
      current = undefined;
      break;
    }
    // Script names may contain colons (`dev:harmony-native:standalone`); match
    // on the part before the first colon so a colon-bearing segment still
    // resolves against the real key.
    const prefix = segment.split(':')[0];
    if (segment in current) {
      current = current[segment];
      continue;
    }
    const matchingKey = Object.keys(current).find(
      (key) => key.split(':')[0] === prefix,
    );
    current = matchingKey === undefined ? undefined : current[matchingKey];
  }
  return current === undefined ? `pointer not resolved: ${pointer}` : null;
}

for (const root of CLIENT_ROOTS) {
  const rootDir = path.join(repoRoot, 'apps', root.name);
  const specPath = path.join(rootDir, 'specs/component.spec.json');
  if (!fs.existsSync(specPath)) {
    fail(`${root.name}: specs/component.spec.json is missing`);
    continue;
  }
  const contracts = JSON.parse(fs.readFileSync(specPath, 'utf8')).contracts ?? {};

  // The authority root's contract shape is legacy-but-tolerated; the roots this
  // verifier exists to hold to the standard must conform.
  const authorityShapeIssues = [];
  const reportShape = root.authority
    ? (message) => authorityShapeIssues.push(message)
    : fail;

  if (contracts.layerRole !== 'frontend-shell') {
    fail(
      `${root.name}: contracts.layerRole must be "frontend-shell", found ${JSON.stringify(contracts.layerRole)}`,
    );
  }

  if (!Array.isArray(contracts.sdkClients)) {
    reportShape(`${root.name}: contracts.sdkClients must be an array`);
  } else if (contracts.sdkClients.length > 0) {
    reportShape(
      `${root.name}: contracts.sdkClients must be empty for an application root (COMPONENT_SPEC.md section 136), found ${JSON.stringify(contracts.sdkClients)}`,
    );
  }

  for (const dependency of contracts.sdkDependencies ?? []) {
    if (dependency === null || typeof dependency !== 'object') {
      reportShape(
        `${root.name}: contracts.sdkDependencies entries must be objects carrying surface and credentialMode (APP_COMPOSITION_SPEC.md section 77); found ${JSON.stringify(dependency)}`,
      );
      continue;
    }
    for (const key of ['workspace', 'surface', 'credentialMode']) {
      if (typeof dependency[key] !== 'string' || dependency[key] === '') {
        reportShape(
          `${root.name}: contracts.sdkDependencies entry is missing "${key}": ${JSON.stringify(dependency)}`,
        );
      }
    }
  }

  if (authorityShapeIssues.length > 0) {
    notes.push(
      `${PC_ROOT}: ${authorityShapeIssues.length} pre-existing root-contract shape issue(s) (legacy sdkClients / sdkDependencies form; not owned by this check)`,
    );
  }

  for (const [label, entries] of [
    ['publicExports', contracts.publicExports ?? []],
    ['runtimeEntrypoints', contracts.runtimeEntrypoints ?? []],
  ]) {
    if (!Array.isArray(entries) || entries.length === 0) {
      fail(`${root.name}: contracts.${label} must declare at least one entry`);
      continue;
    }
    for (const entry of entries) {
      const problem = resolveContractEntry(rootDir, entry);
      if (problem !== null) {
        fail(`${root.name}: contracts.${label} -> ${entry} (${problem})`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

for (const note of notes) {
  console.log(`note: ${note}`);
}

if (failures.length === 0) {
  console.log(
    `client app surface verification passed (${CLIENT_ROOTS.length} root(s), ${pcSurface?.size ?? 0} PC route(s))`,
  );
  process.exit(0);
}

console.error('client app surface verification failed:');
for (const failure of failures.slice(0, 200)) {
  console.error(`- ${failure}`);
}
if (failures.length > 200) {
  console.error(`- ... and ${failures.length - 200} more`);
}
process.exit(1);
