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

<!-- SDKWORK-NAMING-STANDARD: v1 -->
## Rust Naming And Dependency Declaration

Authority: `../sdkwork-specs/NAMING_SPEC.md` section 3.1 and section 3.2.

Two identifier planes exist in every Rust crate and they MUST NOT be mixed: the package plane
(Cargo, filesystem, lock file) uses kebab-case, and the crate plane (lib target, modules, source
imports) uses snake_case.

- `[package].name`, the crate directory, `[features]` keys, and `[[bin]].name` use kebab-case.
- `[lib].name`, module files, module directories, and Rust imports use snake_case.
- A crate whose `[package].name` contains a hyphen SHOULD declare `[lib].name` explicitly
  (default: package name with every `-` replaced by `_`). A shorter lib name is allowed only
  when declared explicitly and used consistently by every consumer.
- Cargo dependency keys, `[workspace.dependencies]` keys, and `Cargo.lock` entries use the
  dependency package name. Use `package = "..."` when an alias is required.
- Every external crate referenced by `src/` MUST be declared in that crate's `[dependencies]`.
  Test-only crates belong in `[dev-dependencies]`; `build.rs` crates belong in
  `[build-dependencies]`.
- Never delete a dependency line, and never demote one from `[dependencies]` to
  `[dev-dependencies]`, while `src/` still imports it. Verify manifest cleanups with the
  command below before committing them.
- Regenerate and commit `Cargo.lock` in the same change as any dependency table edit.

Verification:

```bash
node ../sdkwork-specs/tools/check-rust-crate-naming-standard.mjs --root .
```
<!-- /SDKWORK-NAMING-STANDARD: v1 -->

<!-- SDKWORK-RUST-CODE-STANDARD: v1 -->
## Rust Code Standard

Authority: `../sdkwork-specs/RUST_CODE_SPEC.md` (v2, industry-best baseline); package/crate
naming and dependency declaration are normative in `../sdkwork-specs/NAMING_SPEC.md` section 3.1
and 3.2.

- Crates are responsibility-shaped: service, repository-sqlx, routes, service-host, native-host,
  worker, assembly, gateway. No generic `core`/`common`/`backend`/`runtime` suffixes.
- Errors are typed enums (`thiserror`) implementing `std::error::Error` with a `source` chain.
  `anyhow` only at binary/CLI/test boundaries, never in lib `[dependencies]`.
- No `unsafe` without a `// SAFETY:` comment; crates default to `unsafe_code = "forbid"`.
  No `unwrap`/`expect`/`panic!`/`todo!`/`dbg!` in library code reachable from public API.
- No lock guard held across `.await`; every external await has a timeout; spawned tasks are
  awaited/detached with a documented owner; retries are bounded, jittered, and idempotent.
- Public API is minimal, documented, `#[must_use]` where applicable, and semver-clean. Leaking
  framework types (`sqlx::Row`, axum extractors) through public signatures is forbidden.
- Workspace root declares `[workspace.package]` (edition, rust-version) and `[workspace.lints]`
  (RUST_CODE_SPEC.md section 13 baseline); every member inherits both with
  `edition.workspace = true` and `[lints] workspace = true`.

Verification:

```bash
node ../sdkwork-specs/tools/check-rust-crate-naming-standard.mjs --root .
node ../sdkwork-specs/tools/check-rust-manifest-standard.mjs --root .
# when service/repository/route/gateway dependencies change:
node ../sdkwork-specs/tools/check-rust-backend-composition.mjs --root .
```
<!-- /SDKWORK-RUST-CODE-STANDARD: v1 -->

<!-- SDKWORK-TYPESCRIPT-CODE-STANDARD: v1 -->
## TypeScript Code Standard

Authority: `../sdkwork-specs/TYPESCRIPT_CODE_SPEC.md` (v2, industry-best baseline).

- `tsconfig` runs `strict: true` and the strict family; public APIs are typed and `any`-free.
  `import type` is required for type-only imports (`verbatimModuleSyntax`).
- Errors are typed at package/service boundaries; no empty catches, no swallowed promise
  rejections, no bare `throw new Error('...')` for business failures.
- Async: every promise is settled; external awaits have timeouts; `AbortSignal` accepted for
  cancellable work; bounded concurrency; no unbounded `Promise.all`.
- Public API is minimal, JSDoc-documented, `@deprecated` where applicable, and semver-clean.
- Discriminated unions model closed variant sets; no `as`/`@ts-ignore` bypasses without a guard.
- Node/build runners verify build-critical sources and self-heal from git (CODE_STYLE_SPEC §7);
  `pnpm clean` never deletes git-tracked build-critical files.

Verification:

```bash
pnpm typecheck && pnpm test && pnpm lint
node ../sdkwork-specs/tools/check-application-layering.mjs --root .
```
<!-- /SDKWORK-TYPESCRIPT-CODE-STANDARD: v1 -->

<!-- SDKWORK-FRONTEND-CODE-STANDARD: v1 -->
## Frontend Code Standard

Authority: `../sdkwork-specs/FRONTEND_CODE_SPEC.md` (v2); language rules follow
`../sdkwork-specs/TYPESCRIPT_CODE_SPEC.md` (React/TS) or `../sdkwork-specs/DART_CODE_SPEC.md` (Flutter).

- UI -> service -> injected SDK flow is preserved; components never construct SDK clients or
  assemble raw HTTP/auth headers.
- React: hooks rules clean (`react-hooks`), `useEffect` with full deps and cleanup, stable
  list keys, error boundaries at route/page level, derived state during render (not in effects).
- State: server state behind services/query layer; client state local or minimal typed store;
  no duplication of server state in client stores.
- Accessibility: accessible names, keyboard behavior, visible focus, color is never the only
  signal; error states announced.
- i18n for all user-facing copy in reusable/user-facing packages (I18N_SPEC §6.1).
- PC/H5 `outDir` uses `dist/{standalone,cloud}/{dev,test,staging,prod}`.

Verification:

```bash
pnpm typecheck && pnpm test && pnpm lint
node ../sdkwork-specs/tools/check-application-layering.mjs --root .
node ../sdkwork-specs/tools/check-browser-dist-layout.mjs --root .   # PC/H5 apps
```
<!-- /SDKWORK-FRONTEND-CODE-STANDARD: v1 -->

<!-- SDKWORK-PNPM-WORKSPACE-STANDARD: v1 -->
## pnpm Workspace Dependency And Package Import

Authority: `../sdkwork-specs/PNPM_WORKSPACE_DEPENDENCY_SPEC.md` (companion to
`../sdkwork-specs/DEPENDENCY_MANAGEMENT_SPEC.md`).

Sibling SDKWork repositories are consumed through a dual-track model that MUST stay consistent:

- **Local development** (`pnpm dev`, `pnpm build`): pnpm workspace protocol. Each sibling
  package is declared ONCE in this repository root `pnpm-workspace.yaml` `packages:` as a
  `../sdkwork-*` relative path, and consumed with `workspace:*` in `package.json`. Never use
  `file:`/`link:`/git-URL specifiers for SDKWork sibling packages in any environment.
- **CI / release packaging**: git-repository dependency checkout. Every sibling referenced by the
  local workspace MUST have a matching `dependencies[]` entry in `sdkwork.workflow.json` so CI
  clones the sibling into the same `../sdkwork-*` relative layout (`GITHUB_WORKFLOW_SPEC.md`).
  `package.json` is never rewritten for CI.

Import rules for sibling SDKWork packages:

- Import by package name only: `import { X } from "@sdkwork/package-name"`. The specifier MUST
  equal the target package's `package.json` `name` exactly - no shortening, renaming, or alias.
- Forbidden: relative imports that cross a package boundary into another SDKWork repository or
  another workspace package's `src/` (for example `import ... from "../../sdkwork-appbase/.../src/..."`).
- Consume only the public `exports` surface of a package; never deep-import sibling `src/` internals.
- Every non-relative import in a workspace member MUST resolve to that member's own
  `dependencies`/`devDependencies`/`peerDependencies` (import closure).
- Vite aliases MUST NOT rename or redirect `@sdkwork/*` packages, MUST NOT be added to make a
  resolution error pass, and are allowed only for documented bootstrap/SDK-generation entrypoints.
- Fix a resolution failure by correcting the workspace declaration or the package `exports`,
  not by adding an alias.

Verification:

```bash
node ../sdkwork-specs/tools/verify-repo.mjs --root .
node ../sdkwork-specs/tools/check-workspace-member-protocol.mjs --root .
node ../sdkwork-specs/tools/check-dependency-list-completeness.mjs --target <repo-name>
```
<!-- /SDKWORK-PNPM-WORKSPACE-STANDARD: v1 -->
