import {
  prepareCredentialEntryTokens,
  readBootstrapAccessTokenFromProcessEnv,
} from '@sdkwork/iam-credential-entry';
import type { AuthTokenManager } from '@sdkwork/sdk-common';

import {
  hasAuthenticatedAppstorePcSession,
  type AppstorePcSessionStore,
} from './sessionStore';

/**
 * Seeds the global TokenManager with the bootstrap Access-Token JWT required
 * for credential-entry IAM operations (login, registration, OAuth, QR).
 */
export function prepareAppstorePcCredentialEntryTokens(
  tokenManager: AuthTokenManager,
  session: AppstorePcSessionStore,
): void {
  if (hasAuthenticatedAppstorePcSession(session.getSnapshot())) {
    return;
  }

  prepareCredentialEntryTokens(tokenManager, readBootstrapAccessTokenFromProcessEnv);
}
