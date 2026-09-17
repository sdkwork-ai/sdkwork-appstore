import { AppstoreAppSdkClients } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

import { UserStorePageResult } from '../models/UserStoreModels';

/**
 * User Store service.
 *
 * The App Store app SDK clients are injected by the entry-module bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export class UserStoreService {
  readonly capability: string = 'user-store';
  private clients: AppstoreAppSdkClients;

  constructor(clients: AppstoreAppSdkClients) {
    this.clients = clients;
  }

  empty(): UserStorePageResult<never> {
    return { items: [] };
  }
}

export function createUserStoreService(clients: AppstoreAppSdkClients): UserStoreService {
  return new UserStoreService(clients);
}
