import type { SdkworkUiRouteContribution } from "@sdkwork/appstore-mp-core";

/**
 * Route contributions for the search capability.
 *
 * Route ids are shared with the PC, H5, Flutter, and HarmonyOS roots
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7). The mini program
 * resolves each id through its own `pages` or `subpackages` map.
 */
export const searchRouteContributions: readonly SdkworkUiRouteContribution[] = [
  { id: 'app.store.search.index', surface: 'app', domain: 'store', capability: 'search', screen: 'index', path: '/search', titleKey: 'appstore.search.index.title', auth: 'public', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} }
] as const;
