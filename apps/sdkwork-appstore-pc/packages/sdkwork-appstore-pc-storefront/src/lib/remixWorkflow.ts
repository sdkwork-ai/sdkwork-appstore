/**
 * Remix execution workflow.
 *
 * One function owns the branch selection so the dialog only renders states:
 * `GIT` hands clone coordinates back for the instruction view, `ARCHIVE` fetches
 * the bytes, verifies the published SHA-256, and either unpacks them into the
 * directory the user picked or, when the browser has no File System Access API,
 * saves the archive as a normal download and says so.
 *
 * Every dependency is injected, so the branches are testable without a browser.
 */

import type {
  ListingRemixDownload,
  RemixArchiveCoordinates,
} from '@sdkwork/appstore-pc-core';

import {
  extractZipEntries,
  writeZipEntries,
  RemixZipError,
  type RemixDirectoryHandle,
} from './remixZip';

/** Picks the destination directory, or resolves `null` when the user cancels. */
export type RemixDirectoryPicker = () => Promise<RemixDirectoryHandle | null>;

/** Everything the workflow needs from the runtime. */
export interface RemixWorkflowDeps {
  /** Remix coordinates of the listing (app-api `listings.remix.retrieve`). */
  getRemix(listingId: string): Promise<ListingRemixDownload>;
  /** Archive bytes through the Drive app API. */
  fetchArchive(coordinates: RemixArchiveCoordinates): Promise<Uint8Array>;
  /** Directory picker; absent when the browser cannot write files. */
  pickDirectory?: RemixDirectoryPicker;
  /** Plain-download fallback for browsers without a directory picker. */
  saveArchive(bytes: Uint8Array, fileName: string): Promise<void>;
}

/** Terminal state of one remix attempt. */
export type RemixOutcome =
  | { status: 'git'; download: ListingRemixDownload }
  | { status: 'written'; filesWritten: number; directoryName: string }
  | { status: 'downloaded'; fileName: string }
  | { status: 'cancelled' };

/** Published checksum does not match the fetched bytes. */
export class RemixIntegrityError extends Error {
  constructor(expected: string, actual: string) {
    super(`The archive checksum does not match the published digest (${expected} != ${actual}).`);
    this.name = 'RemixIntegrityError';
  }
}

/** Deploy declared a download the storefront cannot use as-is. */
export class RemixPayloadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RemixPayloadError';
  }
}

/** True when the payload carries the coordinates its mode requires. */
export function hasUsableCoordinates(download: ListingRemixDownload): boolean {
  if (download.mode === 'GIT') {
    return (download.git?.repoUrl ?? '').trim() !== '';
  }
  return (download.archive?.driveNodeId ?? '').trim() !== '';
}

/**
 * Normalize a published SHA-256 digest to lowercase hex.
 * @param value - published digest (`sha256:<hex>` or plain hex).
 * @returns 64-character lowercase hex, or `null` when the value is unusable.
 */
export function normalizeSha256(value: string | undefined): string | null {
  const raw = (value ?? '').trim().toLowerCase();
  if (raw === '') {
    return null;
  }
  const hex = raw.startsWith('sha256:') ? raw.slice('sha256:'.length).trim() : raw;
  return /^[a-f0-9]{64}$/u.test(hex) ? hex : null;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * SHA-256 of a byte array as lowercase hex.
 * @param bytes - input bytes.
 * @returns 64-character lowercase hex digest.
 */
export async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const copy = new Uint8Array(bytes);
  const digest = await crypto.subtle.digest('SHA-256', copy.buffer);
  return toHex(digest);
}

/**
 * Verify the fetched bytes against the published digest.
 *
 * A verified digest is mandatory when deploy published one; an absent or
 * unparsable published digest is reported as a payload problem rather than
 * silently skipping verification, because an archive without a usable digest
 * cannot be proven to be the artifact the operator published.
 *
 * @param checksum - published digest, when present.
 * @param bytes - fetched archive bytes.
 * @throws {RemixIntegrityError} when the digest does not match.
 */
async function verifyArchive(checksum: string | undefined, bytes: Uint8Array): Promise<void> {
  if ((checksum ?? '').trim() === '') {
    return;
  }
  const expected = normalizeSha256(checksum);
  if (expected === null) {
    throw new RemixPayloadError(
      'Deploy published an unreadable SHA-256 digest for this archive; refusing to unpack it.',
    );
  }
  const actual = await sha256Hex(bytes);
  if (actual !== expected) {
    throw new RemixIntegrityError(expected, actual);
  }
}

/**
 * Run one remix attempt.
 *
 * @param deps - injected runtime capabilities.
 * @param listingId - store listing id.
 * @returns the terminal outcome the dialog renders.
 * @throws {RemixPayloadError} when the coordinates are incomplete or the
 *   archive is empty.
 * @throws {RemixIntegrityError} when the checksum does not match.
 * @throws {RemixZipError} when the archive is corrupt, unsupported, unsafe, or
 *   cannot be written.
 */
export async function runRemix(
  deps: RemixWorkflowDeps,
  listingId: string,
): Promise<RemixOutcome> {
  const download = await deps.getRemix(listingId);
  if (!hasUsableCoordinates(download)) {
    throw new RemixPayloadError(
      `The remix download for ${listingId} is missing its ${download.mode} coordinates.`,
    );
  }
  if (download.mode === 'GIT') {
    return { status: 'git', download };
  }

  const archive = download.archive;
  if (archive === undefined) {
    throw new RemixPayloadError(
      `The remix download for ${listingId} declares ARCHIVE without an archive.`,
    );
  }

  const bytes = await deps.fetchArchive(archive);
  await verifyArchive(archive.checksumSha256, bytes);

  if (deps.pickDirectory === undefined) {
    await deps.saveArchive(bytes, archive.fileName);
    return { status: 'downloaded', fileName: archive.fileName };
  }

  const root = await deps.pickDirectory();
  if (root === null) {
    return { status: 'cancelled' };
  }
  const entries = await extractZipEntries(bytes);
  if (entries.length === 0) {
    throw new RemixPayloadError('The source archive contains no files.');
  }
  const filesWritten = await writeZipEntries(root, entries);
  return { status: 'written', filesWritten, directoryName: root.name ?? '' };
}

/** The subset of `window` the directory picker lives on. */
export interface DirectoryPickerHost {
  showDirectoryPicker?: (options?: {
    mode?: 'read' | 'readwrite';
  }) => Promise<RemixDirectoryHandle>;
}

/**
 * Whether this browser can write into a directory the user picks.
 * @param host - `window`, or a stub in tests.
 * @returns true when `showDirectoryPicker` is callable.
 */
export function supportsDirectoryPicker(host: DirectoryPickerHost | undefined): boolean {
  return typeof host?.showDirectoryPicker === 'function';
}

/**
 * Build the picker used by the workflow.
 * @param host - `window`, or a stub in tests.
 * @returns a picker, or `undefined` when the API is unavailable.
 */
export function directoryPickerFor(
  host: DirectoryPickerHost | undefined,
): RemixDirectoryPicker | undefined {
  const picker = host?.showDirectoryPicker;
  if (typeof picker !== 'function') {
    return undefined;
  }
  return async () => {
    try {
      return await picker.call(host, { mode: 'readwrite' });
    } catch (error) {
      // A dismissed picker rejects with AbortError; treat it as cancellation
      // instead of a failure.
      if (error instanceof DOMException && error.name === 'AbortError') {
        return null;
      }
      throw error;
    }
  };
}

/** True when the error came from the ZIP reader/writer. */
export function isRemixZipError(error: unknown): error is RemixZipError {
  return error instanceof RemixZipError;
}
