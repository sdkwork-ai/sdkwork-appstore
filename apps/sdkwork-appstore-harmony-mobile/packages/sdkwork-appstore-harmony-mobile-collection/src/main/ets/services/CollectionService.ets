import { AppstoreAppSdkClients } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

import { CollectionPageResult } from '../models/CollectionModels';

/**
 * Collection service.
 *
 * The App Store app SDK clients are injected by the entry-module bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export class CollectionService {
  readonly capability: string = 'collection';
  private clients: AppstoreAppSdkClients;

  constructor(clients: AppstoreAppSdkClients) {
    this.clients = clients;
  }

  empty(): CollectionPageResult<never> {
    return { items: [] };
  }
}

export function createCollectionService(clients: AppstoreAppSdkClients): CollectionService {
  return new CollectionService(clients);
}
