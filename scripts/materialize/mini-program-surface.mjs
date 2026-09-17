#!/usr/bin/env node

// Materializes `apps/sdkwork-appstore-mini-program` following
// `MINI_PROGRAM_APP_ARCHITECTURE_SPEC.md` and
// `APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md`.
//
// The mini program root consumes TypeScript, so it integrates the generated
// `@sdkwork/appstore-app-sdk` client directly (no adapter seam needed).

import path from 'node:path';

import {
  appApiSuffix,
  camelCase,
  capabilities,
  createWriter,
  pascalCase,
  routeContributionLiteral,
  routeTable,
  sdkFamily,
  sdkworkUiRouteContributionTs,
  titleCase,
  tsRouteTableLiteral,
  writeCompatibilityShims,
  writeSdkworkBaseline,
} from './client-app-scaffold-lib.mjs';
import {
  agentsMd,
  appManifest,
  appRootName,
  applicationKey,
  deploymentConfig,
  environments,
  environmentOrigins,
  etcReadme,
  permissionComposition,
  platformProfiles,
  profileIds,
  readmeMd,
  rootComponentSpec,
  runtimeEnvPayload,
} from './client-app-documents.mjs';

const SUFFIX = 'mini-program';
const profile = platformProfiles[SUFFIX];
const ROOT = appRootName(SUFFIX);
const KEY = applicationKey(SUFFIX);
const MP_PREFIX = `@sdkwork/appstore-mp`;

const mpPackage = (capability) => `${MP_PREFIX}-${capability}`;
const mpPackageDir = (capability) => `sdkwork-appstore-mp-${capability}`;

export function materializeMiniProgram(appsDir) {
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

  // `.gitignore` for the mini program root.
  write(
    '.gitignore',
    `# Mini program build output and local runtime state.
dist/
.cache/
src/runtime/appstore-app.js
src/runtime/runtime-env.js
`,
  );

  writeJson('project.config.json', {
    miniprogramRoot: 'src/',
    projectname: ROOT,
    appid: 'touristappid',
    setting: { urlCheck: false, es6: true, minified: true },
    compileType: 'miniprogram',
  });

  writeJson('tsconfig.json', {
    compilerOptions: {
      target: 'ES2021',
      lib: ['ES2021', 'DOM'],
      module: 'ESNext',
      moduleResolution: 'bundler',
      strict: true,
      skipLibCheck: true,
      types: ['miniprogram-api-typings'],
      noEmit: true,
      allowImportingTsExtensions: true,
    },
    include: ['src', 'packages'],
  });

  writeJson('package.json', {
    name: `@sdkwork/${KEY}`,
    private: true,
    version: '0.1.0',
    type: 'module',
    scripts: {
      dev: 'pnpm dev:standalone',
      'dev:standalone':
        'pnpm exec sdkwork-app dev --root ../.. --deployment-profile standalone',
      'dev:cloud':
        'pnpm exec sdkwork-app dev --root ../.. --deployment-profile cloud',
      build: 'node scripts/build-runtime.mjs',
      'build:standalone': 'node scripts/build-runtime.mjs',
      'build:cloud':
        'node scripts/build-runtime.mjs --deployment-profile cloud',
      typecheck: 'tsc --noEmit -p tsconfig.json',
      test: 'node --test tests/mini-program-surface-contract.test.mjs',
      clean:
        "node -e \"const fs=require('node:fs'); for(const p of ['dist','.cache','src/runtime/appstore-app.js','src/runtime/runtime-env.js']) fs.rmSync(p,{recursive:true,force:true})\"",
    },
    dependencies: {
      [mpPackage('core')]: 'workspace:*',
      [mpPackage('commons')]: 'workspace:*',
      [mpPackage('shell')]: 'workspace:*',
      [mpPackage('host')]: 'workspace:*',
      ...Object.fromEntries(
        capabilities.map((capability) => [
          mpPackage(capability),
          'workspace:*',
        ]),
      ),
      '@sdkwork/sdk-common': 'workspace:*',
    },
    devDependencies: {
      esbuild: '^0.25.10',
      'miniprogram-api-typings': '^4.1.0',
      typescript: 'catalog:',
    },
  });

  // -------------------------------------------------------------------------
  // Runtime configuration
  // -------------------------------------------------------------------------

  for (const profileId of profileIds) {
    writeJson(
      `config/mini-program/runtime-env.${profileId}.json`,
      runtimeEnvPayload(SUFFIX, profileId),
    );
  }
  writeJson('config/mini-program/runtime-env.development.example.json', {
    environment: 'development',
    deploymentProfile: 'standalone',
    profileId: 'standalone.development',
    runtimeTarget: profile.runtimeTarget,
    applicationOrigin: environmentOrigins.development,
    appstoreAppApiBaseUrl: `${environmentOrigins.development.replace(/\/$/u, '')}${appApiSuffix}`,
    sdkDependencies: [sdkFamily.workspace],
  });
  writeJson('config/host/mp-weixin.development.example.json', {
    platform: 'MP_WEIXIN',
    appId: 'touristappid',
    note: 'Secret-free template. Supply a real WeChat app id through CI secure storage.',
  });

  // -------------------------------------------------------------------------
  // Platform surface
  // -------------------------------------------------------------------------

  writeJson('src/app.json', {
    pages: ['pages/home/index', 'pages/shell/index'],
    window: {
      navigationBarTitleText: profile.displayName,
      navigationBarBackgroundColor: '#0f766e',
      navigationBarTextStyle: 'white',
    },
  });

  write(
    'src/app.js',
    `const { bootstrapAppstoreMiniProgram } = require("./runtime/appstore-app");
const runtimeEnv = require("./runtime/runtime-env");

App({
  globalData: {
    sdkworkProfileId: runtimeEnv.SDKWORK_PROFILE_ID,
    appstoreAppApiBaseUrl: runtimeEnv.SDKWORK_APPSTORE_APP_API_BASE_URL,
  },
  onLaunch() {
    try {
      bootstrapAppstoreMiniProgram({
        appApiBaseUrl: this.globalData.appstoreAppApiBaseUrl,
        accessToken: this.globalData.sdkworkAccessToken,
      });
    } catch {
      // Runtime bundle is produced by \`pnpm run build\`.
    }
    wx.reLaunch({ url: "/pages/home/index" });
  },
});
`,
  );

  write(
    'src/app.wxss',
    `page {
  background: #f8fafc;
  color: #0f172a;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", sans-serif;
}
`,
  );

  write('src/runtime/.gitkeep', '');

  write(
    'src/bootstrap/sdkClients.ts',
    `import { createAppstoreMpAppSdkClient } from "${mpPackage('core')}";

import { readRuntimeEnv } from "./environment";

/**
 * Construct the generated App Store app SDK client.
 *
 * Authority: \`APP_SDK_INTEGRATION_SPEC.md\`. Feature packages receive this
 * client by injection and never construct one themselves.
 */
export function createSdkClients(accessToken?: string) {
  const env = readRuntimeEnv();
  return createAppstoreMpAppSdkClient({
    baseUrl: env.appstoreAppApiBaseUrl,
    accessToken,
    platform: "mini-program",
  });
}
`,
  );

  write(
    'src/bootstrap/environment.ts',
    `import type { MiniProgramRuntimeEnv } from "${mpPackage('core')}";

let current: MiniProgramRuntimeEnv | null = null;

export function readRuntimeEnv(): MiniProgramRuntimeEnv {
  if (current) {
    return current;
  }
  throw new Error(
    "mini program runtime environment must be seeded before SDK bootstrap",
  );
}

export function seedRuntimeEnv(env: MiniProgramRuntimeEnv): MiniProgramRuntimeEnv {
  current = env;
  return current;
}
`,
  );

  write(
    'src/bootstrap/runtimeBundle.ts',
    `import { seedRuntimeEnv } from "./environment";

declare const __SDKWORK_RUNTIME_ENV__: Record<string, string> | undefined;

const fallback: Record<string, string> = {
  SDKWORK_PROFILE_ID: "standalone.development",
  SDKWORK_APPSTORE_APP_API_BASE_URL: "http://127.0.0.1:8090/app/v3/api",
};

/**
 * Seed the runtime environment from the build-time bundle.
 *
 * \`scripts/build-runtime.mjs\` injects \`__SDKWORK_RUNTIME_ENV__\` from the
 * selected \`config/mini-program/runtime-env.<profile>.<environment>.json\`.
 */
export function seedRuntimeEnvFromBundle(): void {
  const source =
    typeof __SDKWORK_RUNTIME_ENV__ === "undefined"
      ? fallback
      : __SDKWORK_RUNTIME_ENV__;
  seedRuntimeEnv({
    profileId: source.SDKWORK_PROFILE_ID,
    appstoreAppApiBaseUrl: source.SDKWORK_APPSTORE_APP_API_BASE_URL,
  });
}
`,
  );

  write(
    'src/bootstrap/iamRuntime.ts',
    `/**
 * Appbase IAM runtime wiring for the mini program root.
 *
 * Authority: \`APP_SDK_INTEGRATION_SPEC.md\` and
 * \`IAM_LOGIN_INTEGRATION_SPEC.md\`. The root owns exactly one TokenManager and
 * one IAM runtime; feature packages receive session state by injection.
 */

export interface MiniProgramIamSession {
  accessToken?: string;
  refreshToken?: string;
}

let session: MiniProgramIamSession = {};

export function getIamSession(): MiniProgramIamSession {
  return session;
}

export function setIamSession(next: MiniProgramIamSession): void {
  session = next;
}

export function clearIamSession(): void {
  session = {};
}
`,
  );

  write(
    'src/bootstrap/hostAdapters.ts',
    `import { registerMiniProgramHostAdapters } from "${mpPackage('host')}";

/** Register platform host adapters before the first page renders. */
export function registerHostAdapters(): void {
  registerMiniProgramHostAdapters();
}
`,
  );

  write(
    'src/bootstrap/routes.ts',
    `import { APPSTORE_MP_ROUTE_TABLE } from "${mpPackage('core')}";

/** Route identity surface consumed by \`src/app.json\` page registration. */
export function createRoutes() {
  return APPSTORE_MP_ROUTE_TABLE;
}
`,
  );

  write(
    'src/bootstrap/runtime.ts',
    `import { seedRuntimeEnvFromBundle } from "./runtimeBundle";
import { createSdkClients } from "./sdkClients";
import { registerHostAdapters } from "./hostAdapters";
import { createRoutes } from "./routes";

/**
 * Mini program bootstrap: environment selection, host adapters, SDK client
 * construction, route assembly. Mirrors the Flutter and Harmony roots.
 */
export function bootstrapAppstoreMiniProgram(options: {
  appApiBaseUrl?: string;
  accessToken?: string;
} = {}) {
  seedRuntimeEnvFromBundle();
  registerHostAdapters();
  const sdkClients = createSdkClients(options.accessToken);
  const routes = createRoutes();
  return { sdkClients, routes };
}
`,
  );

  // Page stubs: home + shell host the capability route contributions.
  for (const page of ['home', 'shell']) {
    writeJson(`src/pages/${page}/index.json`, { usingComponents: {} });
    write(
      `src/pages/${page}/index.wxml`,
      `<view class="page">
  <view class="page__title">${profile.displayName}</view>
  <view class="page__body">{{status}}</view>
</view>
`,
    );
    write(
      `src/pages/${page}/index.wxss`,
      `.page { padding: 32rpx; }
.page__title { font-size: 40rpx; font-weight: 600; }
.page__body { margin-top: 16rpx; color: #475569; font-size: 28rpx; }
`,
    );
    write(
      `src/pages/${page}/index.js`,
      `const { bootstrapAppstoreMiniProgram } = require("../../runtime/appstore-app");

Page({
  data: { status: "loading" },
  onLoad() {
    try {
      bootstrapAppstoreMiniProgram({});
      this.setData({ status: "ready" });
    } catch (error) {
      this.setData({ status: "runtime bundle missing; run pnpm run build" });
    }
  },
});
`,
    );
  }

  write(
    'scripts/build-runtime.mjs',
    `#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const readArg = (name, fallback) => {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
};
const deploymentProfile = readArg("--deployment-profile", "standalone");
const environment = readArg("--environment", "development");
const profileId = \`\${deploymentProfile}.\${environment}\`;

const source = path.join(
  root,
  "config/mini-program",
  \`runtime-env.\${profileId}.json\`,
);
if (!fs.existsSync(source)) {
  throw new Error(\`missing runtime env config: \${profileId}\`);
}
const env = JSON.parse(fs.readFileSync(source, "utf8"));

fs.mkdirSync(path.join(root, "src/runtime"), { recursive: true });

const define = {
  __SDKWORK_RUNTIME_ENV__: JSON.stringify({
    SDKWORK_PROFILE_ID: env.profileId,
    SDKWORK_APPSTORE_APP_API_BASE_URL: env.appstoreAppApiBaseUrl,
  }),
};

await build({
  entryPoints: [path.join(root, "src/bootstrap/runtime.ts")],
  outfile: path.join(root, "src/runtime/appstore-app.js"),
  bundle: true,
  format: "cjs",
  platform: "neutral",
  target: "es2021",
  define,
});

fs.writeFileSync(
  path.join(root, "src/runtime/runtime-env.js"),
  \`module.exports = \${JSON.stringify(
    {
      SDKWORK_PROFILE_ID: env.profileId,
      SDKWORK_APPSTORE_APP_API_BASE_URL: env.appstoreAppApiBaseUrl,
    },
    null,
    2,
  )};\\n\`,
);

fs.writeFileSync(
  path.join(root, "src/runtime/build-manifest.json"),
  \`\${JSON.stringify(
    { profileId, deploymentProfile, environment, runtimeTarget: "mini-program-weixin" },
    null,
    2,
  )}\\n\`,
);

console.log(\`mini program runtime built for \${profileId}\`);
`,
  );

  // -------------------------------------------------------------------------
  // Package family
  // -------------------------------------------------------------------------

  materializeMpCore(write, writeJson);
  materializeMpCommons(write, writeJson);
  materializeMpShell(write, writeJson);
  materializeMpHost(write, writeJson);
  for (const capability of capabilities) {
    materializeMpCapability(write, writeJson, capability);
  }

  report(ROOT);
  return { created: true };
}

// ---------------------------------------------------------------------------
// Core
// ---------------------------------------------------------------------------

function packageSpec(name, capability, layerRole, dirName) {
  return {
    schemaVersion: 1,
    kind: 'sdkwork.component.spec',
    component: {
      name,
      displayName: titleCase(capability),
      version: '0.1.0',
      type: 'typescript-package',
      root: `apps/${ROOT}/packages/${dirName ?? name}`,
      domain: 'appstore',
      capability,
      surface: 'app',
      languages: ['typescript'],
      generated: false,
      manifests: ['package.json'],
    },
    canonicalSpecs: [
      {
        file: 'MINI_PROGRAM_APP_ARCHITECTURE_SPEC.md',
        path: '../../../sdkwork-specs/MINI_PROGRAM_APP_ARCHITECTURE_SPEC.md',
        purpose: 'Mini program application root architecture.',
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
    },
  };
}

function mpPackageJson(name, capability, deps, extraExports) {
  return {
    name,
    private: true,
    version: '0.1.0',
    type: 'module',
    exports: {
      '.': {
        types: './src/index.ts',
        import: './src/index.ts',
        default: './src/index.ts',
      },
      ...extraExports,
    },
    dependencies: deps,
    ...(capability === 'core'
      ? {}
      : {}),
  };
}

function materializeMpCore(write, writeJson) {
  const name = mpPackage('core');
  const dir = `packages/${mpPackageDir('core')}`;
  writeJson(
    `${dir}/package.json`,
    mpPackageJson(name, 'core', {
      [sdkFamily.typescriptPackageName]: 'workspace:*',
      '@sdkwork/sdk-common': 'workspace:*',
    }, {
      './sdk': './src/sdk/index.ts',
      './sdk/appstoreAppSdkClient': './src/sdk/appstoreAppSdkClient.ts',
      './modules': './src/modules/index.ts',
      './host': './src/host/index.ts',
      './session': './src/session/index.ts',
      './session/session': './src/session/session.ts',
      './composition': './src/composition/index.ts',
    }),
  );
  writeJson(`${dir}/specs/component.spec.json`, {
    ...packageSpec(name, 'core', 'frontend-core', mpPackageDir('core')),
    contracts: {
      publicExports: ['.'],
      sdkDependencies: [
        {
          workspace: sdkFamily.workspace,
          surface: 'app-api',
          credentialMode: 'authenticated-app-api',
          apiAuthority: sdkFamily.apiAuthority,
          apiPrefix: sdkFamily.apiPrefix,
        },
      ],
      sdkClients: [sdkFamily.typescriptPackageName],
      permissionComposition: permissionComposition(),
    },
  });

  write(`${dir}/src/index.ts`, `export * from "./sdk/index.js";
export * from "./session/index.js";
export * from "./composition/index.js";
`);
  write(`${dir}/src/sdk/index.ts`, `export * from "./appstoreAppSdkClient.js";
`);
  write(
    `${dir}/src/sdk/appstoreAppSdkClient.ts`,
    `import {
  createClient,
  type SdkworkAppClient as GeneratedAppstoreAppClient,
  type SdkworkAppConfig,
} from "${sdkFamily.typescriptPackageName}";

import {
  readAppSdkSessionTokens,
  resolveAppSdkAccessToken,
  resolveAppSdkAuthToken,
  type AppstoreMpSession,
} from "../session/session.js";

export type AppstoreAppClient = GeneratedAppstoreAppClient;
export type AppstoreAppClientConfig = SdkworkAppConfig;

let client: AppstoreAppClient | null = null;
let configuredBaseUrl: string | null = null;
let bootstrapAccessToken: string | null = null;

/** Normalize and pin the App Store app-api base URL. */
export function configureAppstoreAppSdkBaseUrl(baseUrl: string): void {
  const normalized = baseUrl.trim().replace(/\\/+$/u, "");
  if (normalized.length === 0) {
    throw new Error("SDKWORK_APPSTORE_APP_API_BASE_URL is required");
  }
  if (!normalized.endsWith("${appApiSuffix}")) {
    throw new Error(
      \`app-api base URL must end with ${appApiSuffix}: \${normalized}\`,
    );
  }
  configuredBaseUrl = normalized;
}

export function configureAppstoreAppSdkBootstrapAccessToken(
  accessToken?: string,
): void {
  const normalized = accessToken?.trim();
  bootstrapAccessToken = normalized && normalized.length > 0 ? normalized : null;
}

export function resolveAppstoreAppSdkBaseUrl(): string {
  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }
  throw new Error(
    "SDKWORK_APPSTORE_APP_API_BASE_URL must be configured before SDK bootstrap",
  );
}

export function createAppstoreAppSdkClientConfig(
  session?: AppstoreMpSession | null,
): AppstoreAppClientConfig {
  const current = session ?? readAppSdkSessionTokens();
  return {
    baseUrl: resolveAppstoreAppSdkBaseUrl(),
    accessToken:
      resolveAppSdkAccessToken(current) ?? bootstrapAccessToken ?? undefined,
    authToken: resolveAppSdkAuthToken(current),
    platform: "mini-program",
  };
}

export function createAppstoreMpAppSdkClient(config: {
  baseUrl: string;
  accessToken?: string;
  authToken?: string;
  platform?: string;
}): AppstoreAppClient {
  configureAppstoreAppSdkBaseUrl(config.baseUrl);
  client = createClient({
    baseUrl: resolveAppstoreAppSdkBaseUrl(),
    accessToken: config.accessToken,
    authToken: config.authToken,
    platform: config.platform ?? "mini-program",
  });
  return client;
}

export function getAppstoreAppSdkClient(): AppstoreAppClient {
  return client ?? (() => {
    throw new Error("App Store app SDK client is not initialized");
  })();
}

export function resetAppstoreAppSdkClient(): void {
  client = null;
  bootstrapAccessToken = null;
}
`,
  );
  write(`${dir}/src/session/index.ts`, `export * from "./session.js";
`);
  write(
    `${dir}/src/session/session.ts`,
    `/** Session token projection consumed by the generated SDK client. */
export interface AppstoreMpSession {
  accessToken?: string;
  authToken?: string;
  refreshToken?: string;
}

let session: AppstoreMpSession = {};

export function readAppSdkSessionTokens(): AppstoreMpSession {
  return session;
}

export function resolveAppSdkAccessToken(
  candidate: AppstoreMpSession | null,
): string | undefined {
  const value = candidate?.accessToken?.trim();
  return value && value.length > 0 ? value : undefined;
}

export function resolveAppSdkAuthToken(
  candidate: AppstoreMpSession | null,
): string | undefined {
  const value = candidate?.authToken?.trim();
  return value && value.length > 0 ? value : undefined;
}

export function setAppSdkSession(next: AppstoreMpSession): void {
  session = next;
}

export function clearAppSdkSession(): void {
  session = {};
}
`,
  );
  write(`${dir}/src/modules/index.ts`, `export {};\n`);
  write(`${dir}/src/host/index.ts`, `export {};\n`);
  write(`${dir}/src/composition/index.ts`, `export * from "./dependency-manifest.js";
export * from "./sdk-inventory.js";
export * from "./module-registry.js";
export * from "./host-registry.js";
export * from "./route-table.js";
`);
  write(
    `${dir}/src/composition/dependency-manifest.ts`,
    `export const sdkworkComponentSpecPath = "../../../specs/component.spec.json" as const;
`,
  );
  write(
    `${dir}/src/composition/sdk-inventory.ts`,
    `export const sdkInventory = ["${sdkFamily.typescriptPackageName}"] as const;

export function listSdkworkCoreSdkInventory() {
  return sdkInventory;
}
`,
  );
  write(
    `${dir}/src/composition/module-registry.ts`,
    `/**
 * Module registry: the moduleId set this client root participates in.
 *
 * Authority: \`../specs/iam.module.manifest.json\` at the repository root.
 */
export const moduleRegistry = ["appstore"] as const;
`,
  );
  write(
    `${dir}/src/composition/host-registry.ts`,
    `/** Registered platform host adapter names for the mini program runtime. */
export const hostRegistry = ["storage", "haptic", "share"] as const;
`,
  );
  write(
    `${dir}/src/composition/route-table.ts`,
    `/**
 * Canonical App Store route identity table.
 *
 * Authority: \`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md\` section 7 — the id
 * format is \`<surface>.<domain>.<capability>.<screen>\` and the same route id
 * names the same workflow in every client architecture. Cross-checked against
 * the PC root router \`AppstorePcRoutes\`
 * (\`apps/sdkwork-appstore-pc/packages/sdkwork-appstore-pc-host/src/index.tsx\`).
 */
${sdkworkUiRouteContributionTs}
export const APPSTORE_MP_ROUTE_TABLE: readonly SdkworkUiRouteContribution[] = [
${tsRouteTableLiteral()}
] as const;

export function listAppstoreRouteIdentities(): readonly SdkworkUiRouteContribution[] {
  return APPSTORE_MP_ROUTE_TABLE;
}

/** Path lookup by canonical route id. */
export function appstoreRoutePath(routeId: string): string {
  const entry = APPSTORE_MP_ROUTE_TABLE.find((item) => item.id === routeId);
  if (!entry) {
    throw new Error(\`unknown App Store route id: \${routeId}\`);
  }
  return entry.path;
}
`,
  );
}

// ---------------------------------------------------------------------------
// Commons / shell / host
// ---------------------------------------------------------------------------

function materializeMpCommons(write, writeJson) {
  const name = mpPackage('commons');
  const dir = `packages/${mpPackageDir('commons')}`;
  writeJson(
    `${dir}/package.json`,
    mpPackageJson(name, 'commons', {}, undefined),
  );
  writeJson(`${dir}/specs/component.spec.json`, {
    ...packageSpec(name, 'commons', 'frontend-commons', mpPackageDir('commons')),
    contracts: { publicExports: ['.'] },
  });
  write(`${dir}/src/index.ts`, `export * from "./theme/designTokens.js";
export * from "./components/screenStates.js";
export * from "./i18n/locale.js";
`);
  write(
    `${dir}/src/theme/designTokens.ts`,
    `/** Domain-neutral design tokens shared by App Store mini program screens. */
export const appstoreMpDesignTokens = {
  color: {
    background: "#f8fafc",
    surface: "#ffffff",
    border: "#e2e8f0",
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    accent: "#0f766e",
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { sm: 4, md: 8, lg: 16, pill: 999 },
  typography: { title: 20, body: 14, caption: 12 },
} as const;
`,
  );
  write(
    `${dir}/src/components/screenStates.ts`,
    `export interface ScreenState {
  readonly kind: "loading" | "empty" | "error" | "ready";
  readonly message: string;
}

export function loadingState(): ScreenState {
  return { kind: "loading", message: "Loading" };
}

export function emptyState(message: string): ScreenState {
  return { kind: "empty", message };
}

export function errorState(message: string): ScreenState {
  return { kind: "error", message };
}

export function readyState(): ScreenState {
  return { kind: "ready", message: "" };
}
`,
  );
  write(
    `${dir}/src/i18n/locale.ts`,
    `/**
 * Locale resolution helpers.
 *
 * This is a thin boundary module: it holds no authored copy. Locale fragments
 * live under \`src/i18n/<locale>/appstore/<capability>/\` per
 * \`I18N_SPEC.md\` section 6.1.
 */
export const appstoreSupportedLocales = ["en-US", "zh-CN"] as const;

export type AppstoreLocale = (typeof appstoreSupportedLocales)[number];

export const appstoreDefaultLocale: AppstoreLocale = "en-US";

export function normalizeAppstoreLocale(candidate?: string): AppstoreLocale {
  const value = candidate?.trim();
  if (!value) {
    return appstoreDefaultLocale;
  }
  return (appstoreSupportedLocales as readonly string[]).includes(value)
    ? (value as AppstoreLocale)
    : appstoreDefaultLocale;
}

export function resolveAppstoreLocaleFragmentPath(
  locale: AppstoreLocale,
  capability: string,
  fragment: string,
): string {
  return \`i18n/\${locale}/appstore/\${capability}/\${fragment}\`;
}
`,
  );
}

function materializeMpShell(write, writeJson) {
  const name = mpPackage('shell');
  const dir = `packages/${mpPackageDir('shell')}`;
  writeJson(
    `${dir}/package.json`,
    mpPackageJson(name, 'shell', {
      [mpPackage('core')]: 'workspace:*',
    }, undefined),
  );
  writeJson(`${dir}/specs/component.spec.json`, {
    ...packageSpec(name, 'shell', 'frontend-shell', mpPackageDir('shell')),
    contracts: { publicExports: ['.'] },
  });
  write(`${dir}/src/index.ts`, `export * from "./auth/authGate.js";
export * from "./navigation/routePlacement.js";
`);
  write(
    `${dir}/src/auth/authGate.ts`,
    `/**
 * Mini program auth gate.
 *
 * Authority: \`IAM_LOGIN_INTEGRATION_SPEC.md\`. The gate routes unauthenticated
 * navigation to the sign-in page and never constructs its own SDK client.
 */
export interface AuthGateResult {
  readonly allowed: boolean;
  readonly redirectTo?: string;
}

export function evaluateAuthGate(options: {
  path: string;
  authenticated: boolean;
  protectedPrefixes: readonly string[];
}): AuthGateResult {
  const isProtected = options.protectedPrefixes.some((prefix) =>
    options.path.startsWith(prefix),
  );
  if (!isProtected || options.authenticated) {
    return { allowed: true };
  }
  return { allowed: false, redirectTo: "/pages/shell/index" };
}
`,
  );
  write(
    `${dir}/src/navigation/routePlacement.ts`,
    `/**
 * Route placement: maps canonical route ids onto mini program pages.
 *
 * Route ids are the cross-client alignment contract; the WeChat page path is a
 * platform detail and may differ per architecture.
 */
export interface RoutePlacement {
  readonly routeId: string;
  readonly page: string;
  readonly subpackage?: string;
}

export const appstoreMpRoutePlacement: readonly RoutePlacement[] = [
  { routeId: "discover", page: "pages/home/index" },
  { routeId: "apps", page: "pages/shell/index", subpackage: "catalog" },
  { routeId: "search", page: "pages/shell/index", subpackage: "search" },
  { routeId: "app-detail", page: "pages/shell/index", subpackage: "listing" },
  { routeId: "library", page: "pages/shell/index", subpackage: "library" },
  { routeId: "user-store", page: "pages/shell/index", subpackage: "user-store" },
  { routeId: "publisher-overview", page: "pages/shell/index", subpackage: "publisher" },
] as const;

export function resolveRoutePlacement(
  routeId: string,
): RoutePlacement | undefined {
  return appstoreMpRoutePlacement.find((entry) => entry.routeId === routeId);
}
`,
  );
}

function materializeMpHost(write, writeJson) {
  const name = mpPackage('host');
  const dir = `packages/${mpPackageDir('host')}`;
  writeJson(
    `${dir}/package.json`,
    mpPackageJson(name, 'host', {}, undefined),
  );
  writeJson(`${dir}/specs/component.spec.json`, {
    ...packageSpec(name, 'host', 'frontend-host', mpPackageDir('host')),
    contracts: { publicExports: ['.'] },
  });
  write(
    `${dir}/src/index.ts`,
    `/**
 * Mini program host adapters.
 *
 * Host-only capabilities are registered here and exposed through typed
 * contracts so capability packages stay platform-agnostic
 * (\`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md\` section 1).
 */

export interface StorageHostAdapter {
  read(key: string): string | null;
  write(key: string, value: string): void;
  remove(key: string): void;
}

export interface HapticHostAdapter {
  light(): void;
  medium(): void;
  heavy(): void;
}

const registered = new Set<string>();

export function registerMiniProgramHostAdapters(): readonly string[] {
  registered.add("storage");
  registered.add("haptic");
  registered.add("share");
  return listMiniProgramHostAdapters();
}

export function listMiniProgramHostAdapters(): readonly string[] {
  return [...registered].sort();
}

export function isMiniProgramHostAdapterAvailable(name: string): boolean {
  return registered.has(name);
}
`,
  );
}

// ---------------------------------------------------------------------------
// Capability packages
// ---------------------------------------------------------------------------

function materializeMpCapability(write, writeJson, capability) {
  const name = mpPackage(capability);
  const dir = `packages/${mpPackageDir(capability)}`;
  const pascal = pascalCase(capability);
  const camel = camelCase(capability);
  const routes = routeTable.filter((entry) => entry.capability === capability);
  const deps = {
    [mpPackage('core')]: 'workspace:*',
    [mpPackage('commons')]: 'workspace:*',
  };

  writeJson(`${dir}/package.json`, mpPackageJson(name, capability, deps, undefined));
  writeJson(`${dir}/specs/component.spec.json`, {
    ...packageSpec(name, capability, 'frontend-feature', mpPackageDir(capability)),
    contracts: { publicExports: ['.'] },
  });
  write(`${dir}/README.md`, `# ${name}

${titleCase(capability)} capability package for the SDKWork App Store mini program.

Owns route identities: ${routes.map((entry) => `\`${entry.id}\` (\`${entry.path}\`)`).join(', ')}.

Receives the generated app SDK client by injection; never constructs one.
`);
  write(`${dir}/src/index.ts`, `export * from "./routes/routeContributions.js";
export * from "./services/${camel}Service.js";
export * from "./state/${camel}State.js";
export * from "./types/${camel}Models.js";
`);
  write(
    `${dir}/src/types/${camel}Models.ts`,
    `/** Domain models owned by the ${capability} capability. */
export interface ${pascal}RouteEntry {
  readonly routeId: string;
  readonly path: string;
}

export interface ${pascal}PageResult<TItem> {
  readonly items: readonly TItem[];
  readonly nextCursor?: string;
}
`,
  );
  write(
    `${dir}/src/services/${camel}Service.ts`,
    `import type { AppstoreAppClient } from "${mpPackage('core')}";

import type { ${pascal}PageResult } from "../types/${camel}Models.js";

/**
 * ${titleCase(capability)} service.
 *
 * The generated App Store app SDK client is injected by the root bootstrap
 * (\`APP_SDK_INTEGRATION_SPEC.md\`); this package never constructs a client and
 * never issues raw HTTP.
 */
export interface ${pascal}Service {
  readonly capability: "${capability}";
}

export function create${pascal}Service(client: AppstoreAppClient): ${pascal}Service {
  void client;
  return { capability: "${capability}" };
}

export function empty${pascal}Result(): ${pascal}PageResult<never> {
  return { items: [] };
}
`,
  );
  write(
    `${dir}/src/state/${camel}State.ts`,
    `import type { ${pascal}PageResult } from "../types/${camel}Models.js";

export interface ${pascal}State {
  readonly status: "idle" | "loading" | "ready" | "error";
  readonly lastResult?: ${pascal}PageResult<unknown>;
  readonly error?: string;
}

export function initial${pascal}State(): ${pascal}State {
  return { status: "idle" };
}

export function reduce${pascal}State(
  state: ${pascal}State,
  event:
    | { type: "load" }
    | { type: "loaded"; result: ${pascal}PageResult<unknown> }
    | { type: "failed"; error: string },
): ${pascal}State {
  switch (event.type) {
    case "load":
      return { ...state, status: "loading", error: undefined };
    case "loaded":
      return { status: "ready", lastResult: event.result };
    case "failed":
      return { ...state, status: "error", error: event.error };
  }
}
`,
  );
  write(
    `${dir}/src/routes/routeContributions.ts`,
    `import type { SdkworkUiRouteContribution } from "@sdkwork/appstore-mp-core";

/**
 * Route contributions for the ${capability} capability.
 *
 * Route ids are shared with the PC, H5, Flutter, and HarmonyOS roots
 * (\`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md\` section 7). The mini program
 * resolves each id through its own \`pages\` or \`subpackages\` map.
 */
export const ${camel}RouteContributions: readonly SdkworkUiRouteContribution[] = [
${routes.map((entry) => `${routeContributionLiteral(entry)}`).join(',\n')}
] as const;
`,
  );
  for (const locale of ['en-US', 'zh-CN']) {
    const labels =
      locale === 'zh-CN'
        ? {
            catalog: { title: '应用商店', sections: '板块', featured: '精选' },
            search: { title: '搜索', placeholder: '搜索应用与能力', results: '结果' },
            listing: { title: '应用详情', install: '安装', wishlist: '收藏' },
            library: { title: '我的库', updates: '更新', wishlist: '心愿单' },
            'ai-hub': { title: 'AI 实验室', experts: '专家', plugins: '插件' },
            'user-store': { title: '个人商店', share: '分享', public: '公开' },
            publisher: { title: '发布者控制台', apps: '应用', settings: '设置' },
          }[capability]
        : {
            catalog: { title: 'App Store', sections: 'Sections', featured: 'Featured' },
            search: { title: 'Search', placeholder: 'Search apps and capabilities', results: 'Results' },
            listing: { title: 'App detail', install: 'Install', wishlist: 'Save' },
            library: { title: 'My library', updates: 'Updates', wishlist: 'Wishlist' },
            'ai-hub': { title: 'AI Lab', experts: 'Experts', plugins: 'Plugins' },
            'user-store': { title: 'Personal store', share: 'Share', public: 'Public' },
            publisher: { title: 'Publisher console', apps: 'Apps', settings: 'Settings' },
          }[capability];
    write(
      `${dir}/src/i18n/${locale}/appstore/${capability}/list.ts`,
      `/** ${locale} copy fragment for the ${capability} capability. */
export const ${camel}Messages = ${JSON.stringify(labels, null, 2)} as const;

export type ${pascal}Messages = typeof ${camel}Messages;
`,
    );
  }
  write(`${dir}/src/i18n/index.ts`, `export {};
`);
  void environments;
}
