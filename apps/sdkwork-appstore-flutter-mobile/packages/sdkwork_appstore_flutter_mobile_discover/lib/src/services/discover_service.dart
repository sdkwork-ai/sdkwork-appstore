import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/discover_models.dart';

/// Discover service.
///
/// The App Store app SDK clients are injected by the root bootstrap
/// (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
/// never issues raw HTTP. Data flows through the generated Dart target of
/// `sdkwork-appstore-app-sdk`.
class DiscoverService {
  const DiscoverService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'discover';

  /// Loads the storefront feed: hero picks, categories, editorial
  /// collections, active events, recently updated, recommendations.
  Future<DiscoverFeed> loadFeed() async {
    clients.ensureTransportBound(capability);
    final client = clients.requireAppClient;
    final results = await Future.wait(<Future<dynamic>>[
      client.catalog.appstoreCatalogHomeRetrieve(),
      client.catalog.appstoreCatalogCategoriesList(null, 10, 'zh-CN'),
      client.catalog.appstoreCatalogCollectionsList(null, 8),
      client.catalog.appstoreCatalogEventsList(null, 6, 'active'),
      client.catalog.appstoreCatalogRecentlyUpdatedList(null, 6, 'zh-CN'),
      client.catalog.appstoreCatalogRecommendationsList(null, null, null, 10),
    ]).catchError((Object error) => <dynamic>[
          null, null, null, null, null, null,
        ]);

    final homeData = AppstoreAppSdkClients.itemOf(
      (results[0] as dynamic)?.data,
    );
    final featuredSlots = _mapsOf(homeData?['featuredSlots']);
    final heroIds = <String>[
      for (final slot in featuredSlots) _text(slot['listingId']),
    ].where((id) => id.isNotEmpty).toList();
    final heroApps = heroIds.isEmpty
        ? const <DiscoverEntry>[]
        : await _resolveApps(heroIds);

    return DiscoverFeed(
      heroApps: heroApps,
      categories: <DiscoverEntry>[
        for (final row in _mapsOf((results[1] as dynamic)?.data))
          DiscoverEntry(
            id: _text(row['id']),
            title: _localizedName(row, _text(row['categoryCode'], '分类')),
          ),
      ],
      collections: <DiscoverEntry>[
        for (final row in _mapsOf((results[2] as dynamic)?.data))
          DiscoverEntry(
            id: _text(row['id']),
            title: _localizedName(row, _text(row['collectionCode'], '精选合集')),
            subtitle: _localizedDescription(row),
          ),
      ],
      events: <DiscoverEntry>[
        for (final row in _mapsOf((results[3] as dynamic)?.data))
          DiscoverEntry(
            id: _text(row['id']),
            title: _localizedName(row, _text(row['title'], '限时活动')),
            subtitle: _localizedDescription(row),
            endsAt: _text(row['endsAt']),
          ),
      ],
      recentlyUpdated: _toEntries((results[4] as dynamic)?.data),
      recommendations: _toEntries((results[5] as dynamic)?.data),
    );
  }

  Future<List<DiscoverEntry>> _resolveApps(List<String> ids) async {
    final unique = ids.toSet().where((id) => id.isNotEmpty).take(12).toList();
    if (unique.isEmpty) {
      return const <DiscoverEntry>[];
    }
    final response = await clients.requireAppClient.catalog
        .appstoreCatalogListingsList(null, null, unique.join(','), null, unique.length);
    return _toEntries(response?.data);
  }

  List<DiscoverEntry> _toEntries(dynamic data) => <DiscoverEntry>[
        for (final row in AppstoreAppSdkClients.itemsOf(data))
          DiscoverEntry(
            id: _text(row['listingSlug'], _text(row['id'])),
            title: _text(row['displayName'], _text(row['title'], '应用')),
            subtitle: _text(row['developerName'], _text(row['publisherName'], '')),
          ),
      ];
}

List<Map<String, dynamic>> _mapsOf(dynamic value) {
  if (value is List) {
    return value
        .whereType<Map>()
        .map((row) => row.map((key, item) => MapEntry(key.toString(), item)))
        .toList();
  }
  if (value is Map) {
    final normalized =
        value.map((key, item) => MapEntry(key.toString(), item));
    final nested = normalized['item'];
    if (nested is Map) {
      return _mapsOf(nested['featuredSlots']);
    }
  }
  return const <Map<String, dynamic>>[];
}

String _text(dynamic value, [String fallback = '']) {
  final text = value?.toString().trim() ?? '';
  return text.isEmpty ? fallback : text;
}

String _localizedName(Map<String, dynamic> row, String fallback) {
  final localizations = row['localizations'];
  if (localizations is List) {
    for (final entry in localizations) {
      if (entry is Map) {
        final locale = entry['locale']?.toString();
        if (locale == 'zh-CN' || locale == 'zh_CN') {
          final name = entry['displayName']?.toString() ?? entry['name']?.toString() ?? '';
          if (name.isNotEmpty) {
            return name;
          }
        }
      }
    }
    for (final entry in localizations) {
      if (entry is Map) {
        final name = entry['displayName']?.toString() ?? entry['name']?.toString() ?? '';
        if (name.isNotEmpty) {
          return name;
        }
      }
    }
  }
  return fallback;
}

String _localizedDescription(Map<String, dynamic> row) {
  final localizations = row['localizations'];
  if (localizations is List) {
    for (final entry in localizations) {
      if (entry is Map) {
        final locale = entry['locale']?.toString();
        if (locale == 'zh-CN' || locale == 'zh_CN') {
          final text =
              entry['description']?.toString() ?? entry['subtitle']?.toString() ?? '';
          if (text.isNotEmpty) {
            return text;
          }
        }
      }
    }
  }
  return '';
}
