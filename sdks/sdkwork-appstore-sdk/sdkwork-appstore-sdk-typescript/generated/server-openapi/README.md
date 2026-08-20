# sdkwork-appstore-sdk

Generated SDKWork v3 API-key open-api transport SDK.

## Installation

```bash
npm install @sdkwork/appstore-sdk
# or
yarn add @sdkwork/appstore-sdk
# or
pnpm add @sdkwork/appstore-sdk
```

## Quick Start

```typescript
import { SdkworkAppstoreOpenClient } from '@sdkwork/appstore-sdk';

const client = new SdkworkAppstoreOpenClient({
  baseUrl: 'http://127.0.0.1:18092',
  timeout: 30000,
});

client.setApiKey('your-api-key');

// Use the SDK
const params = {
  platform: 'platform',
  locale: 'locale',
};
const result = await client.catalog.appstore.catalog.public.featured.list(params);
```

## Authentication

```text
X-API-Key: <apiKey>
```

Configure API key credentials through the generated client API:

```typescript
client.setApiKey('your-api-key');
```


## Configuration (Non-Auth)

```typescript
import { SdkworkAppstoreOpenClient } from '@sdkwork/appstore-sdk';

const client = new SdkworkAppstoreOpenClient({
  baseUrl: 'http://127.0.0.1:18092',
  timeout: 30000, // Request timeout in ms
  headers: {      // Custom headers
    'X-Custom-Header': 'value',
  },
});
```

## API Modules

- `client.releases` - releases API
- `client.artifacts` - artifacts API
- `client.listings` - listings API
- `client.catalog` - catalog API
- `client.automation` - automation API

## Usage Examples

### releases

```typescript
// Check whether a newer release is available
const body = {
  appKey: 'appKey',
  platform: 'platform',
  architecture: 'architecture',
  installedVersionCode: 'installedVersionCode',
  channelCode: 'channelCode',
  deviceId: 'deviceId',
  regionCode: 'regionCode',
};
const result = await client.releases.appstore.releases.checkUpdate(body);
```

### artifacts

```typescript
// Resolve artifact download location from grant or entitlement
const body = {
  artifactId: 'artifactId',
  grantId: 'grantId',
  appKey: 'appKey',
};
const result = await client.artifacts.appstore.artifacts.resolveDownload(body);
```

### listings

```typescript
// Retrieve public listing by slug
const listingSlug = 'listingSlug';
const params = {
  locale: 'locale',
};
const result = await client.listings.appstore.listings.public.retrieve(listingSlug, params);
```

### catalog

```typescript
// List public featured listings
const params = {
  platform: 'platform',
  locale: 'locale',
};
const result = await client.catalog.appstore.catalog.public.featured.list(params);
```

### automation

```typescript
// Create automated publish submission
const body = {
  appKey: 'appKey',
  submissionType: 'submissionType',
  release: {
    channelCode: 'channelCode',
    versionName: 'versionName',
    versionCode: 'versionCode',
  },
  artifacts: [
    {},
  ],
};
const idempotencyKey = 'Idempotency-Key';
const params = {
  idempotencyKey,
};
const result = await client.automation.appstore.publish.automation.submissions.create(body, params);
```

## Error Handling

```typescript
import { SdkworkAppstoreOpenClient, NetworkError, TimeoutError, AuthenticationError } from '@sdkwork/appstore-sdk';

try {
  const params = {
    platform: 'platform',
    locale: 'locale',
  };
  const result = await client.catalog.appstore.catalog.public.featured.list(params);
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Authentication failed:', error.message);
  } else if (error instanceof TimeoutError) {
    console.error('Request timed out:', error.message);
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
  } else {
    throw error;
  }
}
```

## Publishing

This SDK includes cross-platform publish scripts in `bin/`:
- `bin/publish-core.mjs`
- `bin/publish.sh`
- `bin/publish.ps1`

TypeScript check and publish commands use pnpm to materialize workspace dependency versions in a temporary tarball. They reject local-only dependency protocols before npm publication and do not rewrite the source `package.json`.

### Check

```bash
./bin/publish.sh --action check
```

### Publish

```bash
./bin/publish.sh --action publish --channel release
```

```powershell
.\bin\publish.ps1 --action publish --channel test --dry-run
```

> Set `NPM_TOKEN` (and optional `NPM_REGISTRY_URL`) before release publish.

## License

MIT

## Regeneration Contract

- HTTP/OpenAPI generator-owned files are tracked in `.sdkwork/sdkwork-generator-manifest.json`.
- HTTP/OpenAPI generation also writes `.sdkwork/sdkwork-generator-changes.json` so automation can inspect created, updated, deleted, unchanged, scaffolded, and backed-up files plus the classified impact areas, verification plan, and execution decision for the latest generation.
- HTTP/OpenAPI apply mode also writes `.sdkwork/sdkwork-generator-report.json` with the full execution report, including `schemaVersion`, `generator`, stable artifact paths, and the execution handoff commands that match CLI `--json` output.
- CLI JSON output also includes an execution handoff with concrete next commands, including reviewed apply commands for dry-run flows.
- Put HTTP/OpenAPI hand-written wrappers, adapters, and orchestration in `custom/`.
- Files scaffolded under `custom/` are created once and preserved across HTTP/OpenAPI regenerations.
- If an HTTP/OpenAPI generated-owned file was modified locally, its previous content is copied to `.sdkwork/manual-backups/` before overwrite or removal.
- RPC SDK source workspaces use convention-first evidence by default: RPC SDK family naming, language workspace naming, `rpc/*.manifest.json`, proto source references, generated client source, and native package manifests.
- Use `sdkgen inspect --protocol rpc` to verify RPC convention evidence. Request persisted generator evidence only with `--emit-control-plane` for release, CI, audit, or migration workflows; evidence paths are derived by generator convention.
