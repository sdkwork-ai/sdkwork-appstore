import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/events_models.dart';

/// Store event service.
///
/// Injected clients only; data calls gate on the generated Dart SDK transport
/// binding (PC explicit-unconfigured-port pattern). Backed by
/// `catalog.getEvent` + id-ordered listing resolution.
class EventsService {
  const EventsService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'events';

  /// Loads the event detail with order-preserving participating listings for
  /// [eventId].
  Future<EventDetail> loadDetail(String eventId) async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }
}
