import type { SdkworkUiRouteContribution } from '@sdkwork/appstore-h5-core';

/**
 * Route contributions owned by the library capability package.
 *
 * Route ids are shared with the PC, Flutter, mini program, and HarmonyOS roots;
 * this package owns the H5 implementation of each of them
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7).
 */
export const libraryRouteContributions: readonly SdkworkUiRouteContribution[] = [
  { id: 'app.store.library.index', surface: 'app', domain: 'store', capability: 'library', screen: 'index', path: '/library', titleKey: 'appstore.library.index.title', auth: 'required', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.updates.index', surface: 'app', domain: 'store', capability: 'updates', screen: 'index', path: '/updates', titleKey: 'appstore.updates.index.title', auth: 'required', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.wishlist.index', surface: 'app', domain: 'store', capability: 'wishlist', screen: 'index', path: '/wishlist', titleKey: 'appstore.wishlist.index.title', auth: 'required', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} }
] as const;
