import type { ReactNode } from 'react';

/**
 * Navigation grouping used by the operator console sidebar.
 *
 * Groups are presentation-level buckets owned by the admin shell, not backend
 * domains. A capability package picks a group so the shell can order menus
 * without knowing which packages exist.
 */
export type AppstoreAdminNavGroup =
  | 'insight'
  | 'governance'
  | 'operations'
  | 'distribution';

/** Sidebar entry metadata for one admin route. */
export interface AppstoreAdminNavItem {
  /** i18n key resolved by the admin shell from the owning fragment. */
  labelKey: string;
  /** Lucide icon name resolved by the admin shell; unknown names degrade to a default. */
  icon?: string;
  group: AppstoreAdminNavGroup;
  /** Ascending order within the group. */
  order: number;
  /** Keep the route reachable but omit it from the sidebar. */
  hidden?: boolean;
}

/**
 * One operator console route owned by a `pc-admin-*` capability package.
 *
 * The descriptor is intentionally serializable except for `render`: the shell
 * wraps `render()` in the shared layout, breadcrumb, and access guard, so a
 * capability package never re-implements shell chrome or authorization.
 */
export interface AppstoreAdminRouteDescriptor {
  /** Stable route id, unique across the admin surface. */
  id: string;
  /** Path relative to the `/admin` prefix, for example `moderation/queue`. */
  path: string;
  /**
   * Permission codes that grant access to this route
   * (`BACKEND_UI_SPEC.md` §7). An empty list means "any operator who can enter
   * the admin surface"; frontend checks remain hints, not authorization.
   */
  requiredPermissions: readonly string[];
  /** Renders the page body inside the admin layout. */
  render: () => ReactNode;
  /** Sidebar metadata. Omit for detail routes reached from a list page. */
  nav?: AppstoreAdminNavItem;
}

/**
 * Everything one admin capability package contributes to the operator console.
 *
 * `pc-admin-shell` aggregates these modules into a single route tree and
 * sidebar; the i18n runtime registration walks `i18nNamespaces` so locale
 * resources stay package-owned (`I18N_SPEC.md` §6.1).
 */
export interface AppstoreAdminCapabilityModule {
  /** Capability id matching the package suffix, for example `moderation`. */
  id: string;
  /** i18n key for the capability title shown in headers and breadcrumbs. */
  titleKey: string;
  routes: readonly AppstoreAdminRouteDescriptor[];
  /** Locale fragment namespaces owned by this capability. */
  i18nNamespaces: readonly string[];
}

/** Path prefix owned by the operator console across every surface. */
export const APPSTORE_ADMIN_ROUTE_PREFIX = '/admin';

/** Route id of the console landing page used for the `/admin` redirect. */
export const APPSTORE_ADMIN_DEFAULT_ROUTE_ID = 'dashboard-overview';
