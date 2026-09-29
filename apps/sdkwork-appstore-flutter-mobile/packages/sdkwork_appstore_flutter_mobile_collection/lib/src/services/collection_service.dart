import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/collection_models.dart';

/// Editorial collection service.
///
/// Injected clients only; data calls gate on the generated Dart SDK transport
/// binding (PC explicit-unconfigured-port pattern). Backed by
/// `catalog.getCollection` + id-ordered `catalog.searchListings({ids})`.
class CollectionService {
  const CollectionService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'collection';

  /// Loads the collection detail with order-preserving listing cards for
  /// [collectionId].
  Future<CollectionDetail> loadDetail(String collectionId) async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }
}
