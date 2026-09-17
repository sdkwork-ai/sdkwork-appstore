import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/charts_models.dart';

/// Charts service.
///
/// The App Store app SDK clients are injected by the root bootstrap
/// (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
/// never issues raw HTTP.
class ChartsService {
  const ChartsService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'charts';

  ChartsPageResult<Never> empty() =>
      const ChartsPageResult<Never>(items: <Never>[]);
}
