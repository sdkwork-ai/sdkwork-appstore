-- sdkwork:migration
-- id: 0010_expert_catalog_backfill
-- engine: postgres
-- module: sdkwork-appstore
-- purpose: Phase R4 data step of the application-factory restructure. Copy the
--   expert catalog out of appstore_app_template (template_type = 'EXPERT') into
--   its own table so the template family can be retired without losing the
--   experts page.
--
--   Idempotent: rows already present are left untouched, so a replay or a
--   partially applied database converges. The paired seed writes the same rows
--   for a fresh install; this migration covers databases that were seeded
--   before the table existed.
-- reversible: false
-- rollback: forward-fix (a copy of presentation rows; replaying is a no-op)
-- transactional: true
-- lock: shared on appstore_app_template, row inserts on appstore_expert_catalog
-- lock_timeout: 2s
-- statement_timeout: 60s

BEGIN;

INSERT INTO appstore_expert_catalog (
    id, tenant_id, organization_id, expert_code, expert_name, description, category_code,
    profile_json, expert_status, visibility, featured, sort_weight, owner_user_id, version,
    published_at, created_at, updated_at
)
SELECT
    t.id::text,
    t.tenant_id::text,
    t.organization_id::text,
    t.template_code,
    COALESCE(t.template_name, t.template_code),
    t.description,
    t.category_code,
    COALESCE(t.metadata::text, '{}'),
    CASE WHEN t.publish_status = 1 THEN 'published' ELSE 'draft' END,
    COALESCE(t.visibility, 0),
    COALESCE(t.featured, FALSE),
    COALESCE(t.sort_weight, 0),
    CASE WHEN t.owner_user_id IS NULL THEN NULL ELSE t.owner_user_id::text END,
    COALESCE(t.version, 0),
    CASE WHEN t.publish_status = 1 THEN t.updated_at END,
    t.created_at,
    t.updated_at
FROM appstore_app_template t
WHERE t.template_type = 'EXPERT'
  AND t.template_code IS NOT NULL
  AND t.deleted_at IS NULL
ON CONFLICT DO NOTHING;

COMMIT;
