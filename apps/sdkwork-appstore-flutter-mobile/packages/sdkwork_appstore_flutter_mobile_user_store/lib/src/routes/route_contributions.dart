import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

/// Route contributions for the user-store capability.
///
/// Route ids are shared with the PC, H5, mini program, and HarmonyOS roots
/// (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7). Flutter maps each
/// id to its own named route.
const List<SdkworkUiRouteContribution> user_storeRouteContributions =
    <SdkworkUiRouteContribution>[
  SdkworkUiRouteContribution(
    id: 'app.store.user-store.index',
    surface: SdkworkRouteSurface.app,
    domain: 'store',
    capability: 'user-store',
    screen: 'index',
    path: '/user-store',
    titleKey: 'appstore.user-store.index.title',
    auth: 'required',
  ),
  SdkworkUiRouteContribution(
    id: 'app.store.user-store.public',
    surface: SdkworkRouteSurface.app,
    domain: 'store',
    capability: 'user-store',
    screen: 'public',
    path: '/store/:shareToken',
    titleKey: 'appstore.user-store.public.title',
    auth: 'public',
    paramNames: <String>['shareToken'],
  ),
];
