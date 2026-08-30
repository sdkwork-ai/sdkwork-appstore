import {
  createSdkworkAppbasePcAuthRuntime,
  type SdkworkAppbasePcAuthRuntimeComposition,
} from '@sdkwork/auth-runtime-pc-react';
import { createTokenManager, type AuthTokenManager } from '@sdkwork/sdk-common';
import { getEnvironment } from './environment';
import { resetStoreClient } from '@/services/storeClient';
import { resetDriveClient } from '@/services/driveClient';
import { resetCommentsClient, resetNotificationClient } from '@/bootstrap/sdkClients';
import { resetCommerceDomainsClient } from '@/services/commerceDomainsClient';

const AUTH_TOKEN_KEY = 'auth-token';
const ACCESS_TOKEN_KEY = 'access-token';
const REFRESH_TOKEN_KEY = 'refresh-token';

export interface IamUser {
  userId: string;
  displayName: string;
  email?: string;
  organizationId?: string;
}

let authComposition: SdkworkAppbasePcAuthRuntimeComposition | null = null;
let currentUser: IamUser | null = null;

export const appstoreTokenManager: AuthTokenManager = createTokenManager();

function readStoredSession() {
  const authToken = localStorage.getItem(AUTH_TOKEN_KEY)?.trim();
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)?.trim();
  if (!authToken || !accessToken) {
    return null;
  }
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)?.trim();
  return {
    authToken,
    accessToken,
    ...(refreshToken ? { refreshToken } : {}),
  };
}

function commitStoredSession(session: {
  authToken?: string;
  accessToken?: string;
  refreshToken?: string;
}) {
  if (session.authToken) {
    localStorage.setItem(AUTH_TOKEN_KEY, session.authToken);
    appstoreTokenManager.setAuthToken(session.authToken);
  }
  if (session.accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
    appstoreTokenManager.setAccessToken(session.accessToken);
  }
  if (session.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
    appstoreTokenManager.setRefreshToken(session.refreshToken);
  }
  resetStoreClient();
  resetDriveClient();
  resetCommentsClient();
  resetNotificationClient();
  resetCommerceDomainsClient();
}

function clearStoredSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  appstoreTokenManager.clearTokens();
  currentUser = null;
  resetStoreClient();
  resetDriveClient();
  resetCommentsClient();
  resetNotificationClient();
  resetCommerceDomainsClient();
}

export function bootstrapAppstoreAuthRuntime(): SdkworkAppbasePcAuthRuntimeComposition {
  if (authComposition) {
    return authComposition;
  }

  const env = getEnvironment();
  const stored = readStoredSession();
  if (stored) {
    appstoreTokenManager.setTokens(stored);
  }

  authComposition = createSdkworkAppbasePcAuthRuntime({
    app: {
      appId: 'sdkwork-appstore-h5',
      deploymentMode: 'saas',
      environment:
        env.name === 'development' ? 'dev' : env.name === 'test' ? 'test' : 'prod',
      platform: 'mobile',
    },
    baseUrls: {
      appbaseAppApiBaseUrl: import.meta.env.VITE_APPBASE_API_URL || env.appbaseBaseUrl,
    },
    tokenManager: appstoreTokenManager,
    sessionBridge: {
      readSession: async () => readStoredSession(),
      commitSession: async (session) => {
        commitStoredSession(session);
      },
      clearSession: async () => {
        clearStoredSession();
      },
    },
    sdkClients: [
      {
        setTokenManager: (manager) => {
          const tokens = manager.getTokens();
          if (tokens.authToken || tokens.accessToken) {
            appstoreTokenManager.setTokens(tokens);
            resetStoreClient();
            resetDriveClient();
            resetCommentsClient();
  resetNotificationClient();
  resetCommerceDomainsClient();
          }
        },
      },
    ],
    hooks: {
      onSessionChanged: async () => {
        resetStoreClient();
        resetDriveClient();
        resetCommentsClient();
  resetNotificationClient();
  resetCommerceDomainsClient();
      },
    },
  });

  void authComposition.runtime.hydrateTokenManager().catch(() => {
    clearStoredSession();
  });

  return authComposition;
}

export function getAppstoreAuthRuntime(): SdkworkAppbasePcAuthRuntimeComposition {
  return authComposition ?? bootstrapAppstoreAuthRuntime();
}

export function getCurrentUser(): IamUser | null {
  return currentUser;
}

export function setCurrentUser(user: IamUser | null): void {
  currentUser = user;
}

export function clearCurrentUser(): void {
  currentUser = null;
}

export function isAuthenticated(): boolean {
  return !!appstoreTokenManager.getAuthToken();
}

export async function signInWithPassword(account: string, password: string): Promise<void> {
  const runtime = getAppstoreAuthRuntime().getRuntime();
  await runtime.service.auth.sessions.create({
    account,
    password,
    loginMethod: account.includes('@') ? 'email_password' : 'account_password',
  });
}

export async function signOut(): Promise<void> {
  const runtime = getAppstoreAuthRuntime().getRuntime();
  try {
    await runtime.service.auth.sessions.current.delete();
  } finally {
    clearStoredSession();
  }
}

export function applyDevTokens(authToken: string, accessToken?: string): void {
  commitStoredSession({
    authToken: authToken.trim(),
    accessToken: (accessToken?.trim() || authToken).trim(),
  });
}

function readProfileField(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

/** Load IAM current user profile and cache it for publisher uploads and settings. */
export async function fetchCurrentIamUser(): Promise<IamUser | null> {
  if (!isAuthenticated()) {
    currentUser = null;
    return null;
  }
  try {
    const runtime = getAppstoreAuthRuntime().getRuntime();
    const profile = await runtime.service.iam.users.current.retrieve();
    const row = (profile ?? {}) as unknown as Record<string, unknown>;
    const user: IamUser = {
      userId: readProfileField(row, 'id', 'userId', 'user_id'),
      displayName: readProfileField(row, 'displayName', 'display_name', 'name', 'nickname'),
      email: readProfileField(row, 'email'),
      organizationId: readProfileField(row, 'organizationId', 'organization_id'),
    };
    if (!user.userId) {
      return null;
    }
    currentUser = user;
    return user;
  } catch {
    return null;
  }
}
