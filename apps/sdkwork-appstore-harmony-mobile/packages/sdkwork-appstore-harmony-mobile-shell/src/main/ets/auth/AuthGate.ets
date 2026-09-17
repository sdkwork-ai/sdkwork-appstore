/**
 * AuthGate integration.
 *
 * Authority: `IAM_LOGIN_INTEGRATION_SPEC.md`. The gate decides whether a route
 * may render and never constructs its own SDK client.
 */
export interface AppstoreAuthGateResult {
  readonly allowed: boolean;
  readonly redirectTo?: string;
}

export function evaluateAppstoreAuthGate(
  path: string,
  authenticated: boolean,
  protectedPrefixes: string[],
): AppstoreAuthGateResult {
  const isProtected: boolean = protectedPrefixes.some((prefix: string) => path.startsWith(prefix));
  if (!isProtected || authenticated) {
    return { allowed: true };
  }
  return { allowed: false, redirectTo: '/auth' };
}

@Component
export struct AppstoreAuthGate {
  @BuilderParam child: () => void;

  build() {
    Column() {
      this.child()
    }
    .width('100%')
    .height('100%')
  }
}
