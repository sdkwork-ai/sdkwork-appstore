import { createContext, useContext, type ReactNode } from 'react';
import {
  hasAppstoreAdminPermission,
  type AppstoreAdminAccess,
  type AppstoreAdminOperatorSession,
} from '@sdkwork/appstore-pc-admin-core';

/**
 * Session facts a capability page is allowed to reason about.
 *
 * The shell owns access evaluation, so pages consume `can()` for command-level
 * affordances instead of re-implementing permission matching. Frontend checks
 * remain hints: the backend stays the authorization authority
 * (`BACKEND_UI_SPEC.md` §7).
 */
export interface AppstoreAdminShellContextValue {
  session: AppstoreAdminOperatorSession;
  access: AppstoreAdminAccess;
  /**
   * Evaluate one backend-admin permission code for the signed-in operator.
   * @param permission - code such as `appstore.moderation.decide`.
   * @returns `true` when the operator may see or invoke the affordance.
   */
  can: (permission: string) => boolean;
}

const AppstoreAdminShellContext = createContext<AppstoreAdminShellContextValue | undefined>(
  undefined,
);

export interface AppstoreAdminShellProviderProps {
  session: AppstoreAdminOperatorSession;
  access: AppstoreAdminAccess;
  children: ReactNode;
}

/** Provide operator session facts to the capability pages under the shell. */
export function AppstoreAdminShellProvider({
  access,
  children,
  session,
}: AppstoreAdminShellProviderProps) {
  const value: AppstoreAdminShellContextValue = {
    session,
    access,
    can: (permission) =>
      access.isPlatformAdministrator
      || hasAppstoreAdminPermission(access.grantedPermissions, permission),
  };
  return (
    <AppstoreAdminShellContext.Provider value={value}>
      {children}
    </AppstoreAdminShellContext.Provider>
  );
}

/**
 * Read the operator session facts.
 * @throws Error when used outside {@link AppstoreAdminShell}.
 */
export function useAppstoreAdminShell(): AppstoreAdminShellContextValue {
  const value = useContext(AppstoreAdminShellContext);
  if (!value) {
    throw new Error(
      'useAppstoreAdminShell must be used inside the App Store operator console shell.',
    );
  }
  return value;
}

/**
 * Evaluate one permission code for command-level affordances.
 * @param permission - backend-admin permission code.
 */
export function useAppstoreAdminPermission(permission: string): boolean {
  return useAppstoreAdminShell().can(permission);
}
