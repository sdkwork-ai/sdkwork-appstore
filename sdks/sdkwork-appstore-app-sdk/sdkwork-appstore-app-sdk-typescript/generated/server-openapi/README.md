# sdkwork-appstore-app-sdk

Generated SDKWork v3 dual-token transport SDK.

## Installation

```bash
npm install @sdkwork/appstore-app-sdk
# or
yarn add @sdkwork/appstore-app-sdk
# or
pnpm add @sdkwork/appstore-app-sdk
```

## Quick Start

```typescript
import { SdkworkAppstoreAppClient } from '@sdkwork/appstore-app-sdk';

const client = new SdkworkAppstoreAppClient({
  baseUrl: 'http://127.0.0.1:18090',
  timeout: 30000,
});

// Authentication
client.setAuthToken('your-auth-token');
client.setAccessToken('your-access-token');

// Use the SDK
const result = await client.catalog.appstore.catalog.home.retrieve();
```

## Authentication

```text
Authorization: Bearer <authToken>
Access-Token: <accessToken>
```


## Configuration (Non-Auth)

```typescript
import { SdkworkAppstoreAppClient } from '@sdkwork/appstore-app-sdk';

const client = new SdkworkAppstoreAppClient({
  baseUrl: 'http://127.0.0.1:18090',
  timeout: 30000, // Request timeout in ms
  headers: {      // Custom headers
    'X-Custom-Header': 'value',
  },
});
```

## API Modules

- `client.catalog` - catalog API
- `client.listings` - listings API
- `client.releases` - releases API
- `client.publishers` - publishers API
- `client.compliance` - compliance API
- `client.library` - library API
- `client.wishlist` - wishlist API
- `client.downloadGrants` - download_grants API

## Usage Examples

### catalog

```typescript
// Retrieve storefront home feed
const result = await client.catalog.appstore.catalog.home.retrieve();
```

### listings

```typescript
// Retrieve listing detail
const listingId = '1';
const result = await client.listings.appstore.listings.retrieve(listingId);
```

### releases

```typescript
// Retrieve release detail
const releaseId = '1';
const result = await client.releases.appstore.releases.retrieve(releaseId);
```

### publishers

```typescript
// Retrieve current publisher profile
const result = await client.publishers.appstore.publishers.me.retrieve();
```

### compliance

```typescript
// Retrieve compliance profile
const listingId = '1';
const result = await client.compliance.appstore.compliance.profile.retrieve(listingId);
```

### library

```typescript
// List library items
const params = {
  cursor: 'cursor',
  page_size: 2,
};
const result = await client.library.appstore.library.items.list(params);
```

### wishlist

```typescript
// List wishlist items
const params = {
  cursor: 'cursor',
  page_size: 2,
};
const result = await client.wishlist.appstore.wishlist.items.list(params);
```

### download_grants

```typescript
// Consume download grant
const grantId = '1';
const result = await client.downloadGrants.appstore.downloadGrants.consume(grantId);
```

## Error Handling

```typescript
import { SdkworkAppstoreAppClient, NetworkError, TimeoutError, AuthenticationError } from '@sdkwork/appstore-app-sdk';

try {
  const result = await client.catalog.appstore.catalog.home.retrieve();
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
