import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/wishlist_models.dart';

/// Wishlist service.
///
/// Injected clients only; data flows through the generated Dart target of
/// `sdkwork-appstore-app-sdk` (wishlist domain).
class WishlistService {
  const WishlistService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'wishlist';

  /// Loads the signed-in user's saved listings.
  Future<List<WishlistEntry>> loadWishlist() async {
    clients.ensureTransportBound(capability);
    final response =
        await clients.requireAppClient.wishlist.appstoreWishlistItemsList(null, 200);
    return <WishlistEntry>[
      for (final row in AppstoreAppSdkClients.itemsOf(response?.data))
        WishlistEntry(
          listingId: _text(row['listingId'], _text(row['listing_slug'])),
          title: _text(row['displayName'], _text(row['title'], '应用')),
          developer: _text(row['developerName'], _text(row['publisherName'], '')),
        ),
    ];
  }

  /// Removes one listing from the wishlist.
  Future<void> remove(String listingId) async {
    clients.ensureTransportBound(capability);
    await clients.requireAppClient.wishlist.appstoreWishlistItemsDelete(listingId);
  }
}

String _text(dynamic value, [String fallback = '']) {
  final text = value?.toString().trim() ?? '';
  return text.isEmpty ? fallback : text;
}
