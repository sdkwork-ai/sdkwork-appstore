import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import {
  APPSTORE_ADMIN_DEFAULT_ROUTE_ID,
  APPSTORE_ADMIN_ROUTE_PREFIX,
  createAppstoreAdminModuleRegistry,
  useAppstoreAdminAccess,
  type AppstoreAdminCapabilityModule,
  type AppstoreAdminNavigationEntry,
  type AppstoreAdminOperatorSession,
} from '@sdkwork/appstore-pc-admin-core';

import { AdminAccessDenied } from './components/AdminAccessDenied';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminTopbar } from './components/AdminTopbar';
import { AppstoreAdminShellProvider } from './context/AdminShellContext';
import { AdminRouteTree, resolveAdminAbsolutePath } from './routes/AdminRouteTree';

export interface AppstoreAdminShellProps {
  /**
   * Capability modules contributed by the `pc-admin-*` packages. The host
   * composition root aggregates them, which keeps the shell independent of the
   * capability packages and free of import cycles.
   */
  modules: readonly AppstoreAdminCapabilityModule[];
  /** Operator identity facts used for access decisions. */
  session: AppstoreAdminOperatorSession;
  /** Operator display name for the sidebar footer. */
  operatorName?: string;
  /** Tenant or organization label for the sidebar footer. */
  tenantLabel?: string;
  /** Runtime family; drives dense-grid affordances. */
  platform?: 'browser' | 'desktop' | 'tablet';
  /** Route prefix owned by the console; defaults to `/admin`. */
  prefix?: string;
  /** Route id of the landing page; defaults to the dashboard overview. */
  defaultRouteId?: string;
}

/**
 * SDKWork App Store operator console shell.
 *
 * Owns the `/admin` chrome — navigation, breadcrumb trail, fail-closed surface
 * access gate, and the aggregated route tree — while capability packages own
 * page bodies. Rendered inside the host product's router and i18n provider
 * (`BACKEND_UI_SPEC.md` §1/§2, `APP_PC_ARCHITECTURE_SPEC.md` §4).
 */
export function AppstoreAdminShell({
  defaultRouteId = APPSTORE_ADMIN_DEFAULT_ROUTE_ID,
  modules,
  operatorName,
  platform = 'browser',
  prefix = APPSTORE_ADMIN_ROUTE_PREFIX,
  session,
  tenantLabel,
}: AppstoreAdminShellProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const registry = useMemo(() => createAppstoreAdminModuleRegistry(modules), [modules]);
  const access = useAppstoreAdminAccess(session);
  const navigation = useMemo(() => registry.listNavigation(prefix), [prefix, registry]);
  const routes = registry.listRoutes();

  const landingRoute = routes.find((route) => route.id === defaultRouteId) ?? routes[0];
  const homePath = landingRoute
    ? resolveAdminAbsolutePath(prefix, landingRoute.path)
    : prefix;

  const activeRoute = pickActiveRoute(routes, location.pathname, prefix);
  const activeEntry = pickActiveEntry(navigation, location.pathname);
  const capabilityModule = activeRoute
    ? registry.modules.find((module) => module.routes.some((route) => route.id === activeRoute.id))
    : undefined;

  if (!access.allowed) {
    return <AdminAccessDenied />;
  }

  const breadcrumb = [
    { label: t('adminShell.breadcrumb.home'), to: homePath },
    ...(capabilityModule && capabilityModule.titleKey !== activeEntry?.labelKey
      ? [{ label: t(capabilityModule.titleKey) }]
      : []),
    ...(activeEntry ? [{ label: t(activeEntry.labelKey) }] : []),
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-[#0e1015] dark:text-gray-100">
      <AdminSidebar
        entries={navigation}
        isPlatformAdministrator={access.isPlatformAdministrator}
        operatorName={operatorName}
        prefix={prefix}
        tenantLabel={tenantLabel}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar
          breadcrumb={breadcrumb}
          trailing={
            <span className="rounded-full bg-gray-100 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-gray-500 dark:bg-[#20232c] dark:text-gray-400">
              {platform}
            </span>
          }
        />
        <main className="min-w-0 flex-1 px-5 py-5">
          <AdminRouteTree
            homePath={homePath}
            prefix={prefix}
            registry={registry}
            session={session}
          />
        </main>
      </div>
    </div>
  );
}

function pickActiveRoute(
  routes: readonly { id: string; path: string }[],
  pathname: string,
  prefix: string,
): { id: string; path: string } | undefined {
  let best: { id: string; path: string } | undefined;
  let bestLength = -1;
  for (const route of routes) {
    const absolute = resolveAdminAbsolutePath(prefix, route.path);
    if (pathname !== absolute && !pathname.startsWith(`${absolute}/`)) {
      continue;
    }
    if (absolute.length > bestLength) {
      best = route;
      bestLength = absolute.length;
    }
  }
  return best;
}

function pickActiveEntry(
  entries: readonly AppstoreAdminNavigationEntry[],
  pathname: string,
): AppstoreAdminNavigationEntry | undefined {
  let best: AppstoreAdminNavigationEntry | undefined;
  let bestLength = -1;
  for (const entry of entries) {
    if (pathname !== entry.path && !pathname.startsWith(`${entry.path}/`)) {
      continue;
    }
    if (entry.path.length > bestLength) {
      best = entry;
      bestLength = entry.path.length;
    }
  }
  return best;
}
