import 'src/http/client.dart';
import 'src/http/sdk_config.dart';
import 'src/api/releases.dart';
import 'src/api/artifacts.dart';
import 'src/api/listings.dart';
import 'src/api/catalog.dart';
import 'src/api/user_store.dart';
import 'src/api/automation.dart';

class SdkworkAppstoreOpenClient {
  final HttpClient _httpClient;

  late final ReleasesApi releases;
  late final ArtifactsApi artifacts;
  late final ListingsApi listings;
  late final CatalogApi catalog;
  late final UserStoreApi userStore;
  late final AutomationApi automation;

  SdkworkAppstoreOpenClient({
    required SdkConfig config,
  }) : _httpClient = HttpClient(config: config) {
    releases = ReleasesApi(_httpClient);
    artifacts = ArtifactsApi(_httpClient);
    listings = ListingsApi(_httpClient);
    catalog = CatalogApi(_httpClient);
    userStore = UserStoreApi(_httpClient);
    automation = AutomationApi(_httpClient);
  }

  factory SdkworkAppstoreOpenClient.withBaseUrl({
    required String baseUrl,
    String? apiKey,
    String? authToken,
    String? accessToken,
    String apiKeyHeader = 'X-API-Key',
    bool apiKeyAsBearer = false,
    Map<String, String>? headers,
    int timeout = 30000,
  }) {
    return SdkworkAppstoreOpenClient(
      config: SdkConfig(
        baseUrl: baseUrl,
        timeout: timeout,
        headers: headers ?? const {},
        apiKey: apiKey,
        apiKeyHeader: apiKeyHeader,
        apiKeyAsBearer: apiKeyAsBearer,
        authToken: authToken,
        accessToken: accessToken,
      ),
    );
  }

  void setApiKey(String apiKey) {
    _httpClient.setApiKey(apiKey);
  }

  void setAuthToken(String token) {
    _httpClient.setAuthToken(token);
  }

  void setAccessToken(String token) {
    _httpClient.setAccessToken(token);
  }

  void setHeader(String key, String value) {
    _httpClient.setHeader(key, value);
  }

  void close() {
    _httpClient.close();
  }
}
