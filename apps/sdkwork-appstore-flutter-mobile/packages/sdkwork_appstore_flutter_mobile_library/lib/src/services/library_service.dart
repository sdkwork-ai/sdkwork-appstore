import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/library_models.dart';

/// Library service.
///
/// Injected clients only; data calls gate on the generated Dart SDK transport
/// binding (PC explicit-unconfigured-port pattern). Backed by
/// `library.listItems` and `library.uninstall` once the Dart SDK target is
/// generated.
class LibraryService {
  const LibraryService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'library';

  /// Loads the installed library of the signed-in user.
  Future<List<LibraryEntry>> loadInstalled() async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }

  /// Uninstalls one installed listing.
  Future<void> uninstall(String listingId) async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }
}
