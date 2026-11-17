/**
 * Drive-backed remix archive transfer.
 *
 * The Drive SDK mints a short-lived download URL for the archive node; the
 * bytes themselves are fetched from that URL, which is the documented Drive
 * delivery path (deploy neither proxies bytes nor signs URLs). This module lives
 * outside `services/` because it performs the raw byte transfer the service
 * layer is not allowed to own.
 */

import type { SdkworkDriveAppClient } from '../sdk/drive';
import type { RemixArchiveDownloadPort, RemixArchiveRequest } from '../services/remixArchive';

/** Drive download-URL TTL used for one archive fetch (clamped server-side). */
const ARCHIVE_URL_TTL_SECONDS = 300;

/**
 * Build the Drive-backed archive port.
 *
 * @param driveClient - generated Drive app client on the shared gateway origin.
 * @returns a port that mints a download URL and fetches the bytes.
 */
export function createDriveRemixArchivePort(
  driveClient: SdkworkDriveAppClient,
): RemixArchiveDownloadPort {
  return {
    async downloadArchive(
      request: RemixArchiveRequest,
      signal?: AbortSignal,
    ): Promise<Uint8Array> {
      const nodeId = request.driveNodeId.trim();
      if (!nodeId) {
        throw new Error('The remix archive is missing its Drive node identity.');
      }
      const grant = await driveClient.drive.nodes.downloadUrls.retrieve(nodeId, {
        requestedTtlSeconds: ARCHIVE_URL_TTL_SECONDS,
      });
      const url = grant.downloadUrl?.trim();
      if (!url) {
        throw new Error('Drive did not return a download URL for the remix archive.');
      }
      const response = await fetch(url, signal === undefined ? undefined : { signal });
      if (!response.ok) {
        throw new Error(`The remix archive download failed with HTTP ${response.status}.`);
      }
      const bytes = new Uint8Array(await response.arrayBuffer());
      const expected = Number.parseInt(request.contentLength ?? '', 10);
      if (Number.isFinite(expected) && expected > 0 && bytes.byteLength !== expected) {
        throw new Error(
          `The remix archive is ${bytes.byteLength} bytes but deploy declared ${expected}.`,
        );
      }
      return bytes;
    },
  };
}
