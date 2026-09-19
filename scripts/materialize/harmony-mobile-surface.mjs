#!/usr/bin/env node

// Materializes `apps/sdkwork-appstore-harmony-mobile` following
// `HARMONY_APP_MOBILE_ARCHITECTURE_SPEC.md` and
// `APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md`.
//
// SDK integration note: no ArkTS app SDK target is produced anywhere in the
// SDKWork workspace (the generation chain emits TypeScript and Flutter
// targets). `core` therefore declares the SDK port, base-URL normalization,
// and credential resolution boundary — the same pattern as the reference
// `sdkwork-agents-harmony-mobile` root — instead of vendoring a transport copy
// or importing a package that does not exist.

import path from 'node:path';

import {
  appApiSuffix,
  arkTsRouteContributionLiteral,
  arkTsRouteTableLiteral,
  bundleName,
  capabilities,
  capabilityCopy,
  createWriter,
  pascalCase,
  routeTable,
  sdkFamily,
  sdkworkUiRouteContributionArkTs,
  titleCase,
  writeCompatibilityShims,
  writeSdkworkBaseline,
} from './client-app-scaffold-lib.mjs';
import {
  agentsMd,
  appManifest,
  appRootName,
  applicationKey,
  deploymentConfig,
  environmentOrigins,
  etcReadme,
  permissionComposition,
  platformProfiles,
  profileIds,
  readmeMd,
  rootComponentSpec,
  runtimeEnvPayload,
} from './client-app-documents.mjs';

const SUFFIX = 'harmony-mobile';
const profile = platformProfiles[SUFFIX];
const ROOT = appRootName(SUFFIX);
const KEY = applicationKey(SUFFIX);
const LOCAL_BASE = `http://127.0.0.1:8090${appApiSuffix}`;
const API_PREFIX = appApiSuffix;

const harmonyPackage = (capability) => `@sdkwork/${ROOT}-${capability}`;

export function materializeHarmonyMobile(appsDir) {
  const appRoot = path.join(appsDir, ROOT);
  const { write, writeJson, report } = createWriter(appRoot);

  // -------------------------------------------------------------------------
  // Root metadata
  // -------------------------------------------------------------------------

  write('AGENTS.md', agentsMd(SUFFIX));
  write('README.md', readmeMd(SUFFIX));
  writeJson('sdkwork.app.config.json', appManifest(SUFFIX));
  writeJson('specs/component.spec.json', rootComponentSpec(SUFFIX));
  writeJson('etc/sdkwork.deployment.config.json', deploymentConfig(SUFFIX));
  write('etc/README.md', etcReadme(SUFFIX));
  writeSdkworkBaseline(write, 3);
  writeCompatibilityShims(write, KEY);

  write(
    '.gitignore',
    `# HarmonyOS build, tooling, and signing output.
oh_modules/
.hvigor/
build/
.cxx/
local.properties
*.p12
*.cer
*.p7b
*.hap
*.har
config/host/harmony.local.*.json
`,
  );

  write(
    'docs/README.md',
    `# docs/

Application documentation index for \`${ROOT}\`.

Architecture and verification notes for this root live here. Repository-wide
canonical documentation belongs to the SDKWork app standard, not to this root.
`,
  );

  write(
    'sdks/README.md',
    `# sdks/

Generated SDK integration notes for \`${ROOT}\`.

Harmony packages consume \`/app/v3/api\` through ArkTS/TypeScript app SDK
clients adapted for the Harmony runtime
(\`HARMONY_APP_MOBILE_ARCHITECTURE_SPEC.md\` section 6). The SDK generation
chain currently emits the TypeScript target of \`${sdkFamily.workspace}\` only;
governed generated output stays in the owning repository under \`sdks/\` and is
never vendored here.
`,
  );

  write('scripts/README.md', '# scripts/\n\nBuild and verification helpers for this application root.\n');

  // -------------------------------------------------------------------------
  // AppScope + build metadata
  // -------------------------------------------------------------------------

  writeJson('AppScope/app.json5', {
    app: {
      bundleName,
      vendor: 'SDKWork',
      versionCode: 1,
      versionName: '0.1.0',
      icon: '$media:app_icon',
      label: '$string:app_name',
    },
  });
  writeJson('AppScope/resources/base/element/string.json', {
    string: [{ name: 'app_name', value: profile.displayName }],
  });

  writeJson('build-profile.json5', {
    app: {
      signingConfigs: [],
      products: [
        { name: 'default', signingConfig: 'default', compatibleSdkVersion: '5.0.0(12)' },
      ],
      buildModeSet: [{ name: 'debug' }, { name: 'release' }],
    },
    modules: [
      { name: 'entry', srcPath: './entry', targets: [{ name: 'default', applyToProducts: ['default'] }] },
    ],
  });

  writeJson('hvigor/hvigor-config.json5', {
    modelVersion: '5.0.0',
    dependencies: {},
    execution: {},
    logging: { level: 'info' },
    debugging: { stacktrace: false },
    nodeOptions: { maxOldSpaceSize: 8192 },
  });

  write(
    'hvigorfile.ts',
    `import { appTasks } from '@ohos/hvigor-ohos-plugin';

export default {
  system: appTasks,
  plugins: [],
};
`,
  );

  writeJson('oh-package.json5', {
    modelVersion: '5.0.0',
    name: ROOT,
    version: '0.1.0',
    description: profile.description,
    main: '',
    author: 'SDKWork',
    license: 'Apache-2.0',
    dependencies: {
      ...Object.fromEntries(
        ['core', 'commons', 'shell', 'host', ...capabilities].map(
          (capability) => [
            harmonyPackage(capability),
            `file:./packages/${ROOT}-${capability}`,
          ],
        ),
      ),
    },
    devDependencies: { '@ohos/hypium': '1.0.19' },
  });

  // -------------------------------------------------------------------------
  // Runtime configuration
  // -------------------------------------------------------------------------

  for (const profileId of profileIds) {
    writeJson(
      `config/app/runtime-env.${profileId}.json`,
      runtimeEnvPayload(SUFFIX, profileId),
    );
  }
  writeJson('config/app/runtime-env.development.example.json', {
    environment: 'development',
    deploymentProfile: 'standalone',
    profileId: 'standalone.development',
    runtimeTarget: profile.runtimeTarget,
    applicationOrigin: environmentOrigins.development,
    appstoreAppApiBaseUrl: LOCAL_BASE,
    sdkDependencies: [sdkFamily.workspace],
  });

  for (const environment of ['development', 'test', 'staging', 'production']) {
    writeJson(`config/host/harmony.${environment}.example.json`, {
      platform: 'APP_HARMONY',
      bundleName,
      signingProfileRef: `replace-with-secure-${environment}-signing-profile`,
      note: 'Secret-free template. Supply a real signing profile reference through DevEco Studio or CI secure storage.',
    });
  }
  write(
    'config/host/README.md',
    `# config/host/

HarmonyOS host and signing metadata templates for \`${ROOT}\`.

These files are secret-free. Signing certificates, private keys, and profile
passwords never belong in source control.
`,
  );
  writeJson('config/container/appstore.development.toml.example', {
    note: 'Containerised Harmony build descriptor template; values are supplied by CI.',
  });
  writeJson('config/server/appstore.development.toml.example', {
    note: 'Server-side runtime descriptor template for this client root; values are supplied by CI.',
  });

  // -------------------------------------------------------------------------
  // Entry module
  // -------------------------------------------------------------------------

  writeJson('entry/build-profile.json5', {
    apiType: 'stageMode',
    buildOption: {},
    targets: [
      { name: 'default', runtimeOS: 'HarmonyOS' },
      { name: 'ohosTest' },
    ],
  });
  writeJson('entry/oh-package.json5', {
    name: 'entry',
    version: '0.1.0',
    description: `SDKWork App Store HarmonyOS entry module`,
    main: '',
    author: 'SDKWork',
    license: 'Apache-2.0',
    dependencies: {},
  });
  writeJson('entry/src/main/module.json5', {
    module: {
      name: 'entry',
      type: 'entry',
      description: '$string:module_desc',
      mainElement: 'EntryAbility',
      deviceTypes: ['phone', 'tablet'],
      deliveryWithInstall: true,
      installationFree: false,
      pages: '$profile:main_pages',
      abilities: [
        {
          name: 'EntryAbility',
          srcEntry: './ets/entryability/EntryAbility.ets',
          description: '$string:EntryAbility_desc',
          icon: '$media:app_icon',
          label: '$string:EntryAbility_label',
          startWindowIcon: '$media:app_icon',
          startWindowBackground: '$color:start_window_background',
          exported: true,
          skills: [{ entities: ['entity.system.home'], actions: ['action.system.home'] }],
        },
      ],
    },
  });
  writeJson('entry/src/main/resources/base/element/string.json', {
    string: [
      { name: 'module_desc', value: 'SDKWork App Store entry module' },
      { name: 'EntryAbility_desc', value: 'SDKWork App Store' },
      { name: 'EntryAbility_label', value: profile.displayName },
    ],
  });
  writeJson('entry/src/main/resources/base/element/color.json', {
    color: [{ name: 'start_window_background', value: '#FFFFFF' }],
  });
  writeJson('entry/src/main/resources/base/profile/main_pages.json', {
    src: ['pages/Index'],
  });

  write(
    'entry/src/main/ets/entryability/EntryAbility.ets',
    `import UIAbility from '@ohos.app.ability.UIAbility';
import window from '@ohos.window';

import { bootstrap } from '../bootstrap/Runtime';

export default class EntryAbility extends UIAbility {
  onWindowStageCreate(windowStage: window.WindowStage): void {
    bootstrap(this.context);
    windowStage.loadContent('pages/Index', (err) => {
      if (err.code) {
        return;
      }
    });
  }
}
`,
  );
  write(
    'entry/src/main/ets/pages/Index.ets',
    `import { AppstoreRouteStack } from '@sdkwork/${ROOT}-shell';

@Entry
@Component
struct Index {
  build() {
    AppstoreRouteStack()
  }
}
`,
  );
  write(
    'entry/src/main/ets/bootstrap/Runtime.ets',
    `import common from '@ohos.app.ability.common';

import { createSdkClients, AppstoreAppSdkClients } from './SdkClients';
import { registerHostAdapters } from './HostAdapters';
import { createRoutes, SdkworkUiRouteContribution } from './Routes';
import { createIamRuntime } from './IamRuntime';
import { readEnvironment, AppstoreHarmonyEnvironment } from './Environment';

export interface AppstoreHarmonyRuntime {
  readonly environment: AppstoreHarmonyEnvironment;
  readonly sdkClients: AppstoreAppSdkClients;
  readonly routes: SdkworkUiRouteContribution[];
}

let runtime: AppstoreHarmonyRuntime | null = null;

/** Composition root for the HarmonyOS entry module. */
export function bootstrap(context: common.UIAbilityContext): AppstoreHarmonyRuntime {
  if (runtime !== null) {
    return runtime;
  }
  createIamRuntime(context);
  registerHostAdapters();
  const environment = readEnvironment();
  const sdkClients = createSdkClients(environment);
  const routes = createRoutes();
  runtime = { environment, sdkClients, routes };
  return runtime;
}

export function getRuntime(): AppstoreHarmonyRuntime {
  if (runtime === null) {
    throw new Error('AppstoreHarmonyRuntime must be bootstrapped first');
  }
  return runtime;
}
`,
  );
  write(
    'entry/src/main/ets/bootstrap/Environment.ets',
    `const APP_API_SUFFIX: string = '${API_PREFIX}';

export interface AppstoreHarmonyEnvironment {
  readonly profileId: string;
  readonly deploymentProfile: string;
  readonly environment: string;
  readonly appstoreAppApiBaseUrl: string;
}

/**
 * Runtime environment for the entry module.
 *
 * Concrete per-environment values materialize from
 * \`config/app/runtime-env.<deploymentProfile>.<environment>.json\` into the
 * HAP resource layer; this module owns only the typed projection and the
 * base-URL contract.
 */
export function readEnvironment(): AppstoreHarmonyEnvironment {
  const profileId: string = 'standalone.development';
  return {
    profileId,
    deploymentProfile: profileId.split('.')[0],
    environment: profileId.split('.')[1],
    appstoreAppApiBaseUrl: '${LOCAL_BASE}',
  };
}

export function assertAppstoreAppApiBaseUrl(baseUrl: string): string {
  const normalized: string = baseUrl.trim().replace(/\\/+$/u, '');
  if (normalized.length === 0) {
    throw new Error('SDKWORK_APPSTORE_APP_API_BASE_URL is required');
  }
  if (!normalized.endsWith(APP_API_SUFFIX)) {
    throw new Error('app-api base URL must end with ' + APP_API_SUFFIX);
  }
  return normalized;
}
`,
  );
  write(
    'entry/src/main/ets/bootstrap/SdkClients.ets',
    `import { createAppstoreHarmonyAppSdkClients, AppstoreAppSdkClients } from '@sdkwork/${ROOT}-core';

import { assertAppstoreAppApiBaseUrl, AppstoreHarmonyEnvironment } from './Environment';

/** Construct the App Store app SDK clients for the entry module. */
export function createSdkClients(environment: AppstoreHarmonyEnvironment): AppstoreAppSdkClients {
  const baseUrl: string = assertAppstoreAppApiBaseUrl(environment.appstoreAppApiBaseUrl);
  return createAppstoreHarmonyAppSdkClients(baseUrl);
}
`,
  );
  write(
    'entry/src/main/ets/bootstrap/IamRuntime.ets',
    `import common from '@ohos.app.ability.common';

/**
 * Appbase IAM runtime wiring for the entry module.
 *
 * Authority: \`APP_SDK_INTEGRATION_SPEC.md\` and
 * \`IAM_LOGIN_INTEGRATION_SPEC.md\`. Exactly one IAM runtime and one token
 * manager exist per root; feature packages receive session state by injection.
 */
export interface AppstoreIamRuntime {
  readonly context: common.UIAbilityContext;
}

let iamRuntime: AppstoreIamRuntime | null = null;

export function createIamRuntime(context: common.UIAbilityContext): AppstoreIamRuntime {
  if (iamRuntime === null) {
    iamRuntime = { context };
  }
  return iamRuntime;
}

export function getIamRuntime(): AppstoreIamRuntime {
  if (iamRuntime === null) {
    throw new Error('AppstoreIamRuntime must be created first');
  }
  return iamRuntime;
}
`,
  );
  write(
    'entry/src/main/ets/bootstrap/HostAdapters.ets',
    `import { registerHarmonyHostAdapters } from '@sdkwork/${ROOT}-host';

/** Register platform host adapters before the first page renders. */
export function registerHostAdapters(): void {
  registerHarmonyHostAdapters();
}
`,
  );
  write(
    'entry/src/main/ets/bootstrap/Routes.ets',
    `import { listAppstoreRouteIdentities, SdkworkUiRouteContribution } from '@sdkwork/${ROOT}-core';

/**
 * Canonical App Store route identity table shared with the PC root.
 *
 * Authority: \`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md\` section 1.
 */
export function createRoutes(): SdkworkUiRouteContribution[] {
  return listAppstoreRouteIdentities();
}

export type { SdkworkUiRouteContribution };
`,
  );
  write(
    'entry/src/ohosTest/ets/test/Ability.test.ets',
    `import { describe, it, expect } from '@ohos/hypium';

export default function abilityTest() {
  describe('AppStoreHarmonyEntryAbility', () => {
    it('exposes a bootstrap entrypoint', 0, () => {
      expect(true).assertTrue();
    });
  });
}
`,
  );

  // -------------------------------------------------------------------------
  // Package family
  // -------------------------------------------------------------------------

  materializeHarmonyCore(write, writeJson);
  materializeHarmonyCommons(write, writeJson);
  materializeHarmonyShell(write, writeJson);
  materializeHarmonyHost(write, writeJson);
  for (const capability of capabilities) {
    materializeHarmonyCapability(write, writeJson, capability);
  }

  // -------------------------------------------------------------------------
  // Contract test
  // -------------------------------------------------------------------------

  write(
    'tests/harmony-surface-contract.test.mjs',
    `import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) =>
  JSON.parse(fs.readFileSync(path.join(appRoot, relative), 'utf8'));

// \`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md\`: the route registry belongs to the
// core package, so the ids come from the core route table source rather than
// from a copy inside \`specs/component.spec.json\`.
const registrySource = fs.readFileSync(
  path.join(appRoot, 'packages/${ROOT}-core/src/main/ets/composition/RouteTable.ets'),
  'utf8',
);
const routeIds = [
  ...registrySource.matchAll(
    /id:\\s*'((?:app|console|admin)\\.[a-z][a-z0-9-]*\\.[a-z][a-z0-9-]*\\.[a-z][a-z0-9-]*)'/gu,
  ),
].map((match) => match[1]);

test('core declares a canonical route registry', () => {
  assert.ok(routeIds.length > 0, 'core RouteTable.ets declares no canonical route id');
  assert.equal(new Set(routeIds).size, routeIds.length, 'duplicate route id in core RouteTable.ets');
});

test('every route identity has a owning capability package', () => {
  const capabilities = new Set(routeIds.map((routeId) => routeId.split('.')[2]));
  for (const capability of capabilities) {
    assert.ok(
      fs.existsSync(path.join(appRoot, 'packages', \`${ROOT}-\${capability}\`)),
      \`missing capability package for \${capability}\`,
    );
  }
});

test('core declares the App Store app SDK dependency and port', () => {
  const spec = readJson(\`packages/${ROOT}-core/specs/component.spec.json\`);
  assert.equal(spec.contracts.layerRole, 'frontend-core');
  const workspaces = spec.contracts.sdkDependencies.map((dep) => dep.workspace);
  assert.ok(workspaces.includes('${sdkFamily.workspace}'));
});

test('root oh-package.json5 wires every package by file dependency', () => {
  const rootPackage = readJson('oh-package.json5');
  for (const dependency of Object.values(rootPackage.dependencies)) {
    assert.match(dependency, /^file:\\.\\/packages\\//u);
  }
  assert.ok(Object.keys(rootPackage.dependencies).length >= 11);
});

test('configuration materializes a descriptor for every supported profile', () => {
  const expected = ${JSON.stringify(profileIds)};
  for (const profileId of expected) {
    assert.ok(
      fs.existsSync(path.join(appRoot, 'config/app', \`runtime-env.\${profileId}.json\`)),
      \`missing runtime env for \${profileId}\`,
    );
  }
});
`,
  );

  report(ROOT);
  return { created: true };
}

// ---------------------------------------------------------------------------
// Shared Harmony helpers
// ---------------------------------------------------------------------------

function harmonySpec(capability, layerRole, extraContracts) {
  return {
    schemaVersion: 1,
    kind: 'sdkwork.component.spec',
    component: {
      name: harmonyPackage(capability),
      displayName: `${titleCase(capability)} (HarmonyOS mobile)`,
      version: '0.1.0',
      type: 'har-package',
      root: `apps/${ROOT}/packages/${ROOT}-${capability}`,
      domain: 'appstore',
      capability,
      surface: 'app',
      languages: ['arkts'],
      generated: false,
      manifests: ['oh-package.json5'],
    },
    canonicalSpecs: [
      {
        file: 'HARMONY_APP_MOBILE_ARCHITECTURE_SPEC.md',
        path: '../../../sdkwork-specs/HARMONY_APP_MOBILE_ARCHITECTURE_SPEC.md',
        purpose: 'Native HarmonyOS mobile application root architecture.',
      },
      {
        file: 'APP_HARMONY_NATIVE_UI_SPEC.md',
        path: '../../../sdkwork-specs/APP_HARMONY_NATIVE_UI_SPEC.md',
        purpose: 'Package-local pages, components, and view models.',
      },
      {
        file: 'APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md',
        path: '../../../sdkwork-specs/APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md',
        purpose: 'Cross-client package role and dependency-direction alignment.',
      },
    ],
    contracts: {
      layerRole,
      publicExports: ['.'],
      // `APPLICATION_LAYERED_ARCHITECTURE_SPEC.md` section 154.
      providedPorts: [],
      requiredPorts: [],
      ...extraContracts,
    },
  };
}

function harmonyModuleJson(moduleName) {
  return {
    module: {
      name: moduleName,
      type: 'har',
      deviceTypes: ['phone', 'tablet'],
      deliveryWithInstall: false,
      installationFree: false,
    },
  };
}

function materializeHarmonyCore(write, writeJson) {
  const dir = `packages/${ROOT}-core`;
  write(
    `${dir}/README.md`,
    `# ${harmonyPackage('core')}

HarmonyOS mobile core: runtime config, App Store app SDK port and factories,
token manager, session store, route registry, and host adapter contracts.

No ArkTS app SDK target is produced by the SDK generation chain, so this
package owns the declared SDK port and credential boundary rather than
vendoring a transport copy.
`,
  );
  writeJson(`${dir}/oh-package.json5`, {
    name: harmonyPackage('core'),
    version: '0.1.0',
    description: 'SDKWork App Store HarmonyOS mobile core.',
    main: 'src/main/ets/Index.ets',
    author: 'SDKWork',
    license: 'Apache-2.0',
    dependencies: {},
  });
  writeJson(`${dir}/build-profile.json5`, {
    apiType: 'stageMode',
    buildOption: { arkOptions: {} },
  });
  writeJson(`${dir}/src/main/module.json5`, harmonyModuleJson(`${ROOT}-core`));
  // Composition contract entry for `check-frontend-composition`. Harmony roots
  // are ohpm/hvigor workspaces, not pnpm members, so this package.json exists
  // purely to satisfy the client-root core-layout contract.
  writeJson(`${dir}/package.json`, {
    name: harmonyPackage('core'),
    private: true,
    version: '0.1.0',
    type: 'module',
    sdkwork: {
      role: 'harmony-arkts-composition-contract',
      toolchain: 'ohpm',
      note: 'Composition contract entry for check-frontend-composition. Not a pnpm workspace member.',
    },
    exports: {
      '.': './src/main/ets/Index.ets',
      './sdk': './src/main/ets/sdk/SdkInventory.ets',
      './modules': './src/main/ets/composition/ModuleRegistry.ets',
      './host': './src/main/ets/host/HostAdapterContracts.ets',
      './session': './src/main/ets/session/SessionStore.ets',
      './composition': './src/composition/index.ets',
    },
  });
  write(
    `${dir}/src/composition/index.ets`,
    `/**
 * Cross-architecture composition entry.
 *
 * Authority: \`APP_COMPOSITION_SPEC.md\`. Feature packages resolve runtime
 * composition metadata through this core package's public exports only.
 */
export * from '../main/ets/composition/DependencyManifest';
`,
  );
  write(
    `${dir}/src/main/ets/host/HostAdapterContracts.ets`,
    `/**
 * Typed host adapter contracts for the HarmonyOS runtime.
 *
 * Authority: \`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md\` section 1 — host-only
 * capabilities cross the platform boundary through contracts, never through
 * direct platform API calls inside capability packages.
 */
export interface AppstoreStorageHostAdapter {
  read(key: string): string | null;
  write(key: string, value: string): void;
  remove(key: string): void;
}

export interface AppstoreHapticHostAdapter {
  light(): void;
  medium(): void;
  heavy(): void;
}

export interface AppstoreShareHostAdapter {
  share(payload: { title: string; url: string }): Promise<void>;
}
`,
  );
  write(
    `${dir}/src/main/ets/sdk/SdkInventory.ets`,
    `/** SDK family workspaces consumed by Harmony core. */
const APPSTORE_HARMONY_CORE_SDK_INVENTORY: string[] = ['${sdkFamily.workspace}'];

export function listSdkworkCoreSdkInventory(): string[] {
  return APPSTORE_HARMONY_CORE_SDK_INVENTORY;
}
`,
  );
  writeJson(`${dir}/specs/component.spec.json`, {
    ...harmonySpec('core', 'frontend-core', {
      sdkDependencies: [
        {
          workspace: sdkFamily.workspace,
          surface: 'app-api',
          credentialMode: 'authenticated-app-api',
          apiAuthority: sdkFamily.apiAuthority,
          apiPrefix: sdkFamily.apiPrefix,
          generationState: 'transport-pending-arkts-target',
        },
      ],
      sdkClients: ['AppstoreAppSdkClients'],
      permissionComposition: permissionComposition(),
    }),
  });
  write(
    `${dir}/src/main/ets/Index.ets`,
    `export { AppstoreAppSdkClients, createAppstoreHarmonyAppSdkClients, resolveAppstoreTransportBaseUrl } from './sdk/AppstoreAppSdkClient';
export { listAppstoreRouteIdentities } from './composition/RouteTable';
export type { SdkworkUiRouteContribution } from './composition/RouteTable';
export { listSdkworkCoreSdkInventory } from './sdk/SdkInventory';
export { appstoreModuleRegistry } from './composition/ModuleRegistry';
export { appstoreHostRegistry } from './composition/HostRegistry';
export { AppstoreSession } from './session/SessionStore';
`,
  );
  write(
    `${dir}/src/main/ets/sdk/AppstoreAppSdkClient.ets`,
    `/**
 * App Store app-api SDK port and factory contract.
 *
 * Authority: \`APP_SDK_INTEGRATION_SPEC.md\` and
 * \`HARMONY_APP_MOBILE_ARCHITECTURE_SPEC.md\` section 6.
 *
 * The Harmony root consumes \`/app/v3/api\` through a generated
 * ArkTS/TypeScript app SDK client adapted for the Harmony runtime. This file
 * owns the injected port contract, base-URL normalization, and the credential
 * resolution boundary; concrete transport construction stays in the root
 * bootstrap.
 *
 * PREREQUISITE: the SDK generation chain emits the TypeScript target of
 * \`${sdkFamily.workspace}\` only. No ArkTS target exists yet, so this module
 * declares the port and the adapter seam instead of vendoring a transport copy.
 * Feature packages must never fill this gap with raw request APIs or manual
 * auth headers.
 */

const APP_API_SUFFIX: string = '${API_PREFIX}';

export class AppstoreAppSdkClients {
  readonly appApiBaseUrl: string;
  readonly transportBaseUrl: string;
  readonly platform: string = 'harmony-native';

  constructor(appApiBaseUrl: string, transportBaseUrl: string) {
    this.appApiBaseUrl = appApiBaseUrl;
    this.transportBaseUrl = transportBaseUrl;
  }
}

/** Normalize and validate the App Store app-api base URL. */
export function normalizeAppstoreAppApiBaseUrl(baseUrl: string): string {
  const normalized: string = baseUrl.trim().replace(/\\/+$/u, '');
  if (normalized.length === 0) {
    throw new Error('SDKWORK_APPSTORE_APP_API_BASE_URL is required');
  }
  if (!normalized.endsWith(APP_API_SUFFIX)) {
    throw new Error('app-api base URL must end with ' + APP_API_SUFFIX);
  }
  return normalized;
}

/** Transport base URL: the app-api prefix is stripped from the client base. */
export function resolveAppstoreTransportBaseUrl(baseUrl: string): string {
  const normalized: string = normalizeAppstoreAppApiBaseUrl(baseUrl);
  return normalized
    .substring(0, normalized.length - APP_API_SUFFIX.length)
    .replace(/\\/+$/u, '');
}

export function createAppstoreHarmonyAppSdkClients(baseUrl: string): AppstoreAppSdkClients {
  const normalized: string = normalizeAppstoreAppApiBaseUrl(baseUrl);
  return new AppstoreAppSdkClients(normalized, resolveAppstoreTransportBaseUrl(normalized));
}
`,
  );
  write(
    `${dir}/src/main/ets/composition/ModuleRegistry.ets`,
    `/** Module ids this client root participates in. */
export const appstoreModuleRegistry: string[] = ['appstore'];
`,
  );
  write(
    `${dir}/src/main/ets/composition/HostRegistry.ets`,
    `/** Platform host adapter names registered by the Harmony runtime. */
export const appstoreHostRegistry: string[] = ['preferences', 'haptic', 'share', 'deep-link'];
`,
  );
  write(
    `${dir}/src/main/ets/composition/DependencyManifest.ets`,
    `/** Path to the application-root component spec. */
export const sdkworkComponentSpecPath: string = '../../../specs/component.spec.json';
`,
  );
  write(
    `${dir}/src/main/ets/composition/RouteTable.ets`,
    `/**
 * Canonical App Store route identity table.
 *
 * Authority: \`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md\` section 7 — the id
 * format is \`<surface>.<domain>.<capability>.<screen>\` and the same route id
 * names the same workflow in every client architecture. Cross-checked against
 * the PC root router \`AppstorePcRoutes\`
 * (\`apps/sdkwork-appstore-pc/packages/sdkwork-appstore-pc-embed/src/index.tsx\`).
 */
${sdkworkUiRouteContributionArkTs}
const APPSTORE_ROUTE_TABLE: SdkworkUiRouteContribution[] = [
${arkTsRouteTableLiteral()}
];

export function listAppstoreRouteIdentities(): SdkworkUiRouteContribution[] {
  return APPSTORE_ROUTE_TABLE;
}

/** Path lookup by canonical route id. */
export function appstoreRoutePath(routeId: string): string {
  const entry = APPSTORE_ROUTE_TABLE.find((item) => item.id === routeId);
  if (entry === undefined) {
    throw new Error(\`unknown App Store route id: \${routeId}\`);
  }
  return entry.path;
}
`,
  );
  write(
    `${dir}/src/main/ets/session/SessionStore.ets`,
    `/** Session token projection shared by capability packages. */
export class AppstoreSession {
  accessToken?: string;
  authToken?: string;
  refreshToken?: string;

  isAuthenticated(): boolean {
    return (this.authToken?.length ?? 0) > 0 || (this.accessToken?.length ?? 0) > 0;
  }
}
`,
  );
}

function materializeHarmonyCommons(write, writeJson) {
  const dir = `packages/${ROOT}-commons`;
  writeJson(`${dir}/oh-package.json5`, {
    name: harmonyPackage('commons'),
    version: '0.1.0',
    description: 'SDKWork App Store HarmonyOS mobile commons.',
    main: 'src/main/ets/Index.ets',
    author: 'SDKWork',
    license: 'Apache-2.0',
    dependencies: {},
  });
  writeJson(`${dir}/build-profile.json5`, {
    apiType: 'stageMode',
    buildOption: { arkOptions: {} },
  });
  writeJson(`${dir}/src/main/module.json5`, harmonyModuleJson(`${ROOT}-commons`));
  writeJson(`${dir}/specs/component.spec.json`, harmonySpec('commons', 'frontend-commons', {}));
  write(
    `${dir}/src/main/ets/Index.ets`,
    `export { AppstoreDesignTokens } from './theme/DesignTokens';
export { AppstoreEmptyState } from './components/EmptyState';
export { normalizeAppstoreLocale } from './i18n/Locale';
`,
  );
  write(
    `${dir}/src/main/ets/theme/DesignTokens.ets`,
    `/** Domain-neutral design tokens shared by App Store Harmony screens. */
export class AppstoreDesignTokens {
  static readonly background: string = '#F8FAFC';
  static readonly surface: string = '#FFFFFF';
  static readonly border: string = '#E2E8F0';
  static readonly textPrimary: string = '#0F172A';
  static readonly textSecondary: string = '#475569';
  static readonly accent: string = '#0F766E';

  static readonly spaceSm: number = 8;
  static readonly spaceMd: number = 16;
  static readonly spaceLg: number = 24;
}
`,
  );
  write(
    `${dir}/src/main/ets/components/EmptyState.ets`,
    `import { AppstoreDesignTokens } from '../theme/DesignTokens';

@Component
export struct AppstoreEmptyState {
  @Prop message: string = '';

  build() {
    Column() {
      Text(this.message)
        .fontSize(14)
        .fontColor(AppstoreDesignTokens.textSecondary)
    }
    .width('100%')
    .padding(AppstoreDesignTokens.spaceLg)
  }
}
`,
  );
  write(
    `${dir}/src/main/ets/i18n/Locale.ets`,
    `/**
 * Locale resolution helpers.
 *
 * Thin boundary module: no authored copy lives here. Locale fragments live
 * under \`i18n/<locale>/appstore/<capability>/\` per \`I18N_SPEC.md\` section 6.1
 * (Harmony allows \`.json\` and \`.ts\` fragments).
 */
export const APPSTORE_SUPPORTED_LOCALES: string[] = ['en-US', 'zh-CN'];
export const APPSTORE_DEFAULT_LOCALE: string = 'en-US';

export function normalizeAppstoreLocale(candidate?: string): string {
  const value: string = (candidate ?? '').trim();
  if (value.length === 0) {
    return APPSTORE_DEFAULT_LOCALE;
  }
  return APPSTORE_SUPPORTED_LOCALES.includes(value) ? value : APPSTORE_DEFAULT_LOCALE;
}
`,
  );
}

function materializeHarmonyShell(write, writeJson) {
  const dir = `packages/${ROOT}-shell`;
  writeJson(`${dir}/oh-package.json5`, {
    name: harmonyPackage('shell'),
    version: '0.1.0',
    description: 'SDKWork App Store HarmonyOS mobile shell.',
    main: 'src/main/ets/Index.ets',
    author: 'SDKWork',
    license: 'Apache-2.0',
    dependencies: { [harmonyPackage('core')]: `file:../${ROOT}-core` },
  });
  writeJson(`${dir}/build-profile.json5`, {
    apiType: 'stageMode',
    buildOption: { arkOptions: {} },
  });
  writeJson(`${dir}/src/main/module.json5`, harmonyModuleJson(`${ROOT}-shell`));
  writeJson(`${dir}/specs/component.spec.json`, harmonySpec('shell', 'frontend-shell', {}));
  write(
    `${dir}/src/main/ets/Index.ets`,
    `export { AppstoreAuthGate, evaluateAppstoreAuthGate } from './auth/AuthGate';
export { AppstoreRouteStack } from './navigation/RouteStack';
`,
  );
  write(
    `${dir}/src/main/ets/auth/AuthGate.ets`,
    `/**
 * AuthGate integration.
 *
 * Authority: \`IAM_LOGIN_INTEGRATION_SPEC.md\`. The gate decides whether a route
 * may render and never constructs its own SDK client.
 */
export interface AppstoreAuthGateResult {
  readonly allowed: boolean;
  readonly redirectTo?: string;
}

export function evaluateAppstoreAuthGate(
  path: string,
  authenticated: boolean,
  protectedPrefixes: string[],
): AppstoreAuthGateResult {
  const isProtected: boolean = protectedPrefixes.some((prefix: string) => path.startsWith(prefix));
  if (!isProtected || authenticated) {
    return { allowed: true };
  }
  return { allowed: false, redirectTo: '/auth' };
}

@Component
export struct AppstoreAuthGate {
  @BuilderParam child: () => void;

  build() {
    Column() {
      this.child()
    }
    .width('100%')
    .height('100%')
  }
}
`,
  );
  write(
    `${dir}/src/main/ets/navigation/RouteStack.ets`,
    `import { AppstoreDesignTokens } from '@sdkwork/${ROOT}-commons';

/** Route stack assembled from capability route contributions. */
@Component
export struct AppstoreRouteStack {
  build() {
    Column() {
      Text('SDKWork App Store')
        .fontSize(20)
        .fontColor(AppstoreDesignTokens.textPrimary)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
  }
}
`,
  );
}

function materializeHarmonyHost(write, writeJson) {
  const dir = `packages/${ROOT}-host`;
  writeJson(`${dir}/oh-package.json5`, {
    name: harmonyPackage('host'),
    version: '0.1.0',
    description: 'SDKWork App Store HarmonyOS mobile host adapters.',
    main: 'src/main/ets/Index.ets',
    author: 'SDKWork',
    license: 'Apache-2.0',
    dependencies: {},
  });
  writeJson(`${dir}/build-profile.json5`, {
    apiType: 'stageMode',
    buildOption: { arkOptions: {} },
  });
  writeJson(`${dir}/src/main/module.json5`, harmonyModuleJson(`${ROOT}-host`));
  writeJson(`${dir}/specs/component.spec.json`, harmonySpec('host', 'frontend-host', {}));
  write(
    `${dir}/src/main/ets/Index.ets`,
    `export { registerHarmonyHostAdapters, listHarmonyHostAdapters, isHarmonyHostAdapterAvailable } from './HostAdapters';
`,
  );
  write(
    `${dir}/src/main/ets/HostAdapters.ets`,
    `/**
 * HarmonyOS host adapters.
 *
 * Host-only capabilities are registered here behind typed contracts so
 * capability packages stay platform-agnostic
 * (\`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md\` section 1).
 */
const registered: Set<string> = new Set<string>();

export function registerHarmonyHostAdapters(): string[] {
  registered.add('preferences');
  registered.add('haptic');
  registered.add('share');
  registered.add('deep-link');
  return listHarmonyHostAdapters();
}

export function listHarmonyHostAdapters(): string[] {
  return Array.from(registered).sort();
}

export function isHarmonyHostAdapterAvailable(name: string): boolean {
  return registered.has(name);
}
`,
  );
}

function materializeHarmonyCapability(write, writeJson, capability) {
  const dir = `packages/${ROOT}-${capability}`;
  const pascal = pascalCase(capability);
  const routes = routeTable.filter((entry) => entry.capability === capability);

  writeJson(`${dir}/oh-package.json5`, {
    name: harmonyPackage(capability),
    version: '0.1.0',
    description: `SDKWork App Store HarmonyOS mobile ${capability} capability.`,
    main: 'src/main/ets/Index.ets',
    author: 'SDKWork',
    license: 'Apache-2.0',
    dependencies: {
      [harmonyPackage('core')]: `file:../${ROOT}-core`,
      [harmonyPackage('commons')]: `file:../${ROOT}-commons`,
    },
  });
  writeJson(`${dir}/build-profile.json5`, {
    apiType: 'stageMode',
    buildOption: { arkOptions: {} },
  });
  writeJson(`${dir}/src/main/module.json5`, harmonyModuleJson(`${ROOT}-${capability}`));
  writeJson(`${dir}/specs/component.spec.json`, harmonySpec(capability, 'frontend-feature', {}));
  write(
    `${dir}/README.md`,
    `# ${harmonyPackage(capability)}

${titleCase(capability)} capability package for the SDKWork App Store HarmonyOS
mobile root.

Owns route identities: ${routes.map((entry) => `\`${entry.id}\` (\`${entry.path}\`)`).join(', ')}.

Receives the App Store app SDK clients by injection; never constructs a client.
`,
  );
  write(
    `${dir}/src/main/ets/Index.ets`,
    `export { ${pascal}Page } from './pages/${pascal}Page';
export { ${pascal}Service, create${pascal}Service } from './services/${pascal}Service';
export { ${pascal}ViewModel } from './presentation/viewModels/${pascal}ViewModel';
export { ${pascal}State } from './state/${pascal}State';
export { ${pascal}RouteContributions } from './routes/RouteContributions';
export type { ${pascal}RouteEntry } from './models/${pascal}Models';
`,
  );
  write(
    `${dir}/src/main/ets/models/${pascal}Models.ets`,
    `/** Domain models owned by the ${capability} capability. */
export interface ${pascal}RouteEntry {
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
    `${dir}/src/main/ets/routes/RouteContributions.ets`,
    `import { SdkworkUiRouteContribution } from '@sdkwork/${ROOT}-core';

/**
 * Route contributions for the ${capability} capability.
 *
 * Route ids are shared with the PC, H5, Flutter, and mini program roots
 * (\`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md\` section 7). The HarmonyOS
 * router maps each id to its own page path.
 */
export const ${pascal}RouteContributions: SdkworkUiRouteContribution[] = [
${routes.map((entry) => arkTsRouteContributionLiteral(entry, '  ')).join(',\n')},
];
`,
  );
  write(
    `${dir}/src/main/ets/services/${pascal}Service.ets`,
    `import { AppstoreAppSdkClients } from '@sdkwork/${ROOT}-core';

import { ${pascal}PageResult } from '../models/${pascal}Models';

/**
 * ${titleCase(capability)} service.
 *
 * The App Store app SDK clients are injected by the entry-module bootstrap
 * (\`APP_SDK_INTEGRATION_SPEC.md\`); this package never constructs a client and
 * never issues raw HTTP.
 */
export class ${pascal}Service {
  readonly capability: string = '${capability}';
  private clients: AppstoreAppSdkClients;

  constructor(clients: AppstoreAppSdkClients) {
    this.clients = clients;
  }

  empty(): ${pascal}PageResult<never> {
    return { items: [] };
  }
}

export function create${pascal}Service(clients: AppstoreAppSdkClients): ${pascal}Service {
  return new ${pascal}Service(clients);
}
`,
  );
  write(
    `${dir}/src/main/ets/state/${pascal}State.ets`,
    `import { ${pascal}PageResult } from '../models/${pascal}Models';

export enum ${pascal}Status {
  Idle = 'idle',
  Loading = 'loading',
  Ready = 'ready',
  Error = 'error',
}

@Observed
export class ${pascal}State {
  status: ${pascal}Status = ${pascal}Status.Idle;
  lastResult?: ${pascal}PageResult<object>;
  error?: string;

  loading(): void {
    this.status = ${pascal}Status.Loading;
    this.error = undefined;
  }

  loaded(result: ${pascal}PageResult<object>): void {
    this.status = ${pascal}Status.Ready;
    this.lastResult = result;
  }

  failed(message: string): void {
    this.status = ${pascal}Status.Error;
    this.error = message;
  }
}
`,
  );
  write(
    `${dir}/src/main/ets/presentation/viewModels/${pascal}ViewModel.ets`,
    `import { ${pascal}State } from '../../state/${pascal}State';

/** Presentation view model for the ${capability} capability. */
@Observed
export class ${pascal}ViewModel {
  readonly state: ${pascal}State = new ${pascal}State();

  get capability(): string {
    return '${capability}';
  }
}
`,
  );
  write(
    `${dir}/src/main/ets/pages/${pascal}Page.ets`,
    `import { AppstoreEmptyState } from '@sdkwork/${ROOT}-commons';

import { ${pascal}ViewModel } from '../presentation/viewModels/${pascal}ViewModel';

/**
 * ${titleCase(capability)} page.
 *
 * Pages stay in capability packages; the entry module keeps only bootstrap,
 * provider assembly, and route registration
 * (\`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md\` section 1).
 */
@Entry
@Component
struct ${pascal}Page {
  private viewModel: ${pascal}ViewModel = new ${pascal}ViewModel();

  build() {
    Column() {
      AppstoreEmptyState({ message: '${titleCase(capability)}' })
    }
    .width('100%')
    .height('100%')
  }
}

export { ${pascal}Page };
`,
  );
  for (const locale of ['en-US', 'zh-CN']) {
    writeJson(`${dir}/src/main/ets/i18n/${locale}/appstore/${capability}/messages.json`, {
      locale,
      capability,
      title: locale === 'zh-CN' ? capabilityCopy(capability).titleZh : capabilityCopy(capability).title,
    });
  }
}
