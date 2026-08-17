# sdkwork-api-appstore-standalone-gateway

Unified HTTP entrypoint for the SDKWork App Store backend in standalone deployment mode.

## Responsibilities

- Bootstrap database lifecycle via `sdkwork-appstore-database-host` (init + auto-migrate)
- Apply `sdkwork-web-framework` request context, IAM adapter, and infra routes (`/healthz`, `/readyz`)
- Mount app-api business routes with `SdkWorkApiResponse` / `ProblemDetail` mapping through `sdkwork-appstore-routes-common`
- Wire domain services to SQLx repositories

## Run

```bash
# Workspace PostgreSQL (local development)
export SDKWORK_DATABASE_ENGINE="postgresql"
export SDKWORK_DATABASE_HOST="127.0.0.1"
export SDKWORK_DATABASE_PORT="5432"
export SDKWORK_DATABASE_NAME="sdkwork_ai_dev"
export SDKWORK_DATABASE_SCHEMA="sdkwork_ai_dev"
export SDKWORK_DATABASE_USERNAME="sdkwork_ai_dev"
export SDKWORK_DATABASE_PASSWORD="sdkworkdev123"

# Optional: sdkwork-drive (artifact/media validation + download URLs)
export APPSTORE_DRIVE_BASE_URL="http://127.0.0.1:18080"
export APPSTORE_DRIVE_SERVICE_AUTH_TOKEN="<service-auth-token>"
export APPSTORE_DRIVE_SERVICE_ACCESS_TOKEN="<service-access-token>"
# Optional: sdkwork-platform (registered app validation on listing create)
export APPSTORE_PLATFORM_BASE_URL="http://127.0.0.1:18080"
export APPSTORE_PLATFORM_SERVICE_AUTH_TOKEN="<service-auth-token>"
cargo run -p sdkwork-api-appstore-standalone-gateway
```

Default listen address: `127.0.0.1:3900` (`SDKWORK_APPSTORE_APPLICATION_PUBLIC_INGRESS_BIND` override).

### sdkwork-drive (server adapter)

```bash
export APPSTORE_DRIVE_BASE_URL="http://127.0.0.1:18080"
export APPSTORE_DRIVE_SERVICE_AUTH_TOKEN="<service-auth-token>"
export APPSTORE_DRIVE_SERVICE_ACCESS_TOKEN="<service-access-token>"  # uploader requires dual tokens
# optional:
export APPSTORE_DRIVE_SPACE_ID="<drive-space-id>"
export APPSTORE_DRIVE_ENABLED=1
```

Client uploads (PC/H5 publisher flows) use `@sdkwork/drive-app-sdk` with `driveAppApiBaseUrl` in runtime config.

## Architecture Notes

- Route crates (`sdkwork-routes-*`) own handler logic and OpenAPI manifests; gateway merges their Axum routers.
- File uploads go through `sdkwork-drive` (`@sdkwork/drive-app-sdk` on clients; `DriveIntegrationAdapter` on server). App Store APIs store Drive references only.
- Set `APPSTORE_DRIVE_ENABLED=0` or omit `APPSTORE_DRIVE_BASE_URL` to run without drive validation (dev-only; not for production).
- RPC / `sdkwork-discovery` is not required until split-service RPC deployment is introduced.
- Gateway and worker runtimes use the canonical workspace PostgreSQL profile from `SDKWORK_DATABASE_*`. SQLite adapters are test fixtures only.

## Verification

```bash
pnpm run verify
```
