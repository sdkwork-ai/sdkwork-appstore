-- sdkwork:migration
-- id: 0003_user_store
-- engine: postgres
-- module: sdkwork-appstore
-- purpose: User-owned custom categories and shareable personal appstore
--   views (capability: userStore). Three new tables: appstore_user_category
--   (user-defined categories, isolated from platform catalog categories),
--   appstore_user_category_item (category-to-listing bindings, storing
--   listing_id references only; display cards resolve through the listing
--   domain via a port, never by cross-domain joins), and
--   appstore_user_store_share (immutable-token public share views scoped to
--   all or selected categories with visibility, expiry, and revoke state).
-- reversible: true
-- rollback: DROP TABLE IF EXISTS appstore_user_store_share;
--   DROP TABLE IF EXISTS appstore_user_category_item;
--   DROP TABLE IF EXISTS appstore_user_category;
-- transactional: true
-- lock: lightweight
-- lock_timeout: 2s
-- statement_timeout: 30s

BEGIN;

CREATE TABLE IF NOT EXISTS appstore_user_category (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL DEFAULT '0',
  owner_user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon_media_resource_id TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  category_status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  UNIQUE (tenant_id, owner_user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_appstore_user_category_owner
  ON appstore_user_category (tenant_id, owner_user_id, category_status, sort_order);

CREATE TABLE IF NOT EXISTS appstore_user_category_item (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL DEFAULT '0',
  user_category_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  note TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  UNIQUE (user_category_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_appstore_user_category_item_category
  ON appstore_user_category_item (tenant_id, user_category_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_appstore_user_category_item_listing
  ON appstore_user_category_item (tenant_id, listing_id);

CREATE TABLE IF NOT EXISTS appstore_user_store_share (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL DEFAULT '0',
  owner_user_id TEXT NOT NULL,
  share_token TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  share_scope TEXT NOT NULL,
  selected_category_ids_json TEXT NOT NULL DEFAULT '[]',
  share_visibility TEXT NOT NULL,
  share_status TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  view_count BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_appstore_user_store_share_token
  ON appstore_user_store_share (share_token);

CREATE INDEX IF NOT EXISTS idx_appstore_user_store_share_owner
  ON appstore_user_store_share (tenant_id, owner_user_id, share_status);

COMMIT;
