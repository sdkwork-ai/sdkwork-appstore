import 'src/http/client.dart';
import 'src/http/sdk_config.dart';
import 'src/api/catalog.dart';
import 'src/api/listings.dart';
import 'src/api/releases.dart';
import 'src/api/publishers.dart';
import 'src/api/compliance.dart';
import 'src/api/library.dart';
import 'src/api/wishlist.dart';
import 'src/api/user_store.dart';
import 'src/api/download_grants.dart';

class SdkworkAppstoreAppClient {
  final HttpClient _httpClient;

  late final CatalogApi catalog;
  late final ListingsApi listings;
  late final ReleasesApi releases;
  late final PublishersApi publishers;
  late final ComplianceApi compliance;
  late final Library_Api library_;
  late final WishlistApi wishlist;
  late final UserStoreApi userStore;
  late final DownloadGrantsApi downloadGrants;

  SdkworkAppstoreAppClient({
    required SdkConfig config,
  }) : _httpClient = HttpClient(config: config) {
    catalog = CatalogApi(_httpClient);
    listings = ListingsApi(_httpClient);
    releases = ReleasesApi(_httpClient);
    publishers = PublishersApi(_httpClient);
    compliance = ComplianceApi(_httpClient);
    library_ = Library_Api(_httpClient);
    wishlist = WishlistApi(_httpClient);
    userStore = UserStoreApi(_httpClient);
    downloadGrants = DownloadGrantsApi(_httpClient);
  }

  factory SdkworkAppstoreAppClient.withBaseUrl({
    required String baseUrl,
    String? authToken,
    String? accessToken,
    Map<String, String>? headers,
    int timeout = 30000,
  }) {
    return SdkworkAppstoreAppClient(
      config: SdkConfig(
        baseUrl: baseUrl,
        timeout: timeout,
        headers: headers ?? const {},
        authToken: authToken,
        accessToken: accessToken,
      ),
    );
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
