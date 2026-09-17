import { SdkworkUiRouteContribution } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

/**
 * Route contributions for the library capability.
 *
 * Route ids are shared with the PC, H5, Flutter, and mini program roots
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7). The HarmonyOS
 * router maps each id to its own page path.
 */
export const LibraryRouteContributions: SdkworkUiRouteContribution[] = [
  { id: 'app.store.library.index', surface: 'app', domain: 'store', capability: 'library', screen: 'index', path: '/library', titleKey: 'appstore.library.index.title', auth: 'required' },
];
