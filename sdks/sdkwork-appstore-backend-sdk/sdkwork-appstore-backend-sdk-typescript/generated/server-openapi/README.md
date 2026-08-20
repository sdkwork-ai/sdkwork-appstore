# sdkwork-appstore-backend-sdk

Generated SDKWork v3 dual-token transport SDK.

## Installation

```bash
npm install @sdkwork/appstore-backend-sdk
# or
yarn add @sdkwork/appstore-backend-sdk
# or
pnpm add @sdkwork/appstore-backend-sdk
```

## Quick Start

```typescript
import { SdkworkAppstoreBackendClient } from '@sdkwork/appstore-backend-sdk';

const client = new SdkworkAppstoreBackendClient({
  baseUrl: 'http://127.0.0.1:18091',
  timeout: 30000,
});

// Authentication
client.setAuthToken('your-auth-token');
client.setAccessToken('your-access-token');

// Use the SDK
const params = {
  date_from: 'date_from',
  date_to: 'date_to',
};
const result = await client.analytics.appstore.analytics.publisher.overview.retrieve(params);
```

## Authentication

```text
Authorization: Bearer <authToken>
Access-Token: <accessToken>
```


## Configuration (Non-Auth)

```typescript
import { SdkworkAppstoreBackendClient } from '@sdkwork/appstore-backend-sdk';

const client = new SdkworkAppstoreBackendClient({
  baseUrl: 'http://127.0.0.1:18091',
  timeout: 30000, // Request timeout in ms
  headers: {      // Custom headers
    'X-Custom-Header': 'value',
  },
});
```

## API Modules

- `client.moderation` - moderation API
- `client.catalog` - catalog API
- `client.listings` - listings API
- `client.publishers` - publishers API
- `client.metrics` - metrics API
- `client.analytics` - analytics API
- `client.market` - market API

## Usage Examples

### moderation

```typescript
// List moderation queue
const params = {
  reviewStatus: 'reviewStatus',
  cursor: 'cursor',
  page_size: 3,
};
const result = await client.moderation.appstore.moderation.queue.list(params);
```

### catalog

```typescript
// Create editorial collection
const body = {
  collectionCode: 'collectionCode',
  collectionType: 'collectionType',
  audienceScope: 'audienceScope',
};
const result = await client.catalog.appstore.catalog.collections.create(body);
```

### listings

```typescript
// List listings for operators
const params = {
  listingStatus: 'listingStatus',
  cursor: 'cursor',
  page_size: 3,
};
const result = await client.listings.appstore.listings.admin.list(params);
```

### publishers

```typescript
// Approve publisher verification
const publisherId = '1';
const body = {
  verificationType: 'verificationType',
  decision: 'decision',
};
const result = await client.publishers.appstore.publishers.admin.verify(publisherId, body);
```

### metrics

```typescript
// Retrieve listing metrics
const listingId = '1';
const params = {
  fromDate: 'fromDate',
  toDate: 'toDate',
};
const result = await client.metrics.appstore.metrics.listings.retrieve(listingId, params);
```

### analytics

```typescript
// Retrieve publisher analytics overview
const params = {
  date_from: 'date_from',
  date_to: 'date_to',
};
const result = await client.analytics.appstore.analytics.publisher.overview.retrieve(params);
```

### market

```typescript
// List external market channels
const params = {
  channelStatus: 'channelStatus',
  cursor: 'cursor',
  page_size: 3,
};
const result = await client.market.appstore.marketChannels.list(params);
```

## Error Handling

```typescript
import { SdkworkAppstoreBackendClient, NetworkError, TimeoutError, AuthenticationError } from '@sdkwork/appstore-backend-sdk';

try {
  const params = {
    date_from: 'date_from',
    date_to: 'date_to',
  };
  const result = await client.analytics.appstore.analytics.publisher.overview.retrieve(params);
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

> Configure npm registry credentials before release publish.

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
