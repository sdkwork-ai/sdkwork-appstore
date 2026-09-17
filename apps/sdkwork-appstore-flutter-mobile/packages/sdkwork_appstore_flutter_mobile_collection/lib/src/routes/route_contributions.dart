import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

/// Route contributions for the collection capability.
///
/// Route ids are shared with the PC, H5, mini program, and HarmonyOS roots
/// (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7). Flutter maps each
/// id to its own named route.
const List<SdkworkUiRouteContribution> collectionRouteContributions =
    <SdkworkUiRouteContribution>[
  SdkworkUiRouteContribution(
    id: 'app.store.collection.detail',
    surface: SdkworkRouteSurface.app,
    domain: 'store',
    capability: 'collection',
    screen: 'detail',
    path: '/collection/:id',
    titleKey: 'appstore.collection.detail.title',
    auth: 'public',
    paramNames: <String>['id'],
  ),
];
