-- sdkwork:migration
-- id: 0006_app_template_platform
-- engine: postgres
-- module: sdkwork-appstore
-- purpose: Give app templates a target-platform dimension (H5, PC, Flutter,
--   mini program, ...) so the storefront template library can filter and badge
--   scaffolds by the application form they produce. The column is nullable:
--   PLUGIN-type templates and pre-migration rows carry no platform and surface
--   only under the library's "all" filter.
-- reversible: false
-- rollback: forward-fix (additive nullable column; rollback by not consuming
--   template_platform, no data is dropped)
-- transactional: true
-- lock: lightweight
-- lock_timeout: 2s
-- statement_timeout: 60s

ALTER TABLE appstore_app_template
  ADD COLUMN IF NOT EXISTS template_platform VARCHAR(64);

CREATE INDEX IF NOT EXISTS idx_appstore_app_template_platform
  ON appstore_app_template (tenant_id, organization_id, template_platform, publish_status, id);
