import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/user_store_models.dart';

/// User Store service (owner + anonymous public share views).
///
/// Injected clients only; data calls gate on the generated Dart SDK transport
/// binding (PC explicit-unconfigured-port pattern). Owner calls map to
/// `userStore.category/item/share`; public views map to the open-api
/// `userStores.public` surface once the Dart SDK targets are generated.
class UserStoreService {
  const UserStoreService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'user-store';

  /// Loads the signed-in user's custom categories.
  Future<List<UserStoreCategory>> loadCategories() async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }

  /// Creates a custom category; returns the created record.
  Future<UserStoreCategory> createCategory(String name) async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }

  /// Deletes a custom category and its收录 relations.
  Future<void> deleteCategory(String categoryId) async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }

  /// Loads the active share links of the signed-in user.
  Future<List<UserStoreShareLink>> loadShares() async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }

  /// Creates an unlisted share link over all categories.
  Future<UserStoreShareLink> createShare(String title) async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }

  /// Revokes (deletes) one share link.
  Future<void> revokeShare(String shareId) async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }

  /// Loads the anonymous public view for [shareToken]; throws when the share
  /// does not exist / was revoked / expired (the backend merges all three into
  /// NotFound to prevent enumeration).
  Future<PublicUserStoreView> loadPublicView(String shareToken) async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }
}
