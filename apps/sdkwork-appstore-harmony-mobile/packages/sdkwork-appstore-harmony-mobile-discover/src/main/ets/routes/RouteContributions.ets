import { SdkworkUiRouteContribution } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

/**
 * Route contributions for the discover capability.
 *
 * Route ids are shared with the PC, H5, Flutter, and mini program roots
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7). The HarmonyOS
 * router maps each id to its own page path.
 */
export const DiscoverRouteContributions: SdkworkUiRouteContribution[] = [
  { id: 'app.store.discover.index', surface: 'app', domain: 'store', capability: 'discover', screen: 'index', path: '/', titleKey: 'appstore.discover.index.title', auth: 'public' },
];
