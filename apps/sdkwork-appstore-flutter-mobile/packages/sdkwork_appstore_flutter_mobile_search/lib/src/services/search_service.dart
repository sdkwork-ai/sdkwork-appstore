import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/search_models.dart';

/// Search service.
///
/// Injected clients only; data calls gate on the generated Dart SDK transport
/// binding (PC explicit-unconfigured-port pattern). Backed by
/// `catalog.searchListings`, `listSearchSuggestions`, and
/// `listTrendingSearchTerms` once the Dart SDK target is generated.
class SearchService {
  const SearchService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'search';

  /// Searches listings with a query and a type filter chip value.
  Future<List<SearchEntry>> search(String query, String typeFilter) async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }

  /// Trending search terms rendered when the query is empty.
  Future<List<String>> loadTrending() async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }

  /// Query-as-you-type suggestions.
  Future<List<String>> loadSuggestions(String query) async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }
}
