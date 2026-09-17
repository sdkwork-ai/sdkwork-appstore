import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

/// Route contributions for the ai-hub capability.
///
/// Route ids are shared with the PC, H5, mini program, and HarmonyOS roots
/// (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7). Flutter maps each
/// id to its own named route.
const List<SdkworkUiRouteContribution> ai_hubRouteContributions =
    <SdkworkUiRouteContribution>[
  SdkworkUiRouteContribution(
    id: 'app.store.ai-hub.index',
    surface: SdkworkRouteSurface.app,
    domain: 'store',
    capability: 'ai-hub',
    screen: 'index',
    path: '/ai-hub',
    titleKey: 'appstore.ai-hub.index.title',
    auth: 'public',
  ),
  SdkworkUiRouteContribution(
    id: 'app.store.ai-hub.experts',
    surface: SdkworkRouteSurface.app,
    domain: 'store',
    capability: 'ai-hub',
    screen: 'experts',
    path: '/experts',
    titleKey: 'appstore.ai-hub.experts.title',
    auth: 'public',
  ),
  SdkworkUiRouteContribution(
    id: 'app.store.ai-hub.plugins',
    surface: SdkworkRouteSurface.app,
    domain: 'store',
    capability: 'ai-hub',
    screen: 'plugins',
    path: '/plugins',
    titleKey: 'appstore.ai-hub.plugins.title',
    auth: 'public',
  ),
  SdkworkUiRouteContribution(
    id: 'app.store.ai-hub.skills',
    surface: SdkworkRouteSurface.app,
    domain: 'store',
    capability: 'ai-hub',
    screen: 'skills',
    path: '/skills',
    titleKey: 'appstore.ai-hub.skills.title',
    auth: 'public',
  ),
  SdkworkUiRouteContribution(
    id: 'app.store.ai-hub.mcp',
    surface: SdkworkRouteSurface.app,
    domain: 'store',
    capability: 'ai-hub',
    screen: 'mcp',
    path: '/mcp',
    titleKey: 'appstore.ai-hub.mcp.title',
    auth: 'public',
  ),
  SdkworkUiRouteContribution(
    id: 'app.store.ai-hub.templates',
    surface: SdkworkRouteSurface.app,
    domain: 'store',
    capability: 'ai-hub',
    screen: 'templates',
    path: '/templates',
    titleKey: 'appstore.ai-hub.templates.title',
    auth: 'public',
  ),
  SdkworkUiRouteContribution(
    id: 'app.store.ai-hub.template-detail',
    surface: SdkworkRouteSurface.app,
    domain: 'store',
    capability: 'ai-hub',
    screen: 'template-detail',
    path: '/template/:id',
    titleKey: 'appstore.ai-hub.template-detail.title',
    auth: 'public',
    paramNames: <String>['id'],
  ),
  SdkworkUiRouteContribution(
    id: 'app.store.ai-hub.template-detail-alias',
    surface: SdkworkRouteSurface.app,
    domain: 'store',
    capability: 'ai-hub',
    screen: 'template-detail-alias',
    path: '/templates/:id',
    titleKey: 'appstore.ai-hub.template-detail-alias.title',
    auth: 'public',
    paramNames: <String>['id'],
  ),
];
