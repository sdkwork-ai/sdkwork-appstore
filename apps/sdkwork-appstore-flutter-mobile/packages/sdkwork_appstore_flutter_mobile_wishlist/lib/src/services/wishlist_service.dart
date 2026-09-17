import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/wishlist_models.dart';

/// Wishlist service.
///
/// The App Store app SDK clients are injected by the root bootstrap
/// (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
/// never issues raw HTTP.
class WishlistService {
  const WishlistService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'wishlist';

  WishlistPageResult<Never> empty() =>
      const WishlistPageResult<Never>(items: <Never>[]);
}
