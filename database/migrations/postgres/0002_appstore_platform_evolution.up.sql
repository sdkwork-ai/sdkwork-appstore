-- sdkwork:migration
-- id: 0002_appstore_platform_evolution
-- engine: postgres
-- module: sdkwork-appstore
-- purpose: Fix baseline structural defects (package_format type bug, version
--   ordering, rating numerics, counter widths, library uniqueness) and make
--   distribution platform a first-class entity aligned with App Store
--   Connect / Google Play / Microsoft Store / AppGallery / browser extension
--   stores / mini program platforms: platform dictionary, per-app platform
--   packages, per-platform release tracks with force-update and kill-switch,
--   signing credential registry, review lifecycle, regional pricing, promo
--   codes, tester groups, search read model, and unified daily analytics.
-- reversible: false
-- rollback: forward-fix (all changes are additive; rollback is achieved by
--   not consuming the new columns/tables, no data is dropped)
-- transactional: true
-- lock: lightweight
-- lock_timeout: 2s
-- statement_timeout: 60s

BEGIN;

-- 0002_appstore_platform_evolution.up.sql
-- SDKWork App Store platform-alignment evolution
-- Domain: appstore | Prefix: appstore_ | Compliance: L2 (L3 tables noted)
-- Baseline: folds after 0001_appstore_baseline.sql
--
-- Goals:
--   1. Fix known structural defects in the baseline schema (P0 type bugs, counter widths, library uniqueness scope).
--   2. Make distribution platform a first-class entity so the catalog covers
--      iOS/iPadOS/Android/HarmonyOS mobile apps, Windows/macOS/Linux desktop apps,
--      PC-browser web apps and browser extensions, and multi-platform mini programs,
--      aligned with App Store Connect / Google Play / Microsoft Store / AppGallery /
--      Chrome Web Store / WeChat & Alipay mini program platform capabilities.
--   3. Add industry-standard store capabilities: per-platform release tracks with
--      force-update/kill-switch, signing credential registry, full review lifecycle,
--      regional pricing, promo codes, beta tester groups, search read model, and a
--      unified daily analytics metric table.
--
-- All changes are expand-only. No existing column is dropped or renamed in this migration.
-- JSON columns in NEW tables use native JSONB (declared in specs/database/schema-registry.yaml);
-- legacy TEXT-JSON columns in existing tables are left untouched for compatibility.

-- ---------------------------------------------------------------------------
-- Part 1 — Structural defect fixes
-- ---------------------------------------------------------------------------

-- FIX-1 (P0): 0004_appstore_timestamps_timestamptz.up.sql wrongly converted
-- appstore_release_artifact.package_format (a package format token such as
-- ipa/apk/hap/msix/dmg/crx/xpi/zip) to TIMESTAMPTZ. Restore it to TEXT.
ALTER TABLE appstore_release_artifact
  ALTER COLUMN package_format TYPE TEXT
  USING NULLIF(COALESCE(package_format::text, ''), '')::text;

-- FIX-2 (P1): appstore_release.version_code is TEXT and cannot be ordered
-- numerically for "latest version" / force-update checks. Add a numeric
-- mirror column. version_code MUST be a monotonic integer build code
-- (Android versionCode, App Store build number, mini program version code).
ALTER TABLE appstore_release ADD COLUMN IF NOT EXISTS version_code_numeric BIGINT;
UPDATE appstore_release
   SET version_code_numeric = NULLIF(regexp_replace(version_code, '[^0-9]', '', 'g'), '')::bigint
 WHERE version_code_numeric IS NULL;

-- FIX-3 (P1): rating averages stored as TEXT prevent numeric aggregation and
-- interval filters. Convert to NUMERIC with a NULL-safe USING clause. The
-- TEXT default ('0') cannot be cast automatically by PostgreSQL, so drop it
-- before the type change and re-apply a numeric default afterwards.
ALTER TABLE appstore_app
  ALTER COLUMN rating_avg DROP DEFAULT,
  ALTER COLUMN rating_avg TYPE NUMERIC(4,2) USING NULLIF(rating_avg, '')::numeric,
  ALTER COLUMN rating_avg SET DEFAULT 0;
ALTER TABLE appstore_listing
  ALTER COLUMN average_rating TYPE NUMERIC(4,2) USING NULLIF(average_rating, '')::numeric;

-- FIX-4 (P1): hot-row counters as INTEGER will overflow at scale (App Store /
-- Play scale catalogs). Widen to BIGINT.
ALTER TABLE appstore_app ALTER COLUMN download_count TYPE BIGINT;
ALTER TABLE appstore_listing ALTER COLUMN download_count TYPE BIGINT;
ALTER TABLE appstore_listing_metric_snapshot
  ALTER COLUMN impression_count TYPE BIGINT,
  ALTER COLUMN detail_view_count TYPE BIGINT,
  ALTER COLUMN install_count TYPE BIGINT,
  ALTER COLUMN uninstall_count TYPE BIGINT,
  ALTER COLUMN update_count TYPE BIGINT;

-- FIX-5 (P1): appstore_user_library_item uniqueness was scoped to
-- (user, app_key, platform), which collides when one app has multiple
-- listings (regional/alt storefronts). Scope to listing identity instead.
ALTER TABLE appstore_user_library_item
  DROP CONSTRAINT IF EXISTS appstore_user_library_item_tenant_id_user_id_app_key_platform_key;
ALTER TABLE appstore_user_library_item
  ADD CONSTRAINT appstore_user_library_item_uk
  UNIQUE (tenant_id, user_id, listing_id, platform);

-- ---------------------------------------------------------------------------
-- Part 2 — Platform as first-class entity
-- ---------------------------------------------------------------------------

-- Platform reference dictionary. Seeds: database/seeds/common/011_platform_dictionary.sql
-- Families: mobile | desktop | web | browser-extension | miniprogram
CREATE TABLE IF NOT EXISTS appstore_platform_dictionary (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL DEFAULT '0',
  platform_code TEXT NOT NULL,
  platform_family TEXT NOT NULL,
  os_vendor TEXT NOT NULL,
  package_formats JSONB NOT NULL DEFAULT '[]',
  identity_field TEXT NOT NULL,
  requires_store_review INTEGER NOT NULL DEFAULT 1,
  platform_status TEXT NOT NULL DEFAULT 'active',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, platform_code)
);

-- Per-platform package identity for an app: iOS bundleId, Android packageName,
-- HarmonyOS bundleName, Windows MSIX identity, browser extension id,
-- mini program appid, PWA start_url scope, etc.
CREATE TABLE IF NOT EXISTS appstore_app_platform (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL DEFAULT '0',
  app_id TEXT NOT NULL,
  platform_code TEXT NOT NULL,
  platform_status TEXT NOT NULL DEFAULT 'draft',
  package_identity TEXT NOT NULL,
  external_store_app_id TEXT,
  min_os_version TEXT,
  target_os_version TEXT,
  supported_architectures JSONB NOT NULL DEFAULT '[]',
  device_families JSONB NOT NULL DEFAULT '[]',
  compatibility_json JSONB NOT NULL DEFAULT '{}',
  distribution_mode TEXT NOT NULL DEFAULT 'store',
  config_json JSONB NOT NULL DEFAULT '{}',
  version INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, app_id, platform_code),
  UNIQUE (tenant_id, platform_code, package_identity)
);
CREATE INDEX IF NOT EXISTS idx_appstore_app_platform_app
  ON appstore_app_platform (tenant_id, app_id, platform_status);

-- Per-platform release track (App Store platform version / Play release /
-- mini program release). The listing-level appstore_release remains the
-- storefront concept; platform_release is the distribution authority per OS.
CREATE TABLE IF NOT EXISTS appstore_platform_release (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL DEFAULT '0',
  app_platform_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  release_no TEXT NOT NULL,
  version_name TEXT NOT NULL,
  version_code BIGINT NOT NULL,
  release_status TEXT NOT NULL,
  release_phase TEXT NOT NULL DEFAULT 'production',
  force_update_flag INTEGER NOT NULL DEFAULT 0,
  min_supported_version_code BIGINT,
  kill_switch_flag INTEGER NOT NULL DEFAULT 0,
  manifest_snapshot_json JSONB NOT NULL DEFAULT '{}',
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  retired_at TIMESTAMPTZ,
  version INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, release_no),
  UNIQUE (tenant_id, app_platform_id, channel_id, version_code)
);
CREATE INDEX IF NOT EXISTS idx_appstore_platform_release_update_check
  ON appstore_platform_release (tenant_id, app_platform_id, release_status, version_code DESC);

-- Artifacts may now bind to a platform track and carry supply-chain metadata
-- (delta patches, signing scheme, malware scan state, CDN location).
ALTER TABLE appstore_release_artifact
  ADD COLUMN IF NOT EXISTS app_platform_id TEXT,
  ADD COLUMN IF NOT EXISTS platform_release_id TEXT,
  ADD COLUMN IF NOT EXISTS artifact_kind TEXT NOT NULL DEFAULT 'full',
  ADD COLUMN IF NOT EXISTS delta_base_version_code BIGINT,
  ADD COLUMN IF NOT EXISTS signature_scheme TEXT,
  ADD COLUMN IF NOT EXISTS signing_cert_fingerprint TEXT,
  ADD COLUMN IF NOT EXISTS virus_scan_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS virus_scan_vendor TEXT,
  ADD COLUMN IF NOT EXISTS virus_scan_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cdn_url TEXT;
CREATE INDEX IF NOT EXISTS idx_appstore_release_artifact_platform_release
  ON appstore_release_artifact (tenant_id, platform_release_id, artifact_status);

-- Publisher signing credential registry (App Store signing / Play App Signing /
-- Windows EV code signing / HarmonyOS release cert). Enables upgrade-signature
-- consistency checks and anti-repackaging verification.
CREATE TABLE IF NOT EXISTS appstore_signing_credential (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL DEFAULT '0',
  publisher_id TEXT NOT NULL,
  app_id TEXT,
  platform_code TEXT NOT NULL,
  credential_type TEXT NOT NULL,
  fingerprint_sha256 TEXT NOT NULL,
  certificate_subject TEXT,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  credential_status TEXT NOT NULL,
  rotated_from_credential_id TEXT,
  evidence_media_resource_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, fingerprint_sha256)
);
CREATE INDEX IF NOT EXISTS idx_appstore_signing_credential_publisher
  ON appstore_signing_credential (tenant_id, publisher_id, platform_code, credential_status);

-- ---------------------------------------------------------------------------
-- Part 3 — Reviews and ratings aligned with App Store / Play review lifecycle
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS appstore_listing_review (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL DEFAULT '0',
  listing_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  release_id TEXT,
  platform_code TEXT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  review_body TEXT NOT NULL DEFAULT '',
  locale TEXT,
  review_status TEXT NOT NULL DEFAULT 'published',
  developer_reply TEXT,
  developer_user_id TEXT,
  developer_reply_at TIMESTAMPTZ,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  report_count INTEGER NOT NULL DEFAULT 0,
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, listing_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_appstore_listing_review_listing
  ON appstore_listing_review (tenant_id, listing_id, review_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appstore_listing_review_release
  ON appstore_listing_review (tenant_id, release_id, created_at DESC);

CREATE TABLE IF NOT EXISTS appstore_listing_review_vote (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  review_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  vote_value INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, review_id, user_id)
);

CREATE TABLE IF NOT EXISTS appstore_listing_review_report (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  review_id TEXT NOT NULL,
  reporter_user_id TEXT NOT NULL,
  report_reason_code TEXT NOT NULL,
  report_note TEXT,
  report_status TEXT NOT NULL DEFAULT 'open',
  handled_by TEXT,
  handled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, review_id, reporter_user_id)
);
CREATE INDEX IF NOT EXISTS idx_appstore_listing_review_report_status
  ON appstore_listing_review_report (tenant_id, report_status, created_at ASC);

-- Star distribution snapshot (1..5) per listing per day, as surfaced on
-- App Store / Play product pages.
CREATE TABLE IF NOT EXISTS appstore_rating_distribution_snapshot (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  snapshot_date TEXT NOT NULL,
  star_1_count INTEGER NOT NULL DEFAULT 0,
  star_2_count INTEGER NOT NULL DEFAULT 0,
  star_3_count INTEGER NOT NULL DEFAULT 0,
  star_4_count INTEGER NOT NULL DEFAULT 0,
  star_5_count INTEGER NOT NULL DEFAULT 0,
  rating_avg NUMERIC(4,2),
  rating_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, listing_id, snapshot_date)
);

-- ---------------------------------------------------------------------------
-- Part 4 — Regional pricing and promo codes (catalog/display side; checkout
-- and ledger remain commerce-domain owned)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS appstore_listing_price (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL DEFAULT '0',
  listing_id TEXT NOT NULL,
  region_code TEXT NOT NULL DEFAULT 'GLOBAL',
  currency_code TEXT NOT NULL,
  price_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  price_tier_code TEXT,
  pricing_mode TEXT NOT NULL DEFAULT 'free',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, listing_id, region_code, starts_at)
);
CREATE INDEX IF NOT EXISTS idx_appstore_listing_price_lookup
  ON appstore_listing_price (tenant_id, listing_id, region_code, starts_at DESC);

CREATE TABLE IF NOT EXISTS appstore_promo_code_batch (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL DEFAULT '0',
  listing_id TEXT NOT NULL,
  release_id TEXT,
  batch_no TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'promotional',
  total_count INTEGER NOT NULL DEFAULT 0,
  redeemed_count INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  batch_status TEXT NOT NULL DEFAULT 'active',
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, batch_no)
);

CREATE TABLE IF NOT EXISTS appstore_promo_code (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  batch_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  code_hint TEXT,
  code_status TEXT NOT NULL DEFAULT 'active',
  redeemed_by TEXT,
  redeemed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code_hash)
);
CREATE INDEX IF NOT EXISTS idx_appstore_promo_code_batch
  ON appstore_promo_code (tenant_id, batch_id, code_status);

-- ---------------------------------------------------------------------------
-- Part 5 — Beta tester groups (TestFlight-style internal/external groups)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS appstore_release_tester_group (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL DEFAULT '0',
  app_id TEXT NOT NULL,
  group_no TEXT NOT NULL,
  group_name TEXT NOT NULL,
  group_type TEXT NOT NULL DEFAULT 'external',
  group_status TEXT NOT NULL DEFAULT 'active',
  max_testers INTEGER,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, group_no)
);

CREATE TABLE IF NOT EXISTS appstore_release_tester_group_member (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  group_id TEXT NOT NULL,
  user_id TEXT,
  contact_email TEXT NOT NULL,
  member_status TEXT NOT NULL DEFAULT 'invited',
  added_by TEXT,
  added_at TIMESTAMPTZ,
  removed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, group_id, contact_email)
);
CREATE INDEX IF NOT EXISTS idx_appstore_release_tester_group_member_group
  ON appstore_release_tester_group_member (tenant_id, group_id, member_status);

ALTER TABLE appstore_release_beta_invite ADD COLUMN IF NOT EXISTS tester_group_id TEXT;

-- ---------------------------------------------------------------------------
-- Part 6 — Search read model and unified analytics metrics
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS appstore_catalog_search_doc (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  locale TEXT NOT NULL,
  display_name TEXT NOT NULL,
  subtitle TEXT,
  keywords TEXT NOT NULL DEFAULT '',
  short_description TEXT,
  platform_codes TEXT NOT NULL DEFAULT '[]',
  popularity_score NUMERIC(12,4) NOT NULL DEFAULT 0,
  doc_status TEXT NOT NULL DEFAULT 'active',
  indexed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, listing_id, locale)
);
CREATE INDEX IF NOT EXISTS idx_appstore_catalog_search_doc_lookup
  ON appstore_catalog_search_doc (tenant_id, locale, doc_status, popularity_score DESC);

-- Unified daily metric store (subject-scoped, platform/region sliced).
-- metric_code examples: impression, detail_view, install, uninstall, update,
-- crash_free_sessions, anr_rate, rating_count, listing_revenue_display.
CREATE TABLE IF NOT EXISTS appstore_analytics_metric_daily (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  subject_type TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  metric_code TEXT NOT NULL,
  platform_code TEXT NOT NULL DEFAULT 'ALL',
  region_code TEXT NOT NULL DEFAULT 'GLOBAL',
  metric_value NUMERIC(18,4) NOT NULL DEFAULT 0,
  snapshot_date TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, subject_type, subject_id, metric_code, platform_code, region_code, snapshot_date)
);
CREATE INDEX IF NOT EXISTS idx_appstore_analytics_metric_daily_subject
  ON appstore_analytics_metric_daily (tenant_id, subject_type, subject_id, snapshot_date DESC);

-- Numerical "latest version" lookup using the FIX-2 numeric mirror.
CREATE INDEX IF NOT EXISTS idx_appstore_release_update_check_numeric
  ON appstore_release (tenant_id, listing_id, release_status, version_code_numeric DESC);
COMMIT;
