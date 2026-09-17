import type { AppstoreAppSdkClient } from '@sdkwork/appstore-h5-core';

import type { AiHubPageResult } from '../types/aiHubModels';

/**
 * Ai Hub service.
 *
 * The generated app SDK clients are injected by the application root bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export class AiHubService {
  readonly capability = 'ai-hub';

  constructor(private readonly client: AppstoreAppSdkClient) {}

  empty(): AiHubPageResult<never> {
    return { items: [] };
  }
}
