import type { AppstoreAppSdkClient } from '@sdkwork/appstore-h5-core';

import type { UserStorePageResult } from '../types/userStoreModels';

/**
 * User Store service.
 *
 * The generated app SDK clients are injected by the application root bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export class UserStoreService {
  readonly capability = 'user-store';

  constructor(private readonly client: AppstoreAppSdkClient) {}

  empty(): UserStorePageResult<never> {
    return { items: [] };
  }
}
