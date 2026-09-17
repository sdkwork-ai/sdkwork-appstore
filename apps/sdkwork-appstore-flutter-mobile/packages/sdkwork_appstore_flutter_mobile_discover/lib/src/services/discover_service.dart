import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/discover_models.dart';

/// Discover service.
///
/// The App Store app SDK clients are injected by the root bootstrap
/// (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
/// never issues raw HTTP.
class DiscoverService {
  const DiscoverService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'discover';

  DiscoverPageResult<Never> empty() =>
      const DiscoverPageResult<Never>(items: <Never>[]);
}
