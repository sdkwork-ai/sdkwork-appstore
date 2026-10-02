# SDKWork App Store PC

The PC storefront of the SDKWork App Store: a React + Vite application that
also embeds into host clients (BirdCoder) through
`@sdkwork/appstore-pc-embed`. This application owns the storefront packages
under `packages/`, the API gateway composition lives in
`crates/`, and the initialization data lives in `database/seeds/`.

## Packages

- `packages/sdkwork-appstore-pc-core` — types, platform taxonomy
  (`platforms.ts`), distribution action resolution (`distribution.ts`), SDK
  client inventory, and service ports.
- `packages/sdkwork-appstore-pc-runtime` — SDK-backed service ports
  (catalog, install, session) that bind the generated app SDK.
- `packages/sdkwork-appstore-pc-commons` — shared storefront UI (app rows,
  platform badges, QR code image, distribution action buttons, install
  context).
- `packages/sdkwork-appstore-pc-merchandise` — storefront pages (discover,
  apps, games, search, charts, listing detail, library, updates) and the
  install/QR flows.
- `packages/sdkwork-appstore-pc-embed` — the host-embeddable root that wraps
  the whole storefront for BirdCoder and other hosts.

## Commands

```sh
pnpm install            # from the repository root
pnpm run dev            # express + vite dev server on :3000
pnpm run dev:browser    # vite only
pnpm run typecheck      # tsc --noEmit
pnpm test               # vitest
pnpm run build:desktop  # production bundle into dist/standalone/prod
```

## Distribution capability

The storefront resolves one action per distribution of a listing
(`packages/sdkwork-appstore-pc-core/src/distribution.ts`):

| Distribution | Platform codes | Action |
| --- | --- | --- |
| PC desktop | `windows` `macos` `linux` | OS-aware download + install: the modal matches the detected OS, shows the verified artifact (format + size), issues and consumes a download grant, and opens the presigned installer URL in a new independent window. |
| PC web | `web` `web-pc` `pwa` | Direct open in a new independent window (`noopener`). |
| H5 web | `h5` `web-h5` `mobile-web` | Direct open in a new independent window (`noopener`). |
| Mobile | `android` `ios` `harmonyos` | Scan-to-continue QR dialog labelled with the scanned platform. |
| Mini programs | `miniprogram-*` | Scan-to-continue QR dialog. |
| Browser extensions | `browser-extension-*` | Scan-to-continue QR dialog. |

Scan targets resolve per platform: the QR action prefers the platform link
from `appstore_app_platform.config_json.qrUrl` (exposed as `platformLinks`
on the listing projection), falls back to the listing `access_url`, then to
this storefront's own listing anchor.

Catalog data comes from the app API
(`/app/v3/api/appstore/catalog/...`): listings carry `platforms`,
`appType`, `accessUrl`, `platformLinks`, and releases carry their verified
`artifacts`. Desktop installs record the detected platform through the
library API; download grants flow through
`POST /app/v3/api/download_grants` and `.../consume`, whose response
delivers the presigned URL when the drive integration is enabled
(`APPSTORE_DRIVE_*` environment; without it the install record stands
alone).

## Initialization data

`database/seeds/` follows the shared database initialization standard
(`DATABASE_FRAMEWORK_SPEC.md` §6.4): language-neutral scripts in
`seeds/common/`, locale content in `seeds/locales/{locale}/`, explicit
ordering in `seed.manifest.json`, and locale-set checksums that must move
with content. The storefront-relevant seed chain:

- `005`/`006` — apps, listings, and published releases.
- `010` — verified release artifacts (Windows MSI for every release; macOS
  DMG and Linux AppImage for listings that ship those platforms),
  entitlements, download grants, install events.
- `011` — the platform dictionary (`appstore_platform_dictionary`).
- `012` — distribution projections (`appstore_app.platforms`,
  `access_url`) across the catalog.
- `013` — per-platform scan links (`appstore_app_platform`).

Apply with the database CLI (from the repository root):

```sh
pnpm run db:seed                              # default locale (zh-CN)
sdkwork-db --app-root . seed --locale en-US   # the CLI --locale flag has no env binding
pnpm run db:audit-seeds                       # storefront seed integrity audit
```
