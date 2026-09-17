/**
 * Mini program auth gate.
 *
 * Authority: `IAM_LOGIN_INTEGRATION_SPEC.md`. The gate routes unauthenticated
 * navigation to the sign-in page and never constructs its own SDK client.
 */
export interface AuthGateResult {
  readonly allowed: boolean;
  readonly redirectTo?: string;
}

export function evaluateAuthGate(options: {
  path: string;
  authenticated: boolean;
  protectedPrefixes: readonly string[];
}): AuthGateResult {
  const isProtected = options.protectedPrefixes.some((prefix) =>
    options.path.startsWith(prefix),
  );
  if (!isProtected || options.authenticated) {
    return { allowed: true };
  }
  return { allowed: false, redirectTo: "/pages/shell/index" };
}
