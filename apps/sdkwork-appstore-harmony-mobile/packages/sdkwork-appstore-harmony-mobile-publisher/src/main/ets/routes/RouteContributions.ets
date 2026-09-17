import { SdkworkUiRouteContribution } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

/**
 * Route contributions for the publisher capability.
 *
 * Route ids are shared with the PC, H5, Flutter, and mini program roots
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7). The HarmonyOS
 * router maps each id to its own page path.
 */
export const PublisherRouteContributions: SdkworkUiRouteContribution[] = [
  { id: 'console.store.publisher.overview', surface: 'console', domain: 'store', capability: 'publisher', screen: 'overview', path: '/publisher', titleKey: 'appstore.publisher.overview.title', auth: 'required' },
  { id: 'console.store.publisher.app-create', surface: 'console', domain: 'store', capability: 'publisher', screen: 'app-create', path: '/publisher/apps/new', titleKey: 'appstore.publisher.app-create.title', auth: 'required' },
  { id: 'console.store.publisher.app-manage', surface: 'console', domain: 'store', capability: 'publisher', screen: 'app-manage', path: '/publisher/apps/:id', titleKey: 'appstore.publisher.app-manage.title', auth: 'required', paramNames: ['id'] },
];
