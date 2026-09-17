import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

/// Route contributions for the settings capability.
///
/// Route ids are shared with the PC, H5, mini program, and HarmonyOS roots
/// (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7). Flutter maps each
/// id to its own named route.
const List<SdkworkUiRouteContribution> settingsRouteContributions =
    <SdkworkUiRouteContribution>[
  SdkworkUiRouteContribution(
    id: 'console.system.settings.index',
    surface: SdkworkRouteSurface.console,
    domain: 'system',
    capability: 'settings',
    screen: 'index',
    path: '/console/settings',
    titleKey: 'appstore.settings.index.title',
    auth: 'required',
  ),
];
