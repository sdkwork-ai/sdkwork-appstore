import type { AppstoreOperatorSessionLike } from '../access/appstoreAdminAccess';

/** Operator identity facts consumed by the backend-admin surface. */
export type AppstoreAdminOperatorSession = AppstoreOperatorSessionLike;

/**
 * Structural view of the host session snapshot.
 *
 * Admin packages never import an application runtime type
 * (`APP_PC_ARCHITECTURE_SPEC.md` §6), so the host passes its snapshot and the
 * projection below reads only the IAM AppContext fields the console needs.
 */
export interface AppstoreAdminSessionSnapshotLike {
  context?: {
    permissionScope?: readonly string[];
    standardRoleCodes?: readonly string[];
    tenantId?: string;
    userId?: string;
    userName?: string;
    displayName?: string;
    nickname?: string;
  };
}

/** Operator profile rendered in the admin shell header. */
export interface AppstoreAdminOperatorProfile {
  operatorId: string;
  operatorName: string;
  tenantId: string;
  permissionScope: readonly string[];
  standardRoleCodes: readonly string[];
}

/**
 * Project a host session snapshot into the operator profile the console needs.
 * @param snapshot - host session snapshot, or `undefined` when signed out.
 */
export function projectAppstoreAdminOperator(
  snapshot: AppstoreAdminSessionSnapshotLike | undefined,
): AppstoreAdminOperatorProfile {
  const context = snapshot?.context;
  return {
    operatorId: context?.userId?.trim() ?? '',
    operatorName:
      context?.displayName?.trim()
      || context?.nickname?.trim()
      || context?.userName?.trim()
      || context?.userId?.trim()
      || '',
    tenantId: context?.tenantId?.trim() ?? '',
    permissionScope: [...(context?.permissionScope ?? [])],
    standardRoleCodes: [...(context?.standardRoleCodes ?? [])],
  };
}

/**
 * Project a host session snapshot into the structural session facts used for
 * access evaluation.
 * @param snapshot - host session snapshot, or `undefined` when signed out.
 */
export function toAppstoreAdminOperatorSession(
  snapshot: AppstoreAdminSessionSnapshotLike | undefined,
): AppstoreAdminOperatorSession {
  const context = snapshot?.context;
  return {
    permissionScope: [...(context?.permissionScope ?? [])],
    standardRoleCodes: [...(context?.standardRoleCodes ?? [])],
  };
}
