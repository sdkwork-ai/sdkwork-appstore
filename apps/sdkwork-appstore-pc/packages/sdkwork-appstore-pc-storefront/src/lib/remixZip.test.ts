import { describe, expect, it } from 'vitest';

import {
  extractZipEntries,
  normalizeArchivePath,
  RemixZipError,
  writeZipEntries,
  type RemixDirectoryHandle,
  type RemixFileHandle,
} from './remixZip';
import { buildZipFixture } from './remixZipFixture';

const encoder = new TextEncoder();

function text(value: string): Uint8Array {
  return encoder.encode(value);
}

interface FakeDirectory extends RemixDirectoryHandle {
  readonly name: string;
  readonly directories: Map<string, FakeDirectory>;
  readonly files: Map<string, Uint8Array>;
}

function fakeDirectory(name: string): FakeDirectory {
  const directory: FakeDirectory = {
    name,
    directories: new Map(),
    files: new Map(),
    async getDirectoryHandle(childName) {
      const existing = directory.directories.get(childName);
      if (existing !== undefined) {
        return existing;
      }
      const created = fakeDirectory(childName);
      directory.directories.set(childName, created);
      return created;
    },
    async getFileHandle(fileName): Promise<RemixFileHandle> {
      return {
        async createWritable() {
          return {
            async write(data: Uint8Array) {
              directory.files.set(fileName, new Uint8Array(data));
            },
            async close() {
              // no-op: the fake keeps the bytes in memory
            },
          };
        },
      };
    },
  };
  return directory;
}

describe('remix zip reader', () => {
  it('extracts stored entries with their directory layout', async () => {
    const archive = await buildZipFixture([
      { name: 'README.md', data: text('# app') },
      { name: 'src/index.ts', data: text('export {};') },
    ]);

    const entries = await extractZipEntries(archive);

    expect(entries.map((entry) => [...entry.directory, entry.name].join('/'))).toEqual([
      'README.md',
      'src/index.ts',
    ]);
    expect(new TextDecoder().decode(entries[1]?.data)).toBe('export {};');
  });

  it('inflates deflated entries', async () => {
    const archive = await buildZipFixture([
      { name: 'src/main.ts', data: text('console.log("remix");'), method: 8 },
    ]);

    const entries = await extractZipEntries(archive);

    expect(entries).toHaveLength(1);
    expect(new TextDecoder().decode(entries[0]?.data)).toBe('console.log("remix");');
  });

  it('rejects a traversing path before writing anything', async () => {
    const archive = await buildZipFixture([
      { name: '../escape.txt', data: text('nope') },
    ]);

    await expect(extractZipEntries(archive)).rejects.toMatchObject({
      reason: 'unsafe-path',
    });
  });

  it('rejects a byte sequence that is not a zip archive', async () => {
    await expect(extractZipEntries(text('definitely not a zip'))).rejects.toBeInstanceOf(
      RemixZipError,
    );
  });

  it('writes entries below the chosen directory', async () => {
    const archive = await buildZipFixture([
      { name: 'src/nested/app.ts', data: text('app') },
    ]);
    const entries = await extractZipEntries(archive);
    const root = fakeDirectory('chosen-project');

    const written = await writeZipEntries(root, entries);

    expect(written).toBe(1);
    const src = root.directories.get('src');
    const nested = src?.directories.get('nested');
    expect(new TextDecoder().decode(nested?.files.get('app.ts'))).toBe('app');
  });

  it('wraps a write failure in a typed error', async () => {
    const failingRoot: RemixDirectoryHandle = {
      name: 'read-only',
      async getDirectoryHandle() {
        throw new Error('permission denied');
      },
      async getFileHandle() {
        throw new Error('permission denied');
      },
    };

    await expect(
      writeZipEntries(failingRoot, [{ directory: ['src'], name: 'a.ts', data: text('a') }]),
    ).rejects.toMatchObject({ reason: 'write-failed' });
  });
});

describe('normalizeArchivePath', () => {
  it('splits directories from the file name', () => {
    expect(normalizeArchivePath('a/b/c.txt')).toEqual({
      directory: ['a', 'b'],
      name: 'c.txt',
    });
  });

  it('rejects absolute and drive-prefixed paths', () => {
    expect(() => normalizeArchivePath('/etc/passwd')).toThrow(RemixZipError);
    expect(() => normalizeArchivePath('C:/windows/system32')).toThrow(RemixZipError);
  });
});
