import { SdkworkUiRouteContribution } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

/**
 * Route contributions for the updates capability.
 *
 * Route ids are shared with the PC, H5, Flutter, and mini program roots
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7). The HarmonyOS
 * router maps each id to its own page path.
 */
export const UpdatesRouteContributions: SdkworkUiRouteContribution[] = [
  { id: 'app.store.updates.index', surface: 'app', domain: 'store', capability: 'updates', screen: 'index', path: '/updates', titleKey: 'appstore.updates.index.title', auth: 'required' },
];
