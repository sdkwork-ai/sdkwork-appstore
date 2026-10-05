export { isFreePricingModel, isPaidPricingModel } from '@sdkwork/appstore-listing-acquire-core';

import {
  beginPaidListingCheckout,
  createDomainsClient,
  type PaidCheckoutResult,
  type SdkworkCloudrouterAppDomainsClient,
} from '@sdkwork/appstore-listing-acquire-core';
import type { AuthTokenManager } from '@sdkwork/sdk-common';

/**
 * Paid-listing checkout port.
 *
 * `beginPaidListingCheckout` (listing-acquire-core) walks the cloudrouter
 * domains surface fail-closed: single-SKU enforcement, currency match, and an
 * idempotent checkout session + quote. The composition root binds the port
 * with the shared gateway origin and the global TokenManager; the storefront
 * calls {@link beginPaidListingCheckoutForApp} before any install of a PAID
 * listing so a paid app can never be adopted like a free one.
 */
export interface PaidListingCheckoutPort {
  begin(context: { commerceProductId?: string }): Promise<PaidCheckoutResult>;
}

let checkoutPort: PaidListingCheckoutPort | undefined;

/** Bind the SDK-backed checkout port (called once by the runtime). */
export function configurePaidListingCheckoutPort(port: PaidListingCheckoutPort): void {
  checkoutPort = port;
}

export function createPaidListingCheckoutPort(config: {
  baseUrl: string;
  tokenManager: AuthTokenManager;
}): PaidListingCheckoutPort {
  return {
    async begin(context: { commerceProductId?: string }): Promise<PaidCheckoutResult> {
      const client: SdkworkCloudrouterAppDomainsClient = createDomainsClient({
        baseUrl: config.baseUrl,
        tokenManager: config.tokenManager,
      });
      return beginPaidListingCheckout(() => client, {
        commerceProductId: context.commerceProductId,
      });
    },
  };
}

/**
 * Begins the checkout for one paid listing. When the port is not bound
 * (embedded hosts that own payments themselves) the result is an honest
 * `unavailable`, never a silent free install.
 */
export async function beginPaidListingCheckoutForApp(context: {
  commerceProductId?: string;
}): Promise<PaidCheckoutResult> {
  const port = checkoutPort;
  if (!port) {
    return {
      status: 'unavailable',
      message: '支付能力暂未配置，无法购买付费应用。',
    };
  }
  return port.begin(context);
}
