import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/search_models.dart';

/// Search service.
///
/// Injected clients only; data calls gate on the generated Dart SDK transport
/// binding (PC explicit-unconfigured-port pattern). Backed by
/// `catalog.appstoreCatalogListingsList`, `appstoreCatalogSearchSuggestionsList`,
/// and `appstoreCatalogSearchTrendingList` on the generated Dart target.
class SearchService {
  const SearchService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'search';

  /// Searches listings with a query and a type filter chip value.
  ///
  /// The type chips refine the query string on the client; the app-api search
  /// endpoint is keyword-driven (categories refine via the category route).
  Future<List<SearchEntry>> search(String query, String typeFilter) async {
    clients.ensureTransportBound(capability);
    final trimmed = query.trim();
    if (trimmed.isEmpty) {
      return const <SearchEntry>[];
    }
    final response = await clients.requireAppClient.catalog
        .appstoreCatalogListingsList(trimmed, null, null, null, 30);
    return <SearchEntry>[
      for (final row in AppstoreAppSdkClients.itemsOf(response?.data))
        SearchEntry(
          id: _text(row['listingSlug'], _text(row['id'])),
          title: _text(row['displayName'], _text(row['title'], '应用')),
          developer: _text(row['developerName'], _text(row['publisherName'], '')),
          pricingModel: _text(row['pricingModel'], 'FREE'),
        ),
    ];
  }

  /// Trending search terms rendered when the query is empty.
  Future<List<String>> loadTrending() async {
    clients.ensureTransportBound(capability);
    final response = await clients.requireAppClient.catalog
        .appstoreCatalogSearchTrendingList('zh-CN', 10);
    return <String>[
      for (final row in AppstoreAppSdkClients.itemsOf(response?.data))
        _text(row['term'], _text(row['keyword'], '')),
    ].where((term) => term.isNotEmpty).toList();
  }

  /// Query-as-you-type suggestions.
  Future<List<String>> loadSuggestions(String query) async {
    clients.ensureTransportBound(capability);
    final trimmed = query.trim();
    if (trimmed.isEmpty) {
      return const <String>[];
    }
    final response = await clients.requireAppClient.catalog
        .appstoreCatalogSearchSuggestionsList(trimmed, 'zh-CN');
    return <String>[
      for (final row in AppstoreAppSdkClients.itemsOf(response?.data))
        _text(row['term'], _text(row['keyword'], _text(row['suggestion'], ''))),
    ].where((term) => term.isNotEmpty).toList();
  }
}

String _text(dynamic value, [String fallback = '']) {
  final text = value?.toString().trim() ?? '';
  return text.isEmpty ? fallback : text;
}
