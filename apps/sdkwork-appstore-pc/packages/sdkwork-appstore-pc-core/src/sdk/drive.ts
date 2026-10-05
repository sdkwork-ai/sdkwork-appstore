import {
  createDriveAppClient,
  type SdkworkDriveAppClient,
} from '@sdkwork/drive-app-sdk';
import type { AuthTokenManager } from '@sdkwork/sdk-common';

export type { SdkworkDriveAppClient };

/**
 * Drive app client for the PC storefront (release artifact uploads). Rides
 * the shared gateway origin; the drive sdk adds its own API prefix.
 */
export function createAppstorePcDriveClient(config: {
  baseUrl: string;
  tokenManager: AuthTokenManager;
}): SdkworkDriveAppClient {
  return createDriveAppClient({
    baseUrl: config.baseUrl,
    tokenManager: config.tokenManager,
  });
}
