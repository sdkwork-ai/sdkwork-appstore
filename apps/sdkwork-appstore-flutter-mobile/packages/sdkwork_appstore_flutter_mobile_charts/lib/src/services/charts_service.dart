import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/charts_models.dart';

/// Charts service.
///
/// Injected clients only; data calls gate on the generated Dart SDK transport
/// binding (PC explicit-unconfigured-port pattern). Ranking ids come from the
/// chart snapshot and are resolved back in listing order.
class ChartsService {
  const ChartsService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'charts';

  /// Loads the free or paid top chart; `kind` is `free` or `paid`.
  Future<List<ChartEntry>> loadChart(String kind) async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }
}
