import {
  createAppstorePcSdkClients,
  normalizeGeneratedSdkBaseUrl,
  type AppstorePcSdkClientInventory,
  type AppstorePcSdkBaseUrls,
} from '@sdkwork/appstore-pc-core';

export {
  createAppstorePcSdkClients,
  normalizeGeneratedSdkBaseUrl,
  type AppstorePcSdkClientInventory,
};

/** Keep the existing sdkClients entrypoint typing aligned with core. */
export type AppstorePcSdkClientsInput = AppstorePcSdkBaseUrls;