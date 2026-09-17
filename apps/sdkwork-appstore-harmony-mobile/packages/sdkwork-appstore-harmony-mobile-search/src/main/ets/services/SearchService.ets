import { AppstoreAppSdkClients } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

import { SearchPageResult } from '../models/SearchModels';

/**
 * Search service.
 *
 * The App Store app SDK clients are injected by the entry-module bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export class SearchService {
  readonly capability: string = 'search';
  private clients: AppstoreAppSdkClients;

  constructor(clients: AppstoreAppSdkClients) {
    this.clients = clients;
  }

  empty(): SearchPageResult<never> {
    return { items: [] };
  }
}

export function createSearchService(clients: AppstoreAppSdkClients): SearchService {
  return new SearchService(clients);
}
