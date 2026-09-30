import '../../src/vendor/skills/app_client.dart';
import '../../src/vendor/mcp/app_client.dart';

export '../../src/vendor/skills/app_client.dart' show SdkworkAppClient;
export '../../src/vendor/mcp/app_client.dart' show SdkworkMcpAppClient;

/// Dependency SDK clients (skills / mcp) for the Flutter root.
///
/// `FLUTTER_APP_MOBILE_ARCHITECTURE_SPEC.md` section 6: only the bootstrap/core
/// layer assembles dependency SDK clients; capability packages receive them by
/// injection. The generated Dart sources are vendored under `lib/src/vendor/`
/// (import-rewritten copies of the family dart targets at repo-root `sdks/`),
/// because this toolchain's path-dependency resolution could not see them;
/// regenerate-then-re-vendor is the upgrade path. Tokens propagate through the
/// same single-token-owner pattern as the app client.
SdkworkAppClient createAppstoreFlutterSkillsClient({
  required String baseUrl,
  String? authToken,
  String? accessToken,
}) {
  return SdkworkAppClient.withBaseUrl(
    baseUrl: baseUrl,
    authToken: authToken,
    accessToken: accessToken,
  );
}

SdkworkMcpAppClient createAppstoreFlutterMcpClient({
  required String baseUrl,
  String? authToken,
  String? accessToken,
}) {
  return SdkworkMcpAppClient.withBaseUrl(
    baseUrl: baseUrl,
    authToken: authToken,
    accessToken: accessToken,
  );
}
