import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/settings_models.dart';

/// Settings service.
///
/// The App Store app SDK clients are injected by the root bootstrap
/// (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
/// never issues raw HTTP.
class SettingsService {
  const SettingsService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'settings';

  SettingsPageResult<Never> empty() =>
      const SettingsPageResult<Never>(items: <Never>[]);
}
