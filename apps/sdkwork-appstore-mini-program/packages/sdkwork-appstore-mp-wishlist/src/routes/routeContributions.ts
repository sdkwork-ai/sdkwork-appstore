import type { SdkworkUiRouteContribution } from "@sdkwork/appstore-mp-core";

/**
 * Route contributions for the wishlist capability.
 *
 * Route ids are shared with the PC, H5, Flutter, and HarmonyOS roots
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7). The mini program
 * resolves each id through its own `pages` or `subpackages` map.
 */
export const wishlistRouteContributions: readonly SdkworkUiRouteContribution[] = [
  { id: 'app.store.wishlist.index', surface: 'app', domain: 'store', capability: 'wishlist', screen: 'index', path: '/wishlist', titleKey: 'appstore.wishlist.index.title', auth: 'required', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} }
] as const;
