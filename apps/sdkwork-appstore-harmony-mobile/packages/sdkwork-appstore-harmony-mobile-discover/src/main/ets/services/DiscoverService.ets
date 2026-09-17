import { AppstoreAppSdkClients } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

import { DiscoverPageResult } from '../models/DiscoverModels';

/**
 * Discover service.
 *
 * The App Store app SDK clients are injected by the entry-module bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export class DiscoverService {
  readonly capability: string = 'discover';
  private clients: AppstoreAppSdkClients;

  constructor(clients: AppstoreAppSdkClients) {
    this.clients = clients;
  }

  empty(): DiscoverPageResult<never> {
    return { items: [] };
  }
}

export function createDiscoverService(clients: AppstoreAppSdkClients): DiscoverService {
  return new DiscoverService(clients);
}
