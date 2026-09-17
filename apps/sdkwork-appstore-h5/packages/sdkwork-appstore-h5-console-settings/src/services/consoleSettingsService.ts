import type { AppstoreAppSdkClient } from '@sdkwork/appstore-h5-core';

import type { ConsoleSettingsPageResult } from '../types/consoleSettingsModels';

/**
 * Console Settings service.
 *
 * The generated app SDK clients are injected by the application root bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export class ConsoleSettingsService {
  readonly capability = 'console-settings';

  constructor(private readonly client: AppstoreAppSdkClient) {}

  empty(): ConsoleSettingsPageResult<never> {
    return { items: [] };
  }
}
