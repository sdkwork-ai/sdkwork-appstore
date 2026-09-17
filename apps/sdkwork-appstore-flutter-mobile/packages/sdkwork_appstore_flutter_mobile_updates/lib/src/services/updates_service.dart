import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/updates_models.dart';

/// Updates service.
///
/// The App Store app SDK clients are injected by the root bootstrap
/// (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
/// never issues raw HTTP.
class UpdatesService {
  const UpdatesService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'updates';

  UpdatesPageResult<Never> empty() =>
      const UpdatesPageResult<Never>(items: <Never>[]);
}
