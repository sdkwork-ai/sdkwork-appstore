import { readBootstrapAccessTokenFromProcessEnv } from '@sdkwork/iam-credential-entry';
import { resetTokenManagerToBootstrapAccessToken } from '@sdkwork/iam-runtime';
import { createTokenManager, type AuthTokenManager } from '@sdkwork/sdk-common';

import type { AppstorePcSessionStore } from './sessionStore';

/** Whether the session snapshot carries any credential to mirror. */
function hasSessionTokens(snapshot: ReturnType<AppstorePcSessionStore["getSnapshot"]>): boolean {
  return Boolean(snapshot.accessToken || snapshot.authToken || snapshot.refreshToken);
}

/** Write the snapshot's credentials into the manager. */
function applySessionTokens(tokenManager: AuthTokenManager, session: AppstorePcSessionStore): void {
  const snapshot = session.getSnapshot();
  tokenManager.setTokens({
    accessToken: snapshot.accessToken,
    authToken: snapshot.authToken,
    refreshToken: snapshot.refreshToken,
  });
}

/**
 * Mirror the session store's tokens into a HOST-INJECTED token manager and
 * keep the mirror current while the session changes. The store is the
 * embedded surface's session truth; every bound SDK client reads credentials
 * through the manager (APP_SDK_INTEGRATION_SPEC closure rule).
 *
 * A signed-out session leaves the manager UNTOUCHED: the instance belongs to
 * the embedding application, which may have merged its own credentials (a
 * static env access token, another plugin's login state) — clearing it here
 * wiped those credentials and surfaced later as tokenless "Access-Token"
 * failures in unrelated host flows.
 * @returns the disposer for the session subscription.
 */
export function hydrateAppstorePcSessionTokenManager(
  tokenManager: AuthTokenManager,
  session: AppstorePcSessionStore,
): () => void {
  const hydrate = () => {
    if (hasSessionTokens(session.getSnapshot())) {
      applySessionTokens(tokenManager, session);
    }
  };

  hydrate();
  return session.subscribe(hydrate);
}

/**
 * Session-backed token manager for STANDALONE runtimes (no host instance).
 * Token lifecycle events (expired/invalid) clear the persisted session so the
 * AuthGate redirects to the login flow instead of silently failing every
 * authenticated request. A signed-out session resets this OWN manager to the
 * bootstrap env token — the anonymous-browsing credential the standalone app
 * owns; a host-injected manager never takes this path.
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
    if (hasSessionTokens(session.getSnapshot())) {
      applySessionTokens(tokenManager, session);
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
