import { AppstoreAppSdkClients } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

import { EventsPageResult } from '../models/EventsModels';

/**
 * Events service.
 *
 * The App Store app SDK clients are injected by the entry-module bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export class EventsService {
  readonly capability: string = 'events';
  private clients: AppstoreAppSdkClients;

  constructor(clients: AppstoreAppSdkClients) {
    this.clients = clients;
  }

  empty(): EventsPageResult<never> {
    return { items: [] };
  }
}

export function createEventsService(clients: AppstoreAppSdkClients): EventsService {
  return new EventsService(clients);
}
