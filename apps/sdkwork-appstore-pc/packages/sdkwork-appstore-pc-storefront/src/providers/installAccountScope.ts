import type { DownloadStorageScope } from '@sdkwork/appstore-pc-core';

/** Account scope used when nobody is signed in. */
export const ANONYMOUS_INSTALL_ACCOUNT_SCOPE: DownloadStorageScope = Object.freeze({
  tenantId: '',
  userId: '',
});

/**
 * Structural subset of a session snapshot this module needs.
 *
 * Kept narrow on purpose: the runtime session context carries many IAM
 * fields, and only the account identity decides the local storage scope.
 */
export interface InstallSessionIdentitySource {
  readonly context?: {
    readonly tenantId?: unknown;
    readonly userId?: unknown;
  } | null;
}

function readIdentity(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Derive the download/install scope of the current storefront session.
 *
 * Both tenant and user are required. A snapshot carrying only one of them is
 * treated as anonymous rather than sharing a partially known bucket, so an
 * account switch can never read a previous account's local state.
 * @param snapshot - current session snapshot, or undefined when unavailable.
 * @returns the tenant/user scope of the session.
 */
export function resolveInstallAccountScope(
  snapshot: InstallSessionIdentitySource | null | undefined,
): DownloadStorageScope {
  const tenantId = readIdentity(snapshot?.context?.tenantId);
  const userId = readIdentity(snapshot?.context?.userId);
  if (!tenantId || !userId) {
    return ANONYMOUS_INSTALL_ACCOUNT_SCOPE;
  }
  return { tenantId, userId };
}

/**
 * Stable key of one account scope; changing it means the account changed.
 * @param scope - resolved account scope.
 * @returns a composite identity key.
 */
export function installAccountKey(scope: DownloadStorageScope): string {
  return `${scope.tenantId}\u0000${scope.userId}`;
}
