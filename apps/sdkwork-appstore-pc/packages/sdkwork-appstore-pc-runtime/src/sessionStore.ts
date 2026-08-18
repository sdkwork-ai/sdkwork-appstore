import type { IamAppContext } from '@sdkwork/iam-contracts';

export type AppstorePcSessionContext = IamAppContext;

export interface AppstorePcSessionSnapshot {
  accessToken?: string;
  authToken?: string;
  expiresAt?: number | string;
  refreshToken?: string;
  sessionId?: string;
  context?: AppstorePcSessionContext;
  user?: unknown;
  updatedAt?: string;
}

export interface AppstorePcSessionStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface AppstorePcSessionStore {
  clearSession(): void;
  getSnapshot(): AppstorePcSessionSnapshot;
  refreshSession(): AppstorePcSessionSnapshot;
  setSession(nextSession: AppstorePcSessionSnapshot): void;
  subscribe(listener: (snapshot: AppstorePcSessionSnapshot) => void): () => void;
}

export const APPSTORE_PC_SESSION_STORAGE_KEY = 'sdkwork-appstore-pc-session';

function stableJson(value: unknown): string {
  return value === undefined ? '' : JSON.stringify(value);
}

/**
 * Compare session snapshots while ignoring store-managed metadata such as `updatedAt`.
 * @param left - first session snapshot.
 * @param right - second session snapshot.
 * @returns `true` when both snapshots carry the same credential and identity fields.
 */
export function sessionSnapshotsEqual(
  left: AppstorePcSessionSnapshot,
  right: AppstorePcSessionSnapshot,
): boolean {
  return left.accessToken === right.accessToken
    && left.authToken === right.authToken
    && left.refreshToken === right.refreshToken
    && left.sessionId === right.sessionId
    && left.expiresAt === right.expiresAt
    && stableJson(left.context) === stableJson(right.context)
    && stableJson(left.user) === stableJson(right.user);
}

function readSession(
  storage: AppstorePcSessionStorage | undefined,
  storageKey: string,
): AppstorePcSessionSnapshot {
  if (!storage) {
    return {};
  }

  try {
    const value = storage.getItem(storageKey);
    return value ? (JSON.parse(value) as AppstorePcSessionSnapshot) : {};
  } catch {
    return {};
  }
}

export function createAppstorePcSessionStore(
  storage?: AppstorePcSessionStorage,
  storageKey = APPSTORE_PC_SESSION_STORAGE_KEY,
): AppstorePcSessionStore {
  let snapshot = readSession(storage, storageKey);
  const listeners = new Set<(value: AppstorePcSessionSnapshot) => void>();

  const emit = () => {
    for (const listener of listeners) {
      listener(snapshot);
    }
  };

  const persist = () => {
    if (!storage) {
      return;
    }
    if (!snapshot.authToken && !snapshot.accessToken && !snapshot.refreshToken) {
      storage.removeItem(storageKey);
      return;
    }
    storage.setItem(storageKey, JSON.stringify(snapshot));
  };

  return {
    clearSession() {
      snapshot = {};
      persist();
      emit();
    },
    getSnapshot() {
      return snapshot;
    },
    refreshSession() {
      const next = readSession(storage, storageKey);
      if (sessionSnapshotsEqual(snapshot, next)) {
        return snapshot;
      }
      snapshot = next;
      emit();
      return snapshot;
    },
    setSession(nextSession) {
      if (sessionSnapshotsEqual(snapshot, nextSession)) {
        return;
      }
      snapshot = {
        ...nextSession,
        updatedAt: new Date().toISOString(),
      };
      persist();
      emit();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export function hasAuthenticatedAppstorePcSession(
  snapshot: AppstorePcSessionSnapshot,
): boolean {
  return Boolean(
    snapshot.authToken &&
      snapshot.accessToken &&
      snapshot.context?.tenantId &&
      snapshot.context.userId,
  );
}
