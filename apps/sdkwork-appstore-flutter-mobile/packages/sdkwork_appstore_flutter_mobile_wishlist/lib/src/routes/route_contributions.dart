import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

/// Route contributions for the wishlist capability.
///
/// Route ids are shared with the PC, H5, mini program, and HarmonyOS roots
/// (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7). Flutter maps each
/// id to its own named route.
const List<SdkworkUiRouteContribution> wishlistRouteContributions =
    <SdkworkUiRouteContribution>[
  SdkworkUiRouteContribution(
    id: 'app.store.wishlist.index',
    surface: SdkworkRouteSurface.app,
    domain: 'store',
    capability: 'wishlist',
    screen: 'index',
    path: '/wishlist',
    titleKey: 'appstore.wishlist.index.title',
    auth: 'required',
  ),
];
