import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/apps_models.dart';

/// Apps browse service.
///
/// Injected clients only; data calls gate on the generated Dart SDK transport
/// binding and throw [AppstoreServiceUnconfiguredException] while unbound
/// (PC explicit-unconfigured-port pattern).
class AppsService {
  const AppsService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'apps';

  /// Loads one keyset page of the apps catalog, optionally filtered by
  /// subcategory (backed by `catalog.searchListings` cursor paging).
  Future<AppsListPage> loadPage({String? cursor, String category = ''}) async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }
}
