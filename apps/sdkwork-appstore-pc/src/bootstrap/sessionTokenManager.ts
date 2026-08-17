import { readBootstrapAccessTokenFromProcessEnv } from '@sdkwork/iam-credential-entry';
import { resetTokenManagerToBootstrapAccessToken } from '@sdkwork/iam-runtime';
import { createTokenManager, type AuthTokenManager } from '@sdkwork/sdk-common';

import type { AppstorePcSessionStore } from './sessionStore';

/**
 * Session-backed token manager. Token lifecycle events (expired/invalid)
 * clear the persisted session so the AuthGate redirects to the login flow
 * instead of silently failing every authenticated request.
 */
export function createAppstorePcSessionTokenManager(
  session: AppstorePcSessionStore,
): AuthTokenManager {
  const handleExpired = () => {
    session.clearSession();
  };

  const tokenManager = createTokenManager(undefined, {
    onTokenExpired: handleExpired,
    onTokenInvalid: handleExpired,
  });

  const hydrate = () => {
    const snapshot = session.getSnapshot();
    const hasSessionTokens = Boolean(
      snapshot.accessToken || snapshot.authToken || snapshot.refreshToken,
    );

    if (hasSessionTokens) {
      tokenManager.setTokens({
        accessToken: snapshot.accessToken,
        authToken: snapshot.authToken,
        refreshToken: snapshot.refreshToken,
      });
      return;
    }

    resetTokenManagerToBootstrapAccessToken(
      tokenManager,
      readBootstrapAccessTokenFromProcessEnv(),
    );
  };

  hydrate();
  session.subscribe(hydrate);
  return tokenManager;
}
