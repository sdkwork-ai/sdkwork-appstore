import 'package:sdkwork_appstore_sdk/sdkwork_appstore_sdk.dart';
import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/user_store_models.dart';

/// User Store service (owner + anonymous public share views).
///
/// Injected clients only; owner calls map to the generated Dart target of
/// `sdkwork-appstore-app-sdk` (userStore domain); the public view maps to the
/// generated Dart target of `sdkwork-appstore-sdk` (open-api userStores.public).
class UserStoreService {
  const UserStoreService({required this.clients, this.openClient});

  final AppstoreAppSdkClients clients;

  String get capability => 'user-store';

  /// Open-api transport for anonymous public share reads; bound by the root
  /// bootstrap alongside the app client.
  final SdkworkAppstoreOpenClient? openClient;

  /// Loads the signed-in user's custom categories.
  Future<List<UserStoreCategory>> loadCategories() async {
    clients.ensureTransportBound(capability);
    final response =
        await clients.requireAppClient.userStore.appstoreUserStoreCategoryList();
    return <UserStoreCategory>[
      for (final row in AppstoreAppSdkClients.itemsOf(response?.data))
        UserStoreCategory(
          id: _text(row['id']),
          name: _text(row['name'], '分类'),
          itemCount: int.tryParse(_text(row['itemCount'], '0')) ?? 0,
        ),
    ];
  }

  /// Creates a custom category; returns the created record.
  Future<UserStoreCategory> createCategory(String name) async {
    clients.ensureTransportBound(capability);
    final response = await clients.requireAppClient.userStore.appstoreUserStoreCategoryCreate(
      UserCategoryCreateRequest(name: name),
      DateTime.now().microsecondsSinceEpoch.toString(),
    );
    final row = AppstoreAppSdkClients.itemOf(response?.data) ?? const <String, dynamic>{};
    return UserStoreCategory(
      id: _text(row['id']),
      name: _text(row['name'], name),
      itemCount: int.tryParse(_text(row['itemCount'], '0')) ?? 0,
    );
  }

  /// Deletes a custom category and its收录 relations.
  Future<void> deleteCategory(String categoryId) async {
    clients.ensureTransportBound(capability);
    await clients.requireAppClient.userStore.appstoreUserStoreCategoryDelete(categoryId);
  }

  /// Loads the active share links of the signed-in user.
  Future<List<UserStoreShareLink>> loadShares() async {
    clients.ensureTransportBound(capability);
    final response =
        await clients.requireAppClient.userStore.appstoreUserStoreShareList();
    return <UserStoreShareLink>[
      for (final row in AppstoreAppSdkClients.itemsOf(response?.data))
        UserStoreShareLink(
          id: _text(row['id']),
          shareToken: _text(row['shareToken'], _text(row['share_token'])),
          title: _text(row['title'], '我的 Appstore'),
          status: _text(row['status'], 'active'),
          viewCount: _text(row['viewCount'] ?? row['view_count'], '0'),
        ),
    ];
  }

  /// Creates an unlisted share link over all categories.
  Future<UserStoreShareLink> createShare(String title) async {
    clients.ensureTransportBound(capability);
    final response = await clients.requireAppClient.userStore.appstoreUserStoreShareCreate(
      UserStoreShareCreateRequest(title: title, scope: 'all', visibility: 'unlisted'),
      DateTime.now().microsecondsSinceEpoch.toString(),
    );
    final row = AppstoreAppSdkClients.itemOf(response?.data) ?? const <String, dynamic>{};
    return UserStoreShareLink(
      id: _text(row['id']),
      shareToken: _text(row['shareToken'], _text(row['share_token'])),
      title: _text(row['title'], title),
      status: _text(row['status'], 'active'),
      viewCount: _text(row['viewCount'] ?? row['view_count'], '0'),
    );
  }

  /// Revokes (deletes) one share link.
  Future<void> revokeShare(String shareId) async {
    clients.ensureTransportBound(capability);
    await clients.requireAppClient.userStore.appstoreUserStoreShareDelete(shareId);
  }

  /// Loads the anonymous public view for [shareToken]; throws when the share
  /// does not exist / was revoked / expired (the backend merges all three into
  /// NotFound to prevent enumeration).
  Future<PublicUserStoreView> loadPublicView(String shareToken) async {
    final open = openClient;
    if (open == null) {
      throw const AppstoreServiceUnconfiguredException('user-store-public');
    }
    final view = await open.userStore.appstoreUserStoresPublicRetrieve(shareToken);
    final row = AppstoreAppSdkClients.itemOf(view?.data) ?? const <String, dynamic>{};
    final categories = row['categories'];
    final resolvedCategories = <PublicUserStoreCategory>[];
    if (categories is List) {
      for (final category in categories) {
        if (category is! Map) {
          continue;
        }
        final categoryId = (category['userCategoryId'] ?? category['id'] ?? '').toString();
        var apps = const <PublicUserStoreApp>[];
        if (categoryId.isNotEmpty) {
          final items = await open.userStore
              .appstoreUserStoresPublicItemsList(shareToken, categoryId)
              .catchError((Object error) => null);
          apps = <PublicUserStoreApp>[
            for (final appRow in AppstoreAppSdkClients.itemsOf(items?.data))
              PublicUserStoreApp(
                listingId: _text(appRow['listingId'], _text(appRow['listingSlug'])),
                title: _text(appRow['displayName'], _text(appRow['title'], '应用')),
                subtitle: _text(appRow['subtitle']),
              ),
          ];
        }
        resolvedCategories.add(
          PublicUserStoreCategory(
            id: categoryId,
            name: _text(category['name'], '分类'),
            apps: apps,
          ),
        );
      }
    }
    return PublicUserStoreView(
      shareToken: _text(row['shareToken'], shareToken),
      title: _text(row['title'], '个人 Appstore'),
      description: _text(row['description']),
      categories: resolvedCategories,
    );
  }
}

String _text(dynamic value, [String fallback = '']) {
  final text = value?.toString().trim() ?? '';
  return text.isEmpty ? fallback : text;
}
