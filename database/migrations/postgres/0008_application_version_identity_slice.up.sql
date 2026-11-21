-- sdkwork:migration
-- id: 0008_application_version_identity_slice
-- engine: postgres
-- module: sdkwork-appstore
-- purpose: Phase 3 of the application-factory restructure
--   (APPLICATION_FACTORY_DB_RESTRUCTURE_PLAN.md). Introduce the product version
--   as the single owner of the identity slice that IAM's application template
--   used to hold (app key, package/bundle identity, app type, default access
--   permissions, runtime relying-party config, manifest hash).
--
--   The release rows stay listing-scoped; `appstore_application_release.version_id`
--   lets a release point at the product version it ships, so the identity slice
--   is authored once per product version instead of once per storefront listing.
--   Both statements are additive.
-- reversible: true
-- rollback: down-migration (the added column is nullable and the new table is
--   additive; the paired down migration drops them)
-- transactional: true
-- lock: lightweight (new table and nullable column only)
-- lock_timeout: 2s
-- statement_timeout: 60s

BEGIN;

CREATE TABLE IF NOT EXISTS appstore_application_version (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL DEFAULT '0',
  application_id TEXT NOT NULL,
  -- Identity slice formerly owned by the IAM application template.
  app_key TEXT NOT NULL,
  app_type TEXT NOT NULL,
  package_name TEXT,
  bundle_id TEXT,
  desktop_app_id TEXT,
  default_access_permissions_json TEXT NOT NULL DEFAULT '[]',
  runtime_config_json TEXT NOT NULL DEFAULT '{}',
  manifest_hash TEXT,
  -- Version attributes.
  version_name TEXT NOT NULL,
  version_code TEXT NOT NULL,
  channel_code TEXT NOT NULL DEFAULT 'stable',
  version_status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  retired_at TIMESTAMPTZ,
  version INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, application_id, version_code),
  CONSTRAINT chk_appstore_application_version_status
    CHECK (version_status IN ('draft', 'pending_review', 'approved', 'published', 'deprecated', 'retired'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_appstore_application_version_app_key
  ON appstore_application_version (tenant_id, app_key);

CREATE INDEX IF NOT EXISTS idx_appstore_application_version_list
  ON appstore_application_version (tenant_id, application_id, version_status, version_code DESC, id);

ALTER TABLE appstore_application_release
  ADD COLUMN IF NOT EXISTS version_id TEXT;

CREATE INDEX IF NOT EXISTS idx_appstore_application_release_version
  ON appstore_application_release (tenant_id, version_id);

COMMIT;
