import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/publisher_models.dart';

/// Publisher console service (overview / app-create / app-manage).
///
/// Injected clients only; data calls gate on the generated Dart SDK transport
/// binding (PC explicit-unconfigured-port pattern). Backed by
/// `publishers.getMe/listMyListings`, `publishers.me.apps.create`, and
/// `releases.*` once the Dart SDK target is generated.
class PublisherService {
  const PublisherService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'publisher';

  /// Loads the signed-in publisher's listings (console overview).
  Future<List<PublisherListingRow>> loadMyListings() async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }

  /// Bootstraps a new publisher app draft.
  Future<PublisherListingRow> createApp({
    required String displayName,
    required String appKey,
    String platform = 'windows',
  }) async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }

  /// Loads releases of one managed listing.
  Future<List<PublisherReleaseRow>> loadReleases(String listingId) async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }
}
