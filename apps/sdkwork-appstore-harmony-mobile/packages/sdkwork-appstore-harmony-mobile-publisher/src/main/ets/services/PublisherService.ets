import { AppstoreAppSdkClients } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

import { PublisherPageResult } from '../models/PublisherModels';

/**
 * Publisher service.
 *
 * The App Store app SDK clients are injected by the entry-module bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export class PublisherService {
  readonly capability: string = 'publisher';
  private clients: AppstoreAppSdkClients;

  constructor(clients: AppstoreAppSdkClients) {
    this.clients = clients;
  }

  empty(): PublisherPageResult<never> {
    return { items: [] };
  }
}

export function createPublisherService(clients: AppstoreAppSdkClients): PublisherService {
  return new PublisherService(clients);
}
