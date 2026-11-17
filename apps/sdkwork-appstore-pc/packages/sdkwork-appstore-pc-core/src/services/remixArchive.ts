/**
 * Remix source-archive byte transfer port.
 *
 * Deploy never proxies source bytes: its remix read returns the Drive node that
 * holds the archive. Components do not construct the Drive client — the runtime
 * binds this port during bootstrap, exactly like the release-artifact upload
 * port. The Drive-backed implementation lives in `../remix/archive` so the
 * service layer stays free of raw HTTP and SDK construction.
 */

/** One archive to fetch. */
export interface RemixArchiveRequest {
  /** Drive node holding the archive bytes. */
  driveNodeId: string;
  /** Expected size in bytes as a decimal string, when deploy published one. */
  contentLength?: string;
}

/** Byte source of a remix archive. */
export interface RemixArchiveDownloadPort {
  /**
   * Fetch the complete archive.
   *
   * @param request - node identity of the archive.
   * @param signal - optional cancellation for the transfer.
   * @returns the archive bytes; the caller owns integrity verification.
   */
  downloadArchive(request: RemixArchiveRequest, signal?: AbortSignal): Promise<Uint8Array>;
}

/** Thrown when no Drive byte source was bound (app bootstrap skipped it). */
export class RemixArchiveUnavailableError extends Error {
  constructor() {
    super('The remix archive download port is not configured.');
    this.name = 'RemixArchiveUnavailableError';
  }
}

let archivePort: RemixArchiveDownloadPort = {
  downloadArchive: () => Promise.reject(new RemixArchiveUnavailableError()),
};

/** Bind the Drive-backed archive port during app bootstrap. */
export function configureRemixArchiveDownloadPort(port: RemixArchiveDownloadPort): void {
  archivePort = port;
}

/** The bound archive port. */
export function getRemixArchiveDownloadPort(): RemixArchiveDownloadPort {
  return archivePort;
}
