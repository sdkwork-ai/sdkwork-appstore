/// Canonical App Store route identity table.
///
/// Authority: `APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 1 — the same
/// route id names the same workflow in every client architecture. Cross-checked
/// against the PC root router
/// (`apps/sdkwork-appstore-pc/packages/sdkwork-appstore-pc-host/src/index.tsx`).
/// Client surface that owns the route.
enum SdkworkRouteSurface { app, console, admin }

/// Standard route contribution.
///
/// `APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7: route id, surface,
/// domain, capability, screen, title key, and auth hint are identical on every
/// client architecture that implements the same workflow. Route metadata never
/// declares HTTP API paths, SDK methods, or transport details.
class SdkworkUiRouteContribution {
  const SdkworkUiRouteContribution({
    required this.id,
    required this.surface,
    required this.domain,
    required this.capability,
    required this.screen,
    required this.path,
    required this.titleKey,
    required this.auth,
    this.paramNames = const <String>[],
  });

  final String id;
  final SdkworkRouteSurface surface;
  final String domain;
  final String capability;
  final String screen;
  final String path;
  final String titleKey;

  /// `public` or `required`; route guards remain a shell responsibility.
  final String auth;

  /// Path parameter names in path order.
  final List<String> paramNames;

  /// Presentation hint for this architecture.
  String get presentation => 'route';
}

const List<SdkworkUiRouteContribution> appstoreRouteTable =
    <SdkworkUiRouteContribution>[
  SdkworkUiRouteContribution(
    id: 'app.store.discover.index',
    surface: SdkworkRouteSurface.app,
    domain: 'store',
    capability: 'discover',
    screen: 'index',
    path: '/',
    titleKey: 'appstore.discover.index.title',
    auth: 'public',
  ),
  SdkworkUiRouteContribution(
    id: 'app.store.apps.index',
    surface: SdkworkRouteSurface.app,
    domain: 'store',
    capability: 'apps',
    screen: 'index',
    path: '/apps',
    titleKey: 'appstore.apps.index.title',
    auth: 'public',
  ),
  SdkworkUiRouteContribution(
    id: 'app.store.games.index',
    surface: SdkworkRouteSurface.app,
    domain: 'store',
    capability: 'games',
    screen: 'index',
    path: '/games',
    titleKey: 'appstore.games.index.title',
    auth: 'public',
  ),
  SdkworkUiRouteContribution(
    id: 'app.store.charts.index',
    surface: SdkworkRouteSurface.app,
    domain: 'store',
    capability: 'charts',
    screen: 'index',
    path: '/charts',
    titleKey: 'appstore.charts.index.title',
    auth: 'public',
  ),
  SdkworkUiRouteContribution(
    id: 'app.store.category.detail',
    surface: SdkworkRouteSurface.app,
    domain: 'store',
    capability: 'category',
    screen: 'detail',
    path: '/category/:id',
    titleKey: 'appstore.category.detail.title',
    auth: 'public',
    paramNames: <String>['id'],
  ),
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
  SdkworkUiRouteContribution(
    id: 'app.store.search.index',
    surface: SdkworkRouteSurface.app,
    domain: 'store',
    capability: 'search',
    screen: 'index',
    path: '/search',
    titleKey: 'appstore.search.index.title',
    auth: 'public',
  ),
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
  SdkworkUiRouteContribution(
    id: 'app.store.events.detail',
    surface: SdkworkRouteSurface.app,
    domain: 'store',
    capability: 'events',
    screen: 'detail',
    path: '/events/:id',
    titleKey: 'appstore.events.detail.title',
    auth: 'public',
    paramNames: <String>['id'],
  ),
  SdkworkUiRouteContribution(
    id: 'app.store.library.index',
    surface: SdkworkRouteSurface.app,
    domain: 'store',
    capability: 'library',
    screen: 'index',
    path: '/library',
    titleKey: 'appstore.library.index.title',
    auth: 'required',
  ),
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

List<SdkworkUiRouteContribution> listAppstoreRouteIdentities() =>
    appstoreRouteTable;

/// Path lookup by canonical route id.
String appstoreRoutePath(String routeId) {
  for (final route in appstoreRouteTable) {
    if (route.id == routeId) {
      return route.path;
    }
  }
  throw ArgumentError('unknown App Store route id: $routeId');
}
