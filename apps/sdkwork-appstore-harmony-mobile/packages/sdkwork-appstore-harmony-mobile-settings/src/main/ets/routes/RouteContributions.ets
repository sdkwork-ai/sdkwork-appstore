import { SdkworkUiRouteContribution } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

/**
 * Route contributions for the settings capability.
 *
 * Route ids are shared with the PC, H5, Flutter, and mini program roots
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7). The HarmonyOS
 * router maps each id to its own page path.
 */
export const SettingsRouteContributions: SdkworkUiRouteContribution[] = [
  { id: 'console.system.settings.index', surface: 'console', domain: 'system', capability: 'settings', screen: 'index', path: '/console/settings', titleKey: 'appstore.settings.index.title', auth: 'required' },
];
