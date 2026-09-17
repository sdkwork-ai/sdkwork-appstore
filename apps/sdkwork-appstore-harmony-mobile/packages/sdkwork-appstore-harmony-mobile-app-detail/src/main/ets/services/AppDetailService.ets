import { AppstoreAppSdkClients } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

import { AppDetailPageResult } from '../models/AppDetailModels';

/**
 * App Detail service.
 *
 * The App Store app SDK clients are injected by the entry-module bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export class AppDetailService {
  readonly capability: string = 'app-detail';
  private clients: AppstoreAppSdkClients;

  constructor(clients: AppstoreAppSdkClients) {
    this.clients = clients;
  }

  empty(): AppDetailPageResult<never> {
    return { items: [] };
  }
}

export function createAppDetailService(clients: AppstoreAppSdkClients): AppDetailService {
  return new AppDetailService(clients);
}
