/**
 * Test fixture: build a small ZIP archive in memory.
 *
 * The storefront has no ZIP writer in production (it only reads archives), so the
 * reader's tests construct archives here: a minimal local-header + central
 * directory layout, `stored` or `deflate` entries, and no data descriptors.
 */

export interface ZipFixtureEntry {
  name: string;
  data: Uint8Array;
  /** 0 = stored, 8 = deflate. Defaults to stored. */
  method?: 0 | 8;
}

function encode(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function writeU16(target: Uint8Array, offset: number, value: number): void {
  target[offset] = value & 0xff;
  target[offset + 1] = (value >>> 8) & 0xff;
}

function writeU32(target: Uint8Array, offset: number, value: number): void {
  target[offset] = value & 0xff;
  target[offset + 1] = (value >>> 8) & 0xff;
  target[offset + 2] = (value >>> 16) & 0xff;
  target[offset + 3] = (value >>> 24) & 0xff;
}

async function deflateRaw(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([new Uint8Array(data).buffer])
    .stream()
    .pipeThrough(new CompressionStream('deflate-raw'));
  const compressed = await new Response(stream).arrayBuffer();
  return new Uint8Array(compressed);
}

/**
 * Build a ZIP archive.
 * @param entries - files to store.
 * @returns the complete archive bytes.
 */
export async function buildZipFixture(entries: ZipFixtureEntry[]): Promise<Uint8Array> {
  const prepared: {
    name: Uint8Array;
    data: Uint8Array;
    method: number;
    offset: number;
    uncompressedSize: number;
  }[] = [];
  let offset = 0;
  for (const entry of entries) {
    const name = encode(entry.name);
    const method = entry.method ?? 0;
    const data = method === 8 ? await deflateRaw(entry.data) : entry.data;
    prepared.push({
      name,
      data,
      method,
      offset,
      uncompressedSize: entry.data.byteLength,
    });
    offset += 30 + name.byteLength + data.byteLength;
  }

  const localParts: Uint8Array[] = [];
  for (const entry of prepared) {
    const header = new Uint8Array(30);
    writeU32(header, 0, 0x04034b50);
    writeU16(header, 4, 20);
    writeU16(header, 8, entry.method);
    writeU32(header, 18, entry.data.byteLength);
    writeU32(header, 22, entry.uncompressedSize);
    writeU16(header, 26, entry.name.byteLength);
    localParts.push(header, entry.name, entry.data);
  }

  const centralOffset = offset;
  const centralParts: Uint8Array[] = [];
  for (const entry of prepared) {
    const header = new Uint8Array(46);
    writeU32(header, 0, 0x02014b50);
    writeU16(header, 4, 20);
    writeU16(header, 6, 20);
    writeU16(header, 10, entry.method);
    writeU32(header, 20, entry.data.byteLength);
    writeU32(header, 24, entry.uncompressedSize);
    writeU16(header, 28, entry.name.byteLength);
    writeU32(header, 42, entry.offset);
    centralParts.push(header, entry.name);
  }
  const centralSize = centralParts.reduce((total, part) => total + part.byteLength, 0);

  const eocd = new Uint8Array(22);
  writeU32(eocd, 0, 0x06054b50);
  writeU16(eocd, 8, prepared.length);
  writeU16(eocd, 10, prepared.length);
  writeU32(eocd, 12, centralSize);
  writeU32(eocd, 16, centralOffset);

  const parts = [...localParts, ...centralParts, eocd];
  const total = parts.reduce((sum, part) => sum + part.byteLength, 0);
  const archive = new Uint8Array(total);
  let cursor = 0;
  for (const part of parts) {
    archive.set(part, cursor);
    cursor += part.byteLength;
  }
  return archive;
}
