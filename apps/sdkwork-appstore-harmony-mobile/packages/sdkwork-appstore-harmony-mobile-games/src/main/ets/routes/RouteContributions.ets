import { SdkworkUiRouteContribution } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

/**
 * Route contributions for the games capability.
 *
 * Route ids are shared with the PC, H5, Flutter, and mini program roots
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7). The HarmonyOS
 * router maps each id to its own page path.
 */
export const GamesRouteContributions: SdkworkUiRouteContribution[] = [
  { id: 'app.store.games.index', surface: 'app', domain: 'store', capability: 'games', screen: 'index', path: '/games', titleKey: 'appstore.games.index.title', auth: 'public' },
];
