import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/apps_models.dart';

/// Apps browse service.
///
/// Injected clients only; data flows through the generated Dart target of
/// `sdkwork-appstore-app-sdk` (catalog search listings, keyset paged).
class AppsService {
  const AppsService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'apps';

  /// Loads one keyset page of the apps catalog, optionally filtered by
  /// subcategory keyword.
  Future<AppsListPage> loadPage({String? cursor, String category = ''}) async {
    clients.ensureTransportBound(capability);
    final response = await clients.requireAppClient.catalog
        .appstoreCatalogListingsList(
      category.isEmpty || category == '全部' ? null : category,
      null,
      null,
      cursor,
      50,
    );
    final items = <AppsListEntry>[
      for (final row in AppstoreAppSdkClients.itemsOf(response?.data))
        AppsListEntry(
          id: _text(row['listingSlug'], _text(row['id'])),
          title: _text(row['displayName'], _text(row['title'], '应用')),
          subtitle: _text(row['developerName'], _text(row['publisherName'], '')),
        ),
    ];
    return AppsListPage(
      items: items,
      nextCursor: AppstoreAppSdkClients.nextCursorOf(response?.data),
    );
  }
}

String _text(dynamic value, [String fallback = '']) {
  final text = value?.toString().trim() ?? '';
  return text.isEmpty ? fallback : text;
}
