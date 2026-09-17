import { lazy } from 'react';
import { Route } from 'react-router-dom';
import type { ReactElement } from 'react';

import {
  listAppstoreRouteIdentities,
  type SdkworkUiRouteContribution,
} from '@sdkwork/appstore-h5-core';

import { RoutePlaceholder } from './RoutePlaceholder';

/** Canonical route ids that already render a dedicated H5 screen. */
export const IMPLEMENTED_ROUTE_IDS: readonly string[] = [
  'app.store.discover.index',
  'app.store.search.index',
  'app.store.app-detail.detail',
  'app.store.library.index',
  'app.store.library.wishlist',
  'app.store.updates.index',
  'app.store.user-store.index',
  'app.store.user-store.public',
  'console.store.publisher.overview',
  'console.store.publisher.app-create',
  'console.store.publisher.app-manage',
];

/**
 * Screens the H5 root already ships under its own path spelling.
 *
 * The canonical route is mounted on the existing screen so both spellings keep
 * working while the root converges on the shared path.
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

const ROUTE_ELEMENT_OVERRIDES: Readonly<Record<string, ReactElement>> = {
  'app.store.apps.index': <AppsBrowsePage />,
  'app.store.games.index': <GamesBrowsePage />,
  'console.system.settings.index': <SettingsPage />,
};

/**
 * Canonical route ids that have no dedicated screen yet.
 *
 * Derived from the shared route table, so adding a capability route there and
 * forgetting to implement it shows up as a placeholder instead of a 404.
 */
export const pendingRouteContributions: readonly SdkworkUiRouteContribution[] =
  listAppstoreRouteIdentities().filter(
    (entry) => !IMPLEMENTED_ROUTE_IDS.includes(entry.id),
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
