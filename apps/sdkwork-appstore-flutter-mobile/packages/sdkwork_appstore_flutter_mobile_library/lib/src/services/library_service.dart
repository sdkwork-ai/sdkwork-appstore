import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/library_models.dart';

/// Library service.
///
/// The App Store app SDK clients are injected by the root bootstrap
/// (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
/// never issues raw HTTP.
class LibraryService {
  const LibraryService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'library';

  LibraryPageResult<Never> empty() =>
      const LibraryPageResult<Never>(items: <Never>[]);
}
