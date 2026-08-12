# Repository Guidelines

## SDKWORK Soul

Read `../sdkwork-specs/SOUL.md` before repository work. Apply specs before memory, dictionary before context, exact sources before inference, and evidence before completion.

## SDKWORK Standards

The canonical standards entrypoint is `../sdkwork-specs/README.md`; agent behavior follows `../sdkwork-specs/AGENTS_SPEC.md`. Load task-specific standards dynamically and do not copy their normative bodies into this repository.

## Application Identity

- Application id: `sdkwork-appstore`
- Runtime family: Rust/Axum services with PC and H5 TypeScript applications
- API authorities: `sdkwork-appstore-app-api`, `sdkwork-appstore-backend-api`, `sdkwork-appstore-open-api`
- SDK families: `sdkwork-appstore-app-sdk`, `sdkwork-appstore-backend-sdk`, `sdkwork-appstore-sdk`
- Application declarations: `apps/*/sdkwork.app.config.json`
- Source configuration: `apps/*/etc/sdkwork.deployment.config.json`

Application declarations own identity and release metadata. Concrete environment, runtime, base URL, and deployment values belong under each deployable root's `etc/` directory.

## Local Dictionary Structure

- `AGENTS.md`: repository execution entrypoint.
- `CLAUDE.md`, `GEMINI.md`, `CODEX.md`: compatibility shims pointing here.
- `specs/`: repository component, domain, and database contracts.
- `apis/`: authored app, backend, and open API contracts.
- `sdks/`: owner SDK families and generator inputs; generated output is never hand-edited.
- `crates/`: Rust services, repositories, route crates, assemblies, and process hosts.
- `apps/`: independently deployable PC, H5, and shared application package roots.
- `etc/` under deployable roots: source-controlled runtime and deployment configuration.
- `.sdkwork/`: source-controlled local AI metadata only.

## Documentation Canon

- [docs/README.md](docs/README.md)
- [docs/product/prd/PRD.md](docs/product/prd/PRD.md)
- [docs/architecture/tech/TECH_ARCHITECTURE.md](docs/architecture/tech/TECH_ARCHITECTURE.md)

## Spec Resolution Order

Use dynamic progressive loading and inspect implementation files only after resolving the task-specific dictionary and standards.

1. Read the nearest `AGENTS.md`.
2. Read `sdkwork.app.config.json` and `etc/` only when identity, runtime, release, or deployment is in scope.
3. Read the nearest module `specs/`, then repository `specs/`, when their contracts are touched.
4. Read relevant `.sdkwork/` metadata only when a local extension is in scope.
5. Resolve the task row in `../sdkwork-specs/README.md`.
6. Read only the selected global specs, then inspect implementation files.

## Required Specs By Task Type

- Agent/workflow: `AGENTS_SPEC.md`, `SDKWORK_WORKSPACE_SPEC.md`, `DOCUMENTATION_SPEC.md`, `TEST_SPEC.md`.
- Any code: `CODE_STYLE_SPEC.md`, `NAMING_SPEC.md`, and only the touched language spec.
- TypeScript/Node: `TYPESCRIPT_CODE_SPEC.md`; language specs load on demand only.
- Rust/Cargo: `RUST_CODE_SPEC.md`, `WEB_BACKEND_SPEC.md`, `TEST_SPEC.md`.
- API/SDK: `API_SPEC.md`, `SDK_SPEC.md`, `SDK_WORKSPACE_GENERATION_SPEC.md`, `APP_SDK_INTEGRATION_SPEC.md`, `TEST_SPEC.md`.
- List/search: add `PAGINATION_SPEC.md`.
- Component composition: `COMPONENT_SPEC.md`, `COMPOSABLE_ARCHITECTURE_SPEC.md`, `APP_COMPOSITION_SPEC.md`.
- Source config: `SOURCE_CONFIG_SPEC.md`, `CONFIG_SPEC.md`, `ENVIRONMENT_SPEC.md`, `DEPLOYMENT_SPEC.md`.
- Package commands/workflows: `PNPM_SCRIPT_SPEC.md`, `GITHUB_WORKFLOW_SPEC.md`, `TEST_SPEC.md`.
- Security/auth: `IAM_SPEC.md`, `IAM_LOGIN_INTEGRATION_SPEC.md`, `SECURITY_SPEC.md`, `PRIVACY_SPEC.md`.

## Int64 Wire Contract (API_SPEC §13.6)

- OpenAPI `int64` fields and parameters `MUST` be `type: string`, `format: int64`,
  a decimal `pattern` such as `^-?[0-9]+$`, and `x-sdkwork-int64-string: true`.
  `type: integer, format: int64` is a contract violation: generated TypeScript
  SDKs then emit `number`, and browsers silently round ids past
  `Number.MAX_SAFE_INTEGER` (2^53), replaying wrong ids into lookups.
- Rust response DTOs `MUST` serialize `i64` wire fields with
  `#[serde(with = "sdkwork_utils_rust::serde_int64")]` (or `::option`); request
  boundaries parse inbound strings with the same helper.
- Generated TypeScript SDKs keep `int64` as `string`; frontend code `MUST NOT`
  convert ids/snowflake ids/sequence ids to `number` for storage, comparison,
  or submission.
- Verification: `node <sdkwork-specs>/tools/check-api-operation-patterns.mjs --workspace .`

## Code Style Rules

- Keep route, service, repository, SDK, application, and composition responsibilities in their owning modules.
- Use canonical lower-kebab package/file identities and language-native module naming from `NAMING_SPEC.md`.
- Do not hand-edit `sdks/**/generated/server-openapi`; fix the authority, generator input, or approved facade and regenerate.
- Build-critical sources and `pnpm clean` follow `CODE_STYLE_SPEC.md` section 7.

## Build, Test, and Verification

Run from this repository root and start with the narrowest relevant command:

```powershell
pnpm check
pnpm verify
cargo fmt -- --check
cargo test --workspace
node ../sdkwork-specs/tools/check-agent-workflow-standard.mjs --root .
node ../sdkwork-specs/tools/check-repository-docs-standard.mjs --root .
```

Do not use `cargo fmt --all`; optional sibling workspace paths are outside this repository's formatting authority.

## Agent Execution Rules

- Appstore owns marketplace catalog, publisher, listing, release, library, moderation, and store analytics APIs.
- IAM, Drive, Comments, and commerce domains remain dependency-owned and are consumed through approved SDKs or composed facades.
- Paid checkout uses `@sdkwork/cloudrouter-app-sdk/domains`; do not add raw HTTP, manual auth headers, DTO forks, or local SDK proxies.
- Do not change database schema or migrations without explicit user confirmation.
- Preserve unrelated dirty work and use evidence from executable checks before completion.

## Task-Specific Standards

- App SDK consumer work routes to `../sdkwork-specs/APP_SDK_INTEGRATION_SPEC.md`; verify scoped composed imports with `node ../sdkwork-specs/tools/check-app-sdk-consumer-imports.mjs --workspace .`.
- HTTP API input, output, envelope, error, and operation work routes to `../sdkwork-specs/API_SPEC.md`; run `check-api-operation-patterns.mjs` and `check-api-response-envelope.mjs` from `../sdkwork-specs/tools/`.
- List and search work routes to `../sdkwork-specs/PAGINATION_SPEC.md`; verify store-level canonical pagination with `node ../sdkwork-specs/tools/check-pagination.mjs --workspace .`.

## Human Review Rules

Human review is required for breaking public API/SDK changes, security exceptions, database or migration changes, generated SDK ownership changes, release policy changes, and destructive filesystem work.
