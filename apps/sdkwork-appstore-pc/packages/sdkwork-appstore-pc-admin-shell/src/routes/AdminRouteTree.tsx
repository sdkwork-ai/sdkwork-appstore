import { Navigate, Route, Routes } from 'react-router-dom';
import {
  AdminAccessGuard,
  APPSTORE_ADMIN_SURFACE_ENTRY_PERMISSIONS,
  type AppstoreAdminModuleRegistry,
  type AppstoreAdminOperatorSession,
} from '@sdkwork/appstore-pc-admin-core';

import { AdminNotFound } from '../components/AdminNotFound';
import { AdminPageDenied } from '../components/AdminPageDenied';

export interface AdminRouteTreeProps {
  registry: AppstoreAdminModuleRegistry;
  session: AppstoreAdminOperatorSession;
  /** Absolute landing path used for the console index redirect. */
  homePath: string;
  /** Absolute route prefix, for example `/admin`. */
  prefix: string;
}

/**
 * Aggregated operator route tree.
 *
 * Every descriptor is wrapped in the shared access guard, so a capability page
 * never evaluates permissions itself and an unauthorized route renders an
 * in-shell denial without mounting the page or dispatching any request.
 */
export function AdminRouteTree({ homePath, prefix, registry, session }: AdminRouteTreeProps) {
  return (
    <Routes>
      <Route index element={<Navigate to={homePath} replace />} />
      {registry.listRoutes().map((route) => {
        const requiredPermissions =
          route.requiredPermissions.length > 0
            ? route.requiredPermissions
            : APPSTORE_ADMIN_SURFACE_ENTRY_PERMISSIONS;
        return (
          <Route
            key={route.id}
            path={route.path}
            element={
              <AdminAccessGuard
                session={session}
                requiredPermissions={requiredPermissions}
                fallback={<AdminPageDenied requiredPermissions={requiredPermissions} />}
              >
                {route.render()}
              </AdminAccessGuard>
            }
          />
        );
      })}
      <Route path="*" element={<AdminNotFound homePath={homePath} />} />
    </Routes>
  );
}

/** Normalize a descriptor path into an absolute console path. */
export function resolveAdminAbsolutePath(prefix: string, routePath: string): string {
  const joined = `${prefix}/${routePath}`.replace(/\/{2,}/gu, '/');
  return joined.length > 1 && joined.endsWith('/') ? joined.slice(0, -1) : joined;
}
