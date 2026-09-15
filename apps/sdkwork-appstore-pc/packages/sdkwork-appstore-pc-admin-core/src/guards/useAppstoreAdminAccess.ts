import { useMemo } from 'react';

import {
  evaluateAppstoreAdminAccess,
  type AppstoreAdminAccess,
  type AppstoreOperatorSessionLike,
} from '../access';

/**
 * Evaluate the operator console access decision for a session snapshot.
 *
 * The hook is intentionally free of transport and runtime imports: the host
 * bootstrap passes the session-derived permission scope so the admin package
 * never depends on an application runtime type.
 * @param session - operator identity facts from the session snapshot.
 * @returns the memoized access decision.
 */
export function useAppstoreAdminAccess(
  session: AppstoreOperatorSessionLike | undefined,
): AppstoreAdminAccess {
  const grantedKey = (session?.permissionScope ?? []).join('\u0000');
  const roleKey = (session?.standardRoleCodes ?? []).join('\u0000');
  return useMemo(
    () => evaluateAppstoreAdminAccess(session),
    // Recompute only when the identity facts change, not on every render.
    [grantedKey, roleKey],
  );
}
