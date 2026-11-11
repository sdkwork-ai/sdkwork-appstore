# sdkwork-api-appstore-standalone-gateway

Unified HTTP entrypoint for the SDKWork App Store backend in standalone deployment mode.

## Responsibilities

- Bootstrap database lifecycle via `sdkwork-appstore-database-host` (init + auto-migrate)
- Apply `sdkwork-web-framework` request context, IAM adapter, and infra routes (`/healthz`, `/readyz`)
- Mount app-api business routes with `SdkWorkApiResponse` / `ProblemDetail` mapping through `sdkwork-appstore-routes-common`
- Wire domain services to SQLx repositories

## Sibling modules (sdkwork-drive / sdkwork-search / sdkwork-iam)

App Store reaches every sibling SDKWork module **in-process** by default
(`MODULE_SPEC.md` §4.2). A packaged deployment runs one backend process against
one PostgreSQL, so Drive and Search are called through their service and
repository crates — sharing the connection pool, the transaction, and the error
model — and IAM is already in-process through `sdkwork-iam-web-adapter` +
`sdkwork-api-iam-assembly`.

**No sibling endpoint or service credential is required to boot.** The previous
contract required `APPSTORE_DRIVE_BASE_URL` (and the search endpoints) at
startup, which made a deployment without those variables unable to start at all.

In-process ports:

| Module | Port | Implementation |
| --- | --- | --- |
| sdkwork-drive | `ReleaseProviderPort`, `ListingProviderPort`, `LibraryProviderPort` | `integrations::drive_inprocess::InProcessDriveAdapter` |
| sdkwork-search | `CatalogSearchFederationPort` | `integrations::search_inprocess::InProcessSearchFederationAdapter` |
| sdkwork-search | `ListingSearchProjectionPort` | `integrations::search_inprocess::InProcessSearchProjectionAdapter` |
| sdkwork-iam | request context resolver + permission scopes | `sdkwork-iam-web-adapter` / `sdkwork-api-iam-assembly` (unchanged) |

## Run

```bash
# Workspace PostgreSQL (local development) — the only required configuration.
export SDKWORK_DATABASE_ENGINE="postgresql"
export SDKWORK_DATABASE_HOST="127.0.0.1"
export SDKWORK_DATABASE_PORT="5432"
export SDKWORK_DATABASE_NAME="sdkwork_ai_dev"
export SDKWORK_DATABASE_SCHEMA="sdkwork_ai_dev"
export SDKWORK_DATABASE_USERNAME="sdkwork_ai_dev"
export SDKWORK_DATABASE_PASSWORD="sdkworkdev123"

# Optional: sdkwork-platform (registered app validation on listing create)
export APPSTORE_PLATFORM_BASE_URL="http://127.0.0.1:18080"
export APPSTORE_PLATFORM_SERVICE_AUTH_TOKEN="<service-auth-token>"

# Optional: federated catalog search / listing index projection (in-process by default transport)
export APPSTORE_SEARCH_ENABLED=1
export APPSTORE_SEARCH_PROJECTION_ENABLED=1
export APPSTORE_SEARCH_INDEX_KEY="appstore-listings"

cargo run -p sdkwork-api-appstore-standalone-gateway
```

Default listen address: `127.0.0.1:3900` (`SDKWORK_APPSTORE_APPLICATION_PUBLIC_INGRESS_BIND` override).

### Split deployment (explicit opt-in)

Only a deployment that really runs Drive or Search in another process or
container sets `APPSTORE_INTEGRATION_MODE=http`. That mode is **validated at
startup**: a missing endpoint or service credential aborts the boot instead of
failing the first business request, after state may already have changed.

```bash
export APPSTORE_INTEGRATION_MODE=http

# sdkwork-drive split deployment
export APPSTORE_DRIVE_BASE_URL="http://127.0.0.1:18080"
export APPSTORE_DRIVE_SERVICE_AUTH_TOKEN="<service-auth-token>"
export APPSTORE_DRIVE_SERVICE_ACCESS_TOKEN="<service-access-token>"

# sdkwork-search split deployment (with APPSTORE_SEARCH_ENABLED=1)
export APPSTORE_SEARCH_BASE_URL="http://127.0.0.1:18081"

# sdkwork-search index projection split deployment
# (with APPSTORE_SEARCH_PROJECTION_ENABLED=1)
export APPSTORE_SEARCH_BACKEND_BASE_URL="http://127.0.0.1:18081"
export APPSTORE_SEARCH_INDEX_ID="<search-index-id>"
```

These three adapters are the repository's only recorded exceptions to the
in-process rule; see `specs/backend-module-call-boundary.allow.json`.

### Turning the Drive integration off

`APPSTORE_DRIVE_ENABLED=0` (also `false`/`off`) is read **once, at startup**, and
leaves the Drive port unwired in either transport. Artifact upload, listing media
resolution and storefront downloads then report "not configured" — there is no
per-request "drive disabled" mode that could fail after business state changed.
Absent means enabled.

### Drive authorization in in-process mode

The in-process Drive port evaluates exactly what Drive's app-api evaluated:
tenant-scoped node resolution plus the `reader` role for the calling subject on
`dr_drive_space` / `dr_drive_node_permission` (space ownership, inherited grants,
direct grants). The subject is the App Store **application service identity**
(`app` / `app:sdkwork-appstore:system`) — the identity the Drive service
credential represented, and the owner of the App Store upload space.

The write path keeps the two checks Drive's own routes performed: the tenant
upload quota (`ensure_tenant_can_allocate_bytes`) before an upload item is
created, and the `writer` role on the upload node before any byte is written. The
upload itself is Drive's `DriveUploaderService::upload_bytes`.

Consequences, unchanged from the HTTP contract:

- artifacts App Store uploaded itself are owned by that subject and validate;
- a drive node owned by another subject needs an explicit Drive grant for
  `app:sdkwork-appstore:system`, exactly as it did when the call carried the
  service access token;
- a failed check maps to the same `AppstoreServiceError` kind as before, so the
  HTTP status code does not change.

Client uploads (PC/H5 publisher flows) use `@sdkwork/drive-app-sdk` with `driveAppApiBaseUrl` in runtime config.

## Architecture Notes

- Route crates (`sdkwork-routes-*`) own handler logic and OpenAPI manifests; gateway merges their Axum routers.
- File uploads go through `sdkwork-drive` (`@sdkwork/drive-app-sdk` on clients; the in-process Drive port on the server). App Store APIs store Drive references only.
- An unconfigured deployment boots and serves with the in-process Drive port. There is no dev-only "drive disabled" fallback; an operator that really wants Drive off sets `APPSTORE_DRIVE_ENABLED=0` and gets no Drive port at all (decided at startup, see above).
- RPC / `sdkwork-discovery` is not required until split-service RPC deployment is introduced.
- Gateway and worker runtimes use the canonical workspace PostgreSQL profile from `SDKWORK_DATABASE_*`. SQLite adapters are test fixtures only.

## Verification

```bash
pnpm run verify
```
