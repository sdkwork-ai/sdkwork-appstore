import { AppstoreAppSdkClients } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

import { ChartsPageResult } from '../models/ChartsModels';

/**
 * Charts service.
 *
 * The App Store app SDK clients are injected by the entry-module bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export class ChartsService {
  readonly capability: string = 'charts';
  private clients: AppstoreAppSdkClients;

  constructor(clients: AppstoreAppSdkClients) {
    this.clients = clients;
  }

  empty(): ChartsPageResult<never> {
    return { items: [] };
  }
}

export function createChartsService(clients: AppstoreAppSdkClients): ChartsService {
  return new ChartsService(clients);
}
