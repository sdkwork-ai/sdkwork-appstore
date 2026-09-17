import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/games_models.dart';

/// Games service.
///
/// The App Store app SDK clients are injected by the root bootstrap
/// (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
/// never issues raw HTTP.
class GamesService {
  const GamesService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'games';

  GamesPageResult<Never> empty() =>
      const GamesPageResult<Never>(items: <Never>[]);
}
