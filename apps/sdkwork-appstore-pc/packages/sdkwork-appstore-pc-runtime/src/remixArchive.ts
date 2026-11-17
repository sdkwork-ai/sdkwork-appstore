import {
  configureRemixArchiveDownloadPort,
  createAppstorePcDriveClient,
  createDriveRemixArchivePort,
} from '@sdkwork/appstore-pc-core';
import type { AuthTokenManager } from '@sdkwork/sdk-common';

/**
 * Bind the remix source-archive port: a Drive download URL plus a byte fetch on
 * the shared gateway origin.
 *
 * Remix archives are deploy-owned artifacts whose bytes live in sdkwork-drive;
 * the storefront mints a short-lived download URL with the same Drive client the
 * release-artifact uploader uses.
 */
export function configureAppstorePcRemixArchive(config: {
  baseUrl: string;
  tokenManager: AuthTokenManager;
}): void {
  const driveClient = createAppstorePcDriveClient({
    baseUrl: config.baseUrl,
    tokenManager: config.tokenManager,
  });
  configureRemixArchiveDownloadPort(createDriveRemixArchivePort(driveClient));
}
