import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/wishlist_models.dart';

/// Wishlist service.
///
/// Injected clients only; data calls gate on the generated Dart SDK transport
/// binding (PC explicit-unconfigured-port pattern). Backed by
/// `wishlist.listItems/addItem/removeItem` once the Dart SDK target is
/// generated.
class WishlistService {
  const WishlistService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'wishlist';

  /// Loads the signed-in user's saved listings.
  Future<List<WishlistEntry>> loadWishlist() async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }

  /// Removes one listing from the wishlist.
  Future<void> remove(String listingId) async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }
}
