import { describe, expect, it } from 'vitest';

import type { AppstoreAdminCapabilityModule } from '../routes/types';
import { createAppstoreAdminModuleRegistry } from './index';

function module(
  id: string,
  titleKey: string,
  routes: AppstoreAdminCapabilityModule['routes'],
  i18nNamespaces: readonly string[] = [`admin${id}`],
): AppstoreAdminCapabilityModule {
  return { id, titleKey, routes, i18nNamespaces };
}

const modules: readonly AppstoreAdminCapabilityModule[] = [
  module('market', 'adminMarket.title', [
    {
      id: 'market.channels',
      path: 'market/channels',
      requiredPermissions: ['appstore.market_channels.read'],
      render: () => null,
      nav: { labelKey: 'adminMarket.channels.title', group: 'distribution', order: 10 },
    },
  ]),
  module('dashboard', 'adminDashboard.title', [
    {
      id: 'dashboard.overview',
      path: 'dashboard',
      requiredPermissions: ['appstore.analytics.operator'],
      render: () => null,
      nav: { labelKey: 'adminDashboard.overview.title', group: 'insight', order: 10 },
    },
    {
      id: 'dashboard.search',
      path: 'dashboard/search',
      requiredPermissions: ['appstore.analytics.operator'],
      render: () => null,
      nav: { labelKey: 'adminDashboard.search.title', group: 'insight', order: 20 },
    },
  ]),
  module('moderation', 'adminModeration.title', [
    {
      id: 'moderation.queue',
      path: 'moderation/queue',
      requiredPermissions: ['appstore.moderation.read'],
      render: () => null,
      nav: { labelKey: 'adminModeration.queue.title', group: 'governance', order: 20 },
    },
    {
      id: 'moderation.reviews',
      path: 'moderation/reviews/:reviewId',
      requiredPermissions: ['appstore.moderation.read'],
      render: () => null,
    },
    {
      id: 'moderation.hidden',
      path: 'moderation/hidden',
      requiredPermissions: [],
      render: () => null,
      nav: {
        labelKey: 'adminModeration.hidden.title',
        group: 'governance',
        order: 1,
        hidden: true,
      },
    },
  ]),
];

describe('admin module registry', () => {
  const registry = createAppstoreAdminModuleRegistry(modules);

  it('resolves a capability module by id', () => {
    expect(registry.getModule('moderation')?.titleKey).toBe('adminModeration.title');
    expect(registry.getModule('unknown')).toBeUndefined();
  });

  it('flattens every route in module declaration order', () => {
    expect(registry.listRoutes().map((route) => route.id)).toEqual([
      'market.channels',
      'dashboard.overview',
      'dashboard.search',
      'moderation.queue',
      'moderation.reviews',
      'moderation.hidden',
    ]);
  });

  it('orders the sidebar by navigation group then route order', () => {
    expect(registry.listNavigation('/admin').map((entry) => entry.routeId)).toEqual([
      'dashboard.overview',
      'dashboard.search',
      'moderation.queue',
      'market.channels',
    ]);
    expect(registry.listNavigation('/admin')[0]).toEqual({
      routeId: 'dashboard.overview',
      path: '/admin/dashboard',
      labelKey: 'adminDashboard.overview.title',
      group: 'insight',
      order: 10,
      capabilityId: 'dashboard',
    });
  });

  it('keeps detail and hidden routes out of the sidebar', () => {
    const routeIds = registry.listNavigation('/admin').map((entry) => entry.routeId);
    expect(routeIds).not.toContain('moderation.reviews');
    expect(routeIds).not.toContain('moderation.hidden');
  });

  it('normalizes the prefix when building absolute navigation paths', () => {
    expect(registry.listNavigation('/admin/')[0]?.path).toBe('/admin/dashboard');
  });

  it('de-duplicates locale namespaces across modules', () => {
    const withSharedNamespace = createAppstoreAdminModuleRegistry([
      module('dashboard', 'adminDashboard.title', [], ['adminShared', 'adminDashboard']),
      module('listings', 'adminListings.title', [], ['adminShared', 'adminListings']),
    ]);

    expect(withSharedNamespace.listI18nNamespaces()).toEqual([
      'adminShared',
      'adminDashboard',
      'adminListings',
    ]);
  });

  it('exposes the original modules for composition assertions', () => {
    expect(registry.modules).toEqual(modules);
  });
});
