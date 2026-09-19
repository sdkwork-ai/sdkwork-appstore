/**
 * Canonical App Store route identity table for the H5 root.
 *
 * Authority: `APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7 — the id
 * format is `<surface>.<domain>.<capability>.<screen>` and the same route id
 * names the same workflow in every client architecture. Cross-checked against
 * the PC root router `AppstorePcRoutes`
 * (`apps/sdkwork-appstore-pc/packages/sdkwork-appstore-pc-embed/src/index.tsx`).
 *
 * Physical paths are this root's own; only the ids and the path parameter
 * names are shared contracts.
 */
/** Where each architecture renders this route. */
export interface SdkworkRoutePresentation {
  readonly pc?: "page" | "drawer" | "dialog";
  readonly h5Mobile?: "stack" | "tab" | "modal" | "sheet";
  readonly flutterMobile?: "route" | "tab" | "bottomSheet";
  readonly miniProgram?: "page" | "subpackagePage";
  readonly harmonyNative?: "page" | "tab" | "dialog" | "sheet";
}

/**
 * Standard route contribution.
 *
 * `APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7: route id, surface,
 * domain, capability, screen, title key, and auth hint are identical on every
 * client architecture that implements the same workflow. Route metadata never
 * declares HTTP API paths, SDK methods, or transport details.
 */
export interface SdkworkUiRouteContribution {
  readonly id: string;
  readonly surface: "app" | "console" | "admin";
  readonly domain: string;
  readonly capability: string;
  readonly screen: string;
  readonly path: string;
  readonly titleKey: string;
  readonly auth: "public" | "required";
  readonly permissionHint?: string;
  readonly params?: ReadonlyArray<{ readonly name: string; readonly required: boolean }>;
  readonly presentation?: SdkworkRoutePresentation;
}

export const APPSTORE_H5_ROUTE_TABLE: readonly SdkworkUiRouteContribution[] = [
  { id: 'app.store.discover.index', surface: 'app', domain: 'store', capability: 'discover', screen: 'index', path: '/', titleKey: 'appstore.discover.index.title', auth: 'public', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.apps.index', surface: 'app', domain: 'store', capability: 'apps', screen: 'index', path: '/apps', titleKey: 'appstore.apps.index.title', auth: 'public', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.games.index', surface: 'app', domain: 'store', capability: 'games', screen: 'index', path: '/games', titleKey: 'appstore.games.index.title', auth: 'public', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.charts.index', surface: 'app', domain: 'store', capability: 'charts', screen: 'index', path: '/charts', titleKey: 'appstore.charts.index.title', auth: 'public', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.category.detail', surface: 'app', domain: 'store', capability: 'category', screen: 'detail', path: '/category/:id', titleKey: 'appstore.category.detail.title', auth: 'public', params: [{ name: 'id', required: true }], presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.collection.detail', surface: 'app', domain: 'store', capability: 'collection', screen: 'detail', path: '/collection/:id', titleKey: 'appstore.collection.detail.title', auth: 'public', params: [{ name: 'id', required: true }], presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.ai-hub.index', surface: 'app', domain: 'store', capability: 'ai-hub', screen: 'index', path: '/ai-hub', titleKey: 'appstore.ai-hub.index.title', auth: 'public', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.ai-hub.experts', surface: 'app', domain: 'store', capability: 'ai-hub', screen: 'experts', path: '/experts', titleKey: 'appstore.ai-hub.experts.title', auth: 'public', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.ai-hub.plugins', surface: 'app', domain: 'store', capability: 'ai-hub', screen: 'plugins', path: '/plugins', titleKey: 'appstore.ai-hub.plugins.title', auth: 'public', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.ai-hub.skills', surface: 'app', domain: 'store', capability: 'ai-hub', screen: 'skills', path: '/skills', titleKey: 'appstore.ai-hub.skills.title', auth: 'public', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.ai-hub.mcp', surface: 'app', domain: 'store', capability: 'ai-hub', screen: 'mcp', path: '/mcp', titleKey: 'appstore.ai-hub.mcp.title', auth: 'public', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.ai-hub.templates', surface: 'app', domain: 'store', capability: 'ai-hub', screen: 'templates', path: '/templates', titleKey: 'appstore.ai-hub.templates.title', auth: 'public', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.ai-hub.template-detail', surface: 'app', domain: 'store', capability: 'ai-hub', screen: 'template-detail', path: '/template/:id', titleKey: 'appstore.ai-hub.template-detail.title', auth: 'public', params: [{ name: 'id', required: true }], presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.ai-hub.template-detail-alias', surface: 'app', domain: 'store', capability: 'ai-hub', screen: 'template-detail-alias', path: '/templates/:id', titleKey: 'appstore.ai-hub.template-detail-alias.title', auth: 'public', params: [{ name: 'id', required: true }], presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.search.index', surface: 'app', domain: 'store', capability: 'search', screen: 'index', path: '/search', titleKey: 'appstore.search.index.title', auth: 'public', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.app-detail.detail', surface: 'app', domain: 'store', capability: 'app-detail', screen: 'detail', path: '/app/:id', titleKey: 'appstore.app-detail.detail.title', auth: 'public', params: [{ name: 'id', required: true }], presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.events.detail', surface: 'app', domain: 'store', capability: 'events', screen: 'detail', path: '/events/:id', titleKey: 'appstore.events.detail.title', auth: 'public', params: [{ name: 'id', required: true }], presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.library.index', surface: 'app', domain: 'store', capability: 'library', screen: 'index', path: '/library', titleKey: 'appstore.library.index.title', auth: 'required', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.updates.index', surface: 'app', domain: 'store', capability: 'updates', screen: 'index', path: '/updates', titleKey: 'appstore.updates.index.title', auth: 'required', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.wishlist.index', surface: 'app', domain: 'store', capability: 'wishlist', screen: 'index', path: '/wishlist', titleKey: 'appstore.wishlist.index.title', auth: 'required', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.user-store.index', surface: 'app', domain: 'store', capability: 'user-store', screen: 'index', path: '/user-store', titleKey: 'appstore.user-store.index.title', auth: 'required', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.user-store.public', surface: 'app', domain: 'store', capability: 'user-store', screen: 'public', path: '/store/:shareToken', titleKey: 'appstore.user-store.public.title', auth: 'public', params: [{ name: 'shareToken', required: true }], presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'console.store.publisher.overview', surface: 'console', domain: 'store', capability: 'publisher', screen: 'overview', path: '/publisher', titleKey: 'appstore.publisher.overview.title', auth: 'required', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"subpackagePage","harmonyNative":"page"} },
  { id: 'console.store.publisher.app-create', surface: 'console', domain: 'store', capability: 'publisher', screen: 'app-create', path: '/publisher/apps/new', titleKey: 'appstore.publisher.app-create.title', auth: 'required', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"subpackagePage","harmonyNative":"page"} },
  { id: 'console.store.publisher.app-manage', surface: 'console', domain: 'store', capability: 'publisher', screen: 'app-manage', path: '/publisher/apps/:id', titleKey: 'appstore.publisher.app-manage.title', auth: 'required', params: [{ name: 'id', required: true }], presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"subpackagePage","harmonyNative":"page"} },
  { id: 'console.system.settings.index', surface: 'console', domain: 'system', capability: 'settings', screen: 'index', path: '/console/settings', titleKey: 'appstore.settings.index.title', auth: 'required', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"subpackagePage","harmonyNative":"page"} }
] as const;

export function listAppstoreRouteIdentities(): readonly SdkworkUiRouteContribution[] {
  return APPSTORE_H5_ROUTE_TABLE;
}

/** Path lookup by canonical route id. */
export function appstoreRoutePath(routeId: string): string {
  const entry = APPSTORE_H5_ROUTE_TABLE.find((item) => item.id === routeId);
  if (!entry) {
    throw new Error(`unknown App Store route id: ${routeId}`);
  }
  return entry.path;
}
