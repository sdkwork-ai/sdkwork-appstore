#!/usr/bin/env node

// Materializes the SDKWork App Store client application roots that are not yet
// present in this repository:
//
//   apps/sdkwork-appstore-flutter-mobile
//   apps/sdkwork-appstore-mini-program
//   apps/sdkwork-appstore-harmony-mobile
//
// and aligns the pre-existing H5 root to the PC route-identity contract so the
// two form the Adaptive Web pair required by
// APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md section 2.1:
//
//   apps/sdkwork-appstore-h5
//
// Reads nothing outside the repository and writes only under those four roots
// (`apps/README.md` is owned by `sdkwork-specs/tools/align-apps-directory-index.mjs`).
//
// Usage:
//   node scripts/materialize-client-app-surfaces.mjs [--only <suffix>[,<suffix>]]
//   node scripts/materialize-client-app-surfaces.mjs --help

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { materializeMiniProgram } from './materialize/mini-program-surface.mjs';
import { materializeFlutterMobile } from './materialize/flutter-mobile-surface.mjs';
import { materializeHarmonyMobile } from './materialize/harmony-mobile-surface.mjs';
import { alignH5Surface } from './materialize/h5-surface-alignment.mjs';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const appsDir = path.join(repoRoot, 'apps');

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(
    'Materialize App Store client application roots.\n\n' +
      '  --only <suffix>[,<suffix>]  limit to flutter-mobile | mini-program | harmony-mobile | h5',
  );
  process.exit(0);
}

const onlyIndex = args.indexOf('--only');
const only = onlyIndex === -1 ? null : new Set(args[onlyIndex + 1].split(','));

const surfaces = [
  { suffix: 'flutter-mobile', run: materializeFlutterMobile },
  { suffix: 'mini-program', run: materializeMiniProgram },
  { suffix: 'harmony-mobile', run: materializeHarmonyMobile },
  { suffix: 'h5', run: alignH5Surface },
];

if (!fs.existsSync(appsDir)) {
  console.error('apps/ directory not found; run from the repository root.');
  process.exit(1);
}

let failed = 0;
for (const surface of surfaces) {
  if (only && !only.has(surface.suffix)) {
    continue;
  }
  console.log(`\n== ${surface.suffix} ==`);
  try {
    surface.run(appsDir);
  } catch (error) {
    failed += 1;
    console.error(`  FAILED: ${error.stack ?? error.message}`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} surface(s) failed.`);
  process.exit(1);
}
console.log('\nDone. Next: pnpm install && node ../sdkwork-specs/tools/align-apps-directory-index.mjs --root .');
