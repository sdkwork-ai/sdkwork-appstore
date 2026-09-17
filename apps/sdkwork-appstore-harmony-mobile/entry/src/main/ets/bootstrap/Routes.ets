import { listAppstoreRouteIdentities, SdkworkUiRouteContribution } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

/**
 * Canonical App Store route identity table shared with the PC root.
 *
 * Authority: `APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 1.
 */
export function createRoutes(): SdkworkUiRouteContribution[] {
  return listAppstoreRouteIdentities();
}

export type { SdkworkUiRouteContribution };
