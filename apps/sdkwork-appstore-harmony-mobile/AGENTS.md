# Repository Guidelines

## SDKWORK Soul

Read `../../../sdkwork-specs/SOUL.md` before executing application tasks. Start with the sections that route the current task; related-spec references are not a startup bundle.

## SDKWORK Standards

The canonical standards index is `../../../sdkwork-specs/README.md`, and `../../../sdkwork-specs/AGENTS_SPEC.md` governs this entrypoint. Read the relevant task-matrix row first and do not copy global normative bodies locally.

## Application Identity

Read `sdkwork.app.config.json` only for application identity, SDK/API inventory, release metadata, packaging, or app-owned capabilities. Runtime values belong to source configuration under `etc/` and `config/app/`, not to the application declaration.

- Application code: `appstore`
- Application key: `appstore-harmony-mobile`
- Bundle name: `com.sdkwork.appstore.mobile`
- Client architecture: `harmony-mobile` (runtime target `harmony-native`)

## Local Dictionary Structure

Use `AGENTS.md` as the application routing entrypoint. Read `.sdkwork/`, `specs/`, application source, tests, and documentation only when the current task reaches the contract each location governs.

- `entry/` is the installable HarmonyOS entry/composition module: the entry ability, bootstrap, provider assembly, route registry, SDK client construction, IAM runtime wiring, and host adapter registration.
- `packages/` owns ArkTS/HAR core, commons, shell, host, and capability packages named `@sdkwork/sdkwork-appstore-harmony-mobile-*`.
- `AppScope/`, `oh-package.json5`, `build-profile.json5`, `hvigor/`, `config/`, and `etc/` are deployable-root configuration and build metadata.

## Spec Resolution Order

Use dynamic progressive loading: read this file and `../../AGENTS.md`, then `../../../sdkwork-specs/HARMONY_APP_MOBILE_ARCHITECTURE_SPEC.md`, then applicable local contracts under `specs/`, then the relevant task route in `../../../sdkwork-specs/README.md`, and only afterward inspect implementation files. Language-specific specs are on-demand only.

## Required Specs By Task Type

Client work loads `../../../sdkwork-specs/APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md`, `../../../sdkwork-specs/HARMONY_APP_MOBILE_ARCHITECTURE_SPEC.md`, and `../../../sdkwork-specs/APP_HARMONY_NATIVE_UI_SPEC.md`. Code changes load `../../../sdkwork-specs/CODE_STYLE_SPEC.md`, `../../../sdkwork-specs/NAMING_SPEC.md`, `../../../sdkwork-specs/FRONTEND_CODE_SPEC.md`, and only the touched platform authority. Package-command work loads `../../../sdkwork-specs/PNPM_SCRIPT_SPEC.md`; packaging workflow changes load `../../../sdkwork-specs/GITHUB_WORKFLOW_SPEC.md`; deployment work loads `../../../sdkwork-specs/DEPLOYMENT_SPEC.md`, `../../../sdkwork-specs/CONFIG_SPEC.md`, and `../../../sdkwork-specs/SOURCE_CONFIG_SPEC.md`. Locale work loads `../../../sdkwork-specs/I18N_SPEC.md`. Language-specific specs are on-demand only.

## Code Style Rules

Consume `/app/v3/api` through the generated ArkTS/TypeScript app SDK client adapted for the Harmony runtime and composed in `core`/bootstrap. No ArkTS target is produced by the SDK generation chain yet, so `core` owns the declared SDK port and credential boundary. Do not introduce raw HTTP, manual authentication headers, generated transport imports, local SDK forks, or a second appbase IAM runtime.

## Build, Test, and Verification

HarmonyOS builds require DevEco Studio or a compatible HarmonyOS SDK, `hvigor`, and `ohpm` plus a documented signing profile; these toolchains are not part of the repository workspace.

```powershell
ohpm install
hvigor clean
hvigor assembleHap
```

Static repository verification (runs without the HarmonyOS toolchain):

```bash
node ../../../sdkwork-specs/tools/check-apps-directory-index.mjs --root ../..
node ../../../sdkwork-specs/tools/check-frontend-composition.mjs --root ../..
node ../../../sdkwork-specs/tools/check-component-port-bindings.mjs --root ../..
```

## Agent Execution Rules

Follow specifications before memory and evidence before completion. Keep SDK construction, authentication, environment selection, and host capabilities in their owning composition layers. Route ids, i18n keys, SDK surfaces, service contracts, and host adapter contracts align with the PC root; never import another client architecture's UI implementation, routes, or private source. Stop when kernel ownership, API authority, or SDK family boundaries are ambiguous.

## Task-Specific Standards

SDK consumer work loads `../../../sdkwork-specs/APP_SDK_INTEGRATION_SPEC.md` and runs `check-app-sdk-consumer-imports.mjs`. List/search work loads `../../../sdkwork-specs/PAGINATION_SPEC.md` and `check-pagination.mjs`. Source configuration work loads `../../../sdkwork-specs/SOURCE_CONFIG_SPEC.md` and `check-source-config-standard.mjs`. Locale resource work loads `../../../sdkwork-specs/I18N_SPEC.md` and `check-i18n-standard.mjs`.

## Human Review Rules

Human review is required for public API changes, security exceptions, database migrations, generated SDK ownership changes, destructive operations, and cross-application standards changes.
