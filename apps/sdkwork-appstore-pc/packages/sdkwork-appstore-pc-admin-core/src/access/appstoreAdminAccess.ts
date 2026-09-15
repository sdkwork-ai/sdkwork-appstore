import {
  hasPermissionInScope,
  SDKWORK_STANDARD_ROLE_CODES,
} from '@sdkwork/iam-contracts';

import {
  APPSTORE_ADMIN_SURFACE_ENTRY_PERMISSIONS,
  type AppstoreAdminPermission,
} from '../permissions';

/**
 * Operator identity facts the admin surface is allowed to reason about.
 *
 * This is a structural subset of the IAM AppContext snapshot: the admin
 * package never imports an application runtime type, so the bootstrap can bind
 * it without creating a package cycle.
 */
export interface AppstoreOperatorSessionLike {
  /** Permission codes granted to the signed-in operator. */
  permissionScope?: readonly string[];
  /** Standard platform/org role codes carried by the session. */
  standardRoleCodes?: readonly string[];
}

/** Result of evaluating whether the signed-in operator may enter `/admin`. */
export interface AppstoreAdminAccess {
  /** Whether the operator console should render at all. */
  allowed: boolean;
  /** Whether the operator holds a platform-administrator role. */
  isPlatformAdministrator: boolean;
  /** Permission codes the session granted, normalized to a fresh array. */
  grantedPermissions: readonly string[];
  /** Standard role codes carried by the session. */
  standardRoleCodes: readonly string[];
}

const PLATFORM_ADMINISTRATOR_ROLE_CODES: readonly string[] = [
  SDKWORK_STANDARD_ROLE_CODES.PLATFORM_SYSTEM_ADMIN,
  SDKWORK_STANDARD_ROLE_CODES.PLATFORM_SUPER_ADMIN,
];

/**
 * Match one permission code using the platform wildcard rules.
 *
 * Delegating to the shared IAM contract keeps frontend affordance hints exactly
 * as strict as the server-side matcher (`appstore.*`, `*.read`, `*`).
 * @param grantedPermissions - permission codes carried by the session.
 * @param required - backend-admin permission code the affordance needs.
 * @returns `true` when the scope satisfies the requirement.
 */
export function hasAppstoreAdminPermission(
  grantedPermissions: readonly string[],
  required: AppstoreAdminPermission | string,
): boolean {
  return hasPermissionInScope(grantedPermissions, required);
}

/**
 * Evaluate whether the scope satisfies at least one of the given codes.
 * @param grantedPermissions - permission codes carried by the session.
 * @param required - candidate codes; an empty list never grants access.
 * @returns `true` when any candidate is satisfied.
 */
export function hasAnyAppstoreAdminPermission(
  grantedPermissions: readonly string[],
  required: readonly (AppstoreAdminPermission | string)[],
): boolean {
  return required.some((code) => hasAppstoreAdminPermission(grantedPermissions, code));
}

/**
 * Evaluate whether the session carries a platform-administrator role.
 * @param standardRoleCodes - standard role codes from the session snapshot.
 * @returns `true` for platform system/super administrators.
 */
export function isAppstorePlatformAdministrator(
  standardRoleCodes: readonly string[] | undefined,
): boolean {
  return (standardRoleCodes ?? []).some((code) =>
    PLATFORM_ADMINISTRATOR_ROLE_CODES.includes(code),
  );
}

/**
 * Evaluate whether the operator may see the `/admin` surface.
 *
 * Entry requires any App Store backend-admin permission or a platform
 * administrator role. Page-level and command-level affordances still evaluate
 * their own code, so entry never implies blanket authority.
 * @param session - operator identity facts from the session snapshot.
 * @returns the resolved access decision.
 */
export function evaluateAppstoreAdminAccess(
  session: AppstoreOperatorSessionLike | undefined,
): AppstoreAdminAccess {
  const grantedPermissions = [...(session?.permissionScope ?? [])];
  const standardRoleCodes = [...(session?.standardRoleCodes ?? [])];
  const isPlatformAdministrator = isAppstorePlatformAdministrator(standardRoleCodes);
  return {
    allowed:
      isPlatformAdministrator ||
      hasAnyAppstoreAdminPermission(grantedPermissions, APPSTORE_ADMIN_SURFACE_ENTRY_PERMISSIONS),
    isPlatformAdministrator,
    grantedPermissions,
    standardRoleCodes,
  };
}

/**
 * Convenience predicate for callers that only need the entry decision.
 * @param session - operator identity facts from the session snapshot.
 * @returns `true` when the operator console should render.
 */
export function hasAppstoreAdminSurfaceEntry(
  session: AppstoreOperatorSessionLike | undefined,
): boolean {
  return evaluateAppstoreAdminAccess(session).allowed;
}
