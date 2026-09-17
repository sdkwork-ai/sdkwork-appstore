import { AppstoreAppSdkClients } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

import { GamesPageResult } from '../models/GamesModels';

/**
 * Games service.
 *
 * The App Store app SDK clients are injected by the entry-module bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export class GamesService {
  readonly capability: string = 'games';
  private clients: AppstoreAppSdkClients;

  constructor(clients: AppstoreAppSdkClients) {
    this.clients = clients;
  }

  empty(): GamesPageResult<never> {
    return { items: [] };
  }
}

export function createGamesService(clients: AppstoreAppSdkClients): GamesService {
  return new GamesService(clients);
}
