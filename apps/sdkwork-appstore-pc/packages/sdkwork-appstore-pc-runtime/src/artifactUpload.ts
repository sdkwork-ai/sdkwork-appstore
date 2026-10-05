import {
  configureArtifactUploadPort,
  createArtifactUploadPort,
} from '@sdkwork/appstore-pc-core';
import {
  createAppstorePcDriveClient,
  type SdkworkDriveAppClient,
} from '@sdkwork/appstore-pc-core';
import type { AppStoreClient } from '@sdkwork/appstore-pc-core';
import { normalizeGeneratedSdkBaseUrl } from './sdkClients';
import type { AuthTokenManager } from '@sdkwork/sdk-common';

/**
 * Bind the release artifact upload port: drive sdk uploader (declared
 * `appstore.artifact` purpose) + app-api artifacts attach, over the shared
 * gateway origin and the global TokenManager.
 */
export function configureAppstorePcArtifactUpload(config: {
  baseUrl: string;
  tokenManager: AuthTokenManager;
  appClient: AppStoreClient;
}): void {
  const driveClient: SdkworkDriveAppClient = createAppstorePcDriveClient({
    baseUrl: config.baseUrl,
    tokenManager: config.tokenManager,
  });
  configureArtifactUploadPort(
    createArtifactUploadPort({
      driveClient,
      appClient: config.appClient,
    }),
  );
}
