import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/app_detail_models.dart';

/// App detail service.
///
/// Injected clients only; data flows through the generated Dart target of
/// `sdkwork-appstore-app-sdk` (listings, wishlist, library domains).
class AppDetailService {
  const AppDetailService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'app-detail';

  /// Loads the full detail view model for [listingId].
  Future<AppDetail> loadDetail(String listingId) async {
    clients.ensureTransportBound(capability);
    final client = clients.requireAppClient;
    final listing = await client.listings.appstoreListingsRetrieve(listingId);
    final row = AppstoreAppSdkClients.itemOf(listing?.data);
    if (row == null) {
      throw StateError('应用不存在或已下架');
    }
    final similar = await client.listings
        .appstoreListingsSimilarList(listingId, null, 10)
        .catchError((Object error) => null);
    final more = await client.listings
        .appstoreListingsDeveloperOtherList(listingId, null, 6)
        .catchError((Object error) => null);
    final releases = await client.listings
        .appstoreListingsReleasesList(listingId)
        .catchError((Object error) => null);
    final ratings = await client.listings
        .appstoreListingsRatingsList(listingId, null, 1)
        .catchError((Object error) => null);

    final whatsNewRow = _firstRow(releases?.data);
    final ratingRow = AppstoreAppSdkClients.itemOf(ratings?.data);
    final ratingSummary = ratingRow?['summary'];
    final ratingValue = ratingSummary is Map
        ? (ratingSummary['average'] ?? ratingSummary['averageRating'])
        : row['averageRating'];

    return AppDetail(
      id: _text(row['listingSlug'], _text(row['id'], listingId)),
      name: _text(row['displayName'], _text(row['title'], '应用')),
      developer: _text(row['developerName'], _text(row['publisherName'], '')),
      rating: double.tryParse(_text(ratingValue)) ?? 0,
      ratingCount: int.tryParse(_text(row['ratingCount'], '0')) ?? 0,
      pricingModel: _text(row['pricingModel'], 'FREE'),
      chartRank: int.tryParse(_text(row['chartRank'], '0')) ?? 0,
      ageRating: _text(row['ageRating'], _text(row['age_rating'], '4+')),
      size: _text(row['fileSizeBytes']),
      description: _text(row['description']),
      whatsNew: AppWhatsNew(
        version: _text(whatsNewRow?['version']),
        date: _text(whatsNewRow?['releasedAt'], _text(whatsNewRow?['released_at'])),
        notes: _text(whatsNewRow?['notes']),
      ),
      infoRows: <AppInfoRow>[
        if (_text(row['sellerName'], _text(row['seller_name'])).isNotEmpty)
          AppInfoRow(label: '提供方', value: _text(row['sellerName'], _text(row['seller_name']))),
        if (_text(row['fileSizeBytes']).isNotEmpty)
          AppInfoRow(label: '大小', value: _text(row['fileSizeBytes'])),
        if (_text(row['currentVersion'], _text(row['current_version'])).isNotEmpty)
          AppInfoRow(
            label: '版本',
            value: _text(row['currentVersion'], _text(row['current_version'])),
          ),
        AppInfoRow(label: '语言', value: '中文 / English'),
      ],
      privacyLinked: _text(row['privacyPolicyUrl'], _text(row['privacy_policy_url'])).isNotEmpty,
      moreByDeveloper: _related(more?.data),
      similarApps: _related(similar?.data),
    );
  }

  /// Installs (acquires) the listing through the library domain.
  Future<void> install(String listingId) async {
    clients.ensureTransportBound(capability);
    final client = clients.requireAppClient;
    await client.library_.appstoreLibraryInstall(
      LibraryInstallRequest(listingId: listingId, platform: 'windows'),
      DateTime.now().microsecondsSinceEpoch.toString(),
    );
  }

  /// Adds or removes the listing from the wishlist; returns the new state.
  Future<bool> toggleWishlist(String listingId, {required bool add}) async {
    clients.ensureTransportBound(capability);
    final client = clients.requireAppClient;
    if (add) {
      await client.wishlist.appstoreWishlistItemsCreate(
        WishlistItemAddRequest(listingId: listingId),
        DateTime.now().microsecondsSinceEpoch.toString(),
      );
    } else {
      await client.wishlist.appstoreWishlistItemsDelete(listingId);
    }
    return add;
  }
}

Map<String, dynamic>? _firstRow(dynamic data) {
  final items = AppstoreAppSdkClients.itemsOf(data);
  return items.isEmpty ? null : items.first;
}

List<AppRelatedEntry> _related(dynamic data) => <AppRelatedEntry>[
      for (final row in AppstoreAppSdkClients.itemsOf(data))
        AppRelatedEntry(
          id: _text(row['listingSlug'], _text(row['id'])),
          title: _text(row['displayName'], _text(row['title'], '应用')),
          developer: _text(row['developerName'], _text(row['publisherName'], '')),
        ),
    ];

String _text(dynamic value, [String fallback = '']) {
  final text = value?.toString().trim() ?? '';
  return text.isEmpty ? fallback : text;
}
