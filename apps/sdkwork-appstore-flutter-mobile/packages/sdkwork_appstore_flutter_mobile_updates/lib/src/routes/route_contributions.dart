import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

/// Route contributions for the updates capability.
///
/// Route ids are shared with the PC, H5, mini program, and HarmonyOS roots
/// (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7). Flutter maps each
/// id to its own named route.
const List<SdkworkUiRouteContribution> updatesRouteContributions =
    <SdkworkUiRouteContribution>[
  SdkworkUiRouteContribution(
    id: 'app.store.updates.index',
    surface: SdkworkRouteSurface.app,
    domain: 'store',
    capability: 'updates',
    screen: 'index',
    path: '/updates',
    titleKey: 'appstore.updates.index.title',
    auth: 'required',
  ),
];
