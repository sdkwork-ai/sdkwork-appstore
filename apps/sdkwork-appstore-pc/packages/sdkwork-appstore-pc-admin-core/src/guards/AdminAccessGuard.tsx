import type { ReactNode } from 'react';

import {
  hasAnyAppstoreAdminPermission,
  isAppstorePlatformAdministrator,
  type AppstoreOperatorSessionLike,
} from '../access';
import {
  APPSTORE_ADMIN_SURFACE_ENTRY_PERMISSIONS,
  type AppstoreAdminPermission,
} from '../permissions';

/** Props accepted by the headless backend-admin access guard. */
export interface AdminAccessGuardProps {
  /** Rendered when the operator satisfies the requirement. */
  children: ReactNode;
  /** Operator identity facts from the session snapshot. */
  session: AppstoreOperatorSessionLike | undefined;
  /**
   * Codes that satisfy the guard; any single match grants access. Defaults to
   * the console entry permissions of `APPSTORE_ADMIN_SURFACE_ENTRY_PERMISSIONS`.
   */
  requiredPermissions?: readonly (AppstoreAdminPermission | string)[];
  /** Element rendered instead of `children` when access is denied. */
  fallback: ReactNode;
}

/**
 * Headless `backend-admin` route guard.
 *
 * The guard performs presentation-only evaluation of the session permission
 * scope; it is not an authorization authority — the backend re-evaluates every
 * operator operation (`BACKEND_UI_SPEC.md` §7). Copy and chrome for the denied
 * state belong to the owning surface package, which supplies `fallback`.
 * @param props - guard inputs including the composed denied element.
 * @returns the guarded subtree or the supplied fallback.
 */
export function AdminAccessGuard({
  children,
  fallback,
  requiredPermissions = APPSTORE_ADMIN_SURFACE_ENTRY_PERMISSIONS,
  session,
}: AdminAccessGuardProps) {
  const grantedPermissions = session?.permissionScope ?? [];
  const allowed =
    isAppstorePlatformAdministrator(session?.standardRoleCodes) ||
    hasAnyAppstoreAdminPermission(grantedPermissions, requiredPermissions);
  return allowed ? <>{children}</> : <>{fallback}</>;
}
