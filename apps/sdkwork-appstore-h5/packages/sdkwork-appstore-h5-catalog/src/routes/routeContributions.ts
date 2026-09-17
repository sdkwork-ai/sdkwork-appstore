import type { SdkworkUiRouteContribution } from '@sdkwork/appstore-h5-core';

/**
 * Route contributions owned by the catalog capability package.
 *
 * Route ids are shared with the PC, Flutter, mini program, and HarmonyOS roots;
 * this package owns the H5 implementation of each of them
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7).
 */
export const catalogRouteContributions: readonly SdkworkUiRouteContribution[] = [
  { id: 'app.store.discover.index', surface: 'app', domain: 'store', capability: 'discover', screen: 'index', path: '/', titleKey: 'appstore.discover.index.title', auth: 'public', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.apps.index', surface: 'app', domain: 'store', capability: 'apps', screen: 'index', path: '/apps', titleKey: 'appstore.apps.index.title', auth: 'public', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.games.index', surface: 'app', domain: 'store', capability: 'games', screen: 'index', path: '/games', titleKey: 'appstore.games.index.title', auth: 'public', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.charts.index', surface: 'app', domain: 'store', capability: 'charts', screen: 'index', path: '/charts', titleKey: 'appstore.charts.index.title', auth: 'public', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.category.detail', surface: 'app', domain: 'store', capability: 'category', screen: 'detail', path: '/category/:id', titleKey: 'appstore.category.detail.title', auth: 'public', params: [{ name: 'id', required: true }], presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.collection.detail', surface: 'app', domain: 'store', capability: 'collection', screen: 'detail', path: '/collection/:id', titleKey: 'appstore.collection.detail.title', auth: 'public', params: [{ name: 'id', required: true }], presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} }
] as const;
