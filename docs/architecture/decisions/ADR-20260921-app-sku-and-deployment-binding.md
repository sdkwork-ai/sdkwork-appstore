# ADR-20260921-app-sku-and-deployment-binding

Status: accepted  
Requirement: REQ-2026-0001  
Owner: sdkwork-appstore  
Date: 2026-09-21  
Specs: ARCHITECTURE_DECISION_SPEC.md, NAMING_SPEC.md, DATABASE_SPEC.md, DATABASE_FRAMEWORK_SPEC.md, API_SPEC.md, APP_SDK_INTEGRATION_SPEC.md

## Context

One catalog app is developed by several people at the same time, and the same app ships
several coexisting variants (different development tools, different development models,
different runtime profiles). The storefront must show one of them by default, and each
variant may be deployed to more than one `sdkwork-deployments` application and
environment.

The baseline had no entity for that. `appstore_app.current_release_id` and
`appstore_release` model a **published artifact**, not an app variant: a release exists
only after a publish attempt, carries exactly one `version_code`, and cannot express
"same version, two profiles" or "who developed this, with which model". There was also
no default-selection guarantee and no link at all between `appstore_app` and the
`deploy_app` / `deploy_deployment` entities owned by `sdkwork-deployments`.

Two constraints shaped the modelling:

- `version` was already carrying three unrelated meanings inside this repository —
  the SDKWork optimistic-lock column (`version BIGINT`, present on every table), the
  business release version (`appstore_release.version_name` / `version_code`), and the
  per-platform release version (`appstore_platform_release.version_*`). 44 occurrences in
  the baseline alone.
- `spec` is fully occupied by the specification system itself (`specs/`, `*_SPEC.md`,
  `component.spec.json`, `topology.spec.json`), which `NAMING_SPEC.md` §0.2
  (Second-Order Ambiguity Registry) exists to prevent — the same registry that already
  bans `platform`, `profile`, and `runtime` as second-order overloads.

## Decision

### 1. The variant entity is named `sku`

`appstore_app_sku` is the smallest independently describable, deliverable, and deployable
unit of an app. The token appears nowhere in the baseline (`grep` over `database/` is
empty), so it introduces no second-order ambiguity, and it is the industry term the
requirement itself pointed at.

Rejected in favour of `sku`: `app_version` (re-introduces the `version` collision this ADR
exists to remove) and `app_spec` (collides with the specification system per
`NAMING_SPEC.md` §0.2).

### 2. `version` is demoted from identity to attribute

| Meaning | Carrier | Note |
| --- | --- | --- |
| Optimistic lock | `version BIGINT NOT NULL DEFAULT 0` | SDKWork reserved column; never a business version |
| Display version | `version_name VARCHAR(64)` | e.g. `1.2.0`; matches `appstore_platform_release.version_name` |
| Sortable version | `version_code BIGINT` | monotonic; matches `appstore_platform_release.version_code` |
| **Stable spec identity** | **`sku_code VARCHAR(64)`** | human-readable, referenceable, e.g. `std`, `1.2.0-pro` |

Table name, business version, and optimistic lock therefore never share a name, and the
two version columns reuse column names the repository already has rather than inventing
vocabulary.

### 3. Cardinality is 1:N — one version, several specs

`sku_code` is the only unique identity: `UNIQUE (tenant_id, app_id, sku_code) WHERE
deleted_at IS NULL`. `version_code` gets an index, **not** a unique constraint, so
`1.2.0/std` and `1.2.0/pro` coexist. `display_priority` orders specs inside one
`version_code`; versions are ordered by `version_code DESC`.

### 4. "Default version" is a derived concept, not a column

`is_default BOOLEAN NOT NULL DEFAULT FALSE` lives on `appstore_app_sku`, guarded by the
partial unique index `UNIQUE (tenant_id, app_id) WHERE is_default AND deleted_at IS NULL`
— a database-level guarantee that an app has at most one default spec. The default
**version** is the `version_code` of the default spec, so no `default_version_code`
column is introduced. `appstore_app.default_sku_id` denormalises the pointer for reads.

### 5. New tables use the platform `BIGINT` snowflake id

Per `DATABASE_SPEC.md` §6.1, new tables take `id BIGINT` snowflake primary keys allocated
through `sdkwork_database_id`, which required wiring `SnowflakeIdGenerator` /
`SnowflakeNodeAllocator` into `sdkwork-appstore-service-host`. `app_id` stays `TEXT` to
keep the join to `appstore_app.id` valid; the wire contract remains `int64: string`
(`API_SPEC.md` §13.6). Legacy `id TEXT` tables are L0 debt and converge later under
expand-and-contract.

### 6. Cross-domain deployment binding stores ids, never foreign keys

`appstore_app_deployment_binding` records `deploy_app_id` / `deploy_deployment_id` plus a
`config_snapshot` and `last_synced_at`. No foreign key is created: `deploy_app` and
`deploy_deployment` belong to `sdkwork-deployments`, a separate bounded context. Existence
and drift are validated at the API boundary through `@sdkwork/deployments-app-sdk`, and
the snapshot keeps the binding readable if the remote entity is renamed or retired.
`app_sku_id` is nullable, so a binding may be app-level or spec-level.

### 7. The publish artifact hangs off the spec

`appstore_release.app_sku_id` points at a spec, which is more precise than pointing at a
version under 1:N, and `appstore_platform_release.app_sku_id` is added so per-platform
publishing is expressible per spec instead of only per app-platform.

## Alternatives

| Option | Why rejected |
| --- | --- |
| `appstore_app_version` as the entity name | Collides with the optimistic-lock column and two existing version vocabularies; the exact ambiguity the requirement asked to remove |
| `appstore_app_spec` (literal reading of the requirement) | `spec` is the specification system's token; `NAMING_SPEC.md` §0.2 forbids the overload |
| `appstore_app_edition` | "Edition" conventionally means standard/pro tier, a different axis from version; semantically off |
| Extend `appstore_platform_release` with development attributes | Binds a variant to one platform; cannot express one variant shipped across platforms |
| Keep specs independent of releases and converge later | Two version semantics coexist indefinitely; guarantees a second migration and permanent ambiguity |
| Hard `FOREIGN KEY` to `deploy_app` | Crosses a bounded-context ownership line and couples migration order across repositories |
| Store `deploy_app_id` with no remote validation | Silent dangling references; a deleted deployment keeps looking live in the console |

## Consequences

**Benefits**

- An app expresses many coexisting specs, each with its own development tool, model,
  attributes, models, and contributors, with a database-enforced single default.
- `version` no longer means three things; no new vocabulary was invented for the two
  version columns.
- Spec-level publishing and spec-level deployment binding, both of which the flat
  release model could not represent.
- `sdkwork-appstore-service-host` now allocates real platform ids, removing the
  UUID-as-primary-key pattern that `DATABASE_SPEC.md` §6.1 deprecates.

**Costs**

- 5 new tables and 3 widened columns; `appstore_release` and
  `appstore_platform_release` gain a nullable `app_sku_id`, so existing rows have no spec
  until backfilled.
- A runtime dependency on a live `sdkwork-deployments` endpoint for binding validation;
  the snapshot is what keeps reads working when it is unavailable.
- The SQLite test fixture covers only the `0001` baseline and must gain the `0002` /
  `0003` / `0004` tables before repository tests can touch the new entities.

## Verification

- `pnpm db:validate` / `pnpm db:plan` — migration and contract agree.
- `node ../sdkwork-specs/tools/check-database-framework-standard.mjs --root .`
- `node ../sdkwork-specs/tools/verify-database-initialization-state.mjs --root .` — no module regression.
- `node tools/verify-appstore-design.mjs` — table, routing, and SDK manifest consistency.
- Counter-example: writing a second `is_default = true` spec for one app **must** be
  rejected by the partial unique index; after a soft delete the `sku_code` is reusable.
- Counter-example: a `deploy_app_id` that does not resolve through
  `@sdkwork/deployments-app-sdk` **must** be rejected at the API boundary.

## Supersedes / Superseded By

None.
