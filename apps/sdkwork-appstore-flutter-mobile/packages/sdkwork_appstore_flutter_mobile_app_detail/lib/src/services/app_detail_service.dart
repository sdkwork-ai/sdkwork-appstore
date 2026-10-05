import 'dart:convert';

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
    // Hydrate the wishlist heart from the server; unauthenticated callers
    // keep the default (unsaved) state.
    final wishlist = await client.wishlist.appstoreWishlistItemsList(null, 200).catchError(
        (Object error) => null);
    final wishlistRows = AppstoreAppSdkClients.itemsOf(wishlist?.data);
    final inWishlist = wishlistRows.any(
      (row) => _text(row['listingId'], _text(row['listing_id'])) == listingId,
    );

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
      inWishlist: inWishlist,
      pricingModel: _text(row['pricingModel'], _text(row['pricing_model'], 'FREE')),
      platforms: _platformCodesOf(row),
      accessUrl: _text(row['accessUrl'], _text(row['access_url'])),
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
      LibraryInstallRequest(listingId: listingId, platform: appstorePlatformCode),
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

  /// Resolves a presigned installer download for [listingId] on this
  /// platform: latest published artifact → download grant → consume → URL.
  /// Returns null when the listing has no installer artifact (web/H5
  /// distributions open accessUrl instead).
  Future<String?> resolveInstallerDownload(String listingId) async {
    clients.ensureTransportBound(capability);
    final client = clients.requireAppClient;

    final check = await client.library_.appstoreLibraryUpdatesCheck(
      LibraryUpdatesCheckRequest(
        items: <Map<String, dynamic>>[
          {
            'appKey': listingId,
            'platform': appstorePlatformCode,
            'installedVersionCode': '0',
          },
        ],
      ),
    );
    final checkRow = AppstoreAppSdkClients.itemOf(check?.data) ?? const <String, dynamic>{};
    final checkItems = checkRow['items'];
    String? artifactId;
    if (checkItems is List) {
      for (final row in checkItems) {
        if (row is Map &&
            _text(row['appKey']) == listingId &&
            _text(row['artifactId']).isNotEmpty) {
          artifactId = _text(row['artifactId']);
          break;
        }
      }
    }
    if (artifactId == null) {
      return null;
    }

    final idempotencyKey = DateTime.now().microsecondsSinceEpoch.toString();
    final grantResponse = await client.downloadGrants.appstoreDownloadGrantsCreate(
      DownloadGrantCreateRequest(artifactId: artifactId),
      idempotencyKey,
    );
    final grantRow = AppstoreAppSdkClients.itemOf(grantResponse?.data) ?? const <String, dynamic>{};
    final grantId = _text(grantRow['id']);
    if (grantId.isEmpty) {
      return null;
    }

    final consumed = await client.downloadGrants
        .appstoreDownloadGrantsConsume(grantId)
        .catchError((Object error) => null);
    final consumedRow = AppstoreAppSdkClients.itemOf(consumed?.data) ?? const <String, dynamic>{};
    final delivery = consumedRow['delivery'];
    if (delivery is Map) {
      final normalized =
          delivery.map((key, value) => MapEntry(key.toString(), value));
      final url = _text(normalized['downloadUrl'], _text(normalized['download_url']));
      if (url.isNotEmpty) {
        return url;
      }
    }
    return null;
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

/// Raw platform codes of the listing (list or JSON-array text; the backend
/// serializes `platforms` without a case rename).
List<String> _platformCodesOf(Map<String, dynamic> row) {
  final raw = row['platforms'] ?? row['platform_codes'];
  if (raw is List) {
    return <String>[
      for (final entry in raw)
        if (entry != null && entry.toString().trim().isNotEmpty)
          entry.toString().trim(),
    ];
  }
  final text = raw?.toString().trim() ?? '';
  if (text.startsWith('[')) {
    try {
      final decoded = jsonDecode(text);
      if (decoded is List) {
        return <String>[
          for (final entry in decoded)
            if (entry != null && entry.toString().trim().isNotEmpty)
              entry.toString().trim(),
        ];
      }
    } catch (_) {
      // fall through to the empty default
    }
  }
  return const <String>[];
}
