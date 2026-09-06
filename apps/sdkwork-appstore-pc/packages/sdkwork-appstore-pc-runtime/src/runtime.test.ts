import { afterEach, describe, expect, it, vi } from 'vitest';
import { SDKWORK_SESSION_AUTH_UNAUTHORIZED_EVENT } from '@sdkwork/auth-runtime-pc-react';
import type { AuthTokenManager } from '@sdkwork/sdk-common';

import type { AppstorePcRuntimeConfig } from './environment';
import { createAppstorePcRuntime } from './runtime';

const fixtureConfig: AppstorePcRuntimeConfig = {
  agentsAppApiBaseUrl: 'https://agents.example.test',
  commentsAppApiBaseUrl: 'https://comments.example.test',
  appApiBaseUrl: 'https://app.example.test',
  appDisplayName: 'App Store fixture',
  appKey: 'sdkwork-appstore-pc',
  backendApiBaseUrl: 'https://backend.example.test',
  deploymentProfile: 'cloud',
  environment: 'development',
  iamAppApiBaseUrl: 'https://iam.example.test',
  locale: 'zh-CN',
  mcpAppApiBaseUrl: 'https://mcp.example.test',
  runtimeTarget: 'browser',
  skillsAppApiBaseUrl: 'https://skills.example.test',
};

function stubTokenManager(): AuthTokenManager & { tokenSets: unknown[] } {
  const tokenSets: unknown[] = [];
  return {
    tokenSets,
    clearAccessToken: () => {},
    clearAuthToken: () => {},
    clearTokens: () => {},
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
    setTokens: (tokens: unknown) => { tokenSets.push(tokens); },
    willExpireIn: () => false,
  } as unknown as AuthTokenManager & { tokenSets: unknown[] };
}

describe('createAppstorePcRuntime', () => {
  it('binds the injected host token manager across the runtime', () => {
    const hostTokenManager = stubTokenManager();

    const runtime = createAppstorePcRuntime(fixtureConfig, { tokenManager: hostTokenManager });

    expect(runtime.iamRuntime.composition.tokenManager).toBe(hostTokenManager);
  });

  it('mirrors session-store tokens into the injected host token manager', () => {
    const hostTokenManager = stubTokenManager();

    const runtime = createAppstorePcRuntime(fixtureConfig, { tokenManager: hostTokenManager });
    runtime.session.setSession({ accessToken: 'access-1', authToken: 'auth-1' });

    expect(hostTokenManager.tokenSets.at(-1)).toMatchObject({
      accessToken: 'access-1',
      authToken: 'auth-1',
    });
  });

  it('mints its own session-backed token manager without the host option', () => {
    const runtime = createAppstorePcRuntime(fixtureConfig);

    const manager = runtime.iamRuntime.composition.tokenManager;
    expect(manager).toBeDefined();
    expect(typeof manager.getAccessToken).toBe('function');
    expect(typeof manager.setTokens).toBe('function');
  });
});

describe('createAppstorePcRuntime session-auth boundary', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  /** Desktop-carrier-like window: the boundary only arms when `window` exists. */
  function stubDesktopCarrierWindow(): void {
    vi.stubGlobal('window', {
      location: { hostname: 'dsh', pathname: '/index.html', search: '', hash: '' },
    });
  }

  function stubTokenManagerWithAccessToken(): AuthTokenManager {
    const manager = stubTokenManager() as unknown as Record<string, unknown>;
    manager.getAccessToken = () => 'bootstrap-access-token';
    return manager as unknown as AuthTokenManager;
  }

  function stubUnauthorizedFetch(): void {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ detail: 'session expired' }), {
          status: 401,
          headers: { 'content-type': 'application/json' },
        })),
    );
  }

  it('redirects the window on an unauthorized response under the default standalone policy', async () => {
    stubDesktopCarrierWindow();
    stubUnauthorizedFetch();
    const redirectToLogin = vi.fn();
    const runtime = createAppstorePcRuntime(fixtureConfig, {
      tokenManager: stubTokenManagerWithAccessToken(),
      sessionAuth: { redirectToLogin },
    });

    await expect(
      runtime.sdkClients.app.generated.http.request('/library/items'),
    ).rejects.toMatchObject({ httpStatus: 401 });

    expect(redirectToLogin).toHaveBeenCalledTimes(1);
    expect(redirectToLogin.mock.calls[0]?.[0]).toBe('/auth/login?redirect=%2Findex.html');
  });

  it('keeps the window when the embedded policy suppresses the unauthorized redirect', async () => {
    stubDesktopCarrierWindow();
    stubUnauthorizedFetch();
    const redirectToLogin = vi.fn();
    const runtime = createAppstorePcRuntime(fixtureConfig, {
      tokenManager: stubTokenManagerWithAccessToken(),
      sessionAuth: { shouldRedirectOnUnauthorized: () => false, redirectToLogin },
    });

    await expect(
      runtime.sdkClients.app.generated.http.request('/library/items'),
    ).rejects.toMatchObject({ httpStatus: 401 });

    expect(redirectToLogin).not.toHaveBeenCalled();
  });

  it('pins the redirect mode so a modal-mode host never receives the dispatch', async () => {
    // A localhost window would resolve the ambient mode to "modal" and dispatch
    // the unauthorized event, steering the embedded router to the sign-in route
    // on background catalog calls; the pinned mode must suppress that.
    const windowTarget = new EventTarget() as EventTarget & {
      location: { hostname: string, pathname: string, search: string, hash: string };
    };
    windowTarget.location = { hostname: '127.0.0.1', pathname: '/index.html', search: '', hash: '' };
    vi.stubGlobal('window', windowTarget);
    stubUnauthorizedFetch();
    const dispatched: unknown[] = [];
    const listener = (event: Event): void => { dispatched.push(event); };
    windowTarget.addEventListener(SDKWORK_SESSION_AUTH_UNAUTHORIZED_EVENT, listener);
    const runtime = createAppstorePcRuntime(fixtureConfig, {
      tokenManager: stubTokenManagerWithAccessToken(),
      sessionAuth: {
        readEnv: (name) =>
          name === 'VITE_SDKWORK_SESSION_AUTH_UNAUTHORIZED_MODE' ? 'redirect' : undefined,
        shouldRedirectOnUnauthorized: () => false,
      },
    });

    await expect(
      runtime.sdkClients.app.generated.http.request('/library/items'),
    ).rejects.toMatchObject({ httpStatus: 401 });

    expect(dispatched).toEqual([]);
  });
});
