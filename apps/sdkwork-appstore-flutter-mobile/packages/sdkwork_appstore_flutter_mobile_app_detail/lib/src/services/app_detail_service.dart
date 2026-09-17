import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/app_detail_models.dart';

/// App Detail service.
///
/// The App Store app SDK clients are injected by the root bootstrap
/// (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
/// never issues raw HTTP.
class AppDetailService {
  const AppDetailService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'app-detail';

  AppDetailPageResult<Never> empty() =>
      const AppDetailPageResult<Never>(items: <Never>[]);
}
