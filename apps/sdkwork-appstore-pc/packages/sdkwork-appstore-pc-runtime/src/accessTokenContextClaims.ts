import type { AppstorePcSessionContext, AppstorePcSessionSnapshot } from './sessionStore';

export interface AccessTokenContextClaims {
  tenantId?: string;
  userId?: string;
  organizationId?: string;
  sessionId?: string;
  appId?: string;
  environment?: string;
  deploymentMode?: string;
  authLevel?: string;
}

function decodeBase64Url(value: string): string | undefined {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const remainder = normalized.length % 4;
  const padded = normalized + (remainder === 0 ? '' : '='.repeat(4 - remainder));
  if (typeof atob === 'function') {
    try {
      return atob(padded);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function decodeJwtPayload(token: string): Record<string, unknown> | undefined {
  const segments = token.split('.');
  if (segments.length < 2) {
    return undefined;
  }
  const payload = decodeBase64Url(segments[1] ?? '');
  if (!payload) {
    return undefined;
  }
  try {
    const parsed: unknown = JSON.parse(payload);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function readJwtStringClaim(
  claims: Record<string, unknown>,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = claims[key];
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim();
    }
  }
  return undefined;
}

/**
 * Read AppContext identity fields encoded in a bootstrap or session access token.
 * @param accessToken - JWT access token from bootstrap or IAM session state.
 * @returns decoded identity claims, or `undefined` when the token is absent or unreadable.
 */
export function readAccessTokenContextClaims(
  accessToken: string | undefined,
): AccessTokenContextClaims | undefined {
  if (!accessToken) {
    return undefined;
  }
  const claims = decodeJwtPayload(accessToken);
  if (!claims) {
    return undefined;
  }
  const tenantId = readJwtStringClaim(claims, 'tenant_id', 'tenantId');
  const userId = readJwtStringClaim(claims, 'user_id', 'userId', 'sub');
  const organizationId = readJwtStringClaim(claims, 'organization_id', 'organizationId');
  const sessionId = readJwtStringClaim(claims, 'session_id', 'sessionId', 'sid');
  const appId = readJwtStringClaim(claims, 'app_id', 'appId');
  const environment = readJwtStringClaim(claims, 'environment');
  const deploymentMode = readJwtStringClaim(
    claims,
    'deployment_profile',
    'deploymentProfile',
    'deployment_mode',
    'deploymentMode',
  );
  const authLevel = readJwtStringClaim(claims, 'auth_level', 'authLevel');
  if (
    tenantId === undefined
    && userId === undefined
    && organizationId === undefined
    && sessionId === undefined
    && appId === undefined
    && environment === undefined
    && deploymentMode === undefined
    && authLevel === undefined
  ) {
    return undefined;
  }
  return {
    ...(tenantId === undefined ? {} : { tenantId }),
    ...(userId === undefined ? {} : { userId }),
    ...(organizationId === undefined ? {} : { organizationId }),
    ...(sessionId === undefined ? {} : { sessionId }),
    ...(appId === undefined ? {} : { appId }),
    ...(environment === undefined ? {} : { environment }),
    ...(deploymentMode === undefined ? {} : { deploymentMode }),
    ...(authLevel === undefined ? {} : { authLevel }),
  };
}

export interface AuthTokenUserClaims {
  userId?: string;
  sessionId?: string;
}

/**
 * Read principal identity fields encoded in an IAM auth token.
 * @param authToken - JWT auth token from IAM session state.
 * @returns decoded user identity claims, or `undefined` when the token is absent or unreadable.
 */
export function readAuthTokenUserClaims(
  authToken: string | undefined,
): AuthTokenUserClaims | undefined {
  if (!authToken) {
    return undefined;
  }
  const claims = decodeJwtPayload(authToken);
  if (!claims) {
    return undefined;
  }
  const userId = readJwtStringClaim(claims, 'user_id', 'userId', 'sub');
  const sessionId = readJwtStringClaim(claims, 'session_id', 'sessionId', 'sid');
  if (userId === undefined && sessionId === undefined) {
    return undefined;
  }
  return {
    ...(userId === undefined ? {} : { userId }),
    ...(sessionId === undefined ? {} : { sessionId }),
  };
}

function buildContextFromClaims(
  accessClaims: AccessTokenContextClaims,
  resolvedUserId: string | undefined,
): AppstorePcSessionContext | undefined {
  const tenantId = accessClaims.tenantId;
  const userId = resolvedUserId ?? accessClaims.userId;
  const appId = accessClaims.appId;
  if (!tenantId || !userId || !appId) {
    return undefined;
  }
  return {
    tenantId,
    userId,
    appId,
    ...(accessClaims.organizationId === undefined ? {} : { organizationId: accessClaims.organizationId }),
    ...(accessClaims.sessionId === undefined ? {} : { sessionId: accessClaims.sessionId }),
    ...(accessClaims.environment === undefined ? {} : { environment: accessClaims.environment as AppstorePcSessionContext['environment'] }),
    ...(accessClaims.deploymentMode === undefined ? {} : { deploymentMode: accessClaims.deploymentMode as AppstorePcSessionContext['deploymentMode'] }),
    ...(accessClaims.authLevel === undefined ? {} : { authLevel: accessClaims.authLevel as AppstorePcSessionContext['authLevel'] }),
  };
}

/**
 * Fill missing session identity/context from JWT credentials when a host
 * supplies tokens without a hydrated IAM AppContext snapshot.
 * @param snapshot - current App Store session snapshot.
 * @returns a snapshot with tenant/user context when the tokens carry it.
 */
export function enrichSessionSnapshotFromAccessToken(
  snapshot: AppstorePcSessionSnapshot,
): AppstorePcSessionSnapshot {
  const accessClaims = readAccessTokenContextClaims(snapshot.accessToken);
  const authClaims = readAuthTokenUserClaims(snapshot.authToken);
  if (!accessClaims && !authClaims) {
    return snapshot;
  }
  const resolvedUserId = authClaims?.userId
    ?? (typeof snapshot.user === 'object' && snapshot.user !== null && 'id' in snapshot.user && typeof snapshot.user.id === 'string'
      ? snapshot.user.id.trim()
      : undefined)
    ?? accessClaims?.userId;
  const context = accessClaims
    ? buildContextFromClaims(accessClaims, resolvedUserId)
    : undefined;
  if (!context) {
    return snapshot;
  }
  const user = resolvedUserId === undefined
    ? snapshot.user
    : (typeof snapshot.user === 'object' && snapshot.user !== null && 'id' in snapshot.user
      ? snapshot.user
      : { id: resolvedUserId });
  return {
    ...snapshot,
    ...(snapshot.sessionId === undefined && authClaims?.sessionId === undefined && accessClaims?.sessionId === undefined
      ? {}
      : { sessionId: snapshot.sessionId ?? authClaims?.sessionId ?? accessClaims?.sessionId }),
    ...(user === undefined ? {} : { user }),
    context,
  };
}
