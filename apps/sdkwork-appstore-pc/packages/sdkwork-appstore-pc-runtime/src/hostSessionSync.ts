import { enrichSessionSnapshotFromAccessToken } from './accessTokenContextClaims';
import {
  hasAuthenticatedAppstorePcSession,
  sessionSnapshotsEqual,
  type AppstorePcSessionSnapshot,
} from './sessionStore';

/** Tracks host-session apply/suppress state for embedded App Store hosts. */
export interface AppstorePcHostSessionSyncState {
  lastAppliedHostFingerprint: string | null;
  suppressedHostFingerprint: string | null;
}

export function createAppstorePcHostSessionSyncState(): AppstorePcHostSessionSyncState {
  return {
    lastAppliedHostFingerprint: null,
    suppressedHostFingerprint: null,
  };
}

function stableJson(value: unknown): string {
  return value === undefined ? '' : JSON.stringify(value);
}

/**
 * Merge host props the same way {@link AppstorePcHost} does before enriching JWT claims.
 */
export function resolveAppstorePcHostSessionInput(
  session: AppstorePcSessionSnapshot | null | undefined,
  accessToken: string | undefined,
): AppstorePcSessionSnapshot | undefined {
  const envToken = accessToken?.trim();
  const sessionAccess = typeof session === 'object' && session !== null && typeof session.accessToken === 'string'
    ? session.accessToken.trim()
    : '';
  if (!envToken) {
    return session === null ? {} : session;
  }
  if (sessionAccess !== '') {
    return session === null ? {} : session;
  }
  return { ...(session ?? {}), accessToken: envToken };
}

/**
 * Build the enriched host session snapshot that would be written to the store.
 */
export function buildAppstorePcHostSessionCandidate(
  session: AppstorePcSessionSnapshot | null | undefined,
  accessToken: string | undefined,
): AppstorePcSessionSnapshot | null {
  if (session === undefined && !accessToken?.trim()) {
    return null;
  }
  const resolved = resolveAppstorePcHostSessionInput(session, accessToken) ?? {};
  return enrichSessionSnapshotFromAccessToken(resolved);
}

function fingerprintAppstorePcSessionSnapshot(snapshot: AppstorePcSessionSnapshot): string {
  return stableJson({
    accessToken: snapshot.accessToken ?? '',
    authToken: snapshot.authToken ?? '',
    refreshToken: snapshot.refreshToken ?? '',
    sessionId: snapshot.sessionId ?? '',
    context: snapshot.context ?? null,
    user: snapshot.user ?? null,
  });
}

/**
 * Stable fingerprint for host-provided credentials independent of store-managed metadata.
 */
export function fingerprintAppstorePcHostSessionInput(
  session: AppstorePcSessionSnapshot | null | undefined,
  accessToken: string | undefined,
): string | null {
  const candidate = buildAppstorePcHostSessionCandidate(session, accessToken);
  return candidate ? fingerprintAppstorePcSessionSnapshot(candidate) : null;
}

function runtimeSessionHasCredentials(snapshot: AppstorePcSessionSnapshot): boolean {
  return Boolean(snapshot.accessToken || snapshot.authToken || snapshot.refreshToken);
}

/**
 * Observe runtime session clears so host props do not immediately re-seed invalid credentials.
 */
export function onAppstorePcRuntimeSessionChanged(
  state: AppstorePcHostSessionSyncState,
  storeSnapshot: AppstorePcSessionSnapshot,
  hostFingerprint: string | null,
): AppstorePcHostSessionSyncState {
  if (
    hostFingerprint
    && !runtimeSessionHasCredentials(storeSnapshot)
    && state.lastAppliedHostFingerprint === hostFingerprint
  ) {
    return {
      ...state,
      suppressedHostFingerprint: hostFingerprint,
    };
  }

  if (runtimeSessionHasCredentials(storeSnapshot)) {
    return {
      ...state,
      suppressedHostFingerprint: null,
    };
  }

  return state;
}

/**
 * Decide whether host props should overwrite the runtime session store.
 */
export function shouldApplyAppstorePcHostSession(
  state: AppstorePcHostSessionSyncState,
  storeSnapshot: AppstorePcSessionSnapshot,
  hostFingerprint: string | null,
  nextSession: AppstorePcSessionSnapshot,
): boolean {
  if (!hostFingerprint) {
    return false;
  }
  if (hostFingerprint === state.suppressedHostFingerprint) {
    return false;
  }
  if (sessionSnapshotsEqual(storeSnapshot, nextSession)) {
    return false;
  }
  if (
    hasAuthenticatedAppstorePcSession(storeSnapshot)
    && !hasAuthenticatedAppstorePcSession(nextSession)
  ) {
    return false;
  }
  return true;
}
