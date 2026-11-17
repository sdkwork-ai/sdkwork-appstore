import { describe, expect, it, vi } from 'vitest';

import type { ListingRemixDownload } from '@sdkwork/appstore-pc-core';

import {
  classifyRemixError,
  dialogStateForOutcome,
  httpStatusOf,
} from '../components/remix/remixDialog';
import {
  hasUsableCoordinates,
  normalizeSha256,
  RemixIntegrityError,
  RemixPayloadError,
  runRemix,
  supportsDirectoryPicker,
  directoryPickerFor,
  type RemixWorkflowDeps,
} from './remixWorkflow';
import { buildZipFixture } from './remixZipFixture';
import { RemixZipError, type RemixDirectoryHandle } from './remixZip';

const encoder = new TextEncoder();

function archiveDownload(overrides: {
  checksumSha256?: string;
  contentLength?: string;
} = {}): ListingRemixDownload {
  return {
    mode: 'ARCHIVE',
    archive: {
      artifactId: 'artifact-1',
      driveNodeId: 'node-1',
      fileName: 'source.zip',
      ...(overrides.checksumSha256 === undefined
        ? {}
        : { checksumSha256: overrides.checksumSha256 }),
      ...(overrides.contentLength === undefined
        ? {}
        : { contentLength: overrides.contentLength }),
    },
  };
}

function gitDownload(): ListingRemixDownload {
  return {
    mode: 'GIT',
    git: {
      repoUrl: 'https://git.example.test/acme/app.git',
      repoRef: 'refs/heads/main',
      subPath: 'apps/desktop',
    },
  };
}

async function sha256HexOf(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new Uint8Array(bytes).buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

interface RecordedDirectory extends RemixDirectoryHandle {
  readonly files: string[];
}

function recordingDirectory(): RecordedDirectory {
  const files: string[] = [];
  const directory: RecordedDirectory = {
    name: 'chosen-project',
    files,
    async getDirectoryHandle() {
      return directory;
    },
    async getFileHandle(name) {
      return {
        async createWritable() {
          return {
            async write() {
              files.push(name);
            },
            async close() {
              // no-op
            },
          };
        },
      };
    },
  };
  return directory;
}

function deps(
  download: ListingRemixDownload,
  bytes: Uint8Array,
): RemixWorkflowDeps & { saved: string[] } {
  const saved: string[] = [];
  return {
    saved,
    getRemix: vi.fn(async () => download),
    fetchArchive: vi.fn(async () => bytes),
    saveArchive: vi.fn(async (_bytes: Uint8Array, fileName: string) => {
      saved.push(fileName);
    }),
  };
}

describe('runRemix', () => {
  it('verifies the digest and unpacks into the picked directory', async () => {
    const bytes = await buildZipFixture([
      { name: 'README.md', data: encoder.encode('# app') },
      { name: 'src/index.ts', data: encoder.encode('export {};') },
    ]);
    const checksum = await sha256HexOf(bytes);
    const workflow = deps(archiveDownload({ checksumSha256: `sha256:${checksum}` }), bytes);
    const directory = recordingDirectory();

    const outcome = await runRemix({ ...workflow, pickDirectory: async () => directory }, 'listing-1');

    expect(outcome).toEqual({
      status: 'written',
      filesWritten: 2,
      directoryName: 'chosen-project',
    });
    expect(directory.files).toEqual(['README.md', 'index.ts']);
    expect(workflow.saved).toEqual([]);
  });

  it('rejects an archive whose bytes do not match the published digest', async () => {
    const bytes = await buildZipFixture([{ name: 'a.txt', data: encoder.encode('a') }]);
    const workflow = deps(
      archiveDownload({ checksumSha256: 'a'.repeat(64) }),
      bytes,
    );

    await expect(
      runRemix({ ...workflow, pickDirectory: async () => recordingDirectory() }, 'listing-1'),
    ).rejects.toBeInstanceOf(RemixIntegrityError);
  });

  it('falls back to a plain download when the browser cannot write directories', async () => {
    const bytes = await buildZipFixture([{ name: 'a.txt', data: encoder.encode('a') }]);
    const checksum = await sha256HexOf(bytes);
    const workflow = deps(archiveDownload({ checksumSha256: checksum }), bytes);

    const outcome = await runRemix(workflow, 'listing-1');

    expect(outcome).toEqual({ status: 'downloaded', fileName: 'source.zip' });
    expect(workflow.saved).toEqual(['source.zip']);
  });

  it('treats a dismissed directory picker as cancellation', async () => {
    const bytes = await buildZipFixture([{ name: 'a.txt', data: encoder.encode('a') }]);
    const workflow = deps(archiveDownload(), bytes);

    const outcome = await runRemix({ ...workflow, pickDirectory: async () => null }, 'listing-1');

    expect(outcome).toEqual({ status: 'cancelled' });
    expect(workflow.saved).toEqual([]);
  });

  it('returns clone coordinates for a git source without fetching bytes', async () => {
    const workflow = deps(gitDownload(), new Uint8Array());

    const outcome = await runRemix({ ...workflow, pickDirectory: async () => recordingDirectory() }, 'listing-1');

    expect(outcome.status).toBe('git');
    expect(workflow.fetchArchive).not.toHaveBeenCalled();
  });

  it('refuses a payload whose coordinates do not match its mode', async () => {
    const workflow = deps({ mode: 'ARCHIVE' }, new Uint8Array());

    await expect(runRemix(workflow, 'listing-1')).rejects.toBeInstanceOf(RemixPayloadError);
    expect(workflow.fetchArchive).not.toHaveBeenCalled();
  });

  it('refuses an unreadable published digest instead of skipping verification', async () => {
    const bytes = await buildZipFixture([{ name: 'a.txt', data: encoder.encode('a') }]);
    const workflow = deps(archiveDownload({ checksumSha256: 'not-a-digest' }), bytes);

    await expect(runRemix(workflow, 'listing-1')).rejects.toMatchObject({
      name: 'RemixPayloadError',
    });
  });
});

describe('remix payload helpers', () => {
  it('requires coordinates that match the selected mode', () => {
    expect(hasUsableCoordinates(gitDownload())).toBe(true);
    expect(hasUsableCoordinates(archiveDownload())).toBe(true);
    expect(hasUsableCoordinates({ mode: 'GIT' })).toBe(false);
    expect(hasUsableCoordinates({ mode: 'ARCHIVE', archive: { artifactId: '', driveNodeId: ' ', fileName: '' } })).toBe(false);
  });

  it('normalizes published digests', () => {
    expect(normalizeSha256('sha256:ABCDEF')).toBeNull();
    expect(normalizeSha256('A'.repeat(64))).toBe('a'.repeat(64));
    expect(normalizeSha256(undefined)).toBeNull();
  });
});

describe('directory picker capability', () => {
  it('detects the File System Access API', () => {
    expect(supportsDirectoryPicker(undefined)).toBe(false);
    expect(supportsDirectoryPicker({})).toBe(false);
    expect(supportsDirectoryPicker({ showDirectoryPicker: async () => recordingDirectory() })).toBe(true);
  });

  it('reports a dismissed picker as cancellation', async () => {
    const host = {
      showDirectoryPicker: async () => {
        throw new DOMException('dismissed', 'AbortError');
      },
    };
    const picker = directoryPickerFor(host);
    await expect(picker?.()).resolves.toBeNull();
  });
});

describe('remix error classification', () => {
  it('maps the two HTTP outcomes the endpoint distinguishes', () => {
    expect(classifyRemixError({ httpStatus: 404 })).toBe('not-remixable');
    expect(classifyRemixError({ httpStatus: 503 })).toBe('deploy-unavailable');
    expect(httpStatusOf({ httpStatus: 404 })).toBe(404);
    expect(httpStatusOf(new Error('boom'))).toBeUndefined();
  });

  it('maps typed workflow failures', () => {
    expect(classifyRemixError(new RemixIntegrityError('a', 'b'))).toBe('checksum-failed');
    expect(classifyRemixError(new RemixPayloadError('bad'))).toBe('payload-invalid');
    expect(classifyRemixError(new RemixZipError('write-failed', 'x'))).toBe('write-failed');
    expect(classifyRemixError(new RemixZipError('unsafe-path', 'x'))).toBe('unsafe-archive');
    expect(classifyRemixError(new RemixZipError('corrupt-archive', 'x'))).toBe(
      'unsupported-archive',
    );
    expect(classifyRemixError(new TypeError('Failed to fetch'))).toBe('download-failed');
    expect(classifyRemixError('weird')).toBe('unknown');
  });

  it('maps workflow outcomes onto dialog states', () => {
    expect(dialogStateForOutcome({ status: 'git', download: gitDownload() })).toEqual({
      kind: 'git',
      download: gitDownload(),
    });
    expect(
      dialogStateForOutcome({ status: 'written', filesWritten: 3, directoryName: 'dir' }),
    ).toEqual({ kind: 'written', filesWritten: 3, directoryName: 'dir' });
    expect(dialogStateForOutcome({ status: 'downloaded', fileName: 'a.zip' })).toEqual({
      kind: 'downloaded',
      fileName: 'a.zip',
    });
    expect(dialogStateForOutcome({ status: 'cancelled' })).toEqual({ kind: 'form' });
  });
});
