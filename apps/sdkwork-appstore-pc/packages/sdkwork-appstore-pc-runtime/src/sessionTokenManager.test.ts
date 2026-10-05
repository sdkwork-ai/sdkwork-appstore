import { describe, expect, it, vi } from 'vitest';
import type { AuthTokenManager } from '@sdkwork/sdk-common';

import {
  createAppstorePcSessionTokenManager,
  hydrateAppstorePcSessionTokenManager,
} from './sessionTokenManager';
import type { AppstorePcSessionStore, AppstorePcSessionSnapshot } from './sessionStore';

vi.mock('@sdkwork/iam-runtime', () => ({
  resetTokenManagerToBootstrapAccessToken: vi.fn(),
}));
vi.mock('@sdkwork/iam-credential-entry', () => ({
  readBootstrapAccessTokenFromProcessEnv: vi.fn(() => undefined),
}));

/** A recording session store over one mutable snapshot. */
function stubSession(initial: AppstorePcSessionSnapshot = {}): AppstorePcSessionStore & {
  setSnapshot(next: AppstorePcSessionSnapshot): void
} {
  let snapshot = initial;
  const listeners = new Set<(snapshot: AppstorePcSessionSnapshot) => void>();
  return {
    clearSession: () => {
      snapshot = {};
      for (const listener of listeners) listener(snapshot);
    },
    getSnapshot: () => snapshot,
    refreshSession: () => snapshot,
    setSession: (next) => {
      snapshot = next;
      for (const listener of listeners) listener(snapshot);
    },
    setSnapshot: (next) => {
      snapshot = next;
      for (const listener of listeners) listener(snapshot);
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  } as AppstorePcSessionStore & { setSnapshot(next: AppstorePcSessionSnapshot): void };
}

function stubTokenManager(): AuthTokenManager & { tokenSets: unknown[]; cleared: number } {
  const tokenSets: unknown[] = [];
  let cleared = 0;
  return {
    tokenSets,
    get cleared() {
      return cleared;
    },
    clearAccessToken: () => {},
    clearAuthToken: () => {},
    clearTokens: () => {
      cleared += 1;
    },
    getAccessToken: () => undefined,
    getAuthToken: () => undefined,
    getRefreshToken: () => undefined,
    getTokens: () => ({}),
    hasAccessToken: () => false,
    hasAuthToken: () => false,
    hasToken: () => false,
    isExpired: () => false,
    setAccessToken: () => {},
    setAuthToken: () => {},
    setRefreshToken: () => {},
    setTokens: (tokens: unknown) => {
      tokenSets.push(tokens);
    },
    willExpireIn: () => false,
  } as unknown as AuthTokenManager & { tokenSets: unknown[]; cleared: number };
}

describe('hydrateAppstorePcSessionTokenManager (host-injected manager)', () => {
  it('mirrors session credentials when the session carries tokens', () => {
    const manager = stubTokenManager();
    const session = stubSession({ accessToken: 'access-1', refreshToken: 'refresh-1' });
    hydrateAppstorePcSessionTokenManager(manager, session);
    expect(manager.tokenSets).toEqual([{ accessToken: 'access-1', authToken: undefined, refreshToken: 'refresh-1' }]);
  });

  it('leaves the manager untouched when the session is signed out', () => {
    const manager = stubTokenManager();
    const session = stubSession({});
    const dispose = hydrateAppstorePcSessionTokenManager(manager, session);
    // A later sign-in still mirrors; a sign-out back to empty does not wipe.
    session.setSnapshot({ accessToken: 'access-2' });
    expect(manager.tokenSets).toEqual([{ accessToken: 'access-2', authToken: undefined, refreshToken: undefined }]);
    session.setSnapshot({});
    expect(manager.tokenSets).toHaveLength(1);
    dispose();
  });
});

describe('createAppstorePcSessionTokenManager (standalone manager)', () => {
  it('resets its OWN manager to the bootstrap token when the session is signed out', async () => {
    const { resetTokenManagerToBootstrapAccessToken } = await import('@sdkwork/iam-runtime');
    vi.mocked(resetTokenManagerToBootstrapAccessToken).mockClear();
    const manager = createAppstorePcSessionTokenManager(stubSession({}));
    expect(resetTokenManagerToBootstrapAccessToken).toHaveBeenCalledTimes(1);
    expect(manager).toBeDefined();
  });

  it('mirrors session credentials over the bootstrap reset on sign-in', async () => {
    const { resetTokenManagerToBootstrapAccessToken } = await import('@sdkwork/iam-runtime');
    vi.mocked(resetTokenManagerToBootstrapAccessToken).mockClear();
    const session = stubSession({});
    const manager = createAppstorePcSessionTokenManager(session);
    expect(resetTokenManagerToBootstrapAccessToken).toHaveBeenCalledTimes(1);
    session.setSession({ accessToken: 'access-3' });
    expect(manager.getAccessToken()).toBe('access-3');
  });
});
