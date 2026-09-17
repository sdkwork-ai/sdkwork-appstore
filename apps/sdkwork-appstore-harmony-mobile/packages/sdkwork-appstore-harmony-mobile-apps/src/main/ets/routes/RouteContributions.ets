import { SdkworkUiRouteContribution } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

/**
 * Route contributions for the apps capability.
 *
 * Route ids are shared with the PC, H5, Flutter, and mini program roots
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7). The HarmonyOS
 * router maps each id to its own page path.
 */
export const AppsRouteContributions: SdkworkUiRouteContribution[] = [
  { id: 'app.store.apps.index', surface: 'app', domain: 'store', capability: 'apps', screen: 'index', path: '/apps', titleKey: 'appstore.apps.index.title', auth: 'public' },
];
