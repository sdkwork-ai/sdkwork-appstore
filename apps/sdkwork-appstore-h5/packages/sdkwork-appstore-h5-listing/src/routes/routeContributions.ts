import type { SdkworkUiRouteContribution } from '@sdkwork/appstore-h5-core';

/**
 * Route contributions owned by the listing capability package.
 *
 * Route ids are shared with the PC, Flutter, mini program, and HarmonyOS roots;
 * this package owns the H5 implementation of each of them
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7).
 */
export const listingRouteContributions: readonly SdkworkUiRouteContribution[] = [
  { id: 'app.store.app-detail.detail', surface: 'app', domain: 'store', capability: 'app-detail', screen: 'detail', path: '/app/:id', titleKey: 'appstore.app-detail.detail.title', auth: 'public', params: [{ name: 'id', required: true }], presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.events.detail', surface: 'app', domain: 'store', capability: 'events', screen: 'detail', path: '/events/:id', titleKey: 'appstore.events.detail.title', auth: 'public', params: [{ name: 'id', required: true }], presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} }
] as const;
