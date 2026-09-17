import type { SdkworkUiRouteContribution } from '@sdkwork/appstore-h5-core';

/**
 * Route contributions owned by the console-settings capability package.
 *
 * Route ids are shared with the PC, Flutter, mini program, and HarmonyOS roots;
 * this package owns the H5 implementation of each of them
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7).
 */
export const consoleSettingsRouteContributions: readonly SdkworkUiRouteContribution[] = [
  { id: 'console.system.settings.index', surface: 'console', domain: 'system', capability: 'settings', screen: 'index', path: '/console/settings', titleKey: 'appstore.settings.index.title', auth: 'required', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"subpackagePage","harmonyNative":"page"} }
] as const;
