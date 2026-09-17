import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/search_models.dart';

/// Search service.
///
/// The App Store app SDK clients are injected by the root bootstrap
/// (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
/// never issues raw HTTP.
class SearchService {
  const SearchService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'search';

  SearchPageResult<Never> empty() =>
      const SearchPageResult<Never>(items: <Never>[]);
}
