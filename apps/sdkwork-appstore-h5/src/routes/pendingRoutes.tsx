import { lazy } from 'react';
import { Route } from 'react-router-dom';
import type { ReactElement } from 'react';

import {
  listAppstoreRouteIdentities,
  type SdkworkUiRouteContribution,
} from '@sdkwork/appstore-h5-core';

import { RoutePlaceholder } from './RoutePlaceholder';

/**
 * Canonical route ids the application root mounts explicitly in `App.tsx`
 * under its own screen components.
 *
 * Everything NOT listed here is mounted by `pendingRouteElements` below, so a
 * route added to the shared table but not to `App.tsx` still renders (either
 * through an override here or as a visible placeholder) instead of silently
 * 404ing.
 */
export const EXPLICIT_ROUTE_IDS: readonly string[] = [
  'app.store.discover.index',
  'app.store.charts.index',
  'app.store.category.detail',
  'app.store.collection.detail',
  'app.store.ai-hub.index',
  'app.store.ai-hub.experts',
  'app.store.ai-hub.plugins',
  'app.store.ai-hub.skills',
  'app.store.ai-hub.mcp',
  'app.store.ai-hub.templates',
  'app.store.ai-hub.template-detail',
  'app.store.ai-hub.template-detail-alias',
  'app.store.search.index',
  'app.store.app-detail.detail',
  'app.store.events.detail',
  'app.store.library.index',
  'app.store.updates.index',
  'app.store.wishlist.index',
  'app.store.user-store.index',
  'app.store.user-store.public',
  'console.store.publisher.overview',
  'console.store.publisher.app-create',
  'console.store.publisher.app-manage',
];

/**
 * Canonical routes reused from an existing screen under the same canonical
 * path — no dedicated new screen required.
 */
const AppsBrowsePage = lazy(() =>
  import('../pages/BrowsePage').then((module) => ({
    default: module.AppsBrowsePage,
  })),
);
const GamesBrowsePage = lazy(() =>
  import('../pages/BrowsePage').then((module) => ({
    default: module.GamesBrowsePage,
  })),
);
const SettingsPage = lazy(() =>
  import('../pages/settings/SettingsPage').then((module) => ({
    default: module.SettingsPage,
  })),
);

export const OVERRIDDEN_ROUTE_IDS: readonly string[] = [
  'app.store.apps.index',
  'app.store.games.index',
  'console.system.settings.index',
];

const ROUTE_ELEMENT_OVERRIDES: Readonly<Record<string, ReactElement>> = {
  'app.store.apps.index': <AppsBrowsePage />,
  'app.store.games.index': <GamesBrowsePage />,
  'console.system.settings.index': <SettingsPage />,
};

/**
 * Canonical routes not mounted explicitly by `App.tsx`.
 *
 * Derived from the shared route table, so adding a capability route there and
 * forgetting to implement it shows up as a placeholder instead of a 404.
 */
export const pendingRouteContributions: readonly SdkworkUiRouteContribution[] =
  listAppstoreRouteIdentities().filter(
    (entry) => !EXPLICIT_ROUTE_IDS.includes(entry.id),
  );

/** React Router elements for the remaining canonical routes. */
export const pendingRouteElements: ReactElement[] = pendingRouteContributions.map(
  (entry) => (
    <Route
      key={entry.id}
      path={entry.path}
      element={
        ROUTE_ELEMENT_OVERRIDES[entry.id] ?? (
          <RoutePlaceholder routeId={entry.id} titleKey={entry.titleKey} />
        )
      }
    />
  ),
);
