import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/collection_models.dart';

/// Editorial collection service.
///
/// Injected clients only; data flows through the generated Dart target of
/// `sdkwork-appstore-app-sdk` (`catalog.collections.retrieve` + id-ordered
/// listing resolution).
class CollectionService {
  const CollectionService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'collection';

  /// Loads the collection detail with order-preserving listing cards for
  /// [collectionId].
  Future<CollectionDetail> loadDetail(String collectionId) async {
    clients.ensureTransportBound(capability);
    final client = clients.requireAppClient;
    final collection =
        await client.catalog.appstoreCatalogCollectionsRetrieve(collectionId);
    final row = AppstoreAppSdkClients.itemOf(collection?.data) ??
        const <String, dynamic>{};
    final apps = await _resolveApps(_entryListingIds(row));
    return CollectionDetail(
      id: collectionId,
      name: _localizedName(row, '精选合集'),
      description: _localizedDescription(row),
      apps: apps,
    );
  }

  Future<List<CollectionAppEntry>> _resolveApps(List<String> ids) async {
    final unique = ids.toSet().where((id) => id.isNotEmpty).take(50).toList();
    if (unique.isEmpty) {
      return const <CollectionAppEntry>[];
    }
    final response = await clients.requireAppClient.catalog
        .appstoreCatalogListingsList(null, null, unique.join(','), null, unique.length);
    final bySlug = <String, Map<String, dynamic>>{};
    for (final row in AppstoreAppSdkClients.itemsOf(response?.data)) {
      bySlug[_text(row['listingSlug'], _text(row['id']))] = row;
      bySlug[_text(row['id'])] = row;
    }
    final resolved = <CollectionAppEntry>[];
    for (final id in unique) {
      final row = bySlug[id];
      if (row == null) {
        continue;
      }
      resolved.add(
        CollectionAppEntry(
          id: _text(row['listingSlug'], _text(row['id'])),
          title: _text(row['displayName'], _text(row['title'], '应用')),
          developer: _text(row['developerName'], _text(row['publisherName'], '')),
        ),
      );
    }
    return resolved;
  }
}

List<String> _entryListingIds(Map<String, dynamic> row) {
  final items = row['items'];
  if (items is List) {
    return <String>[
      for (final entry in items)
        if (entry is Map) (entry['listingId'] ?? '').toString(),
    ].where((id) => id.isNotEmpty).toList();
  }
  return _text(row['listingIds'], _text(row['listing_ids']))
      .split(',')
      .map((id) => id.trim())
      .where((id) => id.isNotEmpty)
      .toList();
}

String _text(dynamic value, [String fallback = '']) {
  final text = value?.toString().trim() ?? '';
  return text.isEmpty ? fallback : text;
}

String _localizedName(Map<String, dynamic> row, String fallback) {
  final localizations = row['localizations'];
  if (localizations is List) {
    String? first;
    for (final entry in localizations) {
      if (entry is Map) {
        final name = entry['displayName']?.toString() ?? entry['name']?.toString() ?? '';
        final locale = entry['locale']?.toString();
        if ((locale == 'zh-CN' || locale == 'zh_CN') && name.isNotEmpty) {
          return name;
        }
        first ??= name.isEmpty ? null : name;
      }
    }
    if (first != null) {
      return first;
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
        final text =
            entry['description']?.toString() ?? entry['subtitle']?.toString() ?? '';
        if ((locale == 'zh-CN' || locale == 'zh_CN') && text.isNotEmpty) {
          return text;
        }
      }
    }
  }
  return '';
}
