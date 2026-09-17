import type { SdkworkUiRouteContribution } from '@sdkwork/appstore-h5-core';

/**
 * Route contributions owned by the console-publisher capability package.
 *
 * Route ids are shared with the PC, Flutter, mini program, and HarmonyOS roots;
 * this package owns the H5 implementation of each of them
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7).
 */
export const consolePublisherRouteContributions: readonly SdkworkUiRouteContribution[] = [
  { id: 'console.store.publisher.overview', surface: 'console', domain: 'store', capability: 'publisher', screen: 'overview', path: '/publisher', titleKey: 'appstore.publisher.overview.title', auth: 'required', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"subpackagePage","harmonyNative":"page"} },
  { id: 'console.store.publisher.app-create', surface: 'console', domain: 'store', capability: 'publisher', screen: 'app-create', path: '/publisher/apps/new', titleKey: 'appstore.publisher.app-create.title', auth: 'required', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"subpackagePage","harmonyNative":"page"} },
  { id: 'console.store.publisher.app-manage', surface: 'console', domain: 'store', capability: 'publisher', screen: 'app-manage', path: '/publisher/apps/:id', titleKey: 'appstore.publisher.app-manage.title', auth: 'required', params: [{ name: 'id', required: true }], presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"subpackagePage","harmonyNative":"page"} }
] as const;
