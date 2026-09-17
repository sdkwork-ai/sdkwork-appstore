import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

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
  defaultValue: 'flutter-android',
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
