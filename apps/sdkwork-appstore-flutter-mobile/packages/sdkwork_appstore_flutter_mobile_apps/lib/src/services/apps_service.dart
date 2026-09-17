import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/apps_models.dart';

/// Apps service.
///
/// The App Store app SDK clients are injected by the root bootstrap
/// (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
/// never issues raw HTTP.
class AppsService {
  const AppsService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'apps';

  AppsPageResult<Never> empty() =>
      const AppsPageResult<Never>(items: <Never>[]);
}
