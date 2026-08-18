import { describe, expect, it, vi } from 'vitest';

import {
  APPSTORE_PC_SESSION_STORAGE_KEY,
  createAppstorePcSessionStore,
  hasAuthenticatedAppstorePcSession,
  type AppstorePcSessionStorage,
} from './sessionStore';

function createMemoryStorage(): AppstorePcSessionStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => {
      values.delete(key);
    },
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}

describe('appstore PC session store', () => {
  it('persists a complete dual-token session and notifies subscribers', () => {
    const storage = createMemoryStorage();
    const store = createAppstorePcSessionStore(storage);
    const listener = vi.fn();
    store.subscribe(listener);

    store.setSession({
      accessToken: 'access',
      authToken: 'auth',
      expiresAt: '2026-08-01T00:00:00.000Z',
      context: {
        appId: 'sdkwork-appstore-pc',
        authLevel: 'mfa',
        dataScope: ['publisher:owned'],
        deploymentMode: 'saas',
        environment: 'dev',
        permissionScope: ['appstore.metrics.read'],
        sessionId: 'session',
        standardRoleCodes: ['org_operations'],
        tenantId: 'tenant',
        userId: 'user',
      },
    });

    expect(hasAuthenticatedAppstorePcSession(store.getSnapshot())).toBe(true);
    expect(storage.getItem(APPSTORE_PC_SESSION_STORAGE_KEY)).toContain('"authToken":"auth"');
    expect(store.getSnapshot().context?.authLevel).toBe('mfa');
    expect(store.getSnapshot().context?.dataScope).toEqual(['publisher:owned']);
    expect(store.getSnapshot().expiresAt).toBe('2026-08-01T00:00:00.000Z');
    expect(listener).toHaveBeenCalledOnce();
  });

  it('fails closed for incomplete sessions and removes cleared state', () => {
    const storage = createMemoryStorage();
    const store = createAppstorePcSessionStore(storage);
    store.setSession({ authToken: 'auth' });

    expect(hasAuthenticatedAppstorePcSession(store.getSnapshot())).toBe(false);
    store.clearSession();
    expect(storage.getItem(APPSTORE_PC_SESSION_STORAGE_KEY)).toBeNull();
  });
});
