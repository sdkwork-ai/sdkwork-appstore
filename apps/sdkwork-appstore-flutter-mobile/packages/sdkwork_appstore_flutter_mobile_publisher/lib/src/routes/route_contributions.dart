import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

/// Route contributions for the publisher capability.
///
/// Route ids are shared with the PC, H5, mini program, and HarmonyOS roots
/// (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7). Flutter maps each
/// id to its own named route.
const List<SdkworkUiRouteContribution> publisherRouteContributions =
    <SdkworkUiRouteContribution>[
  SdkworkUiRouteContribution(
    id: 'console.store.publisher.overview',
    surface: SdkworkRouteSurface.console,
    domain: 'store',
    capability: 'publisher',
    screen: 'overview',
    path: '/publisher',
    titleKey: 'appstore.publisher.overview.title',
    auth: 'required',
  ),
  SdkworkUiRouteContribution(
    id: 'console.store.publisher.app-create',
    surface: SdkworkRouteSurface.console,
    domain: 'store',
    capability: 'publisher',
    screen: 'app-create',
    path: '/publisher/apps/new',
    titleKey: 'appstore.publisher.app-create.title',
    auth: 'required',
  ),
  SdkworkUiRouteContribution(
    id: 'console.store.publisher.app-manage',
    surface: SdkworkRouteSurface.console,
    domain: 'store',
    capability: 'publisher',
    screen: 'app-manage',
    path: '/publisher/apps/:id',
    titleKey: 'appstore.publisher.app-manage.title',
    auth: 'required',
    paramNames: <String>['id'],
  ),
];
