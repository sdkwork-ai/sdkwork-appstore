# apps/

Application: sdkwork-appstore
Status: active
Owner: SDKWork maintainers
Specs: APPLICATION_SPEC.md, SDKWORK_WORKSPACE_SPEC.md

## Primary App Surface

The repository root is the primary runnable app surface.
The repository root `sdkwork.app.config.json` governs the primary application manifest.

## Directory Index

| Directory | Surface role | Runnable | Purpose | Entry |
| --- | --- | --- | --- | --- |
| sdkwork-appstore-common | common | no | SDKWork App Store Common | [README](sdkwork-appstore-common/README.md) |
| sdkwork-appstore-flutter-mobile | flutter-mobile | yes | SDKWork App Store Mobile flutter-mobile application root. | [README](sdkwork-appstore-flutter-mobile/README.md) |
| sdkwork-appstore-h5 | h5 | yes | SDKWork App Store h5 application root. | `sdkwork-appstore-h5/` |
| sdkwork-appstore-harmony-mobile | harmony-mobile | yes | SDKWork App Store HarmonyOS Mobile harmony-mobile application root. | [README](sdkwork-appstore-harmony-mobile/README.md) |
| sdkwork-appstore-mini-program | mini-program | yes | SDKWork App Store Mini Program mini-program application root. | [README](sdkwork-appstore-mini-program/README.md) |
| sdkwork-appstore-pc | pc | yes | SDKWork App Store pc application root. | [README](sdkwork-appstore-pc/README.md) |

## Allowed Content

- Selected language/architecture application roots with `README.md`, `AGENTS.md`, `.sdkwork/`, and `specs/` when authored packages exist.
- Architecture-local `packages/`, `config/`, `src/`, `lib/`, `App/`, or `entry/` directories required by the owning architecture standard.

## Forbidden Content

- Repository-root API contracts, generated SDK workspaces, Rust crates, or deployment descriptors moved under `apps/`.
- Runtime secrets, user-private state, generated SDK transport output, or cross-application copied business logic.

## Related Specs

- `../sdkwork-specs/APPLICATION_SPEC.md`
- `../sdkwork-specs/SDKWORK_WORKSPACE_SPEC.md`
- `../sdkwork-specs/APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md`

## Verification

```bash
node ../sdkwork-specs/tools/check-apps-directory-index.mjs --root .
```
