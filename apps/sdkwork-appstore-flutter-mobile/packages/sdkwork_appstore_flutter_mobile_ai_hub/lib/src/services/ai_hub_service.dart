import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/ai_hub_models.dart';

/// Ai Hub service.
///
/// The App Store app SDK clients are injected by the root bootstrap
/// (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
/// never issues raw HTTP.
class AiHubService {
  const AiHubService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'ai-hub';

  AiHubPageResult<Never> empty() =>
      const AiHubPageResult<Never>(items: <Never>[]);
}
