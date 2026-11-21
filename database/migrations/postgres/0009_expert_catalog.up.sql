-- sdkwork:migration
-- id: 0009_expert_catalog
-- engine: postgres
-- module: sdkwork-appstore
-- purpose: Phase 4 prerequisite of the application-factory restructure
--   (APPLICATION_FACTORY_READINESS_GAP_REPORT.md R4). The AI expert catalog was
--   stored inside appstore_app_template with template_type = 'EXPERT', which is
--   how a presentation catalog ended up owning the scaffold table. This table
--   gives the catalog its own store so the template family can be retired
--   without losing the experts page.
--
--   Additive only: the existing rows stay in the template table until the data
--   migration copies them, so no reader breaks in between.
-- reversible: true
-- rollback: down-migration (the table is additive; the paired down migration
--   drops it)
-- transactional: true
-- lock: lightweight (new table only)
-- lock_timeout: 2s
-- statement_timeout: 60s

BEGIN;

CREATE TABLE IF NOT EXISTS appstore_expert_catalog (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL DEFAULT '0',
  expert_code TEXT NOT NULL,
  expert_name TEXT NOT NULL,
  description TEXT,
  category_code TEXT,
  -- Presentation payload that the storefront renders: nickname, tags, prompts,
  -- avatar, popularity, rating, badge, and usage counters.
  profile_json TEXT NOT NULL DEFAULT '{}',
  expert_status TEXT NOT NULL DEFAULT 'draft',
  visibility INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_weight INTEGER NOT NULL DEFAULT 0,
  owner_user_id TEXT,
  version BIGINT NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_appstore_expert_catalog_status
    CHECK (expert_status IN ('draft', 'published', 'hidden', 'retired'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_appstore_expert_catalog_code
  ON appstore_expert_catalog (tenant_id, expert_code)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_appstore_expert_catalog_listing
  ON appstore_expert_catalog (tenant_id, category_code, sort_weight, id)
  WHERE deleted_at IS NULL;

COMMIT;
