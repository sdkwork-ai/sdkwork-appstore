import { SdkworkUiRouteContribution } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

/**
 * Route contributions for the charts capability.
 *
 * Route ids are shared with the PC, H5, Flutter, and mini program roots
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7). The HarmonyOS
 * router maps each id to its own page path.
 */
export const ChartsRouteContributions: SdkworkUiRouteContribution[] = [
  { id: 'app.store.charts.index', surface: 'app', domain: 'store', capability: 'charts', screen: 'index', path: '/charts', titleKey: 'appstore.charts.index.title', auth: 'public' },
];
