import { AppstoreAppSdkClients } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

import { LibraryPageResult } from '../models/LibraryModels';

/**
 * Library service.
 *
 * The App Store app SDK clients are injected by the entry-module bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export class LibraryService {
  readonly capability: string = 'library';
  private clients: AppstoreAppSdkClients;

  constructor(clients: AppstoreAppSdkClients) {
    this.clients = clients;
  }

  empty(): LibraryPageResult<never> {
    return { items: [] };
  }
}

export function createLibraryService(clients: AppstoreAppSdkClients): LibraryService {
  return new LibraryService(clients);
}
