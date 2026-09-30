# sdkwork-skills-app-sdk (Dart)

Professional Dart SDK for SDKWork API.

## Installation

```bash
dart pub add sdkwork_skills_app_sdk
```

## Quick Start

```dart
import 'package:sdkwork_skills_app_sdk/sdkwork_skills_app_sdk.dart';

final client = SdkworkAppClient(
  config: const SdkConfig(
    baseUrl: 'http://127.0.0.1:18092',
  ),
);
client.setApiKey('your-api-key');

// Use the SDK
final params = <String, dynamic>{
  'page': 1,
  'page_size': 2,
  'cursor': 'cursor',
  'q': 'q',
};
final result = await client.skill.marketplaceList(params);
print(result);
```

## Authentication Modes (Mutually Exclusive)

Choose exactly one mode for the same client instance.

### Mode A: API Key

```dart
final client = SdkworkAppClient.withBaseUrl(baseUrl: 'http://127.0.0.1:18092');
client.setApiKey('your-api-key');
// Sends: Access-Token: <apiKey>
```

### Mode B: Dual Token

```dart
final client = SdkworkAppClient.withBaseUrl(baseUrl: 'http://127.0.0.1:18092');
client.setAuthToken('your-auth-token');
client.setAccessToken('your-access-token');
// Sends:
// Authorization: Bearer <authToken>
// Access-Token: <accessToken>
```

> Do not call `setApiKey(...)` together with `setAuthToken(...)` + `setAccessToken(...)` on the same client.

## Configuration (Non-Auth)

```dart
final client = SdkworkAppClient.withBaseUrl(baseUrl: 'http://127.0.0.1:18092');
client.setHeader('X-Custom-Header', 'value');
```

## API Modules

- `client.skill` - skill API
- `client.skillPackage` - skill_package API
- `client.skillCategory` - skill_category API
- `client.skillInstallation` - skill_installation API

## Usage Examples

### skill

```dart
// marketplace.list
final params = <String, dynamic>{
  'page': 1,
  'page_size': 2,
  'cursor': 'cursor',
  'q': 'q',
};
final result = await client.skill.marketplaceList(params);
print(result);
```

### skill_package

```dart
// skillPackages.list
final params = <String, dynamic>{
  'page': 1,
  'page_size': 2,
  'cursor': 'cursor',
  'q': 'q',
};
final result = await client.skillPackage.skillPackagesList(params);
print(result);
```

### skill_category

```dart
// skillCategories.list
final params = <String, dynamic>{
  'page': 1,
  'page_size': 2,
  'cursor': 'cursor',
  'q': 'q',
};
final result = await client.skillCategory.skillCategoriesList(params);
print(result);
```

### skill_installation

```dart
// skillInstallations.list
final params = <String, dynamic>{
  'page': 1,
  'page_size': 2,
  'cursor': 'cursor',
  'q': 'q',
  'subject_kind': 'user',
  'subject_id': '1',
};
final result = await client.skillInstallation.skillInstallationsList(params);
print(result);
```

## Error Handling

```dart
try {
  final params = <String, dynamic>{
    'page': 1,
    'page_size': 2,
    'cursor': 'cursor',
    'q': 'q',
  };
  final result = await client.skill.marketplaceList(params);
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
