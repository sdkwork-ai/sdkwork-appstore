import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/updates_models.dart';

/// Updates service.
///
/// Injected clients only; data calls gate on the generated Dart SDK transport
/// binding (PC explicit-unconfigured-port pattern). Backed by
/// `library.checkUpdates` and drive-signed artifact downloads once the Dart
/// SDK target is generated.
class UpdatesService {
  const UpdatesService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'updates';

  /// Loads pending updates for the installed library.
  Future<List<PendingUpdateEntry>> loadPendingUpdates() async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }

  /// Updates one listing; returns the resolved download URL when available.
  Future<String?> update(String listingId) async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }
}
