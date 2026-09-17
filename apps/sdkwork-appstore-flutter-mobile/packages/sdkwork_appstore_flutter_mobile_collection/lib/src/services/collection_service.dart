import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/collection_models.dart';

/// Collection service.
///
/// The App Store app SDK clients are injected by the root bootstrap
/// (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
/// never issues raw HTTP.
class CollectionService {
  const CollectionService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'collection';

  CollectionPageResult<Never> empty() =>
      const CollectionPageResult<Never>(items: <Never>[]);
}
