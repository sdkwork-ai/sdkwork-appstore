import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/publisher_models.dart';

/// Publisher console service (overview / app-create / app-manage).
///
/// Injected clients only; data flows through the generated Dart target of
/// `sdkwork-appstore-app-sdk` (publishers + releases domains).
class PublisherService {
  const PublisherService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'publisher';

  /// Loads the signed-in publisher's listings (console overview).
  Future<List<PublisherListingRow>> loadMyListings() async {
    clients.ensureTransportBound(capability);
    final response =
        await clients.requireAppClient.publishers.appstorePublishersMeListingsList(null, 50);
    return <PublisherListingRow>[
      for (final row in AppstoreAppSdkClients.itemsOf(response?.data))
        PublisherListingRow(
          id: _text(row['id']),
          title: _text(row['displayName'], _text(row['title'], '应用')),
          status: _text(row['listingStatus'], _text(row['listing_status'], _text(row['status']))),
          currentVersion:
              _text(row['currentVersion'], _text(row['current_version'])),
        ),
    ];
  }

  /// Bootstraps a new publisher app draft.
  ///
  /// [appType] follows the storefront app-type dictionary (`APP`/`PLUGIN`),
  /// not a platform code. [defaultLocale] is a required contract field
  /// (PublisherAppBootstrapRequest).
  Future<PublisherListingRow> createApp({
    required String displayName,
    required String appKey,
    String appType = 'APP',
    String defaultLocale = 'zh-CN',
  }) async {
    clients.ensureTransportBound(capability);
    final response = await clients.requireAppClient.publishers.appstorePublishersMeAppsCreate(
      PublisherAppBootstrapRequest(
        displayName: displayName,
        appKey: appKey,
        defaultLocale: defaultLocale,
        appType: appType,
      ),
      DateTime.now().microsecondsSinceEpoch.toString(),
    );
    final row = AppstoreAppSdkClients.itemOf(response?.data) ?? const <String, dynamic>{};
    final listing = row['listing'];
    final listingMap = listing is Map
        ? listing.map((key, value) => MapEntry(key.toString(), value))
        : row;
    return PublisherListingRow(
      id: _text(listingMap['id']),
      title: _text(listingMap['displayName'], displayName),
      status: _text(listingMap['status'], 'draft'),
      currentVersion: _text(listingMap['currentVersion']),
    );
  }

  /// Loads releases of one managed listing.
  Future<List<PublisherReleaseRow>> loadReleases(String listingId) async {
    clients.ensureTransportBound(capability);
    final response = await clients.requireAppClient.listings
        .appstoreListingsReleasesList(listingId, null, 50);
    return <PublisherReleaseRow>[
      for (final row in AppstoreAppSdkClients.itemsOf(response?.data))
        PublisherReleaseRow(
          id: _text(row['id']),
          // Release schema: versionName/versionCode/releaseStatus (snake_case
          // fallbacks for the pass-through mapper).
          version: _text(
            row['versionName'],
            _text(row['version_name'], _text(row['versionCode'], _text(row['version_code'], '0.0.0'))),
          ),
          status: _text(row['releaseStatus'], _text(row['release_status'])),
          notes: _text(row['releaseNotes'], _text(row['release_notes'])),
        ),
    ];
  }

  /// Creates a new release draft for one listing (channel `production` is the
  /// seeded channel_code).
  Future<PublisherReleaseRow> createRelease({
    required String listingId,
    required String versionName,
    required String versionCode,
    String channelCode = 'production',
  }) async {
    clients.ensureTransportBound(capability);
    final response = await clients.requireAppClient.releases.appstoreReleasesCreate(
      listingId,
      ReleaseCreateRequest(
        channelCode: channelCode,
        versionName: versionName,
        versionCode: versionCode,
      ),
      DateTime.now().microsecondsSinceEpoch.toString(),
    );
    final row = AppstoreAppSdkClients.itemOf(response?.data) ?? const <String, dynamic>{};
    return PublisherReleaseRow(
      id: _text(row['id']),
      version: _text(row['versionName'], versionName),
      status: _text(row['releaseStatus'], _text(row['release_status'], 'draft')),
    );
  }

  /// Submits a RELEASE review submission for one listing release.
  Future<void> submitReleaseForReview({
    required String listingId,
    required String releaseId,
  }) async {
    clients.ensureTransportBound(capability);
    await clients.requireAppClient.listings.appstoreListingsSubmissionsCreate(
      listingId,
      ListingSubmissionCreateRequest(
        submissionType: 'RELEASE',
        releaseId: releaseId,
      ),
      DateTime.now().microsecondsSinceEpoch.toString(),
    );
  }
}

String _text(dynamic value, [String fallback = '']) {
  final text = value?.toString().trim() ?? '';
  return text.isEmpty ? fallback : text;
}
