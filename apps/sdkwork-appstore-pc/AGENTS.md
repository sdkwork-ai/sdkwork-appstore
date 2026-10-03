# Repository Guidelines

## SDKWORK Soul

Read `../../../sdkwork-specs/SOUL.md` before PC application work. Apply exact local contracts and selected global specifications before inspecting implementation details.

## SDKWORK Standards

The canonical standards index is `../../../sdkwork-specs/README.md`; `../../../sdkwork-specs/AGENTS_SPEC.md` governs this entrypoint. Load only the task-specific standards selected by the index and this file.

## Application Identity

Read `sdkwork.app.config.json` for application identity, release, media, and packaging metadata. Runtime and deployment values belong in `etc/sdkwork.deployment.config.json` and the typed runtime configuration adapter.

## Local Dictionary Structure

- `specs/`: application-level component and composition contracts.
- `packages/*/specs/`: independently authored PC module contracts.
- `packages/sdkwork-appstore-pc-runtime/`: runtime configuration, IAM, global TokenManager, and SDK client composition.
- `packages/sdkwork-appstore-pc-merchandise/src/bootstrap/`: standalone entry bootstrap wiring (auth, session store).
- `packages/`: app, console, backend-admin, shell, feature, and host modules.
- `etc/`: source-controlled runtime and deployment configuration.
- `tests/`: application architecture and contract tests.

## Spec Resolution Order

Use dynamic progressive loading before implementation files: read this file, `../../AGENTS.md`, the nearest `specs/component.spec.json`, the applicable row in `../../../sdkwork-specs/README.md`, and only then the selected implementation files. Language-specific specs load on demand only.

## Required Specs By Task Type

- TypeScript: `TYPESCRIPT_CODE_SPEC.md`, `CODE_STYLE_SPEC.md`, `NAMING_SPEC.md` (language specs load on-demand only).
- Frontend/package boundaries: `FRONTEND_CODE_SPEC.md`, `FRONTEND_SPEC.md`, `UI_ARCHITECTURE_SPEC.md`, `APP_PC_ARCHITECTURE_SPEC.md`, `APP_PC_REACT_UI_SPEC.md`, `COMPOSABLE_ARCHITECTURE_SPEC.md`.
- SDK consumption: `APP_SDK_INTEGRATION_SPEC.md`, `SDK_SPEC.md`, `TEST_SPEC.md`.
- List/search: `PAGINATION_SPEC.md`.
- IAM work: `IAM_SPEC.md`, `IAM_LOGIN_INTEGRATION_SPEC.md`, `SECURITY_SPEC.md`, `PRIVACY_SPEC.md`.
- Source config: `SOURCE_CONFIG_SPEC.md`, `CONFIG_SPEC.md`, `ENVIRONMENT_SPEC.md`, `DEPLOYMENT_SPEC.md`.
- Commands/workflows: `PNPM_SCRIPT_SPEC.md`, `GITHUB_WORKFLOW_SPEC.md`.

## Code Style Rules

Keep the current PC visual design as the product baseline. UI modules consume injected service ports; only bootstrap constructs SDK clients and owns the global TokenManager. App and user-console surfaces must not import backend SDKs. Backend SDKs are restricted to the explicit `backend-admin` composition. Do not add raw HTTP, manual auth headers, browser-owned secrets, local DTO forks, or fake-success paths.

## Build, Test, and Verification

Run the narrowest PC checks first: `pnpm typecheck`, `pnpm test`, and `pnpm build`. SDK changes also run `node ../../../sdkwork-specs/tools/check-app-sdk-consumer-imports.mjs --workspace ../..`; composition changes run the component, frontend-composition, permission-composition, and composition-resolver checks.

## Agent Execution Rules

Appstore owns marketplace catalog, publisher, listing, release, library, moderation, and store analytics. IAM, Drive, Comments, commerce, Agents, Skills, and MCP remain dependency-owned and are consumed through approved SDKs or composed facades. Do not modify database schema, migrations, generated SDK output, release policy, or destructive filesystem state without human review.

## Task-Specific Standards

List and search work additionally loads `PAGINATION_SPEC.md` and runs `node ../../../sdkwork-specs/tools/check-pagination.mjs --workspace ../..`. Source configuration work loads `SOURCE_CONFIG_SPEC.md`, `CONFIG_SPEC.md`, `ENVIRONMENT_SPEC.md`, and `DEPLOYMENT_SPEC.md`. API contract work loads `API_SPEC.md` and runs its operation and response-envelope checks.

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

Human review is required for breaking public API/SDK changes, security exceptions, database or migration changes, generated SDK ownership changes, release policy changes, and destructive filesystem work.
