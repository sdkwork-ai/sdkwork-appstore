import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/category_models.dart';

/// Category service.
///
/// The App Store app SDK clients are injected by the root bootstrap
/// (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
/// never issues raw HTTP.
class CategoryService {
  const CategoryService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'category';

  CategoryPageResult<Never> empty() =>
      const CategoryPageResult<Never>(items: <Never>[]);
}
