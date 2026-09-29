# sdkwork-appstore-sdk (Dart)

Professional Dart SDK for SDKWork API.

## Installation

```bash
dart pub add sdkwork_appstore_sdk
```

## Quick Start

```dart
import 'package:sdkwork_appstore_sdk/sdkwork_appstore_sdk.dart';

final client = SdkworkAppstoreOpenClient(
  config: const SdkConfig(
    baseUrl: 'http://127.0.0.1:18092',
  ),
);
client.setApiKey('your-api-key');

// Use the SDK
final params = <String, dynamic>{
  'platform': 'platform',
  'locale': 'locale',
};
final result = await client.catalog.appstoreCatalogPublicFeaturedList(params);
print(result);
```

## Authentication Modes (Mutually Exclusive)

Choose exactly one mode for the same client instance.

### Mode A: API Key

```dart
final client = SdkworkAppstoreOpenClient.withBaseUrl(baseUrl: 'http://127.0.0.1:18092');
client.setApiKey('your-api-key');
// Sends: X-API-Key: <apiKey>
```

### Mode B: Dual Token

```dart
final client = SdkworkAppstoreOpenClient.withBaseUrl(baseUrl: 'http://127.0.0.1:18092');
client.setAuthToken('your-auth-token');
client.setAccessToken('your-access-token');
// Sends:
// Authorization: Bearer <authToken>
// Access-Token: <accessToken>
```

> Do not call `setApiKey(...)` together with `setAuthToken(...)` + `setAccessToken(...)` on the same client.

## Configuration (Non-Auth)

```dart
final client = SdkworkAppstoreOpenClient.withBaseUrl(baseUrl: 'http://127.0.0.1:18092');
client.setHeader('X-Custom-Header', 'value');
```

## API Modules

- `client.releases` - releases API
- `client.artifacts` - artifacts API
- `client.listings` - listings API
- `client.catalog` - catalog API
- `client.userStore` - user_store API
- `client.automation` - automation API

## Usage Examples

### releases

```dart
// Check whether a newer release is available
final body = ReleaseCheckUpdateRequest(
  appKey: 'appkey',
  platform: 'platform',
  architecture: 'architecture',
  installedVersionCode: 'ok',
  channelCode: 'ok',
  deviceId: '1',
  regionCode: 'ok',
);
final result = await client.releases.appstoreReleasesCheckUpdate(body);
print(result);
```

### artifacts

```dart
// Resolve artifact download location from grant or entitlement
final body = ArtifactResolveDownloadRequest(
  artifactId: '1',
  grantId: '1',
  appKey: 'appkey',
);
final result = await client.artifacts.appstoreArtifactsResolveDownload(body);
print(result);
```

### listings

```dart
// Retrieve public listing by slug
final listingSlug = 'listingSlug';
final params = <String, dynamic>{
  'locale': 'locale',
};
final result = await client.listings.appstoreListingsPublicRetrieve(listingSlug, params);
print(result);
```

### catalog

```dart
// List public featured listings
final params = <String, dynamic>{
  'platform': 'platform',
  'locale': 'locale',
};
final result = await client.catalog.appstoreCatalogPublicFeaturedList(params);
print(result);
```

### user_store

```dart
// Retrieve a shared personal appstore view
final shareToken = 'shareToken';
final result = await client.userStore.appstoreUserStoresPublicRetrieve(shareToken);
print(result);
```

### automation

```dart
// Create automated publish submission
final body = AutomationSubmissionCreateRequest(
  appKey: 'appkey',
  submissionType: 'submissiontype',
  release: { 'channelCode': 'ok', 'versionName': 'name', 'versionCode': 'ok' },
  artifacts: [{ 'platform': 'platform', 'architecture': 'architecture', 'packageFormat': 'packageformat', 'driveNodeId': '1', 'checksumSha256': 'checksumsha256', 'fileSizeBytes': 'filesizebytes' }],
);
final idempotencyKey = 'Idempotency-Key';
final result = await client.automation.appstorePublishAutomationSubmissionsCreate(body, idempotencyKey);
print(result);
```

## Error Handling

```dart
try {
  final params = <String, dynamic>{
    'platform': 'platform',
    'locale': 'locale',
  };
  final result = await client.catalog.appstoreCatalogPublicFeaturedList(params);
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
