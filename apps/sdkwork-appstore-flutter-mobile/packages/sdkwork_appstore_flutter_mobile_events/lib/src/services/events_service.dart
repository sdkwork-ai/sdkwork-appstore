import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/events_models.dart';

/// Events service.
///
/// The App Store app SDK clients are injected by the root bootstrap
/// (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
/// never issues raw HTTP.
class EventsService {
  const EventsService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'events';

  EventsPageResult<Never> empty() =>
      const EventsPageResult<Never>(items: <Never>[]);
}
