#!/usr/bin/env node

// Materializes `apps/sdkwork-appstore-flutter-mobile` following
// `FLUTTER_APP_MOBILE_ARCHITECTURE_SPEC.md` and
// `APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md`.
//
// Dart package names are lower snake case per `NAMING_SPEC.md`:
// `sdkwork_<application_code>_flutter_mobile_<capability>`.
//
// SDK integration note: the SDK generation chain currently materializes the
// TypeScript target of `sdkwork-appstore-app-sdk` only. No
// `sdkwork-appstore-app-sdk-flutter` workspace exists, so `core` declares the
// SDK port, base-URL normalization, and credential boundary instead of
// importing a Dart package that does not exist. Feature packages must never
// fill that gap with raw HTTP or manual auth headers.

import path from 'node:path';

import {
  appApiSuffix,
  capabilities,
  capabilityCopy,
  createWriter,
  dartRouteContributionLiteral,
  dartRouteTableLiteral,
  pascalCase,
  routeTable,
  sdkFamily,
  sdkworkUiRouteContributionDart,
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

const SUFFIX = 'flutter-mobile';
const profile = platformProfiles[SUFFIX];
const ROOT = appRootName(SUFFIX);
const KEY = applicationKey(SUFFIX);
const LOCAL_BASE = `http://127.0.0.1:8090${appApiSuffix}`;

const dartPackage = (capability) =>
  `sdkwork_appstore_flutter_mobile_${capability.replaceAll('-', '_')}`;

export function materializeFlutterMobile(appsDir) {
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
    `# Flutter / Dart build and tooling output.
.dart_tool/
.packages
build/
.flutter-plugins
.flutter-plugins-dependencies
env/sdkwork.local.*.json
`,
  );

  write(
    '.env.example',
    `# Non-secret template. Real values materialize through
# \`pnpm workflow:materialize-client-env\` into env/sdkwork.<profile>.<environment>.json.
SDKWORK_DEPLOYMENT_PROFILE=standalone
SDKWORK_ENVIRONMENT=development
SDKWORK_APPSTORE_APP_API_BASE_URL=${LOCAL_BASE}
`,
  );

  write(
    'pubspec.yaml',
    `name: ${KEY}
description: ${profile.description}
version: 0.1.0
publish_to: none

environment:
  sdk: ">=3.5.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  ${dartPackage('core')}:
    path: packages/${dartPackage('core')}
  ${dartPackage('commons')}:
    path: packages/${dartPackage('commons')}
  ${dartPackage('shell')}:
    path: packages/${dartPackage('shell')}
  ${dartPackage('host')}:
    path: packages/${dartPackage('host')}
${capabilities
  .map((c) => `  ${dartPackage(c)}:\n    path: packages/${dartPackage(c)}`)
  .join('\n')}

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0
`,
  );

  // -------------------------------------------------------------------------
  // Runtime configuration
  // -------------------------------------------------------------------------

  for (const profileId of profileIds) {
    writeJson(
      `env/sdkwork.${profileId}.json`,
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

  // -------------------------------------------------------------------------
  // Dart application entry
  // -------------------------------------------------------------------------

  write(
    'lib/main.dart',
    `import 'package:flutter/material.dart';

import 'app.dart';
import 'bootstrap/runtime.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final runtime = await bootstrap();
  runApp(AppstoreApp(runtime: runtime));
}
`,
  );

  write(
    'lib/app.dart',
    `import 'package:flutter/material.dart';

import 'auth_gate.dart';
import 'bootstrap/runtime.dart';

/// App Store Flutter mobile root widget.
class AppstoreApp extends StatelessWidget {
  const AppstoreApp({required this.runtime, super.key});

  final AppstoreMobileRuntime runtime;

  @override
  Widget build(BuildContext context) {
    return AppstoreRuntimeScope(
      runtime: runtime,
      child: MaterialApp(
        title: '${profile.displayName}',
        theme: ThemeData(colorSchemeSeed: const Color(0xFF0F766E)),
        home: const AuthGate(),
      ),
    );
  }
}

/// Inherited runtime scope; mirrors the H5 runtime provider boundary.
class AppstoreRuntimeScope extends InheritedWidget {
  const AppstoreRuntimeScope({
    required this.runtime,
    required super.child,
    super.key,
  });

  final AppstoreMobileRuntime runtime;

  static AppstoreMobileRuntime of(BuildContext context) {
    final scope =
        context.dependOnInheritedWidgetOfExactType<AppstoreRuntimeScope>();
    if (scope == null) {
      throw StateError('AppstoreRuntimeScope is not available.');
    }
    return scope.runtime;
  }

  @override
  bool updateShouldNotify(AppstoreRuntimeScope oldWidget) {
    return !identical(runtime, oldWidget.runtime);
  }
}
`,
  );

  write(
    'lib/auth_gate.dart',
    `import 'package:flutter/material.dart';
import 'package:${dartPackage('shell')}/${dartPackage('shell')}.dart';

/// Root AuthGate. Authority: \`IAM_LOGIN_INTEGRATION_SPEC.md\`.
class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    return const AppstoreAuthGate(child: AppstoreRouteStack());
  }
}
`,
  );

  write(
    'lib/bootstrap/runtime.dart',
    `import 'package:${dartPackage('core')}/${dartPackage('core')}.dart';

import 'host_adapters.dart';
import 'iam_runtime.dart';
import 'routes.dart';
import 'sdk_clients.dart';

/// Flutter mobile composition root.
class AppstoreMobileRuntime {
  const AppstoreMobileRuntime({
    required this.sdkClients,
    required this.routes,
  });

  final AppstoreAppSdkClients sdkClients;
  final List<SdkworkUiRouteContribution> routes;
}

Future<AppstoreMobileRuntime> bootstrap() async {
  createIamRuntime();
  registerHostAdapters();
  final sdkClients = createSdkClients();
  final routes = createRoutes();
  return AppstoreMobileRuntime(sdkClients: sdkClients, routes: routes);
}
`,
  );

  write(
    'lib/bootstrap/sdk_clients.dart',
    `import 'package:${dartPackage('core')}/${dartPackage('core')}.dart';

typedef SdkClients = AppstoreAppSdkClients;

const String _configuredAppApiBaseUrl = String.fromEnvironment(
  'SDKWORK_APPSTORE_APP_API_BASE_URL',
  defaultValue: '$LOCAL_BASE',
);

const String appstoreEnvironment = String.fromEnvironment(
  'SDKWORK_ENVIRONMENT',
  defaultValue: 'development',
);

const String appstoreDeploymentProfile = String.fromEnvironment(
  'SDKWORK_DEPLOYMENT_PROFILE',
  defaultValue: 'standalone',
);

const String appstoreProfileId = String.fromEnvironment(
  'SDKWORK_PROFILE_ID',
  defaultValue: 'standalone.development',
);

const String appstoreRuntimeTarget = String.fromEnvironment(
  'SDKWORK_RUNTIME_TARGET',
  defaultValue: '${profile.runtimeTarget}',
);

/// Construct the App Store app SDK clients.
AppstoreAppSdkClients createSdkClients({
  String? appApiBaseUrl,
  String? authToken,
  String? accessToken,
}) {
  return createAppstoreAppSdkClients(
    appApiBaseUrl: appApiBaseUrl ?? _configuredAppApiBaseUrl,
    authToken: authToken,
    accessToken: accessToken,
  );
}
`,
  );

  write(
    'lib/bootstrap/iam_runtime.dart',
    `import 'package:${dartPackage('core')}/${dartPackage('core')}.dart';

/// Appbase IAM runtime wiring for the Flutter root.
///
/// Authority: \`APP_SDK_INTEGRATION_SPEC.md\` and
/// \`IAM_LOGIN_INTEGRATION_SPEC.md\`. The root owns exactly one token manager
/// and one IAM runtime; feature packages receive session state by injection.
AppstoreIamRuntime? _runtime;

AppstoreIamRuntime createIamRuntime() {
  _runtime ??= AppstoreIamRuntime();
  return _runtime!;
}

AppstoreIamRuntime getIamRuntime() => _runtime ?? createIamRuntime();
`,
  );

  write(
    'lib/bootstrap/host_adapters.dart',
    `import 'package:${dartPackage('host')}/${dartPackage('host')}.dart';

/// Register platform host adapters before the first frame renders.
void registerHostAdapters() {
  registerFlutterHostAdapters();
}
`,
  );

  write(
    'lib/bootstrap/routes.dart',
    `import 'package:${dartPackage('core')}/${dartPackage('core')}.dart';

/// Canonical App Store route identity table shared with the PC root.
List<SdkworkUiRouteContribution> createRoutes() => listAppstoreRouteIdentities();
`,
  );

  // -------------------------------------------------------------------------
  // Package family
  // -------------------------------------------------------------------------

  materializeFlutterCore(write, writeJson);
  materializeFlutterCommons(write, writeJson);
  materializeFlutterShell(write, writeJson);
  materializeFlutterHost(write, writeJson);
  for (const capability of capabilities) {
    materializeFlutterCapability(write, writeJson, capability);
  }

  report(ROOT);
  return { created: true };
}

// ---------------------------------------------------------------------------
// Shared Dart helpers
// ---------------------------------------------------------------------------

function dartPubspec(capability, dependencies, description) {
  const deps = dependencies
    .map(
      (dep) =>
        `  ${dartPackage(dep)}:\n    path: ../${dartPackage(dep)}`,
    )
    .join('\n');
  return `name: ${dartPackage(capability)}
description: ${description}
version: 0.1.0
publish_to: none

environment:
  sdk: ">=3.5.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
${deps}

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0
`;
}

function dartSpec(capability, layerRole, extraContracts) {
  return {
    schemaVersion: 1,
    kind: 'sdkwork.component.spec',
    component: {
      name: dartPackage(capability),
      displayName: `${titleCase(capability)} (Flutter mobile)`,
      version: '0.1.0',
      type: 'dart-package',
      root: `apps/${ROOT}/packages/${dartPackage(capability)}`,
      domain: 'appstore',
      capability,
      surface: 'app',
      languages: ['dart'],
      generated: false,
      manifests: ['pubspec.yaml'],
    },
    canonicalSpecs: [
      {
        file: 'FLUTTER_APP_MOBILE_ARCHITECTURE_SPEC.md',
        path: '../../../sdkwork-specs/FLUTTER_APP_MOBILE_ARCHITECTURE_SPEC.md',
        purpose: 'Flutter mobile application root and package taxonomy.',
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

function materializeFlutterCore(write, writeJson) {
  const pkg = dartPackage('core');
  const dir = `packages/${pkg}`;
  write(
    `${dir}/README.md`,
    `# ${pkg}

Flutter mobile core: runtime config, App Store app SDK port and factories,
token manager, session store, route registry, and host adapter contracts.

The generated app SDK currently materializes its TypeScript target only, so
this package owns the declared SDK port and credential boundary. See the
application-root README for the blocking prerequisite.
`,
  );
  writeJson(`${dir}/specs/component.spec.json`, {
    ...dartSpec('core', 'frontend-core', {
      sdkDependencies: [
        {
          workspace: sdkFamily.workspace,
          surface: 'app-api',
          credentialMode: 'authenticated-app-api',
          apiAuthority: sdkFamily.apiAuthority,
          apiPrefix: sdkFamily.apiPrefix,
          packageName: sdkFamily.dartPackageName,
          generationState: 'transport-pending-dart-target',
        },
      ],
      sdkClients: ['AppstoreAppSdkClients'],
      permissionComposition: permissionComposition(),
    }),
  });
  write(
    `${dir}/pubspec.yaml`,
    `name: ${pkg}
description: SDKWork App Store Flutter mobile core package
version: 0.1.0
publish_to: none

environment:
  sdk: ">=3.5.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0
`,
  );
  write(
    `${dir}/lib/${pkg}.dart`,
    `library;

export 'composition/composition.dart';
export 'sdk/appstore_app_sdk_clients.dart';
export 'session/appstore_session.dart';
export 'iam/appstore_iam_runtime.dart';
`,
  );
  write(
    `${dir}/lib/composition/composition.dart`,
    `library;

export 'dependency_manifest.dart';
export 'host_registry.dart';
export 'module_registry.dart';
export 'route_table.dart';
export 'sdk_inventory.dart';
`,
  );
  write(
    `${dir}/lib/composition/dependency_manifest.dart`,
    `/// Path to the application-root component spec.
const sdkworkComponentSpecPath = '../../../specs/component.spec.json';
`,
  );
  write(
    `${dir}/lib/composition/sdk_inventory.dart`,
    `/// SDK family workspaces consumed by Flutter core.
///
/// Authority: the application-root \`specs/component.spec.json\`
/// \`contracts.sdkDependencies\`.
const List<String> appstoreFlutterCoreSdkInventory = <String>[
  '${sdkFamily.workspace}',
];

List<String> listSdkworkCoreSdkInventory() => appstoreFlutterCoreSdkInventory;
`,
  );
  write(
    `${dir}/lib/composition/module_registry.dart`,
    `/// Module ids this client root participates in.
///
/// Authority: \`../specs/iam.module.manifest.json\` at the repository root.
const List<String> appstoreModuleRegistry = <String>['appstore'];
`,
  );
  write(
    `${dir}/lib/composition/host_registry.dart`,
    `/// Platform host adapter names registered by the Flutter runtime.
const List<String> appstoreHostRegistry = <String>[
  'secure-storage',
  'haptic',
  'share',
  'deep-link',
];
`,
  );
  write(
    `${dir}/lib/composition/route_table.dart`,
    `/// Canonical App Store route identity table.
///
/// Authority: \`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md\` section 1 — the same
/// route id names the same workflow in every client architecture. Cross-checked
/// against the PC root router
/// (\`apps/sdkwork-appstore-pc/packages/sdkwork-appstore-pc-embed/src/index.tsx\`).
${sdkworkUiRouteContributionDart}
const List<SdkworkUiRouteContribution> appstoreRouteTable =
    <SdkworkUiRouteContribution>[
${dartRouteTableLiteral()},
];

List<SdkworkUiRouteContribution> listAppstoreRouteIdentities() =>
    appstoreRouteTable;

/// Path lookup by canonical route id.
String appstoreRoutePath(String routeId) {
  for (final route in appstoreRouteTable) {
    if (route.id == routeId) {
      return route.path;
    }
  }
  throw ArgumentError('unknown App Store route id: $routeId');
}
`,
  );
  write(
    `${dir}/lib/sdk/appstore_app_sdk_clients.dart`,
    `/// App Store app-api SDK port and factory contract.
///
/// Authority: \`APP_SDK_INTEGRATION_SPEC.md\`, \`CONFIG_SPEC.md\` section 3.1, and
/// \`FLUTTER_APP_MOBILE_ARCHITECTURE_SPEC.md\`.
///
/// PREREQUISITE: the SDK generation chain materializes the TypeScript target of
/// \`${sdkFamily.workspace}\` only. No Dart target exists yet, so this module
/// declares the port contract, the base-URL normalization, and the credential
/// resolution boundary rather than importing a Dart package that does not
/// exist. Feature packages must never fill this gap with raw request APIs or
/// manual auth headers.
library;

const String appstoreAppApiPrefix = '$appApiSuffix';

/// Normalized, credential-aware App Store app-api client configuration.
class AppstoreAppSdkClientConfig {
  const AppstoreAppSdkClientConfig({
    required this.baseUrl,
    this.accessToken,
    this.authToken,
    this.platform = 'flutter-mobile',
  });

  final String baseUrl;
  final String? accessToken;
  final String? authToken;
  final String platform;
}

String? _configuredBaseUrl;

/// Normalize and pin the App Store app-api base URL.
void configureAppstoreAppSdkBaseUrl(String baseUrl) {
  final normalized = baseUrl.trim().replaceFirst(RegExp(r'/+$'), '');
  if (normalized.isEmpty) {
    throw ArgumentError.value(
      baseUrl,
      'baseUrl',
      'SDKWORK_APPSTORE_APP_API_BASE_URL is required',
    );
  }
  if (!normalized.endsWith(appstoreAppApiPrefix)) {
    throw ArgumentError.value(
      baseUrl,
      'baseUrl',
      'must end with the /app/v3/api prefix exactly once',
    );
  }
  _configuredBaseUrl = normalized;
}

String resolveAppstoreAppSdkBaseUrl() {
  final configured = _configuredBaseUrl;
  if (configured == null) {
    throw StateError(
      'SDKWORK_APPSTORE_APP_API_BASE_URL must be configured before SDK bootstrap',
    );
  }
  return configured;
}

/// Transport base URL: the app-api prefix is stripped from the client base.
String resolveAppstoreTransportBaseUrl(String appApiBaseUrl) {
  configureAppstoreAppSdkBaseUrl(appApiBaseUrl);
  final resolved = resolveAppstoreAppSdkBaseUrl();
  return resolved
      .substring(0, resolved.length - appstoreAppApiPrefix.length)
      .replaceFirst(RegExp(r'/+$'), '');
}

/// SDK clients composed for this root.
class AppstoreAppSdkClients {
  const AppstoreAppSdkClients({
    required this.appApiBaseUrl,
    required this.transportBaseUrl,
  });

  final String appApiBaseUrl;
  final String transportBaseUrl;
}

AppstoreAppSdkClients createAppstoreAppSdkClients({
  required String appApiBaseUrl,
  String? authToken,
  String? accessToken,
}) {
  configureAppstoreAppSdkBaseUrl(appApiBaseUrl);
  return AppstoreAppSdkClients(
    appApiBaseUrl: resolveAppstoreAppSdkBaseUrl(),
    transportBaseUrl: resolveAppstoreTransportBaseUrl(appApiBaseUrl),
  );
}

void resetAppstoreAppSdkClients() {
  _configuredBaseUrl = null;
}
`,
  );
  write(
    `${dir}/lib/session/appstore_session.dart`,
    `/// Session token projection shared by capability packages.
class AppstoreSession {
  const AppstoreSession({this.accessToken, this.authToken, this.refreshToken});

  final String? accessToken;
  final String? authToken;
  final String? refreshToken;

  bool get isAuthenticated =>
      (authToken?.isNotEmpty ?? false) || (accessToken?.isNotEmpty ?? false);
}
`,
  );
  write(
    `${dir}/lib/iam/appstore_iam_runtime.dart`,
    `import '../session/appstore_session.dart';

/// Appbase IAM runtime boundary for the Flutter root.
///
/// Authority: \`APP_SDK_INTEGRATION_SPEC.md\` and
/// \`IAM_LOGIN_INTEGRATION_SPEC.md\`. Exactly one instance exists per root; the
/// concrete appbase runtime is supplied by the root bootstrap once the appbase
/// Dart SDK target is available for Flutter.
class AppstoreIamRuntime {
  AppstoreSession _session = const AppstoreSession();

  AppstoreSession get session => _session;

  void setSession(AppstoreSession session) {
    _session = session;
  }

  void clearSession() {
    _session = const AppstoreSession();
  }
}
`,
  );
}

function materializeFlutterCommons(write, writeJson) {
  const pkg = dartPackage('commons');
  const dir = `packages/${pkg}`;
  writeJson(
    `${dir}/specs/component.spec.json`,
    dartSpec('commons', 'frontend-commons', {}),
  );
  write(
    `${dir}/pubspec.yaml`,
    dartPubspec(
      'commons',
      [],
      'SDKWork App Store Flutter mobile commons: design tokens, shared widgets, locale helpers.',
    ),
  );
  write(
    `${dir}/lib/${pkg}.dart`,
    `library;

export 'src/theme/design_tokens.dart';
export 'src/widgets/screen_states.dart';
export 'src/copy/locale_helpers.dart';
`,
  );
  write(
    `${dir}/lib/src/theme/design_tokens.dart`,
    `import 'package:flutter/material.dart';

/// Domain-neutral design tokens shared by App Store Flutter screens.
class AppstoreDesignTokens {
  const AppstoreDesignTokens._();

  static const Color background = Color(0xFFF8FAFC);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color border = Color(0xFFE2E8F0);
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF475569);
  static const Color accent = Color(0xFF0F766E);

  static const double spaceXs = 4;
  static const double spaceSm = 8;
  static const double spaceMd = 16;
  static const double spaceLg = 24;
  static const double spaceXl = 32;

  static const double radiusSm = 4;
  static const double radiusMd = 8;
  static const double radiusLg = 16;
}
`,
  );
  write(
    `${dir}/lib/src/widgets/screen_states.dart`,
    `import 'package:flutter/material.dart';

/// Standard screen state kinds shared by every capability screen.
enum AppstoreScreenStateKind { loading, empty, error, ready }

class AppstoreScreenState extends StatelessWidget {
  const AppstoreScreenState({
    required this.kind,
    required this.message,
    super.key,
  });

  final AppstoreScreenStateKind kind;
  final String message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Text(message, textAlign: TextAlign.center),
      ),
    );
  }
}
`,
  );
  write(
    `${dir}/lib/src/copy/locale_helpers.dart`,
    `/// Locale resolution helpers.
///
/// This module holds no authored copy. Locale fragments live under
/// \`lib/src/i18n/<locale>/appstore/<capability>/\` per \`I18N_SPEC.md\`
/// section 6.1 (Flutter allows \`.arb\` and \`.json\` fragments). Dart
/// \`const Map\` copy tables belong in \`lib/src/copy/\`, never under
/// \`lib/src/i18n/\`.
library;

const List<String> appstoreSupportedLocales = <String>['en-US', 'zh-CN'];

const String appstoreDefaultLocale = 'en-US';

String normalizeAppstoreLocale(String? candidate) {
  final value = candidate?.trim();
  if (value == null || value.isEmpty) {
    return appstoreDefaultLocale;
  }
  return appstoreSupportedLocales.contains(value)
      ? value
      : appstoreDefaultLocale;
}
`,
  );
}

function materializeFlutterShell(write, writeJson) {
  const pkg = dartPackage('shell');
  const dir = `packages/${pkg}`;
  writeJson(
    `${dir}/specs/component.spec.json`,
    dartSpec('shell', 'frontend-shell', {}),
  );
  write(
    `${dir}/pubspec.yaml`,
    dartPubspec(
      'shell',
      ['core'],
      'SDKWork App Store Flutter mobile shell: app shell, navigation, AuthGate integration.',
    ),
  );
  write(
    `${dir}/lib/${pkg}.dart`,
    `library;

export 'src/auth/auth_gate.dart';
export 'src/navigation/route_registry.dart';
`,
  );
  write(
    `${dir}/lib/src/auth/auth_gate.dart`,
    `import 'package:flutter/material.dart';

/// AuthGate integration.
///
/// Authority: \`IAM_LOGIN_INTEGRATION_SPEC.md\`. The gate decides whether a
/// route may render and never constructs its own SDK client.
class AppstoreAuthGate extends StatelessWidget {
  const AppstoreAuthGate({required this.child, super.key});

  final Widget child;

  @override
  Widget build(BuildContext context) => child;
}
`,
  );
  write(
    `${dir}/lib/src/navigation/route_registry.dart`,
    `import 'package:flutter/material.dart';

/// Route stack assembled from capability route contributions.
class AppstoreRouteStack extends StatelessWidget {
  const AppstoreRouteStack({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: Center(child: Text('SDKWork App Store')));
  }
}
`,
  );
}

function materializeFlutterHost(write, writeJson) {
  const pkg = dartPackage('host');
  const dir = `packages/${pkg}`;
  writeJson(
    `${dir}/specs/component.spec.json`,
    dartSpec('host', 'frontend-host', {}),
  );
  write(
    `${dir}/pubspec.yaml`,
    dartPubspec('host', [], 'SDKWork App Store Flutter mobile host adapters.'),
  );
  write(
    `${dir}/lib/${pkg}.dart`,
    `library;

export 'src/host_adapters.dart';
`,
  );
  write(
    `${dir}/lib/src/host_adapters.dart`,
    `/// Flutter host adapters.
///
/// Host-only capabilities are registered here behind typed contracts so
/// capability packages stay platform-agnostic
/// (\`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md\` section 1).
library;

final Set<String> _registered = <String>{};

List<String> registerFlutterHostAdapters() {
  _registered.addAll(<String>[
    'secure-storage',
    'haptic',
    'share',
    'deep-link',
  ]);
  return listFlutterHostAdapters();
}

List<String> listFlutterHostAdapters() => _registered.toList()..sort();

bool isFlutterHostAdapterAvailable(String name) => _registered.contains(name);
`,
  );
}

function materializeFlutterCapability(write, writeJson, capability) {
  const pkg = dartPackage(capability);
  const dir = `packages/${pkg}`;
  const pascal = pascalCase(capability);
  const snake = capability.replaceAll('-', '_');
  const routes = routeTable.filter((entry) => entry.capability === capability);

  writeJson(
    `${dir}/specs/component.spec.json`,
    dartSpec(capability, 'frontend-feature', {}),
  );
  write(
    `${dir}/pubspec.yaml`,
    dartPubspec(
      capability,
      ['core', 'commons'],
      `SDKWork App Store Flutter mobile ${capability} capability package.`,
    ),
  );
  write(
    `${dir}/README.md`,
    `# ${pkg}

${titleCase(capability)} capability package for the SDKWork App Store Flutter
mobile root.

Owns route identities: ${routes.map((entry) => `\`${entry.id}\` (\`${entry.path}\`)`).join(', ')}.

Receives the App Store app SDK clients by injection; never constructs a client.
`,
  );
  write(
    `${dir}/lib/${pkg}.dart`,
    `library;

export 'src/models/${snake}_models.dart';
export 'src/services/${snake}_service.dart';
export 'src/state/${snake}_state.dart';
export 'src/routes/route_contributions.dart';
export 'src/screens/${snake}_screen.dart';
export 'src/copy/${snake}_messages.dart';
`,
  );
  write(
    `${dir}/lib/src/models/${snake}_models.dart`,
    `/// Domain models owned by the ${capability} capability.
class ${pascal}RouteEntry {
  const ${pascal}RouteEntry({required this.routeId, required this.path});

  final String routeId;
  final String path;
}

class ${pascal}PageResult<TItem> {
  const ${pascal}PageResult({required this.items, this.nextCursor});

  final List<TItem> items;
  final String? nextCursor;
}
`,
  );
  write(
    `${dir}/lib/src/services/${snake}_service.dart`,
    `import 'package:${dartPackage('core')}/${dartPackage('core')}.dart';

import '../models/${snake}_models.dart';

/// ${titleCase(capability)} service.
///
/// The App Store app SDK clients are injected by the root bootstrap
/// (\`APP_SDK_INTEGRATION_SPEC.md\`); this package never constructs a client and
/// never issues raw HTTP.
class ${pascal}Service {
  const ${pascal}Service({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => '${capability}';

  ${pascal}PageResult<Never> empty() =>
      const ${pascal}PageResult<Never>(items: <Never>[]);
}
`,
  );
  write(
    `${dir}/lib/src/state/${snake}_state.dart`,
    `import '../models/${snake}_models.dart';

enum ${pascal}Status { idle, loading, ready, error }

class ${pascal}State {
  const ${pascal}State({
    this.status = ${pascal}Status.idle,
    this.lastResult,
    this.error,
  });

  final ${pascal}Status status;
  final ${pascal}PageResult<Object?>? lastResult;
  final String? error;

  ${pascal}State loading() => const ${pascal}State(status: ${pascal}Status.loading);

  ${pascal}State loaded(${pascal}PageResult<Object?> result) =>
      ${pascal}State(status: ${pascal}Status.ready, lastResult: result);

  ${pascal}State failed(String message) =>
      ${pascal}State(status: ${pascal}Status.error, error: message);
}
`,
  );
  write(
    `${dir}/lib/src/routes/route_contributions.dart`,
    `import 'package:${dartPackage('core')}/${dartPackage('core')}.dart';

/// Route contributions for the ${capability} capability.
///
/// Route ids are shared with the PC, H5, mini program, and HarmonyOS roots
/// (\`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md\` section 7). Flutter maps each
/// id to its own named route.
const List<SdkworkUiRouteContribution> ${snake}RouteContributions =
    <SdkworkUiRouteContribution>[
${routes.map((entry) => dartRouteContributionLiteral(entry, '  ')).join(',\n')},
];
`,
  );
  write(
    `${dir}/lib/src/screens/${snake}_screen.dart`,
    `import 'package:flutter/material.dart';

/// ${titleCase(capability)} screen.
///
/// Screens stay in capability packages; the root keeps only bootstrap,
/// providers, route assembly, and shell registration
/// (\`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md\` section 1).
class ${pascal}Screen extends StatelessWidget {
  const ${pascal}Screen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('${titleCase(capability)}')),
    );
  }
}
`,
  );
  write(
    `${dir}/lib/src/copy/${snake}_messages.dart`,
    `/// English copy table for the ${capability} capability.
///
/// Dart \`const Map\` copy tables live in \`lib/src/copy/\`, not under
/// \`lib/src/i18n/\`: \`I18N_SPEC.md\` section 6.1 allows only \`.arb\` and
/// \`.json\` fragments under the Flutter i18n tree.
const Map<String, String> ${snake}Messages = <String, String>{
${Object.entries(capabilityCopy(capability))
  .map(([key, value]) => `  '${key}': '${value}',`)
  .join('\n')}
};
`,
  );
  for (const locale of ['en-US', 'zh-CN']) {
    writeJson(
      `${dir}/lib/src/i18n/${locale}/appstore/${capability}/screen.arb`,
      {
        '@@locale': locale,
        title: locale === 'zh-CN' ? capabilityCopy(capability).titleZh : capabilityCopy(capability).title,
        '@title': {
          description: `Screen title for the ${capability} capability`,
        },
      },
    );
  }
}
