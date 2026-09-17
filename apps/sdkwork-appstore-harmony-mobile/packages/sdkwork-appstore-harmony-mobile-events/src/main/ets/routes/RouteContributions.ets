import { SdkworkUiRouteContribution } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

/**
 * Route contributions for the events capability.
 *
 * Route ids are shared with the PC, H5, Flutter, and mini program roots
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7). The HarmonyOS
 * router maps each id to its own page path.
 */
export const EventsRouteContributions: SdkworkUiRouteContribution[] = [
  { id: 'app.store.events.detail', surface: 'app', domain: 'store', capability: 'events', screen: 'detail', path: '/events/:id', titleKey: 'appstore.events.detail.title', auth: 'public', paramNames: ['id'] },
];
