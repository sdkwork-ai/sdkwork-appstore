import type {
  AppstoreAdminCapabilityModule,
  AppstoreAdminNavGroup,
  AppstoreAdminRouteDescriptor,
} from '../routes/types';

/** One sidebar entry resolved from a capability module's route descriptors. */
export interface AppstoreAdminNavigationEntry {
  routeId: string;
  /** Absolute path including the `/admin` prefix. */
  path: string;
  labelKey: string;
  icon?: string;
  group: AppstoreAdminNavGroup;
  order: number;
  /** Capability module that owns the entry. */
  capabilityId: string;
}

/**
 * Static composition of the operator console.
 *
 * Capability modules are aggregated explicitly by `pc-admin-shell` — the
 * operator console never discovers routes at runtime, so the route tree is
 * reviewable, tree-shakeable, and cannot diverge from the shipped packages.
 */
export interface AppstoreAdminModuleRegistry {
  modules: readonly AppstoreAdminCapabilityModule[];
  getModule(capabilityId: string): AppstoreAdminCapabilityModule | undefined;
  /** Every route descriptor, in module declaration order. */
  listRoutes(): readonly AppstoreAdminRouteDescriptor[];
  /** Sidebar entries sorted by group order then `order`. */
  listNavigation(prefix: string): readonly AppstoreAdminNavigationEntry[];
  /** Locale namespaces owned by the aggregated modules, de-duplicated. */
  listI18nNamespaces(): readonly string[];
}

const NAV_GROUP_ORDER: readonly AppstoreAdminNavGroup[] = [
  'insight',
  'governance',
  'operations',
  'distribution',
];

/**
 * Build the operator console registry from capability modules.
 * @param modules - capability modules contributed by `pc-admin-*` packages.
 */
export function createAppstoreAdminModuleRegistry(
  modules: readonly AppstoreAdminCapabilityModule[],
): AppstoreAdminModuleRegistry {
  const ordered = [...modules];
  return {
    modules: ordered,
    getModule(capabilityId) {
      return ordered.find((module) => module.id === capabilityId);
    },
    listRoutes() {
      return ordered.flatMap((module) => module.routes);
    },
    listNavigation(prefix) {
      const entries: AppstoreAdminNavigationEntry[] = [];
      for (const module of ordered) {
        for (const route of module.routes) {
          if (!route.nav || route.nav.hidden) {
            continue;
          }
          entries.push({
            routeId: route.id,
            path: `${prefix}/${route.path}`.replace(/\/+/gu, '/'),
            labelKey: route.nav.labelKey,
            ...(route.nav.icon === undefined ? {} : { icon: route.nav.icon }),
            group: route.nav.group,
            order: route.nav.order,
            capabilityId: module.id,
          });
        }
      }
      return entries.sort((left, right) => {
        const groupDelta =
          NAV_GROUP_ORDER.indexOf(left.group) - NAV_GROUP_ORDER.indexOf(right.group);
        if (groupDelta !== 0) {
          return groupDelta;
        }
        if (left.order !== right.order) {
          return left.order - right.order;
        }
        return left.labelKey.localeCompare(right.labelKey);
      });
    },
    listI18nNamespaces() {
      const namespaces = new Set<string>();
      for (const module of ordered) {
        for (const namespace of module.i18nNamespaces) {
          namespaces.add(namespace);
        }
      }
      return [...namespaces];
    },
  };
}
