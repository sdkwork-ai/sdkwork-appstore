import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/app_detail_models.dart';

/// App detail service.
///
/// Injected clients only; data calls gate on the generated Dart SDK transport
/// binding (PC explicit-unconfigured-port pattern). Backed by
/// `listings.get/listSimilar/listMedia/listReleases/listRatings`,
/// `wishlist.addItem/removeItem`, and `library.install` once the Dart SDK
/// target is generated.
class AppDetailService {
  const AppDetailService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'app-detail';

  /// Loads the full detail view model for [listingId].
  Future<AppDetail> loadDetail(String listingId) async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }

  /// Installs (acquires) the listing through the library domain.
  Future<void> install(String listingId) async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }

  /// Adds or removes the listing from the wishlist; returns the new state.
  Future<bool> toggleWishlist(String listingId, {required bool add}) async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }
}
