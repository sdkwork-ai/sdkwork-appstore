#!/usr/bin/env node

// Shared document, manifest, and source-config generators for the SDKWork App
// Store client application roots.
//
// `AGENTS.md` section set and spec references are fixed by
// `sdkwork-specs/tools/check-agent-workflow-standard.mjs`
// (REQUIRED_AGENT_SECTIONS + SPEC_REFERENCES). Relative depth matches the
// sibling roots under `apps/`: specs and the repository dictionary resolve
// from `apps/<root>/`, so specs are three levels up.

import {
  appId,
  applicationCode,
  appApiSuffix,
  bundleName,
  capabilities,
  cloudApiBaseUrls,
  deploymentProfiles,
  environmentAlias,
  environmentOrigins,
  environments,
  profileIds,
  publicHttpUrl,
  routeTable,
  runtimeEnvElementId,
  sdkFamily,
  titleCase,
} from './client-app-scaffold-lib.mjs';

const SPECS = '../../../sdkwork-specs';

export const platformProfiles = {
  'flutter-mobile': {
    applicationKeySuffix: 'flutter-mobile',
    displayName: 'SDKWork App Store Mobile',
    description:
      'SDKWork App Store Flutter mobile client for discovering, installing, publishing, and operating marketplace applications and AI capabilities.',
    appType: 'APP_FLUTTER',
    runtimeFamily: 'mobile',
    framework: 'flutter',
    runtimes: ['APP', 'APP_ANDROID', 'APP_IOS'],
    defaultPlatform: 'APP_ANDROID',
    deliveryModes: ['DIRECT_DOWNLOAD'],
    publishPlatforms: ['APP', 'APP_ANDROID', 'APP_IOS'],
    versionSource: 'pubspec.yaml',
    identifiers: { packageName: bundleName, bundleId: bundleName },
    rootArchSpec: 'FLUTTER_APP_MOBILE_ARCHITECTURE_SPEC.md',
    uiSpec: 'APP_FLUTTER_UI_SPEC.md',
    runtimeTarget: 'flutter-android',
    packageSegment: 'flutter_mobile',
    componentType: 'flutter-mobile-app-root',
    languages: ['dart'],
    manifests: ['pubspec.yaml', 'sdkwork.app.config.json'],
    packageManager: 'flutter',
    etcFormat: 'dart-define-json',
    etcOutputPattern: '../env/sdkwork.{deploymentProfile}.{environment}.json',
    configRoot: 'env',
    // `contracts.publicExports` / `contracts.runtimeEntrypoints` follow the
    // Flutter app-root convention established by `sdkwork-im-flutter-mobile`
    // and `sdkwork-knowledgebase-flutter-mobile`.
    publicExports: ['lib/main.dart'],
    runtimeEntrypoints: ['pubspec.yaml#environment.sdk'],
  },
  'mini-program': {
    applicationKeySuffix: 'mini-program',
    displayName: 'SDKWork App Store Mini Program',
    description:
      'SDKWork App Store WeChat mini program client for discovering, installing, and operating marketplace applications.',
    appType: 'APP_UNIAPP',
    runtimeFamily: 'mini-program',
    framework: 'mp-weixin',
    runtimes: ['MP_WEIXIN'],
    defaultPlatform: 'MP_WEIXIN',
    deliveryModes: ['WEB_URL'],
    publishPlatforms: ['MP_WEIXIN'],
    versionSource: 'package.json',
    identifiers: { packageName: null, bundleId: null },
    rootArchSpec: 'MINI_PROGRAM_APP_ARCHITECTURE_SPEC.md',
    uiSpec: 'APP_MINI_PROGRAM_UI_SPEC.md',
    runtimeTarget: 'mini-program-weixin',
    packageSegment: 'mp',
    componentType: 'mini-program-app-root',
    languages: ['typescript'],
    manifests: ['package.json', 'sdkwork.app.config.json', 'project.config.json'],
    packageManager: 'pnpm',
    etcFormat: 'mini-program-json',
    etcOutputPattern:
      '../config/mini-program/runtime-env.{deploymentProfile}.{environment}.json',
    configRoot: 'config/mini-program',
    // Mini-program roots keep a `package.json`, so the build script is a real
    // mountable runtime entrypoint (`sdkwork-knowledgebase-mini-program`,
    // `sdkwork-mail-mini-program`).
    publicExports: ['src/app.js'],
    runtimeEntrypoints: ['package.json#scripts.build'],
  },
  'harmony-mobile': {
    applicationKeySuffix: 'harmony-mobile',
    displayName: 'SDKWork App Store HarmonyOS Mobile',
    description:
      'SDKWork App Store native HarmonyOS mobile client for discovering, installing, and operating marketplace applications.',
    appType: 'APP_HARMONY',
    runtimeFamily: 'mobile',
    framework: 'arkts',
    runtimes: ['APP_HARMONY', 'APP'],
    defaultPlatform: 'APP_HARMONY',
    deliveryModes: ['DIRECT_DOWNLOAD'],
    publishPlatforms: ['APP_HARMONY', 'APP'],
    versionSource: 'oh-package.json5',
    identifiers: { packageName: bundleName, bundleId: bundleName },
    rootArchSpec: 'HARMONY_APP_MOBILE_ARCHITECTURE_SPEC.md',
    uiSpec: 'APP_HARMONY_NATIVE_UI_SPEC.md',
    runtimeTarget: 'harmony-native',
    packageSegment: 'harmony-mobile',
    componentType: 'harmony-mobile-app-root',
    languages: ['arkts'],
    manifests: ['oh-package.json5', 'sdkwork.app.config.json'],
    packageManager: 'ohpm',
    etcFormat: 'har-json',
    etcOutputPattern:
      '../config/app/runtime-env.{deploymentProfile}.{environment}.json',
    configRoot: 'config/app',
    // Harmony native roots ship `oh-package.json5` + hvigor, not a `package.json`,
    // so the ability/slice entrypoint is the mountable runtime entrypoint
    // (`sdkwork-agents-harmony-mobile`). Do not point `runtimeEntrypoints` at
    // `package.json#…` here: that reference would dangle in this root.
    publicExports: ['entry/src/main/ets/entryability/EntryAbility.ets'],
    runtimeEntrypoints: ['entry/src/main/ets/entryability/EntryAbility.ets'],
  },
};

export const appRootName = (suffix) => `sdkwork-${applicationCode}-${suffix}`;
export const applicationKey = (suffix) => `${applicationCode}-${suffix}`;

/** Application declaration (`sdkwork.app.config.json`) for one client root. */
export function appManifest(suffix) {
  const profile = platformProfiles[suffix];
  const root = `apps/${appRootName(suffix)}`;
  return {
    schemaVersion: 3,
    kind: 'sdkwork.app',
    app: {
      key: applicationKey(suffix),
      name: profile.displayName,
      displayName: profile.displayName,
      description: profile.description,
      vendor: 'SDKWork',
      officialWebsiteUrl: `https://sdkwork.com/apps/${applicationKey(suffix)}`,
      supportUrl: 'https://sdkwork.com/support',
      privacyPolicyUrl: 'https://sdkwork.com/privacy',
      termsOfServiceUrl: 'https://sdkwork.com/terms',
      appType: profile.appType,
      versionSource: profile.versionSource,
      identifiers: {
        ...profile.identifiers,
        desktopAppId: null,
        containerImage: `registry.sdkwork.com/apps/${applicationKey(suffix)}`,
      },
    },
    backend: {
      profileKey: 'backend-root-admin',
      ownerMode: 'tenant',
      grantMode: 'current',
      platform: profile.defaultPlatform,
      appId,
      organizationId: '0',
      tenantId: '100001',
      accessTokenPermissionScope: ['iam:self'],
    },
    runtime: {
      family: profile.runtimeFamily,
      framework: profile.framework,
      runtimes: profile.runtimes,
      deliveryModes: profile.deliveryModes,
      defaultPlatform: profile.defaultPlatform,
      defaultArchitecture: 'universal',
      supportedDeploymentProfiles: deploymentProfiles,
      defaultDeploymentProfile: 'standalone',
    },
    media: {
      icons: {
        primary: {
          id: `${applicationKey(suffix)}-primary-icon`,
          type: 'ICON',
          purpose: 'PRIMARY',
          platform: 'APP',
          locale: 'en-US',
          width: 1024,
          height: 1024,
          format: 'PNG',
          enabled: true,
          url: 'https://cdn.sdkwork.com/apps/sdkwork-appstore/assets/icon-1024.png',
          metadata: { generatedPlaceholder: true },
        },
        platform: [],
        metadata: { generatedPlaceholder: true },
      },
      screenshots: [],
      previews: [],
      metadata: { assetVersion: '0.1.0', defaultLocale: 'en-US' },
    },
    publish: {
      status: 'DRAFT',
      installSkill: false,
      platforms: profile.publishPlatforms,
      installPlatforms: profile.publishPlatforms,
      config: {
        workspaceRoot: root,
        framework: profile.framework,
        managedBy: `${appId}-client-scaffold`,
      },
    },
    artifacts: {
      installConfig: {
        packages: [],
        metadata: {
          workspaceRoot: root,
          framework: profile.framework,
          packageManager: profile.packageManager,
        },
      },
    },
    release: {
      currentVersion: '0.1.0',
      defaultChannel: 'BETA',
      latest: { BETA: '0.1.0' },
      notes: [
        { version: '0.1.0', channel: 'BETA', current: true, packageIds: [] },
      ],
    },
    security: {
      checksumRequired: true,
      signatureRequired: false,
      sbomRequired: true,
    },
    devApp: { build: { targets: [] }, sourceRoot: root },
    metadata: {
      domain: 'appstore',
      capability: 'store',
      standardOwner: appId,
      deploymentConfig: 'etc/sdkwork.deployment.config.json',
      releaseAuthority: '../../sdkwork.workflow.json',
    },
  };
}

/** Application-root `specs/component.spec.json`. */
export function rootComponentSpec(suffix) {
  const profile = platformProfiles[suffix];
  return {
    schemaVersion: 1,
    kind: 'sdkwork.component.spec',
    component: {
      name: appRootName(suffix),
      displayName: profile.displayName,
      version: '0.1.0',
      type: profile.componentType,
      root: `apps/${appRootName(suffix)}`,
      domain: 'appstore',
      capability: 'store',
      surface: 'app',
      languages: profile.languages,
      generated: false,
      manifests: profile.manifests,
    },
    canonicalSpecs: [
      {
        file: profile.rootArchSpec,
        path: `${SPECS}/${profile.rootArchSpec}`,
        purpose: 'Client application root architecture.',
      },
      {
        file: 'APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md',
        path: `${SPECS}/APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md`,
        purpose: 'Cross-client package taxonomy, route identity, and dependency direction.',
      },
      {
        file: 'APP_COMPOSITION_SPEC.md',
        path: `${SPECS}/APP_COMPOSITION_SPEC.md`,
        purpose: 'Native-authority application composition.',
      },
      {
        file: 'APP_SDK_INTEGRATION_SPEC.md',
        path: `${SPECS}/APP_SDK_INTEGRATION_SPEC.md`,
        purpose: 'Generated app SDK integration.',
      },
      {
        file: 'CODE_STYLE_SPEC.md',
        path: `${SPECS}/CODE_STYLE_SPEC.md`,
        purpose: 'Authored source structure and generated code boundaries.',
      },
      {
        file: 'NAMING_SPEC.md',
        path: `${SPECS}/NAMING_SPEC.md`,
        purpose: 'Canonical SDKWork naming rules.',
      },
    ],
    contracts: {
      // An app root is the surface shell (`FRONTEND_SPEC.md` section "App
      // shell/root" -> `frontend-shell`), which is what the PC and H5 roots
      // declare. It is not a host adapter.
      layerRole: 'frontend-shell',
      publicExports: profile.publicExports,
      // `APPLICATION_LAYERED_ARCHITECTURE_SPEC.md` section 154: a new
      // composable module MUST declare `providedPorts` / `requiredPorts`, using
      // `[]` when it offers or needs none.
      providedPorts: [],
      requiredPorts: [],
      runtimeEntrypoints: profile.runtimeEntrypoints,
      // `COMPONENT_SPEC.md` section "contracts.sdkClients": the key lists
      // generated SDK client classes only when the component owns a generated
      // SDK family. An app root consumes an SDK family it does not own, so the
      // value stays empty; ownership lives in the `sdkwork-*-app-sdk` repo.
      sdkClients: [],
      // `APP_COMPOSITION_SPEC.md`: this array must carry an explicit `surface`
      // and `credentialMode` per dependency. `apiAuthority`/`apiPrefix` are
      // derived by `resolve-composition.mjs`, so they are not restated here.
      sdkDependencies: [
        {
          workspace: sdkFamily.workspace,
          surface: 'app-api',
          credentialMode: 'authenticated-app-api',
        },
      ],
      // Defaults: this component re-exports no dependency-owned API capability
      // and mounts no dependency-owned HTTP surface of its own.
      dependencyApiExports: [],
      dependencyApiSurfaces: [],
      // No route identity table is emitted here. `APP_CLIENT_ARCHITECTURE_ALIGNMENT_
      // SPEC.md` section 7 owns the id format, and the package taxonomy table in
      // that same standard assigns the route registry to the `core` package, so
      // the registry lives in the root's core package source. A second copy under
      // `contracts` would be an ungated inventory with no key defined in
      // `COMPONENT_SPEC.md`.
    },
    verification: {
      commands: ['pnpm --filter ' + applicationKey(suffix) + ' verify'],
    },
  };
}

/** `etc/sdkwork.deployment.config.json` for one client root. */
export function deploymentConfig(suffix) {
  const profile = platformProfiles[suffix];
  return {
    schemaVersion: 1,
    kind: 'sdkwork.component-deployment',
    application: applicationKey(suffix),
    parentDeploymentConfig: '../../../etc/sdkwork.deployment.config.json',
    parentTopologySpec: '../../../specs/topology.spec.json',
    materialization: {
      authority: '../../../etc/sdkwork.deployment.config.json',
      command: 'pnpm workflow:materialize-client-env',
      format: profile.etcFormat,
      outputPattern: profile.etcOutputPattern,
      profiles: profileIds,
    },
    runtimeTarget: profile.runtimeTarget,
  };
}

export function etcReadme(suffix) {
  const profile = platformProfiles[suffix];
  return `# etc/

Source configuration for \`${appRootName(suffix)}\`.

## Discovery

\`sdkwork.deployment.config.json\` is the deployment profile index for this
deployable root. It declares the parent deployment authority
(\`../../../etc/sdkwork.deployment.config.json\`), the parent topology contract
(\`../../../specs/topology.spec.json\`), and how non-secret runtime config
materializes.

## Materialization

\`\`\`bash
pnpm workflow:materialize-client-env
\`\`\`

Format: \`${profile.etcFormat}\`. Output: \`${profile.etcOutputPattern}\` for each
of the ${profileIds.length} supported profiles
(${profileIds.join(', ')}).

## Rules

- Commit non-secret templates and environment descriptors only.
- Never commit access tokens, refresh tokens, signing material, or app secrets.
- Concrete environment, runtime, base URL, and deployment values belong here,
  not in \`sdkwork.app.config.json\`.
`;
}

/** Non-secret runtime config payload for one profile. */
export function runtimeEnvPayload(suffix, profileId) {
  const profile = platformProfiles[suffix];
  const [deploymentProfile, environment] = profileId.split('.');
  const origin = environmentOrigins[environment];
  return {
    environment,
    deploymentProfile,
    profileId,
    runtimeTarget: profile.runtimeTarget,
    applicationOrigin: origin,
    appstoreAppApiBaseUrl:
      deploymentProfile === 'cloud'
        ? `${cloudApiBaseUrls[environment]}${appApiSuffix}`
        : `${publicHttpUrl}${appApiSuffix}`,
    sdkworkEnvironmentAlias: environmentAlias[environment],
    sdkDependencies: [sdkFamily.workspace],
  };
}

/** Application-root AGENTS.md (10 required sections + 3 resolvable refs). */
export function agentsMd(suffix) {
  const profile = platformProfiles[suffix];
  const root = appRootName(suffix);
  const isDart = suffix === 'flutter-mobile';
  const isMp = suffix === 'mini-program';

  const dictionary = isDart
    ? `- \`lib/\` is the Dart application entry: bootstrap, providers, route assembly, shell registration, AuthGate wiring, environment selection, SDK client construction, IAM runtime wiring, and host adapter registration.
- \`packages/\` owns Dart core, commons, shell, host, and capability packages named \`sdkwork_${applicationCode}_flutter_mobile_*\`.
- \`pubspec.yaml\`, \`config/\`, \`env/\`, and \`etc/\` are deployable-root build and runtime configuration.`
    : isMp
      ? `- \`src/\` is the mini program platform surface: \`app.js\`, \`app.json\`, page subpackages, and the runtime bundle entry.
- \`packages/\` owns TypeScript core, commons, shell, host, and capability packages named \`@sdkwork/${applicationCode}-mp-*\`.
- \`project.config.json\`, \`tsconfig.json\`, \`config/\`, and \`etc/\` are deployable-root build and runtime configuration. SDKWork source packages stay separate from platform pages and subpackages.`
      : `- \`entry/\` is the installable HarmonyOS entry/composition module: the entry ability, bootstrap, provider assembly, route registry, SDK client construction, IAM runtime wiring, and host adapter registration.
- \`packages/\` owns ArkTS/HAR core, commons, shell, host, and capability packages named \`@sdkwork/${root}-*\`.
- \`AppScope/\`, \`oh-package.json5\`, \`build-profile.json5\`, \`hvigor/\`, \`config/\`, and \`etc/\` are deployable-root configuration and build metadata.`;

  const buildSection = isDart
    ? `Flutter builds require the Flutter SDK and Dart toolchain, which are not part of the repository pnpm workspace.

\`\`\`bash
flutter pub get
flutter analyze
flutter test
\`\`\`

Static repository verification (runs without the Flutter toolchain):

\`\`\`bash
node ${SPECS}/tools/check-apps-directory-index.mjs --root ../..
node ${SPECS}/tools/check-frontend-composition.mjs --root ../..
node ${SPECS}/tools/check-component-port-bindings.mjs --root ../..
\`\`\``
    : isMp
      ? `\`\`\`powershell
pnpm typecheck
pnpm run build:mini-program
\`\`\`

Static repository verification:

\`\`\`bash
node ${SPECS}/tools/check-apps-directory-index.mjs --root ../..
node ${SPECS}/tools/check-frontend-composition.mjs --root ../..
node ${SPECS}/tools/check-component-port-bindings.mjs --root ../..
node ${SPECS}/tools/check-i18n-standard.mjs --root .
\`\`\``
      : `HarmonyOS builds require DevEco Studio or a compatible HarmonyOS SDK, \`hvigor\`, and \`ohpm\` plus a documented signing profile; these toolchains are not part of the repository workspace.

\`\`\`powershell
ohpm install
hvigor clean
hvigor assembleHap
\`\`\`

Static repository verification (runs without the HarmonyOS toolchain):

\`\`\`bash
node ${SPECS}/tools/check-apps-directory-index.mjs --root ../..
node ${SPECS}/tools/check-frontend-composition.mjs --root ../..
node ${SPECS}/tools/check-component-port-bindings.mjs --root ../..
\`\`\``;

  const sdkRule = isMp
    ? `Consume \`/app/v3/api\` exclusively through the generated \`${sdkFamily.typescriptPackageName}\` client composed in \`core\` and the root bootstrap. Do not introduce raw HTTP, manual authentication headers, generated transport imports, local SDK proxies, DTO forks, or a second appbase IAM runtime. Feature packages must not construct SDK clients or read runtime environment values directly.`
    : isDart
      ? `Consume \`/app/v3/api\` exclusively through the generated \`${sdkFamily.dartPackageName}\` client composed in \`core\` and the root bootstrap, once the Dart SDK target is materialized. Until then \`core\` owns the declared SDK port and credential boundary, and feature packages must never fill the gap with raw request APIs or manual auth headers. Do not introduce local SDK proxies, DTO forks, or a second appbase IAM runtime.`
      : `Consume \`/app/v3/api\` through the generated ArkTS/TypeScript app SDK client adapted for the Harmony runtime and composed in \`core\`/bootstrap. No ArkTS target is produced by the SDK generation chain yet, so \`core\` owns the declared SDK port and credential boundary. Do not introduce raw HTTP, manual authentication headers, generated transport imports, local SDK forks, or a second appbase IAM runtime.`;

  return `# Repository Guidelines

## SDKWORK Soul

Read \`${SPECS}/SOUL.md\` before executing application tasks. Start with the sections that route the current task; related-spec references are not a startup bundle.

## SDKWORK Standards

The canonical standards index is \`${SPECS}/README.md\`, and \`${SPECS}/AGENTS_SPEC.md\` governs this entrypoint. Read the relevant task-matrix row first and do not copy global normative bodies locally.

## Application Identity

Read \`sdkwork.app.config.json\` only for application identity, SDK/API inventory, release metadata, packaging, or app-owned capabilities. Runtime values belong to source configuration under \`etc/\` and \`${profile.configRoot}/\`, not to the application declaration.

- Application code: \`${applicationCode}\`
- Application key: \`${applicationKey(suffix)}\`
- Bundle name: \`${bundleName}\`
- Client architecture: \`${suffix}\` (runtime target \`${profile.runtimeTarget}\`)

## Local Dictionary Structure

Use \`AGENTS.md\` as the application routing entrypoint. Read \`.sdkwork/\`, \`specs/\`, application source, tests, and documentation only when the current task reaches the contract each location governs.

${dictionary}

## Spec Resolution Order

Use dynamic progressive loading: read this file and \`../../AGENTS.md\`, then \`${SPECS}/${profile.rootArchSpec}\`, then applicable local contracts under \`specs/\`, then the relevant task route in \`${SPECS}/README.md\`, and only afterward inspect implementation files. Language-specific specs are on-demand only.

## Required Specs By Task Type

Client work loads \`${SPECS}/APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md\`, \`${SPECS}/${profile.rootArchSpec}\`, and \`${SPECS}/${profile.uiSpec}\`. Code changes load \`${SPECS}/CODE_STYLE_SPEC.md\`, \`${SPECS}/NAMING_SPEC.md\`, \`${SPECS}/${isMp ? 'TYPESCRIPT_CODE_SPEC.md' : 'FRONTEND_CODE_SPEC.md'}\`, and only the touched platform authority. Package-command work loads \`${SPECS}/PNPM_SCRIPT_SPEC.md\`; packaging workflow changes load \`${SPECS}/GITHUB_WORKFLOW_SPEC.md\`; deployment work loads \`${SPECS}/DEPLOYMENT_SPEC.md\`, \`${SPECS}/CONFIG_SPEC.md\`, and \`${SPECS}/SOURCE_CONFIG_SPEC.md\`. Locale work loads \`${SPECS}/I18N_SPEC.md\`. Language-specific specs are on-demand only.

## Code Style Rules

${sdkRule}

## Build, Test, and Verification

${buildSection}

## Agent Execution Rules

Follow specifications before memory and evidence before completion. Keep SDK construction, authentication, environment selection, and host capabilities in their owning composition layers. Route ids, i18n keys, SDK surfaces, service contracts, and host adapter contracts align with the PC root; never import another client architecture's UI implementation, routes, or private source. Stop when kernel ownership, API authority, or SDK family boundaries are ambiguous.

## Task-Specific Standards

SDK consumer work loads \`${SPECS}/APP_SDK_INTEGRATION_SPEC.md\` and runs \`check-app-sdk-consumer-imports.mjs\`. List/search work loads \`${SPECS}/PAGINATION_SPEC.md\` and \`check-pagination.mjs\`. Source configuration work loads \`${SPECS}/SOURCE_CONFIG_SPEC.md\` and \`check-source-config-standard.mjs\`. Locale resource work loads \`${SPECS}/I18N_SPEC.md\` and \`check-i18n-standard.mjs\`.

## Human Review Rules

Human review is required for public API changes, security exceptions, database migrations, generated SDK ownership changes, destructive operations, and cross-application standards changes.
`;
}

/** Application-root README.md. */
export function readmeMd(suffix) {
  const profile = platformProfiles[suffix];
  const root = appRootName(suffix);
  const isMp = suffix === 'mini-program';
  const isDart = suffix === 'flutter-mobile';

  const packageRows = [
    ['core', 'Runtime config, SDK port/factories, token manager, session store, route registry, host adapter contracts', 'frontend-core'],
    ['commons', 'Domain-neutral UI primitives, design tokens, locale helpers', 'frontend-commons'],
    ['shell', 'App shell, navigation, AuthGate integration', 'frontend-shell'],
    ['host', 'Typed platform host adapters', 'frontend-host'],
    ...capabilities.map((capability) => [
      capability,
      `${titleCase(capability)} capability package (routes: ${routeTable
        .filter((entry) => entry.capability === capability)
        .map((entry) => `\`${entry.id}\``)
        .join(', ')})`,
      'frontend-feature',
    ]),
  ];

  const packageName = (capability) =>
    isDart
      ? `packages/sdkwork_${applicationCode}_flutter_mobile_${capability.replaceAll('-', '_')}`
      : isMp
        ? `packages/@sdkwork/${applicationCode}-mp-${capability}`
        : `packages/@sdkwork/${root}-${capability}`;

  return `# ${profile.displayName}

${profile.description}

## Status

Architecture scaffold materialized against
\`${profile.rootArchSpec}\` and \`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md\`.
Route ids, package roles, and SDK surface align with the PC root
(\`apps/sdkwork-appstore-pc\`) so the two are implementations of one system.

## Package Family

| Package | Role | Layer role |
| --- | --- | --- |
${packageRows.map(([name, role, layer]) => `| \`${packageName(name)}\` | ${role} | ${layer} |`).join('\n')}

## Route Identity

Route ids are the cross-client alignment contract. This root owns the same
route ids as the PC and H5 roots; it never imports their route or UI
implementations.

| Route id | Path | Capability |
| --- | --- | --- |
${routeTable.map((entry) => `| \`${entry.id}\` | \`${entry.path}\` | \`${entry.capability}\` |`).join('\n')}

## SDK Integration

| Surface | Workspace | Package | Status |
| --- | --- | --- | --- |
| app-api | \`${sdkFamily.workspace}\` | ${
    isMp
      ? `\`${sdkFamily.typescriptPackageName}\``
      : isDart
        ? `\`${sdkFamily.dartPackageName}\``
        : 'declared port (no ArkTS target)'
  } | ${
    isMp
      ? 'materialized'
      : isDart
        ? 'transport pending Dart target generation'
        : 'transport pending ArkTS target generation'
  } |

${
  isMp
    ? `The generated TypeScript app SDK is consumed directly.`
    : `The SDK generation chain currently emits the TypeScript target of
\`${sdkFamily.workspace}\` only. \`core\` therefore declares the SDK port
contract, base-URL normalization, and credential resolution boundary instead of
vendoring a transport copy or importing a package that does not exist. Feature
packages must never fill this gap with raw request APIs or manual auth headers.`
}

## Configuration

Non-secret runtime config materializes as
\`${profile.configRoot}/…\` for the ${profileIds.length} supported profiles
(${profileIds.join(', ')}).

## Verification

\`\`\`bash
node ${SPECS}/tools/check-apps-directory-index.mjs --root ../..
node ${SPECS}/tools/check-frontend-composition.mjs --root ../..
node ${SPECS}/tools/check-component-port-bindings.mjs --root ../..
node ${SPECS}/tools/check-i18n-standard.mjs --root .
\`\`\`
`;
}

export { SPECS, runtimeEnvElementId };

/**
 * `contracts.permissionComposition` for a client-root core package.
 *
 * Required whenever a core package declares an HTTP `sdkDependencies` entry.
 * Mirrors the reference shape used by the sibling client roots: the module
 * catalog is inherited from the repository-root IAM module manifest and the
 * bootstrap access-token scope is inherited from the application declaration.
 */
export function permissionComposition() {
  return {
    inheritanceMode: 'module-catalog-with-overrides',
    moduleCatalogRefs: [
      {
        moduleId: 'appstore',
        manifestRef: '../../../../specs/iam.module.manifest.json',
        inheritPermissions: true,
        inheritRoles: true,
      },
    ],
    bootstrapAccessTokenScope: {
      inheritFrom: 'sdkwork.app.config.json#backend.accessTokenPermissionScope',
      supplement: [],
      overrideReplace: false,
    },
    routePermissionHints: {
      inheritFromOpenApi: true,
      inheritFromModuleManifests: true,
      overrides: [],
    },
    consumerPolicy: {
      forbidLocalPermissionCatalogForDependencyDomains: true,
      allowExplicitOverridesOnly: true,
      allowFrontendHintsWithoutServerDuplication: true,
    },
    applicationModule: {
      manifestRef: '../../../../specs/iam.module.manifest.json',
    },
  };
}

// Re-exported so surface modules can import everything from one place.
export {
  appApiSuffix,
  applicationCode,
  appId,
  bundleName,
  capabilities,
  camelCase,
  cloudApiBaseUrls,
  createWriter,
  deploymentProfiles,
  environmentAlias,
  environmentOrigins,
  environments,
  pascalCase,
  profileIds,
  publicHttpUrl,
  routeTable,
  sdkFamily,
  titleCase,
  writeCompatibilityShims,
  writeSdkworkBaseline,
} from './client-app-scaffold-lib.mjs';
