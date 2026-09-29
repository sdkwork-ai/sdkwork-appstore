import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/category_models.dart';

/// Category service.
///
/// Injected clients only; data calls gate on the generated Dart SDK transport
/// binding (PC explicit-unconfigured-port pattern). Backed by
/// `catalog.getCategory` + `catalog.searchListings({categoryId})` once the
/// Dart SDK target is generated.
class CategoryService {
  const CategoryService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'category';

  /// Loads the category detail and its listing page for [categoryId].
  Future<CategoryDetail> loadDetail(String categoryId) async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }
}
