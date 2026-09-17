import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/publisher_models.dart';

/// Publisher service.
///
/// The App Store app SDK clients are injected by the root bootstrap
/// (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
/// never issues raw HTTP.
class PublisherService {
  const PublisherService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'publisher';

  PublisherPageResult<Never> empty() =>
      const PublisherPageResult<Never>(items: <Never>[]);
}
