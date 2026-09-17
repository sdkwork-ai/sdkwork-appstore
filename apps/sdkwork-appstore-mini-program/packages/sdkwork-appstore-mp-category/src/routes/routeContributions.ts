import type { SdkworkUiRouteContribution } from "@sdkwork/appstore-mp-core";

/**
 * Route contributions for the category capability.
 *
 * Route ids are shared with the PC, H5, Flutter, and HarmonyOS roots
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7). The mini program
 * resolves each id through its own `pages` or `subpackages` map.
 */
export const categoryRouteContributions: readonly SdkworkUiRouteContribution[] = [
  { id: 'app.store.category.detail', surface: 'app', domain: 'store', capability: 'category', screen: 'detail', path: '/category/:id', titleKey: 'appstore.category.detail.title', auth: 'public', params: [{ name: 'id', required: true }], presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} }
] as const;
