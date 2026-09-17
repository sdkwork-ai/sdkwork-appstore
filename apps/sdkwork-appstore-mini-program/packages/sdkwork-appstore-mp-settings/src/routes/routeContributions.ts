import type { SdkworkUiRouteContribution } from "@sdkwork/appstore-mp-core";

/**
 * Route contributions for the settings capability.
 *
 * Route ids are shared with the PC, H5, Flutter, and HarmonyOS roots
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7). The mini program
 * resolves each id through its own `pages` or `subpackages` map.
 */
export const settingsRouteContributions: readonly SdkworkUiRouteContribution[] = [
  { id: 'console.system.settings.index', surface: 'console', domain: 'system', capability: 'settings', screen: 'index', path: '/console/settings', titleKey: 'appstore.settings.index.title', auth: 'required', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"subpackagePage","harmonyNative":"page"} }
] as const;
