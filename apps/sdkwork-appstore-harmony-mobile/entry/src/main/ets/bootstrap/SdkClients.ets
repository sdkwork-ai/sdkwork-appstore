import { createAppstoreHarmonyAppSdkClients, AppstoreAppSdkClients } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

import { assertAppstoreAppApiBaseUrl, AppstoreHarmonyEnvironment } from './Environment';

/** Construct the App Store app SDK clients for the entry module. */
export function createSdkClients(environment: AppstoreHarmonyEnvironment): AppstoreAppSdkClients {
  const baseUrl: string = assertAppstoreAppApiBaseUrl(environment.appstoreAppApiBaseUrl);
  return createAppstoreHarmonyAppSdkClients(baseUrl);
}
