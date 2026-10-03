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

## HTTP API Response Envelope

All L2+ SDKWork-owned custom HTTP contracts, including `app-api`, `backend-api`, and SDKWork-owned business `open-api`, `MUST` follow `API_SPEC.md` section 4.5, section 14, and section 15:

- **Default classification:** omitted `x-sdkwork-wire-protocol` means SDKWork-owned custom API (`sdkwork-v3`); only operation-level `x-sdkwork-wire-protocol: external` plus `x-sdkwork-external-protocol-id` identifies a third-party compatibility `open-api` operation.
- **Input:** typed request bodies, section 14.1 list/search/command input, `SdkWorkListQuery`, and `q` for free-text search.
- **Success output:** `SdkWorkApiResponse` with `{ "code": 0, "data": <payload>, "traceId": "<server-uuid>" }`.
- **Error output:** HTTP 4xx/5xx `application/problem+json` (`ProblemDetail`) with numeric `code` and `traceId`; SDKWork-owned errors may include `i18nKey` and `locale` presentation metadata.
- Success `code` is numeric `int32`; HTTP 2xx JSON bodies `MUST` use `0` only. REST semantics remain on HTTP status (`201`, `202`, etc.).
- Platform error codes are numeric non-zero values per section 15.3 (`40001`, `40101`, `40401`, …).
- Single resource: `data.item`
- Lists: `data.items` + `data.pageInfo` (`PageInfo.mode` is `offset` or `cursor`)
- Commands: `data.accepted` plus optional `resourceId` / `status`
- Async accept (`202`): `data.operationId`, `data.status`, optional `pollUrl`
- Operation patterns: retrieve/list/search/create/update/delete/command/async/bulk semantics follow `API_SPEC.md` section 15.4; create uses `201`, delete uses `204` with no JSON body, and `PUT`/`PATCH` use SDK action `update`.

Vendor compatibility `open-api` routes that mirror upstream tool or provider wire (for example OpenAI `/v1/*`, Anthropic/Claude `/anthropic/v1/*`, Google/Gemini `/google/v1beta/*`, Claude Code, or Codex) `MAY` opt out only when every exempt operation declares operation-level `x-sdkwork-wire-protocol: external` and `x-sdkwork-external-protocol-id` per `API_SPEC.md` section 4.5.2. SDKWork-owned business `open-api` operations `MUST NOT` opt out. Mixed OpenAPI documents are validated per operation; one external operation never exempts SDKWork-owned operations in the same document.

Errors `MUST` use HTTP 4xx/5xx with `application/problem+json` (`ProblemDetail`) including required numeric `code` and `traceId`. Optional `i18nKey` and `locale` are display metadata only. Business failures `MUST NOT` use HTTP 2xx with non-zero `code`, string wire codes, `success`, or human `message`.

Forbidden legacy envelopes and fields: `PlusApiResult`, `AppbaseApiResult`, `StoreApiResult`, `SdkWorkResponse`, per-domain `*ApiResult`, wire field `requestId`, bare domain DTOs at the HTTP root, and top-level `{ items, pageInfo, traceId }` without `data`.

Handlers `MUST` serialize success and map errors through `sdkwork-web-framework` response mapping. Generated HTTP SDKs (`--standard-profile sdkwork-v3`) unwrap `data` by default and expose typed numeric `ProblemDetail.code` / `traceId` and returned localization metadata on errors; use `.raw` when the full envelope is required.

Before completing API contract, SDK generation, or frontend service work, run:

```bash
node <sdkwork-specs>/tools/check-api-operation-patterns.mjs --workspace <workspace-root>
node <sdkwork-specs>/tools/check-api-response-envelope.mjs --workspace <workspace-root>
```

Authority: `sdkwork-specs/API_SPEC.md` section 4.5 and sections 14–16, `SDK_SPEC.md` section 4.2, `FRONTEND_SPEC.md`, `MIGRATION_SPEC.md` section 4.2.

## Human Review Rules

Request review for breaking public SDK behavior, security/auth changes, runtime credential changes, release policy changes, or generated SDK ownership changes.
