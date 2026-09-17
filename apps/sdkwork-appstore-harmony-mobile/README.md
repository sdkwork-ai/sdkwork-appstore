# SDKWork App Store HarmonyOS Mobile

SDKWork App Store native HarmonyOS mobile client for discovering, installing, and operating marketplace applications.

## Status

Architecture scaffold materialized against
`HARMONY_APP_MOBILE_ARCHITECTURE_SPEC.md` and `APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md`.
Route ids, package roles, and SDK surface align with the PC root
(`apps/sdkwork-appstore-pc`) so the two are implementations of one system.

## Package Family

| Package | Role | Layer role |
| --- | --- | --- |
| `packages/@sdkwork/sdkwork-appstore-harmony-mobile-core` | Runtime config, SDK port/factories, token manager, session store, route registry, host adapter contracts | frontend-core |
| `packages/@sdkwork/sdkwork-appstore-harmony-mobile-commons` | Domain-neutral UI primitives, design tokens, locale helpers | frontend-commons |
| `packages/@sdkwork/sdkwork-appstore-harmony-mobile-shell` | App shell, navigation, AuthGate integration | frontend-shell |
| `packages/@sdkwork/sdkwork-appstore-harmony-mobile-host` | Typed platform host adapters | frontend-host |
| `packages/@sdkwork/sdkwork-appstore-harmony-mobile-discover` | Discover capability package (routes: `app.store.discover.index`) | frontend-feature |
| `packages/@sdkwork/sdkwork-appstore-harmony-mobile-apps` | Apps capability package (routes: `app.store.apps.index`) | frontend-feature |
| `packages/@sdkwork/sdkwork-appstore-harmony-mobile-games` | Games capability package (routes: `app.store.games.index`) | frontend-feature |
| `packages/@sdkwork/sdkwork-appstore-harmony-mobile-charts` | Charts capability package (routes: `app.store.charts.index`) | frontend-feature |
| `packages/@sdkwork/sdkwork-appstore-harmony-mobile-category` | Category capability package (routes: `app.store.category.detail`) | frontend-feature |
| `packages/@sdkwork/sdkwork-appstore-harmony-mobile-collection` | Collection capability package (routes: `app.store.collection.detail`) | frontend-feature |
| `packages/@sdkwork/sdkwork-appstore-harmony-mobile-ai-hub` | Ai Hub capability package (routes: `app.store.ai-hub.index`, `app.store.ai-hub.experts`, `app.store.ai-hub.plugins`, `app.store.ai-hub.skills`, `app.store.ai-hub.mcp`, `app.store.ai-hub.templates`, `app.store.ai-hub.template-detail`, `app.store.ai-hub.template-detail-alias`) | frontend-feature |
| `packages/@sdkwork/sdkwork-appstore-harmony-mobile-search` | Search capability package (routes: `app.store.search.index`) | frontend-feature |
| `packages/@sdkwork/sdkwork-appstore-harmony-mobile-app-detail` | App Detail capability package (routes: `app.store.app-detail.detail`) | frontend-feature |
| `packages/@sdkwork/sdkwork-appstore-harmony-mobile-events` | Events capability package (routes: `app.store.events.detail`) | frontend-feature |
| `packages/@sdkwork/sdkwork-appstore-harmony-mobile-library` | Library capability package (routes: `app.store.library.index`) | frontend-feature |
| `packages/@sdkwork/sdkwork-appstore-harmony-mobile-updates` | Updates capability package (routes: `app.store.updates.index`) | frontend-feature |
| `packages/@sdkwork/sdkwork-appstore-harmony-mobile-wishlist` | Wishlist capability package (routes: `app.store.wishlist.index`) | frontend-feature |
| `packages/@sdkwork/sdkwork-appstore-harmony-mobile-user-store` | User Store capability package (routes: `app.store.user-store.index`, `app.store.user-store.public`) | frontend-feature |
| `packages/@sdkwork/sdkwork-appstore-harmony-mobile-publisher` | Publisher capability package (routes: `console.store.publisher.overview`, `console.store.publisher.app-create`, `console.store.publisher.app-manage`) | frontend-feature |
| `packages/@sdkwork/sdkwork-appstore-harmony-mobile-settings` | Settings capability package (routes: `console.system.settings.index`) | frontend-feature |

## Route Identity

Route ids are the cross-client alignment contract. This root owns the same
route ids as the PC and H5 roots; it never imports their route or UI
implementations.

| Route id | Path | Capability |
| --- | --- | --- |
| `app.store.discover.index` | `/` | `discover` |
| `app.store.apps.index` | `/apps` | `apps` |
| `app.store.games.index` | `/games` | `games` |
| `app.store.charts.index` | `/charts` | `charts` |
| `app.store.category.detail` | `/category/:id` | `category` |
| `app.store.collection.detail` | `/collection/:id` | `collection` |
| `app.store.ai-hub.index` | `/ai-hub` | `ai-hub` |
| `app.store.ai-hub.experts` | `/experts` | `ai-hub` |
| `app.store.ai-hub.plugins` | `/plugins` | `ai-hub` |
| `app.store.ai-hub.skills` | `/skills` | `ai-hub` |
| `app.store.ai-hub.mcp` | `/mcp` | `ai-hub` |
| `app.store.ai-hub.templates` | `/templates` | `ai-hub` |
| `app.store.ai-hub.template-detail` | `/template/:id` | `ai-hub` |
| `app.store.ai-hub.template-detail-alias` | `/templates/:id` | `ai-hub` |
| `app.store.search.index` | `/search` | `search` |
| `app.store.app-detail.detail` | `/app/:id` | `app-detail` |
| `app.store.events.detail` | `/events/:id` | `events` |
| `app.store.library.index` | `/library` | `library` |
| `app.store.updates.index` | `/updates` | `updates` |
| `app.store.wishlist.index` | `/wishlist` | `wishlist` |
| `app.store.user-store.index` | `/user-store` | `user-store` |
| `app.store.user-store.public` | `/store/:shareToken` | `user-store` |
| `console.store.publisher.overview` | `/publisher` | `publisher` |
| `console.store.publisher.app-create` | `/publisher/apps/new` | `publisher` |
| `console.store.publisher.app-manage` | `/publisher/apps/:id` | `publisher` |
| `console.system.settings.index` | `/console/settings` | `settings` |

## SDK Integration

| Surface | Workspace | Package | Status |
| --- | --- | --- | --- |
| app-api | `sdkwork-appstore-app-sdk` | declared port (no ArkTS target) | transport pending ArkTS target generation |

The SDK generation chain currently emits the TypeScript target of
`sdkwork-appstore-app-sdk` only. `core` therefore declares the SDK port
contract, base-URL normalization, and credential resolution boundary instead of
vendoring a transport copy or importing a package that does not exist. Feature
packages must never fill this gap with raw request APIs or manual auth headers.

## Configuration

Non-secret runtime config materializes as
`config/app/…` for the 10 supported profiles
(standalone.development, standalone.test, standalone.staging, standalone.production, standalone.demo, cloud.development, cloud.test, cloud.staging, cloud.production, cloud.demo).

## Verification

```bash
node ../../../sdkwork-specs/tools/check-apps-directory-index.mjs --root ../..
node ../../../sdkwork-specs/tools/check-frontend-composition.mjs --root ../..
node ../../../sdkwork-specs/tools/check-component-port-bindings.mjs --root ../..
node ../../../sdkwork-specs/tools/check-i18n-standard.mjs --root .
```
