import { SdkworkUiRouteContribution } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

/**
 * Route contributions for the user-store capability.
 *
 * Route ids are shared with the PC, H5, Flutter, and mini program roots
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7). The HarmonyOS
 * router maps each id to its own page path.
 */
export const UserStoreRouteContributions: SdkworkUiRouteContribution[] = [
  { id: 'app.store.user-store.index', surface: 'app', domain: 'store', capability: 'user-store', screen: 'index', path: '/user-store', titleKey: 'appstore.user-store.index.title', auth: 'required' },
  { id: 'app.store.user-store.public', surface: 'app', domain: 'store', capability: 'user-store', screen: 'public', path: '/store/:shareToken', titleKey: 'appstore.user-store.public.title', auth: 'public', paramNames: ['shareToken'] },
];
