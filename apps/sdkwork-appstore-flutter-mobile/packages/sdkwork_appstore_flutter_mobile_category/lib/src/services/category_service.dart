import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/category_models.dart';

/// Category service.
///
/// Injected clients only; data calls gate on the generated Dart SDK transport
/// binding (PC explicit-unconfigured-port pattern). Backed by
/// `catalog.appstoreCatalogCategoriesRetrieve` +
/// `catalog.appstoreCatalogListingsList({categoryId})` on the generated Dart
/// target.
class CategoryService {
  const CategoryService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'category';

  /// Loads the category detail and its listing page for [categoryId].
  Future<CategoryDetail> loadDetail(String categoryId) async {
    clients.ensureTransportBound(capability);
    final client = clients.requireAppClient;
    final categoryResponse =
        await client.catalog.appstoreCatalogCategoriesRetrieve(categoryId);
    final row =
        AppstoreAppSdkClients.itemOf(categoryResponse?.data) ??
            const <String, dynamic>{};
    final appsResponse = await client.catalog
        .appstoreCatalogListingsList(null, categoryId, null, null, 50);
    return CategoryDetail(
      id: _text(row['id'], categoryId),
      name: _localizedName(row, _text(row['categoryCode'], '分类')),
      description: _localizedDescription(row),
      apps: <CategoryAppEntry>[
        for (final app in AppstoreAppSdkClients.itemsOf(appsResponse?.data))
          CategoryAppEntry(
            id: _text(app['listingSlug'], _text(app['id'])),
            title: _text(app['displayName'], _text(app['title'], '应用')),
            developer:
                _text(app['developerName'], _text(app['publisherName'], '')),
          ),
      ],
    );
  }
}

List<Map<String, dynamic>> _localizationsOf(Map<String, dynamic> row) {
  final localizations = row['localizations'];
  if (localizations is List) {
    return localizations
        .whereType<Map>()
        .map((row) => row.map((key, value) => MapEntry(key.toString(), value)))
        .toList();
  }
  return const <Map<String, dynamic>>[];
}

String _localizedName(Map<String, dynamic> row, String fallback) {
  for (final entry in _localizationsOf(row)) {
    final locale = entry['locale']?.toString();
    if (locale == 'zh-CN' || locale == 'zh_CN') {
      final name =
          entry['displayName']?.toString() ?? entry['name']?.toString() ?? '';
      if (name.isNotEmpty) {
        return name;
      }
    }
  }
  for (final entry in _localizationsOf(row)) {
    final name =
        entry['displayName']?.toString() ?? entry['name']?.toString() ?? '';
    if (name.isNotEmpty) {
      return name;
    }
  }
  return fallback;
}

String _localizedDescription(Map<String, dynamic> row) {
  for (final entry in _localizationsOf(row)) {
    final locale = entry['locale']?.toString();
    if (locale == 'zh-CN' || locale == 'zh_CN') {
      final text = entry['description']?.toString() ?? '';
      if (text.isNotEmpty) {
        return text;
      }
    }
  }
  for (final entry in _localizationsOf(row)) {
    final text = entry['description']?.toString() ?? '';
    if (text.isNotEmpty) {
      return text;
    }
  }
  return '';
}

String _text(dynamic value, [String fallback = '']) {
  final text = value?.toString().trim() ?? '';
  return text.isEmpty ? fallback : text;
}
