import { AppstoreAppSdkClients } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

import { SettingsPageResult } from '../models/SettingsModels';

/**
 * Settings service.
 *
 * The App Store app SDK clients are injected by the entry-module bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export class SettingsService {
  readonly capability: string = 'settings';
  private clients: AppstoreAppSdkClients;

  constructor(clients: AppstoreAppSdkClients) {
    this.clients = clients;
  }

  empty(): SettingsPageResult<never> {
    return { items: [] };
  }
}

export function createSettingsService(clients: AppstoreAppSdkClients): SettingsService {
  return new SettingsService(clients);
}
