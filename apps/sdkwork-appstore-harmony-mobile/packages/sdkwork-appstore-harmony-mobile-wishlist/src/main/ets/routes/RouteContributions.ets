import { SdkworkUiRouteContribution } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

/**
 * Route contributions for the wishlist capability.
 *
 * Route ids are shared with the PC, H5, Flutter, and mini program roots
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7). The HarmonyOS
 * router maps each id to its own page path.
 */
export const WishlistRouteContributions: SdkworkUiRouteContribution[] = [
  { id: 'app.store.wishlist.index', surface: 'app', domain: 'store', capability: 'wishlist', screen: 'index', path: '/wishlist', titleKey: 'appstore.wishlist.index.title', auth: 'required' },
];
