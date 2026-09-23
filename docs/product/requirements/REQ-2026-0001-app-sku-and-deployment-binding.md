# REQ-2026-0001 App SKU And Deployment Binding

Status: in-progress  
Owner: sdkwork-appstore  
Date: 2026-09-21  
Specs: REQUIREMENTS_SPEC.md, NAMING_SPEC.md, DATABASE_SPEC.md, DATABASE_FRAMEWORK_SPEC.md, API_SPEC.md, APP_SDK_INTEGRATION_SPEC.md, PAGINATION_SPEC.md, COMPONENT_SPEC.md

## Problem

One catalog app is built by several people at the same time, and the same app ships several
coexisting variants — different development tools, different development models, different
runtime profiles. The storefront must surface one variant by default, each variant may be
deployed to more than one `sdkwork-deployments` application and environment, and operators
must be able to see which model and tool produced a given variant.

The baseline could not express any of this. `appstore_release` models a **published
artifact**, not a variant: it only exists after a publish attempt, carries exactly one
`version_code`, cannot represent "same version, two profiles", and has no development
provenance. There was no default-selection guarantee, and `appstore_app` had no link to the
`deploy_app` / `deploy_deployment` entities owned by `sdkwork-deployments`.

Vocabulary also blocked a naive fix: `version` already meant three unrelated things in this
repository (the SDKWork optimistic-lock column, the business release version, and the
per-platform release version), and `spec` is the specification system's own token.
`NAMING_SPEC.md` §0.2 (Second-Order Ambiguity Registry) exists to prevent exactly that
overload.

## Goals

1. An app owns many specs; a spec is the smallest independently describable, deliverable,
   and deployable unit, and carries its own development tool, development model, and
   contributors.
2. Exactly one spec per app is the default, enforced by the database rather than by
   convention, and the default version is derived from it.
3. A spec binds to zero or more `deploy_app` / `deploy_deployment` targets, with the
   binding validated against `sdkwork-deployments` instead of trusted blindly.
4. Publishing (releases and per-platform releases) can be expressed per spec.
5. New tables follow `DATABASE_SPEC.md` §6.1 — platform `BIGINT` snowflake ids allocated
   through `sdkwork_database_id`, never a locally invented id scheme.

## Non-Goals

- Reconciling legacy `id TEXT` tables in the baseline. They converge later under
  expand-and-contract; this requirement only stops adding new ones.
- Replacing `appstore_release` or `appstore_platform_release`. They stay the publish
  artifacts and gain a nullable spec reference.
- Owning deployment semantics. Environments, deployment targets, and deployment status
  remain `sdkwork-deployments` property; appstore stores a reference plus a snapshot.
- Per-spec pricing, entitlement, or checkout behavior.
- Renaming `appstore_app.version`, the SDKWork optimistic-lock column.

## Personas

| Persona | Primary surface | Core jobs |
| --- | --- | --- |
| Publisher developer | app-api | Create and edit specs, set the default, declare tool and model, list contributors |
| Publisher operator | backend-api | Inspect every app's specs, override the default, audit provenance |
| Store user | open-api | See the default spec of an app in detail and update-check responses |
| Platform operator | deployment console | See which deployment an app or spec is bound to, and its sync state |

## Capability Requirements

### Spec lifecycle

- Create, list, read, update, and retire specs of an app, scoped to the owning publisher.
- `sku_code` is the stable identity inside an app; `version_name` and `version_code` are
  attributes, and several specs may share one `version_code`.
- Spec kind (`release` / `beta` / `canary` / `edition` / `custom`), status, and publish
  status are independently settable.
- Development provenance: development tool, development model, model provider, primary
  owner, and source template ancestry.

### Configurable attributes

- Arbitrary key/value attributes grouped by concern (`development`, `runtime`,
  `capability`, `pricing`, `distribution`, `custom`), each with a value type, locale,
  visibility, and sort weight, so new per-version properties do not need a migration.

### Model implementations

- A spec declares the models that implement it, each with a provider, an implementation
  role (`primary` / `assistant` / `reviewer` / `fallback`), a scope, and a weight, plus a
  configuration snapshot.

### Contributors

- A spec lists contributors with a role (`owner` / `developer` / `reviewer` / `publisher`)
  and an optional contribution share, so concurrent development is attributable.

### Default selection

- Setting a spec as default is a single operation; the previous default is cleared in the
  same transaction.
- The database rejects a second default spec for the same app, and rejects a default on a
  retired (soft-deleted) spec.
- Store and update-check responses expose the default spec; when no default is set the
  behavior is explicit and deterministic rather than incidental.

### Deployment binding

- Bind an app, or a specific spec, to a `deploy_app` or `deploy_deployment` target with an
  environment, platform, role, and default flag.
- Candidate targets are listed from `sdkwork-deployments` through its SDK so operators pick
  from real entities.
- A binding whose remote target does not resolve is rejected at the API boundary; a stored
  binding keeps a configuration snapshot and a last-synced timestamp so reads survive a
  temporarily unavailable dependency.

## Non-Functional Requirements

| NFR | Target |
| --- | --- |
| Security | Publisher-scoped authorization on every spec and binding write; no new bypass of appbase IAM. `none beyond root standards` for the loopback surface |
| Privacy | Development provenance names people; contributor and owner fields are subject to the same tenant/org scoping as the app, and `is_public` gates what leaves the publisher surface |
| Performance | Default-spec resolution is a single indexed lookup; spec lists are cursor-paginated per `PAGINATION_SPEC.md` |
| Reliability | Default uniqueness and soft-delete-uniqueness are database constraints, not application checks; deployment binding validation degrades to snapshot reads when `sdkwork-deployments` is unavailable |
| Idempotency | Spec creation and default switching are idempotent per `API_SPEC.md` |
| Contract level | API L2 minimum; Int64 wire fields follow `API_SPEC.md` §13.6 |
| Pagination | Cursor-based for every new list endpoint |

## Acceptance Criteria

- [x] `0004` migration creates the five new tables and widens the three columns, and
      `database/contract/schema.yaml`, `database/contract/table-registry.json`, and
      `specs/database/schema-registry.yaml` agree with it (`pnpm db:validate`).
- [x] `sdkwork-appstore-service-host` allocates ids through `sdkwork_database_id`; no new
      UUID-as-primary-key path exists.
- [x] A second `is_default = true` spec for one app is rejected by the partial unique index.
- [x] After a soft delete, the same `sku_code` can be reused.
- [ ] Spec, attribute, model, contributor, and default operations exist on app-api with
      generated SDK bindings.
- [ ] Deployment binding operations exist, and candidate listing resolves real
      `sdkwork-deployments` entities through its SDK.
- [ ] A binding referencing a nonexistent `deploy_app_id` is rejected at the API boundary.
- [ ] Open API app detail and update-check responses expose the default spec.
- [ ] Operator surfaces can list and override the default spec.
- [ ] PC publisher console and H5 detail views show the default spec.

## Traceability

| Requirement | Database | API tag | Surface | Status |
| --- | --- | --- | --- | --- |
| Spec lifecycle | `appstore_app_sku` | `apps.versions.*` | app-api, backend-api | Pending |
| Attributes | `appstore_app_sku_attribute` | `apps.versions.attributes.*` | app-api | Pending |
| Models | `appstore_app_sku_model` | `apps.versions.models.*` | app-api | Pending |
| Contributors | `appstore_app_sku_contributor` | `apps.versions.contributors.*` | app-api | Pending |
| Default selection | `appstore_app.default_sku_id`, partial unique index | `apps.versions.default.*` | app-api, backend-api | Pending |
| Publish per spec | `appstore_release.app_sku_id`, `appstore_platform_release.app_sku_id` | `releases.*` | app-api, open-api | Partial |
| Deployment binding | `appstore_app_deployment_binding` | `apps.deployments.*` | app-api | Pending |

Related decisions: [ADR-20260921-app-sku-and-deployment-binding.md](../../architecture/decisions/ADR-20260921-app-sku-and-deployment-binding.md).

> `REQ-2026-appstore-foundation.md` and `REQ-2026-user-custom-store.md` in this directory
> predate the numeric `REQ-YYYY-NNNN` id form used by the rest of the workspace. Their ids
> are referenced by an accepted ADR and a technical design record, so they are left stable
> per `REQUIREMENTS_SPEC.md` §75.
