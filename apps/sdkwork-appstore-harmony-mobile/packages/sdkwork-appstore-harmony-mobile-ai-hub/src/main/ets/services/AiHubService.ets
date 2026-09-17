import { AppstoreAppSdkClients } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

import { AiHubPageResult } from '../models/AiHubModels';

/**
 * Ai Hub service.
 *
 * The App Store app SDK clients are injected by the entry-module bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export class AiHubService {
  readonly capability: string = 'ai-hub';
  private clients: AppstoreAppSdkClients;

  constructor(clients: AppstoreAppSdkClients) {
    this.clients = clients;
  }

  empty(): AiHubPageResult<never> {
    return { items: [] };
  }
}

export function createAiHubService(clients: AppstoreAppSdkClients): AiHubService {
  return new AiHubService(clients);
}
