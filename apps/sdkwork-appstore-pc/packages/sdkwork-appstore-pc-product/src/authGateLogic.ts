export interface AppstoreRouteLocation {
  hash?: string;
  pathname: string;
  search?: string;
}

export type AppstorePcAuthGateDecision =
  | { kind: 'product-route' }
  | { kind: 'auth-route' }
  | { kind: 'redirect'; replace: true; to: string };

const AUTH_BASE_PATH = '/auth';
const AUTH_LOGIN_PATH = '/auth/login';
const DEFAULT_HOME_PATH = '/';
const PROTECTED_PATH_PREFIXES = ['/updates', '/console', '/admin', '/library', '/wishlist', '/publisher'];

export function buildAppstorePcLoginRedirect(location: AppstoreRouteLocation): string {
  const returnPath = `${normalizePathname(location.pathname)}${location.search ?? ''}${location.hash ?? ''}`;
  return `${AUTH_LOGIN_PATH}?redirect=${encodeURIComponent(returnPath)}`;
}

export function sanitizeAppstorePcAuthRedirect(value: string | null | undefined): string {
  if (!value) {
    return DEFAULT_HOME_PATH;
  }

  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return DEFAULT_HOME_PATH;
  }

  if (!decoded.startsWith('/') || decoded.startsWith('//')) {
    return DEFAULT_HOME_PATH;
  }

  const redirectUrl = new URL(decoded, 'http://sdkwork-appstore.local');
  if (isAuthRoute(redirectUrl.pathname)) {
    return DEFAULT_HOME_PATH;
  }
  return `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`;
}

export function isAppstorePcProtectedPath(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  return PROTECTED_PATH_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

export function resolveAppstorePcAuthGateDecision({
  hasSession,
  homePath = DEFAULT_HOME_PATH,
  location,
}: {
  hasSession: boolean;
  homePath?: string;
  location: AppstoreRouteLocation;
}): AppstorePcAuthGateDecision {
  const pathname = normalizePathname(location.pathname);

  if (isAuthRoute(pathname)) {
    if (!hasSession) {
      return { kind: 'auth-route' };
    }
    const redirect = new URLSearchParams((location.search ?? '').replace(/^\?/u, '')).get(
      'redirect',
    );
    return {
      kind: 'redirect',
      replace: true,
      to: sanitizeAppstorePcAuthRedirect(redirect) || normalizePathname(homePath),
    };
  }

  if (!hasSession && isAppstorePcProtectedPath(pathname)) {
    return {
      kind: 'redirect',
      replace: true,
      to: buildAppstorePcLoginRedirect(location),
    };
  }

  return { kind: 'product-route' };
}

function isAuthRoute(pathname: string): boolean {
  return pathname === AUTH_BASE_PATH || pathname.startsWith(`${AUTH_BASE_PATH}/`);
}

function normalizePathname(pathname: string): string {
  const normalized = pathname.trim();
  if (!normalized) {
    return '/';
  }
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}
