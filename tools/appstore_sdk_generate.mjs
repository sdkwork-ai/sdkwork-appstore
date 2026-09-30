import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..');
const generate = process.argv.includes('--generate');

const targets = [
  {
    manifestPath: 'sdks/sdkwork-appstore-app-sdk/sdk-manifest.json',
    authorityOpenApiPath:
      'sdks/sdkwork-appstore-app-sdk/openapi/sdkwork-appstore-app-api.openapi.yaml',
    expected: {
      sdkOwner: 'sdkwork-appstore',
      apiAuthority: 'sdkwork-appstore-app-api',
      sdkFamily: 'sdkwork-appstore-app-sdk',
      sdkType: 'app',
      sdkSurface: 'app',
      generationInputSpec: 'openapi/sdkwork-appstore-app-api.sdkgen.yaml',
      standardProfile: 'sdkwork-v3',
      apiPrefix: '/app/v3/api',
      ownerOnlyOperationCount: 82,
    },
  },
  {
    manifestPath: 'sdks/sdkwork-appstore-backend-sdk/sdk-manifest.json',
    authorityOpenApiPath:
      'sdks/sdkwork-appstore-backend-sdk/openapi/sdkwork-appstore-backend-api.openapi.yaml',
    expected: {
      sdkOwner: 'sdkwork-appstore',
      apiAuthority: 'sdkwork-appstore-backend-api',
      sdkFamily: 'sdkwork-appstore-backend-sdk',
      sdkType: 'backend',
      sdkSurface: 'backend',
      generationInputSpec: 'openapi/sdkwork-appstore-backend-api.sdkgen.yaml',
      standardProfile: 'sdkwork-v3',
      apiPrefix: '/backend/v3/api',
      ownerOnlyOperationCount: 29,
    },
  },
  {
    manifestPath: 'sdks/sdkwork-appstore-sdk/sdk-manifest.json',
    authorityOpenApiPath:
      'sdks/sdkwork-appstore-sdk/openapi/sdkwork-appstore-open-api.openapi.yaml',
    expected: {
      sdkOwner: 'sdkwork-appstore',
      apiAuthority: 'sdkwork-appstore-open-api',
      sdkFamily: 'sdkwork-appstore-sdk',
      sdkType: 'custom',
      sdkSurface: 'open',
      generationInputSpec: 'openapi/sdkwork-appstore-open-api.sdkgen.yaml',
      standardProfile: 'sdkwork-v3',
      apiPrefix: '/store/v3/api',
      ownerOnlyOperationCount: 8,
    },
  },
];

if (generate) {
  execFileSync(process.execPath, [resolve(repoRoot, 'tools/appstore_openapi_materialize.mjs')], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
}

for (const target of targets) {
  const manifestPath = resolve(repoRoot, target.manifestPath);
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  for (const [key, expectedValue] of Object.entries(target.expected)) {
    if (manifest[key] !== expectedValue) {
      throw new Error(
        `${target.manifestPath} ${key} must be ${expectedValue}, got ${manifest[key]}`,
      );
    }
  }

  const manifestDir = dirname(manifestPath);
  const authorityOpenApi = await readFile(resolve(repoRoot, target.authorityOpenApiPath), 'utf8');
  const generationInput = await readFile(
    resolve(manifestDir, manifest.generationInputSpec),
    'utf8',
  );
  if (authorityOpenApi !== generationInput) {
    throw new Error(
      `${manifest.generationInputSpec} is stale; run pnpm api:materialize`,
    );
  }

  const operationCount = (generationInput.match(/^\s+operationId:/gm) ?? []).length;
  if (operationCount !== manifest.ownerOnlyOperationCount) {
    throw new Error(
      `${target.manifestPath} ownerOnlyOperationCount must be ${operationCount}, got ${manifest.ownerOnlyOperationCount}`,
    );
  }
  console.log(`sdk family contract verified for ${target.manifestPath}`);
}

if (generate) {
  execFileSync(process.execPath, [resolve(repoRoot, 'scripts/generate-appstore-sdk.mjs')], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
}
