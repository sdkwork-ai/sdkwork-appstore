# Repository Guidelines

## SDKWORK Soul

Read `../../../sdkwork-specs/SOUL.md` before work in this application root.

## SDKWORK Standards

Use `../../../sdkwork-specs/README.md` and `../../../sdkwork-specs/AGENTS_SPEC.md` as the global authority. Load only the task-specific standards selected by the root matrix.

## Application Identity

- Application id: `sdkwork-appstore-h5`
- Surface: phone-first H5 browser application
- Declaration: `sdkwork.app.config.json`
- Source configuration: `etc/sdkwork.deployment.config.json`
- Application SDK: `@sdkwork/appstore-app-sdk`
- Federated commerce SDK: `@sdkwork/cloudrouter-app-sdk/domains`

## Local Dictionary Structure

- `sdkwork.app.config.json`: application and release identity.
- `etc/`: concrete environment, base URL, runtime, and deployment configuration.
- `specs/`: component contracts.
- `packages/`: H5 application packages.
- `src/`: bootstrap and host composition.
- `docs/`: application Canon documentation.
- `.sdkwork/`: local AI metadata.

## Documentation Canon

- [docs/README.md](docs/README.md)
- [docs/product/prd/PRD.md](docs/product/prd/PRD.md)
- [docs/architecture/tech/TECH_ARCHITECTURE.md](docs/architecture/tech/TECH_ARCHITECTURE.md)

## Spec Resolution Order

Use dynamic progressive loading: read this file, then the app declaration and nearest component specs when relevant, then the task row in `../../../sdkwork-specs/README.md`, then only selected standards, and implementation files last. Language-specific standards are on-demand only.

## Required Specs By Task Type

- TypeScript: `TYPESCRIPT_CODE_SPEC.md`, `CODE_STYLE_SPEC.md`, `NAMING_SPEC.md`.
- Frontend/package boundaries: `FRONTEND_CODE_SPEC.md`, `FRONTEND_SPEC.md`, `UI_ARCHITECTURE_SPEC.md`, `APP_H5_ARCHITECTURE_SPEC.md`, `APP_MOBILE_REACT_UI_SPEC.md`, `COMPOSABLE_ARCHITECTURE_SPEC.md`.
- SDK consumption: `APP_SDK_INTEGRATION_SPEC.md`, `SDK_SPEC.md`, `TEST_SPEC.md`.
- List/search: `PAGINATION_SPEC.md`.
- Source config: `SOURCE_CONFIG_SPEC.md`, `CONFIG_SPEC.md`, `ENVIRONMENT_SPEC.md`, `DEPLOYMENT_SPEC.md`.
- Commands/workflows: `PNPM_SCRIPT_SPEC.md`, `GITHUB_WORKFLOW_SPEC.md`.

## Code Style Rules

Keep bootstrap, services, reusable packages, and UI responsibilities separated. Shared cross-architecture logic belongs under `../sdkwork-appstore-common`; H5 packages remain host independent.

## Build, Test, and Verification

```powershell
pnpm typecheck
pnpm test
pnpm build
node ../../../sdkwork-specs/tools/check-app-sdk-consumer-imports.mjs --workspace ../..
node ../../../sdkwork-specs/tools/check-pagination.mjs --workspace ../..
```

## Agent Execution Rules

Use the global TokenManager and per-surface runtime base URLs from bootstrap. Do not use raw HTTP, generated transport package imports, manual auth headers, local DTO forks, or app-local SDK proxies. Do not change database schemas from this client root.

## Task-Specific Standards

- App SDK consumer work routes to `../../../sdkwork-specs/APP_SDK_INTEGRATION_SPEC.md`; use scoped composed exports and run `check-app-sdk-consumer-imports.mjs`.
- HTTP API and response work routes to `../../../sdkwork-specs/API_SPEC.md`; generated SDKs own envelope unwrapping and typed errors.
- List and search work routes to `../../../sdkwork-specs/PAGINATION_SPEC.md`; request bounded server pages and run `check-pagination.mjs`.

HTTP API input, output, envelope, error, and operation work routes to `../../../sdkwork-specs/API_SPEC.md` (section 4.5 and sections 14-16); verify with `check-api-operation-patterns.mjs` and `check-api-response-envelope.mjs` from `../../../sdkwork-specs/tools/`.

## Human Review Rules

Request review for breaking public SDK behavior, security/auth changes, runtime credential changes, release policy changes, or generated SDK ownership changes.
