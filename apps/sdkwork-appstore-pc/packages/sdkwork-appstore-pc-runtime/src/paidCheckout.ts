import {
  configurePaidListingCheckoutPort,
} from '@sdkwork/appstore-pc-core';
import type { AuthTokenManager } from '@sdkwork/sdk-common';

import { createPaidListingCheckoutPort } from '@sdkwork/appstore-pc-core';

/**
 * Bind the paid-listing checkout port over the cloudrouter domains surface.
 * The storefront's InstallProvider routes every PAID install through it, so
 * a paid listing can never be adopted through the free install path.
 */
export function configureAppstorePcPaidCheckout(config: {
  baseUrl: string;
  tokenManager: AuthTokenManager;
}): void {
  configurePaidListingCheckoutPort(createPaidListingCheckoutPort(config));
}
