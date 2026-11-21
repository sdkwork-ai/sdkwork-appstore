-- sdkwork:migration
-- id: 0004_appstore_app_sku_and_deployment_binding
-- engine: postgres
-- module: sdkwork-appstore
-- purpose: Add the application specification (SKU) layer and the deployment
--   binding layer.
--
--   Application specification layer. An appstore application is authored by
--   several people at once and ships as several independently describable,
--   independently deliverable variants. `appstore_app_sku` is that variant
--   entity, modelled as an SKU: `sku_code` is the stable identity of the
--   variant and the version number is one of its attributes
--   (`version_name` + `version_code`) rather than the identity itself.
--
--   `version` is NOT part of the table or entity name on purpose. Inside this
--   module the token already carries three distinct meanings --
--   `DATABASE_SPEC.md` section 6.6 optimistic locking (`version BIGINT`),
--   release version numbers (`appstore_release.version_name/_code`), and
--   platform release version numbers
--   (`appstore_platform_release.version_name/_code`). Naming the entity
--   `appstore_app_version` would collide with all three, which is the
--   second-order ambiguity `NAMING_SPEC.md` section 0.2 exists to prevent.
--
--   Specification to version cardinality is 1:N: one `version_code` may carry
--   several SKUs distinguished by `sku_code` (for example a standard and a
--   professional variant of 1.2.0), so `version_code` is indexed but not
--   unique. Uniqueness is anchored on `sku_code`.
--
--   Per-SKU development provenance. Each SKU records which coding agent
--   produced it (`development_tool`), which model implemented it
--   (`development_model` + `model_provider`), and who owns it
--   (`primary_owner_user_id`). A SKU may be implemented by more than one model,
--   so `appstore_app_sku_model` carries the model bindings with an
--   implementation role and weight, while `appstore_app_sku_attribute` carries
--   open-ended SKU attributes grouped by axis. Contributors are recorded in
--   `appstore_app_sku_contributor` so concurrent development is attributable.
--
--   Display default. `appstore_app_sku.is_default` marks the SKU a storefront
--   shows by default. "Default version" is a derived view of that flag (the
--   `version_code` of the default SKU), which keeps a single source of truth
--   rather than a second default column that can disagree with it. Both default
--   flags are enforced by partial unique indexes so a concurrent double-write
--   cannot produce two defaults.
--
--   Deployment binding layer. `appstore_app_deployment_binding` links an
--   appstore application, and optionally one of its SKUs, to the deployment
--   owned `deploy_app` / `deploy_deployment` rows. Deployment is a separate
--   module, so the binding stores the external snowflake ids plus display
--   snapshots and a configuration snapshot, and integrity is verified through
--   the deployments SDK rather than by a cross-module foreign key. Bindings
--   may be application level (`app_sku_id IS NULL`) or SKU level.
--
--   `appstore_app.default_sku_id` and `appstore_app.default_deployment_binding_id`
--   denormalize the two resolved defaults for list and detail reads; the partial
--   unique indexes above remain the authority. `appstore_release.app_sku_id` and
--   `appstore_platform_release.app_sku_id` attach published artifacts to the SKU
--   they ship, which the 1:N specification cardinality requires.
--
-- reversible: false
-- rollback: forward-fix (every statement is additive: new tables and nullable
--   columns only, no column is dropped, renamed or retyped, and no existing row
--   is rewritten. Reversal is achieved by not consuming the new tables and
--   columns; dropping them would discard specification and binding data and is
--   therefore not offered as a down migration)
-- transactional: true
-- lock: lightweight
-- lock_timeout: 2s
-- statement_timeout: 60s
-- contract_version: 1.1.0

BEGIN;

-- ---------------------------------------------------------------------------
-- Part 1 — Application specification (SKU) entity
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS appstore_app_sku (
  id BIGINT NOT NULL PRIMARY KEY,
  uuid VARCHAR(64) NOT NULL,
  tenant_id BIGINT NOT NULL,
  organization_id BIGINT NOT NULL DEFAULT 0,
  app_id TEXT NOT NULL,
  sku_code VARCHAR(64) NOT NULL,
  sku_kind VARCHAR(32) NOT NULL DEFAULT 'release',
  sku_status VARCHAR(24) NOT NULL DEFAULT 'draft',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  display_priority INTEGER NOT NULL DEFAULT 0,
  version_name VARCHAR(64) NOT NULL,
  version_code BIGINT NOT NULL,
  development_tool VARCHAR(64),
  development_model VARCHAR(128),
  model_provider VARCHAR(64),
  primary_owner_user_id BIGINT,
  git_ref VARCHAR(255),
  source_template_id BIGINT,
  source_template_version_id BIGINT,
  manifest_snapshot_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  attribute_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  data_scope INTEGER NOT NULL DEFAULT 0,
  status INTEGER NOT NULL DEFAULT 1,
  version BIGINT NOT NULL DEFAULT 0,
  activated_at TIMESTAMPTZ,
  defaulted_at TIMESTAMPTZ,
  deprecated_at TIMESTAMPTZ,
  retired_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_by BIGINT,
  updated_by BIGINT,
  deleted_by BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uk_appstore_app_sku_uuid UNIQUE (uuid),
  CONSTRAINT chk_appstore_app_sku_kind
    CHECK (sku_kind IN ('release', 'beta', 'canary', 'edition', 'custom')),
  CONSTRAINT chk_appstore_app_sku_status
    CHECK (
      sku_status IN (
        'draft',
        'pending_review',
        'approved',
        'published',
        'deprecated',
        'retired'
      )
    ),
  CONSTRAINT chk_appstore_app_sku_version_code CHECK (version_code >= 0),
  CONSTRAINT chk_appstore_app_sku_display_priority CHECK (display_priority >= 0)
);

-- `sku_code` is the stable identity of one specification. Uniqueness is scoped
-- to live rows so a retired SKU's code can be reused, per `DATABASE_SPEC.md`
-- section 6.6 which requires soft-delete tables to define how uniqueness
-- behaves for deleted rows.
CREATE UNIQUE INDEX IF NOT EXISTS uq_appstore_app_sku_code
  ON appstore_app_sku (tenant_id, app_id, sku_code)
  WHERE deleted_at IS NULL;

-- Single default specification per application. Partial unique indexes are the
-- authority for both default flags in this migration; application code must not
-- treat the denormalized `appstore_app.default_sku_id` as the guarantee.
CREATE UNIQUE INDEX IF NOT EXISTS uq_appstore_app_sku_default
  ON appstore_app_sku (tenant_id, app_id)
  WHERE is_default AND deleted_at IS NULL;

-- Storefront specification list: equality on tenant/app/status, ordered by
-- display priority then descending version, with `id` as the keyset tie-breaker
-- (`DATABASE_SPEC.md` section 10).
CREATE INDEX IF NOT EXISTS idx_appstore_app_sku_list
  ON appstore_app_sku (tenant_id, app_id, sku_status, display_priority, version_code DESC, id);

-- Specifications of one version, and 1:N version roll-ups.
CREATE INDEX IF NOT EXISTS idx_appstore_app_sku_version
  ON appstore_app_sku (tenant_id, app_id, version_code);

CREATE INDEX IF NOT EXISTS idx_appstore_app_sku_owner
  ON appstore_app_sku (tenant_id, primary_owner_user_id)
  WHERE primary_owner_user_id IS NOT NULL;

-- Development provenance lookup: which specifications were produced by a tool
-- or implemented by a model. Serves coverage reporting, not a hot read path.
CREATE INDEX IF NOT EXISTS idx_appstore_app_sku_provenance
  ON appstore_app_sku (tenant_id, development_tool, development_model)
  WHERE development_tool IS NOT NULL OR development_model IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Part 2 — Specification attributes (open-ended SKU attribute axis)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS appstore_app_sku_attribute (
  id BIGINT NOT NULL PRIMARY KEY,
  uuid VARCHAR(64) NOT NULL,
  tenant_id BIGINT NOT NULL,
  organization_id BIGINT NOT NULL DEFAULT 0,
  app_sku_id BIGINT NOT NULL,
  attribute_group VARCHAR(64) NOT NULL,
  attribute_key VARCHAR(128) NOT NULL,
  attribute_value TEXT,
  value_type VARCHAR(24) NOT NULL DEFAULT 'string',
  enum_code VARCHAR(128),
  unit VARCHAR(32),
  locale VARCHAR(16) NOT NULL DEFAULT '',
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  sort_weight INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  status INTEGER NOT NULL DEFAULT 1,
  version BIGINT NOT NULL DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  created_by BIGINT,
  updated_by BIGINT,
  deleted_by BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uk_appstore_app_sku_attribute_uuid UNIQUE (uuid),
  CONSTRAINT chk_appstore_app_sku_attribute_value_type
    CHECK (value_type IN ('string', 'int', 'decimal', 'bool', 'json', 'enum', 'ref')),
  CONSTRAINT chk_appstore_app_sku_attribute_sort_weight CHECK (sort_weight >= 0)
);

-- `locale` is NOT NULL with an empty-string sentinel rather than nullable: a
-- nullable column would not participate in the uniqueness boundary, because
-- PostgreSQL treats `NULL <> NULL`, and duplicate non-localized attributes
-- would become insertable.
CREATE UNIQUE INDEX IF NOT EXISTS uq_appstore_app_sku_attribute_key
  ON appstore_app_sku_attribute (tenant_id, app_sku_id, attribute_group, attribute_key, locale)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_appstore_app_sku_attribute_sku
  ON appstore_app_sku_attribute (tenant_id, app_sku_id, attribute_group, sort_weight, id);

-- ---------------------------------------------------------------------------
-- Part 3 — Specification model bindings (which models implement a SKU)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS appstore_app_sku_model (
  id BIGINT NOT NULL PRIMARY KEY,
  uuid VARCHAR(64) NOT NULL,
  tenant_id BIGINT NOT NULL,
  organization_id BIGINT NOT NULL DEFAULT 0,
  app_sku_id BIGINT NOT NULL,
  model_key VARCHAR(128) NOT NULL,
  model_provider VARCHAR(64),
  implementation_role VARCHAR(32) NOT NULL DEFAULT 'primary',
  implementation_scope VARCHAR(64),
  weight INTEGER NOT NULL DEFAULT 100,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  config_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  status INTEGER NOT NULL DEFAULT 1,
  version BIGINT NOT NULL DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  created_by BIGINT,
  updated_by BIGINT,
  deleted_by BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uk_appstore_app_sku_model_uuid UNIQUE (uuid),
  CONSTRAINT chk_appstore_app_sku_model_role
    CHECK (implementation_role IN ('primary', 'assistant', 'reviewer', 'fallback')),
  CONSTRAINT chk_appstore_app_sku_model_weight CHECK (weight >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_appstore_app_sku_model_binding
  ON appstore_app_sku_model (tenant_id, app_sku_id, model_key, implementation_role)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_appstore_app_sku_model_sku
  ON appstore_app_sku_model (tenant_id, app_sku_id, enabled, implementation_role, id);

-- Reverse lookup: which specifications a model implements. Feeds model coverage
-- and deprecation impact analysis.
CREATE INDEX IF NOT EXISTS idx_appstore_app_sku_model_model
  ON appstore_app_sku_model (tenant_id, model_provider, model_key);

-- ---------------------------------------------------------------------------
-- Part 4 — Specification contributors (concurrent authorship attribution)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS appstore_app_sku_contributor (
  id BIGINT NOT NULL PRIMARY KEY,
  uuid VARCHAR(64) NOT NULL,
  tenant_id BIGINT NOT NULL,
  organization_id BIGINT NOT NULL DEFAULT 0,
  app_sku_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  contributor_role VARCHAR(32) NOT NULL DEFAULT 'developer',
  contribution_share INTEGER,
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  status INTEGER NOT NULL DEFAULT 1,
  version BIGINT NOT NULL DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  created_by BIGINT,
  updated_by BIGINT,
  deleted_by BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uk_appstore_app_sku_contributor_uuid UNIQUE (uuid),
  CONSTRAINT chk_appstore_app_sku_contributor_role
    CHECK (contributor_role IN ('owner', 'developer', 'reviewer', 'publisher')),
  CONSTRAINT chk_appstore_app_sku_contributor_share
    CHECK (contribution_share IS NULL OR (contribution_share >= 0 AND contribution_share <= 100)),
  CONSTRAINT chk_appstore_app_sku_contributor_period
    CHECK (left_at IS NULL OR joined_at IS NULL OR left_at >= joined_at)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_appstore_app_sku_contributor_member
  ON appstore_app_sku_contributor (tenant_id, app_sku_id, user_id, contributor_role)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_appstore_app_sku_contributor_sku
  ON appstore_app_sku_contributor (tenant_id, app_sku_id, contributor_role, id);

-- Subject-scope index for "which specifications does this user contribute to".
CREATE INDEX IF NOT EXISTS idx_appstore_app_sku_contributor_user
  ON appstore_app_sku_contributor (tenant_id, user_id, contributor_role, app_sku_id);

-- ---------------------------------------------------------------------------
-- Part 5 — Deployment bindings (appstore app/SKU to owned deployments)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS appstore_app_deployment_binding (
  id BIGINT NOT NULL PRIMARY KEY,
  uuid VARCHAR(64) NOT NULL,
  tenant_id BIGINT NOT NULL,
  organization_id BIGINT NOT NULL DEFAULT 0,
  app_id TEXT NOT NULL,
  app_sku_id BIGINT,
  deploy_app_id BIGINT NOT NULL,
  deploy_app_uuid VARCHAR(36),
  deploy_deployment_id BIGINT,
  deploy_deployment_uuid VARCHAR(64),
  environment VARCHAR(16) NOT NULL DEFAULT 'production',
  platform_code VARCHAR(64) NOT NULL DEFAULT '',
  binding_role VARCHAR(24) NOT NULL DEFAULT 'primary',
  binding_status VARCHAR(24) NOT NULL DEFAULT 'pending',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  config_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  sync_status VARCHAR(24),
  last_synced_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  status INTEGER NOT NULL DEFAULT 1,
  version BIGINT NOT NULL DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  created_by BIGINT,
  updated_by BIGINT,
  deleted_by BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uk_appstore_app_deployment_binding_uuid UNIQUE (uuid),
  CONSTRAINT chk_appstore_app_deployment_binding_environment
    CHECK (environment IN ('development', 'test', 'staging', 'demo', 'production')),
  CONSTRAINT chk_appstore_app_deployment_binding_role
    CHECK (binding_role IN ('primary', 'canary', 'backup', 'shadow')),
  CONSTRAINT chk_appstore_app_deployment_binding_status
    CHECK (binding_status IN ('pending', 'active', 'degraded', 'invalid', 'revoked')),
  CONSTRAINT chk_appstore_app_deployment_binding_sync_status
    CHECK (sync_status IS NULL OR sync_status IN ('synced', 'stale', 'unknown', 'error'))
);

-- One binding per application, deployment target, environment and platform.
-- `platform_code` is NOT NULL with an empty-string sentinel for the same reason
-- as `locale` above.
CREATE UNIQUE INDEX IF NOT EXISTS uq_appstore_app_deployment_binding_target
  ON appstore_app_deployment_binding (tenant_id, app_id, deploy_app_id, environment, platform_code)
  WHERE deleted_at IS NULL;

-- One default deployment surface per application and environment, so each
-- lifecycle environment has its own resolvable default.
CREATE UNIQUE INDEX IF NOT EXISTS uq_appstore_app_deployment_binding_default
  ON appstore_app_deployment_binding (tenant_id, app_id, environment)
  WHERE is_default AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_appstore_app_deployment_binding_app
  ON appstore_app_deployment_binding (tenant_id, app_id, environment, binding_status, id);

-- Nullable column, so the SKU-level lookup index is partial.
CREATE INDEX IF NOT EXISTS idx_appstore_app_deployment_binding_sku
  ON appstore_app_deployment_binding (tenant_id, app_sku_id)
  WHERE app_sku_id IS NOT NULL;

-- Reverse lookup from the deployment side: which appstore applications bind a
-- given `deploy_app`. Cross-module integrity is verified through the
-- deployments SDK, so this index backs repair and reconciliation jobs.
CREATE INDEX IF NOT EXISTS idx_appstore_app_deployment_binding_deploy_app
  ON appstore_app_deployment_binding (tenant_id, deploy_app_id, environment);

CREATE INDEX IF NOT EXISTS idx_appstore_app_deployment_binding_deploy_deployment
  ON appstore_app_deployment_binding (tenant_id, deploy_deployment_id)
  WHERE deploy_deployment_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Part 6 — Attach the new layer to the existing application and release rows
-- ---------------------------------------------------------------------------

ALTER TABLE appstore_app
  ADD COLUMN IF NOT EXISTS default_sku_id BIGINT,
  ADD COLUMN IF NOT EXISTS default_deployment_binding_id BIGINT;

-- Published artifacts attach to the specification they ship. Nullable so the
-- existing rows stay valid while releases are migrated onto specifications.
ALTER TABLE appstore_release
  ADD COLUMN IF NOT EXISTS app_sku_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_appstore_release_app_sku
  ON appstore_release (tenant_id, app_sku_id)
  WHERE app_sku_id IS NOT NULL;

ALTER TABLE appstore_platform_release
  ADD COLUMN IF NOT EXISTS app_sku_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_appstore_platform_release_app_sku
  ON appstore_platform_release (tenant_id, app_sku_id)
  WHERE app_sku_id IS NOT NULL;

COMMIT;
