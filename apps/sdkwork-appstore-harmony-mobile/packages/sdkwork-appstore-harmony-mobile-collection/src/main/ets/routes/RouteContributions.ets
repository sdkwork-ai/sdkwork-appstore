import { SdkworkUiRouteContribution } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

/**
 * Route contributions for the collection capability.
 *
 * Route ids are shared with the PC, H5, Flutter, and mini program roots
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7). The HarmonyOS
 * router maps each id to its own page path.
 */
export const CollectionRouteContributions: SdkworkUiRouteContribution[] = [
  { id: 'app.store.collection.detail', surface: 'app', domain: 'store', capability: 'collection', screen: 'detail', path: '/collection/:id', titleKey: 'appstore.collection.detail.title', auth: 'public', paramNames: ['id'] },
];
