/// App Store app-api SDK port and factory contract.
///
/// Authority: `APP_SDK_INTEGRATION_SPEC.md`, `CONFIG_SPEC.md` section 3.1, and
/// `FLUTTER_APP_MOBILE_ARCHITECTURE_SPEC.md` section 6.
///
/// The generated Dart target of `sdkwork-appstore-app-sdk`
/// (`sdks/sdkwork-appstore-app-sdk/sdkwork-appstore-app-sdk-dart`) is bound
/// here by the root bootstrap; feature packages only ever receive this client
/// set and never construct one, never issue raw HTTP, and never add manual
/// auth headers.
library;

export 'package:sdkwork_appstore_app_sdk/sdkwork_appstore_app_sdk.dart';

import 'package:sdkwork_appstore_app_sdk/sdkwork_appstore_app_sdk.dart';

/// App-api path prefix owned by the appstore app-api surface.
const String appstoreAppApiPrefix = '/app/v3/api';

/// Storefront platform code this client reports for install/update calls
/// (`appstore_app_platform.code`; override via the SDKWORK_PLATFORM_CODE
/// dart-define when building for iOS).
const String appstorePlatformCode = String.fromEnvironment(
  'SDKWORK_PLATFORM_CODE',
  defaultValue: 'android',
);

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

/// Transport base URL: the app-api prefix is stripped from the client base
/// (the generated client re-adds the prefix per operation path).
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
    this.appClient,
  });

  final String appApiBaseUrl;
  final String transportBaseUrl;

  /// Generated app-api transport. Null only before the root bootstrap binds
  /// it; capability services gate every data call on [transportBound].
  final SdkworkAppstoreAppClient? appClient;

  /// Whether a generated Dart app SDK transport is bound to this client set.
  bool get transportBound => appClient != null;

  /// Guard used by capability services before any data call.
  void ensureTransportBound(String capability) {
    if (!transportBound) {
      throw AppstoreServiceUnconfiguredException(capability);
    }
  }

  /// Required generated app-api client (throws when unbound).
  SdkworkAppstoreAppClient get requireAppClient {
    final client = appClient;
    if (client == null) {
      throw const AppstoreServiceUnconfiguredException('transport');
    }
    return client;
  }

  /// Propagates the IAM session tokens into the generated client headers.
  ///
  /// The generated client owns per-request headers; the core IAM runtime stays
  /// the single token owner and pushes updates through this sink.
  void propagateSessionTokens({String? authToken, String? accessToken}) {
    final client = appClient;
    if (client == null) {
      return;
    }
    client.setAuthToken(authToken ?? '');
    client.setAccessToken(accessToken ?? '');
  }

  // ---- envelope unwrapping helpers shared by capability services ----

  /// Items of a page/list envelope (`data.items`).
  static List<Map<String, dynamic>> itemsOf(dynamic data) {
    final map = itemOf(data);
    final list = map?['items'];
    if (list is List) {
      return list
          .whereType<Map>()
          .map((row) => row.map((key, value) => MapEntry(key.toString(), value)))
          .toList();
    }
    return const <Map<String, dynamic>>[];
  }

  /// Item of a resource envelope (`data.item`), or the map itself.
  static Map<String, dynamic>? itemOf(dynamic data) {
    if (data is Map) {
      final normalized = data.map((key, value) => MapEntry(key.toString(), value));
      final item = normalized['item'];
      if (item is Map) {
        return item.map((key, value) => MapEntry(key.toString(), value));
      }
      return normalized;
    }
    return null;
  }

  /// Continuation cursor of a page envelope (`data.pageInfo.nextCursor`).
  static String? nextCursorOf(dynamic data) {
    final map = itemOf(data);
    final pageInfo = map?['pageInfo'];
    if (pageInfo is Map) {
      final cursor = pageInfo['nextCursor'];
      if (cursor is String && cursor.isNotEmpty) {
        return cursor;
      }
    }
    return null;
  }
}

AppstoreAppSdkClients createAppstoreAppSdkClients({
  required String appApiBaseUrl,
  String? authToken,
  String? accessToken,
}) {
  final transportBaseUrl = resolveAppstoreTransportBaseUrl(appApiBaseUrl);
  final appClient = SdkworkAppstoreAppClient.withBaseUrl(
    baseUrl: transportBaseUrl,
    authToken: authToken,
    accessToken: accessToken,
  );
  return AppstoreAppSdkClients(
    appApiBaseUrl: resolveAppstoreAppSdkBaseUrl(),
    transportBaseUrl: transportBaseUrl,
    appClient: appClient,
  );
}

void resetAppstoreAppSdkClients() {
  _configuredBaseUrl = null;
}

/// Thrown by capability services when the generated Dart app SDK transport is
/// not bound yet.
///
/// The PC root uses the same explicit-unconfigured-port pattern: screens render
/// the error state, and no demo data is ever injected
/// (`sdkwork-appstore-pc-core` services; `InstallProvider.tsx` "no demo apps
/// are ever injected").
class AppstoreServiceUnconfiguredException implements Exception {
  const AppstoreServiceUnconfiguredException(this.capability);

  final String capability;

  @override
  String toString() =>
      'appstore.$capability: the generated Dart app SDK transport is not '
      'bound yet; bind the generated Dart target in the root bootstrap.';
}
