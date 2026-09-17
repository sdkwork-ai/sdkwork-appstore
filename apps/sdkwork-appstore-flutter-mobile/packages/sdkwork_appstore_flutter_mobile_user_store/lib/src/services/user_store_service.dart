import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/user_store_models.dart';

/// User Store service.
///
/// The App Store app SDK clients are injected by the root bootstrap
/// (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
/// never issues raw HTTP.
class UserStoreService {
  const UserStoreService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'user-store';

  UserStorePageResult<Never> empty() =>
      const UserStorePageResult<Never>(items: <Never>[]);
}
