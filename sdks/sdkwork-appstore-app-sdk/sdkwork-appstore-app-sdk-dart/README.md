# sdkwork-appstore-app-sdk (Dart)

Generated SDKWork v3 dual-token transport SDK.

## Installation

```bash
dart pub add sdkwork_appstore_app_sdk
```

## Quick Start

```dart
import 'package:sdkwork_appstore_app_sdk/sdkwork_appstore_app_sdk.dart';

final client = SdkworkAppstoreAppClient(
  config: const SdkConfig(
    baseUrl: 'http://127.0.0.1:18090',
  ),
);
client.setAuthToken('your-auth-token');
client.setAccessToken('your-access-token');

// Use the SDK
final result = await client.catalog.appstoreCatalogHomeRetrieve();
print(result);
```

## Authentication

```text
Authorization: Bearer <authToken>
Access-Token: <accessToken>
```


## Configuration (Non-Auth)

```dart
final client = SdkworkAppstoreAppClient.withBaseUrl(baseUrl: 'http://127.0.0.1:18090');
client.setHeader('X-Custom-Header', 'value');
```

## API Modules

- `client.catalog` - catalog API
- `client.listings` - listings API
- `client.releases` - releases API
- `client.publishers` - publishers API
- `client.compliance` - compliance API
- `client.library_` - library API
- `client.wishlist` - wishlist API
- `client.userStore` - user_store API
- `client.downloadGrants` - download_grants API

## Usage Examples

### catalog

```dart
// Retrieve storefront home feed
final result = await client.catalog.appstoreCatalogHomeRetrieve();
print(result);
```

### listings

```dart
// Retrieve listing detail
final listingId = '1';
final result = await client.listings.appstoreListingsRetrieve(listingId);
print(result);
```

### releases

```dart
// Retrieve release detail
final releaseId = '1';
final result = await client.releases.appstoreReleasesRetrieve(releaseId);
print(result);
```

### publishers

```dart
// Retrieve current publisher profile
final result = await client.publishers.appstorePublishersMeRetrieve();
print(result);
```

### compliance

```dart
// Retrieve compliance profile
final listingId = '1';
final result = await client.compliance.appstoreComplianceProfileRetrieve(listingId);
print(result);
```

### library

```dart
// List library items
final params = <String, dynamic>{
  'cursor': 'cursor',
  'page_size': 2,
};
final result = await client.library_.appstoreLibraryItemsList(params);
print(result);
```

### wishlist

```dart
// List wishlist items
final params = <String, dynamic>{
  'cursor': 'cursor',
  'page_size': 2,
};
final result = await client.wishlist.appstoreWishlistItemsList(params);
print(result);
```

### user_store

```dart
// List my custom categories
final params = <String, dynamic>{
  'cursor': 'cursor',
  'page_size': 2,
};
final result = await client.userStore.appstoreUserStoreCategoryList(params);
print(result);
```

### download_grants

```dart
// Consume download grant
final grantId = '1';
final result = await client.downloadGrants.appstoreDownloadGrantsConsume(grantId);
print(result);
```

## Error Handling

```dart
try {
  final result = await client.catalog.appstoreCatalogHomeRetrieve();
  print(result);
} catch (error) {
  print('Error: $error');
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

> Ensure `dart pub publish --dry-run` passes before release publish.

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
