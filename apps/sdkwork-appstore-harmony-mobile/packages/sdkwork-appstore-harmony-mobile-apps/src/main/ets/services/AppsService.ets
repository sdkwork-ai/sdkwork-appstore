import { AppstoreAppSdkClients } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

import { AppsPageResult } from '../models/AppsModels';

/**
 * Apps service.
 *
 * The App Store app SDK clients are injected by the entry-module bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export class AppsService {
  readonly capability: string = 'apps';
  private clients: AppstoreAppSdkClients;

  constructor(clients: AppstoreAppSdkClients) {
    this.clients = clients;
  }

  empty(): AppsPageResult<never> {
    return { items: [] };
  }
}

export function createAppsService(clients: AppstoreAppSdkClients): AppsService {
  return new AppsService(clients);
}
