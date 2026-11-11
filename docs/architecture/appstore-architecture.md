# SDKWork App Store Architecture

Version: 1.0.0  
Status: active — pre-launch alignment complete for core surfaces  
Updated: 2026-07-06  
Related: ADR-20260612-appstore-foundation, REQ-2026-appstore-foundation

## Canonical Documents

Use the following as the single source of truth for product, UI, backend, and data contracts:

| Topic | Document |
| --- | --- |
| Product PRD | [product/prd/PRD.md](../product/prd/PRD.md) |
| UI/UX spec | [product/design/UI_DESIGN_SPEC.md](../product/design/UI_DESIGN_SPEC.md) |
| Tech architecture | [architecture/tech/TECH_ARCHITECTURE.md](tech/TECH_ARCHITECTURE.md) |
| API operation catalog | [api/operation-catalog.md](../api/operation-catalog.md) |
| Service interface map | [api/appstore-service-interface-map.md](../api/appstore-service-interface-map.md) |
| Database tables | [database/appstore-table-catalog.md](../database/appstore-table-catalog.md) |
| Implementation tracker | [crates/IMPLEMENTATION_TODO.md](../../crates/IMPLEMENTATION_TODO.md) |

## 1. Product Positioning

SDKWork App Store is SDKWork’s **professional application marketplace**, aligned with Apple App Store, Google Play, and regional stores (e.g. 应用宝), while remaining native to the SDKWork ecosystem.

| Industry reference | SDKWork capability |
| --- | --- |
| App Store / Play Store consumer | Catalog + Listing + Library (app-api) |
| App Store Connect / Play Console | Publisher Console (app-api) |
| App Review / Play Policy | Moderation + Compliance (backend-api) |
| TestFlight / staged rollout | Release channels + beta_invite + rollout |
| Update API | Open API `check_update` + `resolve_download` |

## 2. Layered Architecture

```text
Client (apps/sdkwork-appstore-pc | h5)
  → @sdkwork/appstore-app-sdk (composed facade)
sdkwork-api-appstore-standalone-gateway
  → sdkwork-appstore-service-host
      publisher | listing | release | catalog | library
      moderation | compliance | market
  → sdkwork-appstore-repository-sqlx (SQLite + PostgreSQL dialect)
  → sdkwork-appstore-analytics-worker (projections / scheduled jobs)
External SDKs: IAM, Drive, Platform, Comments, Notifications, Commerce checkout (cloudrouter domains) wired on PC/H5. Server-side sibling modules are reached IN-PROCESS (`MODULE_SPEC.md` §4.2): `integrations::drive_inprocess` over `sdkwork-drive-workspace-service`, `integrations::search_inprocess` over `sdkwork-search-provider-postgresql`, IAM through `sdkwork-iam-web-adapter`. No sibling endpoint is required to boot; a split deployment opts in with `APPSTORE_INTEGRATION_MODE=http`.
```

## 3. Capability Modules

| Domain | Service crate | Primary tables |
| --- | --- | --- |
| Publisher | publisher-service | `appstore_publisher*` |
| Listing | listing-service | `appstore_listing*` |
| Release | release-service | `appstore_release*` |
| Catalog | catalog-service | `appstore_catalog*` |
| Library | library-service | `appstore_user_*`, `appstore_download_grant` |
| Moderation | moderation-service | `appstore_moderation*` |
| Compliance | compliance-service | `appstore_compliance*` |
| Analytics | analytics-worker | metrics snapshots, charts, trending terms |
| Market | market-service | `appstore_market_*`; optional HTTP relay to Apple/Google via `APPSTORE_MARKET_*` |

## 4. Cross-Domain Boundaries

| Domain | Owner | App Store usage |
| --- | --- | --- |
| IAM | appbase | Dual-token auth; user/org context |
| App registry | platform | Listing create validates `app_id` |
| Media / artifacts | drive | Store `drive_node_id` references only |
| Reviews / threads | comments | `comments_thread_id` + `@sdkwork/comments-app-sdk` on PC/H5 listing detail |
| Payments / IAP | commerce (via cloudrouter domains) | `commerce_product_id` on listings; PC/H5 paid acquire via `@sdkwork/appstore-listing-acquire-core` + `@sdkwork/cloudrouter-app-sdk/domains` |
| Full-text search | search | In-process federation via `integrations::search_inprocess::InProcessSearchFederationAdapter` + SQL fallback; optional index projection (upsert on publish, remove on hide) |
| Push / inbox | cloudrouter notification API | `@sdkwork/cloudrouter-app-sdk` + `appstore-notification-core` on PC/H5 |

## 5. Client Applications

| App | Path | Surface |
| --- | --- | --- |
| sdkwork-appstore-pc | `apps/sdkwork-appstore-pc` | PC Web ≥1280px |
| sdkwork-appstore-h5 | `apps/sdkwork-appstore-h5` | H5 / mobile <768px |

Package layout:

- **PC:** `@sdkwork/appstore-pc-console-publisher` + shared `@sdkwork/appstore-publisher-console-core`
- **H5:** `@sdkwork/appstore-h5-console-publisher` + same core package
- All HTTP from clients via `@sdkwork/appstore-app-sdk` only (no raw transport imports)

## 6. Database & Deployment

| Item | Status |
| --- | --- |
| SQLite (local dev) | Default via `SDKWORK_DATABASE_SQLITE_URL=sqlite://...` |
| PostgreSQL (production) | `postgresql://` URL; dialect adaptation in `repository-sqlx` |
| Gateway bootstrap | `sdkwork-appstore-database-host` init + migrate on startup |
| Standalone gateway | Port `18090` (override with `PORT`) |

See [standalone-gateway README](../../crates/sdkwork-api-appstore-standalone-gateway/README.md) for env vars.

## 7. Implementation Status (2026-07-06)

| Area | Status | Notes |
| --- | --- | --- |
| Contracts (API / DB / SDK) | Complete | 95+ app-api operations; SdkWorkApiResponse envelope |
| Backend services | Complete | Gateway + SQLx repositories + analytics worker |
| PC / H5 storefront | Complete | zh-CN UI; IAM profile; paginated lists via SDK |
| Publisher console | Complete | Shared core; PC + H5 packages; Drive upload bootstrap |
| Pre-launch gaps | Tracked | External connectors, production perf validation |

Live tracker: [crates/IMPLEMENTATION_TODO.md](../../crates/IMPLEMENTATION_TODO.md).
