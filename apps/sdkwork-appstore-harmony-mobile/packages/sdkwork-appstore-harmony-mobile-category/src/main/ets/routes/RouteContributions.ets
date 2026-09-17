import { SdkworkUiRouteContribution } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

/**
 * Route contributions for the category capability.
 *
 * Route ids are shared with the PC, H5, Flutter, and mini program roots
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7). The HarmonyOS
 * router maps each id to its own page path.
 */
export const CategoryRouteContributions: SdkworkUiRouteContribution[] = [
  { id: 'app.store.category.detail', surface: 'app', domain: 'store', capability: 'category', screen: 'detail', path: '/category/:id', titleKey: 'appstore.category.detail.title', auth: 'public', paramNames: ['id'] },
];
