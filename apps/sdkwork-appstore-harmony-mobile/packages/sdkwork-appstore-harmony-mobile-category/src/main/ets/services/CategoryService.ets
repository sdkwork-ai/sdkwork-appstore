import { AppstoreAppSdkClients } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

import { CategoryPageResult } from '../models/CategoryModels';

/**
 * Category service.
 *
 * The App Store app SDK clients are injected by the entry-module bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export class CategoryService {
  readonly capability: string = 'category';
  private clients: AppstoreAppSdkClients;

  constructor(clients: AppstoreAppSdkClients) {
    this.clients = clients;
  }

  empty(): CategoryPageResult<never> {
    return { items: [] };
  }
}

export function createCategoryService(clients: AppstoreAppSdkClients): CategoryService {
  return new CategoryService(clients);
}
