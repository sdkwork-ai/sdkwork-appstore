import { describe, expect, it } from 'vitest';

import {
  resolveAppstorePcAuthGateDecision,
  sanitizeAppstorePcAuthRedirect,
} from './authGateLogic';

describe('appstore PC auth gate', () => {
  it('keeps public marketplace routes available anonymously', () => {
    expect(
      resolveAppstorePcAuthGateDecision({
        hasSession: false,
        location: { pathname: '/app/example' },
      }),
    ).toEqual({ kind: 'product-route' });
  });

  it('redirects protected routes to IAM login with a return path', () => {
    expect(
      resolveAppstorePcAuthGateDecision({
        hasSession: false,
        location: { pathname: '/console/settings', search: '?tab=security' },
      }),
    ).toEqual({
      kind: 'redirect',
      replace: true,
      to: '/auth/login?redirect=%2Fconsole%2Fsettings%3Ftab%3Dsecurity',
    });
  });

  it('protects library, wishlist and publisher routes for anonymous users', () => {
    for (const pathname of ['/library', '/wishlist', '/publisher', '/publisher/apps/new', '/publisher/apps/app-1']) {
      expect(
        resolveAppstorePcAuthGateDecision({
          hasSession: false,
          location: { pathname },
        }),
      ).toEqual({
        kind: 'redirect',
        replace: true,
        to: `/auth/login?redirect=${encodeURIComponent(pathname)}`,
      });
    }
  });

  it('keeps public category, collection and event routes available anonymously', () => {
    for (const pathname of ['/category/ai-assistants', '/collection/editorial-1', '/events/event-1']) {
      expect(
        resolveAppstorePcAuthGateDecision({
          hasSession: false,
          location: { pathname },
        }),
      ).toEqual({ kind: 'product-route' });
    }
  });

  it('rejects external and recursive auth redirects', () => {
    expect(sanitizeAppstorePcAuthRedirect('https://example.com')).toBe('/');
    expect(sanitizeAppstorePcAuthRedirect('/auth/login')).toBe('/');
  });

  it('returns authenticated users from auth routes to their target', () => {
    expect(
      resolveAppstorePcAuthGateDecision({
        hasSession: true,
        location: {
          pathname: '/auth/login',
          search: '?redirect=%2Fupdates',
        },
      }),
    ).toEqual({ kind: 'redirect', replace: true, to: '/updates' });
  });
});
