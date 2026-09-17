import { AppstoreAppSdkClients } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

import { UpdatesPageResult } from '../models/UpdatesModels';

/**
 * Updates service.
 *
 * The App Store app SDK clients are injected by the entry-module bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export class UpdatesService {
  readonly capability: string = 'updates';
  private clients: AppstoreAppSdkClients;

  constructor(clients: AppstoreAppSdkClients) {
    this.clients = clients;
  }

  empty(): UpdatesPageResult<never> {
    return { items: [] };
  }
}

export function createUpdatesService(clients: AppstoreAppSdkClients): UpdatesService {
  return new UpdatesService(clients);
}
