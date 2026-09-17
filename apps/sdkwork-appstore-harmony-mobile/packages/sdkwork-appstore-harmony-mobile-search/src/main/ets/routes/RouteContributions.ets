import { SdkworkUiRouteContribution } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

/**
 * Route contributions for the search capability.
 *
 * Route ids are shared with the PC, H5, Flutter, and mini program roots
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7). The HarmonyOS
 * router maps each id to its own page path.
 */
export const SearchRouteContributions: SdkworkUiRouteContribution[] = [
  { id: 'app.store.search.index', surface: 'app', domain: 'store', capability: 'search', screen: 'index', path: '/search', titleKey: 'appstore.search.index.title', auth: 'public' },
];
