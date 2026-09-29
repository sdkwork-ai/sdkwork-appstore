import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/games_models.dart';

/// Games hall service.
///
/// Injected clients only; data calls gate on the generated Dart SDK transport
/// binding (PC explicit-unconfigured-port pattern).
class GamesService {
  const GamesService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'games';

  /// Loads the games hall feed: board-game hall (with sub-filters), mini
  /// games, handheld games, and PC games sections.
  Future<GamesFeed> loadFeed() async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }
}
