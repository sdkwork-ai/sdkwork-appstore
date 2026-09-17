import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

/// Route contributions for the app-detail capability.
///
/// Route ids are shared with the PC, H5, mini program, and HarmonyOS roots
/// (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7). Flutter maps each
/// id to its own named route.
const List<SdkworkUiRouteContribution> app_detailRouteContributions =
    <SdkworkUiRouteContribution>[
  SdkworkUiRouteContribution(
    id: 'app.store.app-detail.detail',
    surface: SdkworkRouteSurface.app,
    domain: 'store',
    capability: 'app-detail',
    screen: 'detail',
    path: '/app/:id',
    titleKey: 'appstore.app-detail.detail.title',
    auth: 'public',
    paramNames: <String>['id'],
  ),
];
