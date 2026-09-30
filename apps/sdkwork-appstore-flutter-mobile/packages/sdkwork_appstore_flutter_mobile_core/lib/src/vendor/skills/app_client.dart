import 'src/http/client.dart';
import 'src/http/sdk_config.dart';
import 'src/api/skill.dart';
import 'src/api/skill_package.dart';
import 'src/api/skill_category.dart';
import 'src/api/skill_installation.dart';

class SdkworkAppClient {
  final HttpClient _httpClient;

  late final SkillApi skill;
  late final SkillPackageApi skillPackage;
  late final SkillCategoryApi skillCategory;
  late final SkillInstallationApi skillInstallation;

  SdkworkAppClient({
    required SdkConfig config,
  }) : _httpClient = HttpClient(config: config) {
    skill = SkillApi(_httpClient);
    skillPackage = SkillPackageApi(_httpClient);
    skillCategory = SkillCategoryApi(_httpClient);
    skillInstallation = SkillInstallationApi(_httpClient);
  }

  factory SdkworkAppClient.withBaseUrl({
    required String baseUrl,
    String? apiKey,
    String? authToken,
    String? accessToken,
    String apiKeyHeader = 'Access-Token',
    bool apiKeyAsBearer = false,
    Map<String, String>? headers,
    int timeout = 30000,
  }) {
    return SdkworkAppClient(
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
