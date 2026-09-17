import { AppstoreAppSdkClients } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

import { WishlistPageResult } from '../models/WishlistModels';

/**
 * Wishlist service.
 *
 * The App Store app SDK clients are injected by the entry-module bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export class WishlistService {
  readonly capability: string = 'wishlist';
  private clients: AppstoreAppSdkClients;

  constructor(clients: AppstoreAppSdkClients) {
    this.clients = clients;
  }

  empty(): WishlistPageResult<never> {
    return { items: [] };
  }
}

export function createWishlistService(clients: AppstoreAppSdkClients): WishlistService {
  return new WishlistService(clients);
}
