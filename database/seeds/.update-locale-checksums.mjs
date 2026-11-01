import fs from 'node:fs';
import { createHash } from 'node:crypto';

const root = new URL('.', import.meta.url);
// Checksums describe the committed (LF) content: `core.autocrlf=true` turns the
// working tree CRLF on Windows, so normalize before hashing or a Windows run
// writes a value that a Linux checkout can never match.
const read = (relativePath) =>
  fs.readFileSync(new URL(relativePath, root), 'utf8').replaceAll('\r\n', '\n');

function sha256Files(files) {
  const hash = createHash('sha256');
  for (const file of files) {
    hash.update(read(file));
  }
  return `sha256:${hash.digest('hex')}`;
}

const manifestPath = new URL('./seed.manifest.json', root);
const manifest = JSON.parse(read('seed.manifest.json'));

for (const [locale, set] of Object.entries(manifest.localeSets)) {
  if (!set.files?.length) continue;
  set.files = set.files.map((file) =>
    file.replaceAll('\\', '/').startsWith('locales/')
      ? file.replaceAll('\\', '/')
      : `locales/${locale}/${file.replaceAll('\\', '/')}`,
  );
  set.checksum = sha256Files(set.files);
}

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log('updated locale checksums in seed.manifest.json');
