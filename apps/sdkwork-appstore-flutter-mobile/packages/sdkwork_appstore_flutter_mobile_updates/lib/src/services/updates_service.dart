import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/updates_models.dart';

/// Updates service.
///
/// Injected clients only; data flows through the generated Dart target of
/// `sdkwork-appstore-app-sdk` (library updates check + wishlist cross-check).
class UpdatesService {
  const UpdatesService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'updates';

  /// Loads pending updates for the installed library.
  Future<List<PendingUpdateEntry>> loadPendingUpdates() async {
    clients.ensureTransportBound(capability);
    final client = clients.requireAppClient;
    final installed =
        await client.library_.appstoreLibraryItemsList(null, 200).catchError((Object error) => null);
    final installRows = AppstoreAppSdkClients.itemsOf(installed?.data);
    if (installRows.isEmpty) {
      return const <PendingUpdateEntry>[];
    }
    // The check contract is per-item: every installed row carries its app key,
    // platform, and installed version so the server can match releases.
    final check = await client.library_.appstoreLibraryUpdatesCheck(
      LibraryUpdatesCheckRequest(
        items: <Map<String, dynamic>>[
          for (final row in installRows)
            {
              'appKey': _pick(row, const ['appKey', 'app_key']),
              'platform': _pick(row, const ['platform'], appstorePlatformCode),
              'installedVersionCode': _pick(
                row,
                const ['installedVersionCode', 'installed_version_code'],
                '0',
              ),
            },
        ],
      ),
    );
    final checkRow = AppstoreAppSdkClients.itemOf(check?.data) ?? const <String, dynamic>{};
    final checkItems = checkRow['items'];
    final byAppKey = <String, Map<String, dynamic>>{
      if (checkItems is List)
        for (final row in checkItems)
          if (row is Map) (row['appKey'] ?? '').toString(): _normalize(row),
    };
    return <PendingUpdateEntry>[
      for (final row in installRows)
        if (byAppKey[_text(row['appKey'])] != null)
          PendingUpdateEntry(
            listingId: _text(row['listingId'], _text(row['listing_slug'])),
            title: _text(row['displayName'], _text(row['title'], '应用')),
            developer: _text(row['developerName'], _text(row['publisherName'], '')),
            currentVersion: _text(row['installedVersion'], _text(row['installed_version'])),
            availableVersion:
                _text(byAppKey[_text(row['appKey'])]!['latestVersion'], _text(byAppKey[_text(row['appKey'])]!['latest_version'])),
          ),
    ];
  }

  /// Updates one listing; returns the resolved download URL when available.
  Future<String?> update(String listingId) async {
    clients.ensureTransportBound(capability);
    await clients.requireAppClient.library_.appstoreLibraryInstall(
      LibraryInstallRequest(listingId: listingId, platform: appstorePlatformCode),
      DateTime.now().microsecondsSinceEpoch.toString(),
    );
    return null;
  }
}

Map<String, dynamic> _normalize(Map row) =>
    row.map((key, value) => MapEntry(key.toString(), value));

/// First non-empty value among the candidate keys (backend rows may carry
/// camelCase or snake_case depending on the mapper), falling back when all
/// are empty.
String _pick(Map<String, dynamic> row, List<String> keys, [String fallback = '']) {
  for (final key in keys) {
    final text = row[key]?.toString().trim() ?? '';
    if (text.isNotEmpty) {
      return text;
    }
  }
  return fallback;
}

String _text(dynamic value, [String fallback = '']) {
  final text = value?.toString().trim() ?? '';
  return text.isEmpty ? fallback : text;
}
