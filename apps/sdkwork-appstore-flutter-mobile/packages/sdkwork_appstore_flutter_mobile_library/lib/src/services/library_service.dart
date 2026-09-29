import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/library_models.dart';

/// Library service.
///
/// Injected clients only; data flows through the generated Dart target of
/// `sdkwork-appstore-app-sdk` (library domain).
class LibraryService {
  const LibraryService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'library';

  /// Loads the installed library of the signed-in user.
  Future<List<LibraryEntry>> loadInstalled() async {
    clients.ensureTransportBound(capability);
    final response =
        await clients.requireAppClient.library_.appstoreLibraryItemsList(null, 200);
    return <LibraryEntry>[
      for (final row in AppstoreAppSdkClients.itemsOf(response?.data))
        LibraryEntry(
          listingId: _text(row['listingId'], _text(row['listing_slug'])),
          title: _text(row['displayName'], _text(row['title'], '应用')),
          libraryItemId: _text(row['id']),
          developer: _text(row['developerName'], _text(row['publisherName'], '')),
          installedVersion: _text(row['installedVersion'], _text(row['installed_version'])),
        ),
    ];
  }

  /// Uninstalls one installed listing.
  Future<void> uninstall(String listingId) async {
    clients.ensureTransportBound(capability);
    await clients.requireAppClient.library_.appstoreLibraryUninstall(
      LibraryUninstallRequest(libraryItemId: listingId),
    );
  }
}

String _text(dynamic value, [String fallback = '']) {
  final text = value?.toString().trim() ?? '';
  return text.isEmpty ? fallback : text;
}
