import type { SdkworkUiRouteContribution } from "@sdkwork/appstore-mp-core";

/**
 * Route contributions for the updates capability.
 *
 * Route ids are shared with the PC, H5, Flutter, and HarmonyOS roots
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7). The mini program
 * resolves each id through its own `pages` or `subpackages` map.
 */
export const updatesRouteContributions: readonly SdkworkUiRouteContribution[] = [
  { id: 'app.store.updates.index', surface: 'app', domain: 'store', capability: 'updates', screen: 'index', path: '/updates', titleKey: 'appstore.updates.index.title', auth: 'required', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} }
] as const;
