import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/discover_models.dart';

/// Discover service.
///
/// The App Store app SDK clients are injected by the root bootstrap
/// (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
/// never issues raw HTTP. Every data call gates on the generated Dart SDK
/// transport binding — while it is unbound the call throws
/// [AppstoreServiceUnconfiguredException] and the screen renders its error
/// state, mirroring the PC root's explicit-unconfigured-port pattern.
class DiscoverService {
  const DiscoverService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'discover';

  /// Loads the storefront feed: hero picks, categories, editorial
  /// collections, active events, recently updated, recommendations.
  ///
  /// Backed by the catalog domain (`getHome`, `listCategories`,
  /// `listCollections`, `listEvents`, `listRecentlyUpdated`,
  /// `listRecommendations`) once the Dart SDK target is generated.
  Future<DiscoverFeed> loadFeed() async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }
}
