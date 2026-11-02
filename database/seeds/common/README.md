# Common seed scripts

Locale-agnostic seed SQL referenced from `seeds/seed.manifest.json` profiles.

- `001_bootstrap.sql` finalizes market channel, category bindings, compliance, regional availability, market releases, and media/thread references. It runs last.
- `010_download_capabilities.sql` initializes the installer artifact matrix, paid entitlements, download grants, and install events for end-to-end download capability flows. The matrix is derived from `appstore_app.platforms`: every declared desktop or mobile operating system gets its CPU architectures and package formats (Windows x64/arm64, macOS arm64/x64, Linux x64/arm64, Android arm64/x64, iOS/iPadOS universal, HarmonyOS arm64). Web, H5, and mini program surfaces carry no installer. Artifact, grant, and install-event ids use the `artifact-`/`grant-`/`install-event-` namespaces owned by this file and are rebuilt on every apply.
- `011_platform_dictionary.sql` declares the storefront platform codes (`appstore_platform_dictionary`), including the mobile web `h5` surface.
- `013_app_platform_delivery.sql` owns the per-platform scan/preview matrix (`appstore_app_platform`): mobile store lanes, H5 mobile preview, mini programs, and browser extensions each get one row whose `config_json.qrUrl` is the scan target. Desktop installers and the PC web surface are not scan targets. The scannable lanes of a seeded app are rebuilt on every apply.
- `015_vertical_evaluation.sql` seeds the education-experiment, culture & tourism, and healthcare categories and their evaluation listings. It runs before `006` because `006` publishes the releases of these listings.
- `018_app_distribution_identity.sql` repairs the application identity of seeded catalog rows from the delivery matrix: `app_type` (PlusProjectType), `runtime_family`, `runtime_framework`, and `platforms` (`APP_MANIFEST_SPEC.md` sections 4-6), plus the release distribution snapshot and minimum OS version. Rows already projected from a real manifest are left untouched.
- `016_workspace_applications.sql` registers every H5 / PC / Flutter / mini-program (and HarmonyOS) application declared across the sdkwork-space sibling repositories. It is generated — do not hand-edit; refresh with `node database/seeds/.generate-workspace-applications.mjs` (scans `<workspace>/sdkwork-*/apps/*/agent.app.config.json`) and verify with `node database/seeds/.generate-workspace-applications.mjs --check`. The generator projects `app.appType`, `runtime.family`, `runtime.framework`, `publish.platforms`, and the enabled client packages of `artifacts.installConfig` onto canonical storefront values, deduplicates an application id declared by two sibling repositories, and emits the installer rows for enabled desktop/mobile packages. Its localized copy lives in the partner files `locales/zh-CN/004_workspace_applications_zh.sql` and `locales/en-US/004_workspace_applications_en.sql`; refresh the manifest checksums afterwards with `node database/seeds/.update-locale-checksums.mjs`.

Ordering matters: `012` projects the platform matrix, `015_vertical_evaluation` adds the vertical evaluation catalog, `016`/`017` add applications, `018` canonicalizes identity, `010` builds installers, `013` builds scan targets, and `001_bootstrap` finalizes the catalog.

## Download completeness contract

Every seeded application must be fully deliverable after the standard profile:

| Declared platform | Required download cells (architecture/format) |
| --- | --- |
| `windows` | `x64`: exe, msi, zip · `arm64`: exe, msi, zip |
| `macos` | `arm64`: dmg, zip · `x64`: dmg, zip |
| `linux` | `x64` and `arm64`: appimage, deb, tar_gz |
| `android` | `arm64`: apk, aab · `x64`: apk |
| `ios`, `ipados` | `universal`: ipa |
| `harmonyos` | `arm64`: hap |
| `web` | a usable `access_url` (open action) |
| `h5` | a usable `access_url` plus an `h5` scan target |
| `miniprogram-*`, `browser-extension-*` | an active scan target |

Each artifact must be `verified`, carry a Drive node, a 64-hex SHA-256, a byte size, a MIME type, a minimum OS version, a CDN URL, SBOM/provenance references, a download grant, and belong to a published release. Artifact digests must be unique. Re-run the per-app audit after changing `010`, `013`, `016`, or `018`.

Run `node database/seeds/.audit-seeds.mjs` or `pnpm run db:audit-seeds` to verify listing/release/catalog/download reference integrity and non-empty storefront content.
