/**
 * Minimal, dependency-free ZIP reader for remix source archives.
 *
 * Deploy publishes a source archive; the storefront must unpack it into a
 * directory the user picked. The workspace ships no ZIP dependency for the
 * browser bundle, and the two shapes that matter (`stored` and `deflate`) are
 * decodable with the platform's own `DecompressionStream('deflate-raw')`, so the
 * reader is implemented here instead of adding a bundle dependency:
 *
 * - stored entries (method 0) are sliced as-is;
 * - deflated entries (method 8) go through `DecompressionStream`;
 * - everything else (encrypted entries, ZIP64, unsupported methods) is refused
 *   with an explicit error instead of producing a half-written tree.
 *
 * Paths are validated before any write: an absolute path, a Windows drive
 * prefix, a NUL byte, or a `..` segment rejects the whole archive, so an archive
 * cannot escape the chosen directory.
 */

/** Why an archive could not be unpacked. */
export type RemixZipFailure =
  | 'corrupt-archive'
  | 'unsupported-archive'
  | 'unsafe-path'
  | 'write-failed';

/** Typed failure of the archive reader/writer. */
export class RemixZipError extends Error {
  readonly reason: RemixZipFailure;

  constructor(reason: RemixZipFailure, message: string) {
    super(message);
    this.name = 'RemixZipError';
    this.reason = reason;
  }
}

/** One file to create, already decompressed. */
export interface ZipEntry {
  /** Directory segments below the chosen root, already path-validated. */
  directory: string[];
  /** File name (last path segment). */
  name: string;
  /** Decompressed bytes. */
  data: Uint8Array;
}

/** Structural view of a directory the user picked. */
export interface RemixDirectoryHandle {
  /** Display name of the picked directory, when the platform exposes one. */
  readonly name?: string;
  getDirectoryHandle(
    name: string,
    options?: { create?: boolean },
  ): Promise<RemixDirectoryHandle>;
  getFileHandle(
    name: string,
    options?: { create?: boolean },
  ): Promise<RemixFileHandle>;
}

/** Structural view of a file inside a picked directory. */
export interface RemixFileHandle {
  createWritable(): Promise<RemixWritableFileStream>;
}

/** Structural view of a writable file stream. */
export interface RemixWritableFileStream {
  write(data: Uint8Array): Promise<void>;
  close(): Promise<void>;
}

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_DIRECTORY_SIGNATURE = 0x02014b50;
const LOCAL_HEADER_SIGNATURE = 0x04034b50;
const EOCD_MIN_SIZE = 22;
const MAX_COMMENT_SIZE = 0xffff;
const ZIP64_SENTINEL_16 = 0xffff;
const FLAG_ENCRYPTED = 0x1;

const METHOD_STORED = 0;
const METHOD_DEFLATE = 8;

function readU16(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function readU32(bytes: Uint8Array, offset: number): number {
  return (
    (bytes[offset] |
      (bytes[offset + 1] << 8) |
      (bytes[offset + 2] << 16) |
      (bytes[offset + 3] << 24)) >>>
    0
  );
}

function decodeName(bytes: Uint8Array): string {
  // Bit 11 marks UTF-8; older archivers store CP437, but every archive this
  // pipeline meets is written by the deploy uploader or a modern git host, and
  // UTF-8 is a strict superset for ASCII paths.
  return new TextDecoder('utf-8').decode(bytes);
}

/** Locate the End Of Central Directory record. */
function findEndOfCentralDirectory(bytes: Uint8Array): number {
  const lowerBound = Math.max(0, bytes.length - EOCD_MIN_SIZE - MAX_COMMENT_SIZE);
  for (let offset = bytes.length - EOCD_MIN_SIZE; offset >= lowerBound; offset -= 1) {
    if (readU32(bytes, offset) === EOCD_SIGNATURE) {
      return offset;
    }
  }
  throw new RemixZipError('corrupt-archive', 'The archive has no ZIP directory record.');
}

/**
 * Validate one archive path and split it into directory segments plus file name.
 * @param rawName - path as stored in the archive.
 * @returns directory segments and file name.
 * @throws {RemixZipError} when the path is absolute, traversing, or empty.
 */
export function normalizeArchivePath(rawName: string): { directory: string[]; name: string } {
  if (rawName.includes('\0')) {
    throw new RemixZipError('unsafe-path', 'The archive contains a path with a NUL byte.');
  }
  const unified = rawName.replaceAll('\\', '/');
  if (unified.startsWith('/') || /^[a-zA-Z]:/u.test(unified)) {
    throw new RemixZipError(
      'unsafe-path',
      `The archive contains an absolute path: ${rawName}`,
    );
  }
  const segments = unified.split('/').filter((segment) => segment !== '' && segment !== '.');
  if (segments.includes('..')) {
    throw new RemixZipError(
      'unsafe-path',
      `The archive contains a parent traversal: ${rawName}`,
    );
  }
  const name = segments.pop();
  if (name === undefined || name === '') {
    throw new RemixZipError('unsafe-path', `The archive contains an empty path: ${rawName}`);
  }
  return { directory: segments, name };
}

async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === 'undefined') {
    throw new RemixZipError(
      'unsupported-archive',
      'This browser cannot decompress deflated archives.',
    );
  }
  // Copy into a fresh ArrayBuffer-backed view so the Blob part is a plain
  // ArrayBuffer, independent of the source buffer's offset or shared state.
  const part = new Uint8Array(data);
  const stream = new Blob([part.buffer])
    .stream()
    .pipeThrough(new DecompressionStream('deflate-raw'));
  const inflated = await new Response(stream).arrayBuffer();
  return new Uint8Array(inflated);
}

/**
 * Read every file of a ZIP archive.
 *
 * @param bytes - complete archive bytes.
 * @returns one entry per file, directories skipped and paths validated.
 * @throws {RemixZipError} for a corrupt, encrypted, ZIP64, or unsupported
 *   archive, and for any unsafe path (the whole archive is rejected).
 */
export async function extractZipEntries(bytes: Uint8Array): Promise<ZipEntry[]> {
  const eocd = findEndOfCentralDirectory(bytes);
  const entryCount = readU16(bytes, eocd + 10);
  const centralDirectoryOffset = readU32(bytes, eocd + 16);
  if (
    entryCount === ZIP64_SENTINEL_16 ||
    centralDirectoryOffset === 0xffffffff ||
    centralDirectoryOffset >= bytes.length
  ) {
    throw new RemixZipError(
      'unsupported-archive',
      'ZIP64 or truncated archives are not supported for remix.',
    );
  }

  const entries: ZipEntry[] = [];
  let cursor = centralDirectoryOffset;
  for (let index = 0; index < entryCount; index += 1) {
    if (cursor + 46 > bytes.length) {
      throw new RemixZipError('corrupt-archive', 'The archive directory is truncated.');
    }
    if (readU32(bytes, cursor) !== CENTRAL_DIRECTORY_SIGNATURE) {
      throw new RemixZipError('corrupt-archive', 'The archive directory entry is malformed.');
    }
    const flags = readU16(bytes, cursor + 8);
    const method = readU16(bytes, cursor + 10);
    const compressedSize = readU32(bytes, cursor + 20);
    const uncompressedSize = readU32(bytes, cursor + 24);
    const nameLength = readU16(bytes, cursor + 28);
    const extraLength = readU16(bytes, cursor + 30);
    const commentLength = readU16(bytes, cursor + 32);
    const localHeaderOffset = readU32(bytes, cursor + 42);
    const nameStart = cursor + 46;
    const nameEnd = nameStart + nameLength;
    if (nameEnd > bytes.length) {
      throw new RemixZipError('corrupt-archive', 'The archive file name is truncated.');
    }
    const rawName = decodeName(bytes.subarray(nameStart, nameEnd));
    cursor = nameEnd + extraLength + commentLength;

    if ((flags & FLAG_ENCRYPTED) !== 0) {
      throw new RemixZipError(
        'unsupported-archive',
        'Encrypted archives are not supported for remix.',
      );
    }
    // Directory entries carry no bytes.
    if (rawName.endsWith('/')) {
      continue;
    }
    if (compressedSize === 0xffffffff || uncompressedSize === 0xffffffff) {
      throw new RemixZipError(
        'unsupported-archive',
        'ZIP64 archives are not supported for remix.',
      );
    }
    if (method !== METHOD_STORED && method !== METHOD_DEFLATE) {
      throw new RemixZipError(
        'unsupported-archive',
        `The archive uses an unsupported compression method (${method}).`,
      );
    }
    if (localHeaderOffset + 30 > bytes.length) {
      throw new RemixZipError('corrupt-archive', 'The archive file header is out of range.');
    }
    if (readU32(bytes, localHeaderOffset) !== LOCAL_HEADER_SIGNATURE) {
      throw new RemixZipError('corrupt-archive', 'The archive file header signature is invalid.');
    }
    const localNameLength = readU16(bytes, localHeaderOffset + 26);
    const localExtraLength = readU16(bytes, localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
    const dataEnd = dataStart + compressedSize;
    if (dataEnd > bytes.length) {
      throw new RemixZipError('corrupt-archive', 'The archive file data is truncated.');
    }

    const { directory, name } = normalizeArchivePath(rawName);
    const raw = bytes.subarray(dataStart, dataEnd);
    const data = method === METHOD_STORED ? new Uint8Array(raw) : await inflateRaw(raw);
    if (data.byteLength !== uncompressedSize) {
      throw new RemixZipError(
        'corrupt-archive',
        `The archive file ${rawName} unpacked to ${data.byteLength} of ${uncompressedSize} bytes.`,
      );
    }
    entries.push({ directory, name, data });
  }
  return entries;
}

/**
 * Write every entry below a directory the user picked.
 *
 * Directories are created on demand and each file is written through
 * `createWritable()`, so a failure leaves the already-written files rather than
 * a corrupted one.
 *
 * @param root - picked directory handle.
 * @param entries - validated entries from {@link extractZipEntries}.
 * @returns number of files written.
 * @throws {RemixZipError} with reason `write-failed`.
 */
export async function writeZipEntries(
  root: RemixDirectoryHandle,
  entries: ZipEntry[],
): Promise<number> {
  let written = 0;
  try {
    for (const entry of entries) {
      let directory = root;
      for (const segment of entry.directory) {
        directory = await directory.getDirectoryHandle(segment, { create: true });
      }
      const file = await directory.getFileHandle(entry.name, { create: true });
      const writable = await file.createWritable();
      await writable.write(entry.data);
      await writable.close();
      written += 1;
    }
  } catch (error) {
    if (error instanceof RemixZipError) {
      throw error;
    }
    const detail = error instanceof Error ? error.message : String(error);
    throw new RemixZipError(
      'write-failed',
      `Writing the project failed after ${written} file(s): ${detail}`,
    );
  }
  return written;
}
