import type { SdkworkUiRouteContribution } from "@sdkwork/appstore-mp-core";

/**
 * Route contributions for the publisher capability.
 *
 * Route ids are shared with the PC, H5, Flutter, and HarmonyOS roots
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7). The mini program
 * resolves each id through its own `pages` or `subpackages` map.
 */
export const publisherRouteContributions: readonly SdkworkUiRouteContribution[] = [
  { id: 'console.store.publisher.overview', surface: 'console', domain: 'store', capability: 'publisher', screen: 'overview', path: '/publisher', titleKey: 'appstore.publisher.overview.title', auth: 'required', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"subpackagePage","harmonyNative":"page"} },
  { id: 'console.store.publisher.app-create', surface: 'console', domain: 'store', capability: 'publisher', screen: 'app-create', path: '/publisher/apps/new', titleKey: 'appstore.publisher.app-create.title', auth: 'required', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"subpackagePage","harmonyNative":"page"} },
  { id: 'console.store.publisher.app-manage', surface: 'console', domain: 'store', capability: 'publisher', screen: 'app-manage', path: '/publisher/apps/:id', titleKey: 'appstore.publisher.app-manage.title', auth: 'required', params: [{ name: 'id', required: true }], presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"subpackagePage","harmonyNative":"page"} }
] as const;
