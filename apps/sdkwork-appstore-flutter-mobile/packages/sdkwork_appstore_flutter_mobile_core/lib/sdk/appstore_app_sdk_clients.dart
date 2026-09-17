/// App Store app-api SDK port and factory contract.
///
/// Authority: `APP_SDK_INTEGRATION_SPEC.md`, `CONFIG_SPEC.md` section 3.1, and
/// `FLUTTER_APP_MOBILE_ARCHITECTURE_SPEC.md`.
///
/// PREREQUISITE: the SDK generation chain materializes the TypeScript target of
/// `sdkwork-appstore-app-sdk` only. No Dart target exists yet, so this module
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
