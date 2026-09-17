import type { SdkworkUiRouteContribution } from '@sdkwork/appstore-h5-core';

/**
 * Route contributions owned by the user-store capability package.
 *
 * Route ids are shared with the PC, Flutter, mini program, and HarmonyOS roots;
 * this package owns the H5 implementation of each of them
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7).
 */
export const userStoreRouteContributions: readonly SdkworkUiRouteContribution[] = [
  { id: 'app.store.user-store.index', surface: 'app', domain: 'store', capability: 'user-store', screen: 'index', path: '/user-store', titleKey: 'appstore.user-store.index.title', auth: 'required', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.user-store.public', surface: 'app', domain: 'store', capability: 'user-store', screen: 'public', path: '/store/:shareToken', titleKey: 'appstore.user-store.public.title', auth: 'public', params: [{ name: 'shareToken', required: true }], presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} }
] as const;
