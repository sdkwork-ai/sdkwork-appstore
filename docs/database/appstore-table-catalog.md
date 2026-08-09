# App Store Table Catalog

This document mirrors the schema registry and migration DDL so later agents can
see every table structure without opening the raw SQL first.

## appstore_idempotency_key

- profile: control
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_idempotency_key (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL DEFAULT '0',
  scope TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  response_json TEXT,
  status TEXT NOT NULL,
  locked_until TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, scope, idempotency_key)
);
```

### Indexes

No additional indexes defined in migration.

## appstore_publisher

- profile: master
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_publisher (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  publisher_no TEXT NOT NULL,
  publisher_type TEXT NOT NULL,
  display_name TEXT NOT NULL,
  legal_name TEXT,
  publisher_status TEXT NOT NULL,
  verification_status TEXT NOT NULL,
  contact_snapshot_json TEXT NOT NULL DEFAULT '{}',
  profile_snapshot_json TEXT NOT NULL DEFAULT '{}',
  website_url TEXT,
  support_email TEXT,
  logo_media_resource_id TEXT,
  owner_user_id TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 0,
  verified_at TEXT,
  suspended_at TEXT,
  deleted_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, publisher_no),
  UNIQUE (tenant_id, organization_id, owner_user_id)
);
```

### Indexes

No additional indexes defined in migration.

## appstore_publisher_member

- profile: master
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_publisher_member (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  publisher_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  member_role TEXT NOT NULL,
  member_status TEXT NOT NULL,
  invited_by TEXT,
  joined_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, publisher_id, user_id)
);
```

### Indexes

No additional indexes defined in migration.

## appstore_publisher_verification

- profile: master
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_publisher_verification (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  publisher_id TEXT NOT NULL,
  verification_type TEXT NOT NULL,
  verification_status TEXT NOT NULL,
  credential_snapshot_json TEXT NOT NULL DEFAULT '{}',
  evidence_media_resource_id TEXT,
  reviewed_by TEXT,
  reviewed_at TEXT,
  expires_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, publisher_id, verification_type)
);
```

### Indexes

No additional indexes defined in migration.

## appstore_app

- profile: master
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_app (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  publisher_id TEXT NOT NULL,
  app_no TEXT NOT NULL,
  app_key TEXT NOT NULL,
  app_slug TEXT NOT NULL,
  display_name TEXT NOT NULL,
  default_locale TEXT NOT NULL,
  app_type TEXT NOT NULL,
  runtime_family TEXT NOT NULL,
  runtime_framework TEXT NOT NULL,
  app_status TEXT NOT NULL,
  distribution_status TEXT NOT NULL,
  review_status TEXT NOT NULL,
  monetization_mode TEXT NOT NULL,
  primary_category_id TEXT,
  secondary_category_id TEXT,
  age_rating_code TEXT,
  content_rating_json TEXT NOT NULL DEFAULT '{}',
  official_website_url TEXT,
  support_url TEXT,
  privacy_policy_url TEXT,
  terms_url TEXT,
  icon_media_id TEXT,
  current_listing_id TEXT,
  current_release_id TEXT,
  latest_released_version TEXT,
  manifest_snapshot_json TEXT NOT NULL DEFAULT '{}',
  version INTEGER NOT NULL DEFAULT 0,
  submitted_at TEXT,
  approved_at TEXT,
  released_at TEXT,
  suspended_at TEXT,
  retired_at TEXT,
  deleted_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, app_no),
  UNIQUE (tenant_id, app_key),
  UNIQUE (tenant_id, app_slug)
);
```

### Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_appstore_app_status
  ON appstore_app (tenant_id, organization_id, distribution_status, review_status, updated_at DESC);
```

## appstore_app_dependency

- profile: relation
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_app_dependency (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  app_id TEXT NOT NULL,
  dependency_app_id TEXT,
  dependency_key TEXT NOT NULL,
  dependency_kind TEXT NOT NULL,
  version_requirement TEXT,
  dependency_status TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, app_id, dependency_key, dependency_kind)
);
```

### Indexes

No additional indexes defined in migration.

## appstore_category

- profile: master
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_category (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  category_code TEXT NOT NULL,
  parent_category_id TEXT,
  category_level INTEGER NOT NULL DEFAULT 1,
  category_status TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  icon_media_resource_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, category_code)
);
```

### Indexes

No additional indexes defined in migration.

## appstore_category_localization

- profile: master
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_category_localization (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  locale TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, category_id, locale)
);
```

### Indexes

No additional indexes defined in migration.

## appstore_tag

- profile: master
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_tag (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  tag_code TEXT NOT NULL,
  tag_type TEXT NOT NULL,
  tag_status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, tag_code)
);
```

### Indexes

No additional indexes defined in migration.

## appstore_tag_localization

- profile: master
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_tag_localization (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  locale TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, tag_id, locale)
);
```

### Indexes

No additional indexes defined in migration.

## appstore_listing

- profile: master
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_listing (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  publisher_id TEXT NOT NULL,
  listing_no TEXT NOT NULL,
  app_id TEXT NOT NULL,
  app_key TEXT NOT NULL,
  listing_slug TEXT NOT NULL,
  listing_type TEXT NOT NULL,
  pricing_model TEXT NOT NULL,
  listing_status TEXT NOT NULL,
  storefront_visibility TEXT NOT NULL,
  review_status TEXT NOT NULL,
  primary_category_id TEXT,
  default_locale TEXT NOT NULL,
  age_rating_code TEXT,
  content_rating_json TEXT NOT NULL DEFAULT '{}',
  official_website_url TEXT,
  support_url TEXT,
  privacy_policy_url TEXT,
  comments_thread_id TEXT,
  commerce_product_id TEXT,
  current_release_id TEXT,
  featured_score INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  average_rating TEXT,
  rating_count INTEGER NOT NULL DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 0,
  submitted_at TEXT,
  published_at TEXT,
  delisted_at TEXT,
  deleted_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, listing_no),
  UNIQUE (tenant_id, app_id),
  UNIQUE (tenant_id, listing_slug)
);
```

### Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_appstore_listing_catalog
  ON appstore_listing (tenant_id, listing_status, storefront_visibility, published_at DESC);
```

```sql
CREATE INDEX IF NOT EXISTS idx_appstore_listing_publisher
  ON appstore_listing (tenant_id, publisher_id, listing_status, updated_at DESC);
```

## appstore_listing_localization

- profile: master
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_listing_localization (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  locale TEXT NOT NULL,
  display_name TEXT NOT NULL,
  subtitle TEXT,
  short_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  whats_new_summary TEXT,
  keywords_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, listing_id, locale)
);
```

### Indexes

No additional indexes defined in migration.

## appstore_listing_media

- profile: master
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_listing_media (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  media_role TEXT NOT NULL,
  media_resource_id TEXT NOT NULL,
  drive_node_id TEXT,
  platform_scope TEXT NOT NULL DEFAULT 'ALL',
  sort_order INTEGER NOT NULL DEFAULT 0,
  locale TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, listing_id, media_role, sort_order, locale)
);
```

### Indexes

No additional indexes defined in migration.

## appstore_listing_category_binding

- profile: relation
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_listing_category_binding (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  UNIQUE (tenant_id, listing_id, category_id)
);
```

### Indexes

No additional indexes defined in migration.

## appstore_listing_tag_binding

- profile: relation
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_listing_tag_binding (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (tenant_id, listing_id, tag_id)
);
```

### Indexes

No additional indexes defined in migration.

## appstore_regional_availability

- profile: master
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_regional_availability (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  region_code TEXT NOT NULL,
  availability_status TEXT NOT NULL,
  effective_at TEXT NOT NULL,
  expires_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, listing_id, region_code)
);
```

### Indexes

No additional indexes defined in migration.

## appstore_compliance_profile

- profile: master
- complianceLevel: L3

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_compliance_profile (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  compliance_version INTEGER NOT NULL DEFAULT 1,
  privacy_nutrition_json TEXT NOT NULL DEFAULT '{}',
  content_rating_questionnaire_json TEXT NOT NULL DEFAULT '{}',
  data_safety_json TEXT NOT NULL DEFAULT '{}',
  target_audience_json TEXT NOT NULL DEFAULT '{}',
  compliance_status TEXT NOT NULL,
  reviewed_by TEXT,
  reviewed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, listing_id, compliance_version)
);
```

### Indexes

No additional indexes defined in migration.

## appstore_compliance_permission_disclosure

- profile: master
- complianceLevel: L3

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_compliance_permission_disclosure (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  permission_code TEXT NOT NULL,
  usage_purpose TEXT NOT NULL,
  is_required INTEGER NOT NULL DEFAULT 1,
  disclosure_status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, listing_id, permission_code)
);
```

### Indexes

No additional indexes defined in migration.

## appstore_release_channel

- profile: master
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_release_channel (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  channel_code TEXT NOT NULL,
  channel_type TEXT NOT NULL,
  channel_status TEXT NOT NULL,
  audience_scope TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, channel_code)
);
```

### Indexes

No additional indexes defined in migration.

## appstore_release

- profile: master
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_release (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  release_no TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  version_name TEXT NOT NULL,
  version_code TEXT NOT NULL,
  build_number TEXT,
  release_status TEXT NOT NULL,
  minimum_os_version TEXT,
  release_notes_default_locale TEXT,
  manifest_snapshot_json TEXT NOT NULL DEFAULT '{}',
  submitted_at TEXT,
  approved_at TEXT,
  published_at TEXT,
  retired_at TEXT,
  version INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, release_no),
  UNIQUE (tenant_id, listing_id, channel_id, version_code)
);
```

### Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_appstore_release_update_check
  ON appstore_release (tenant_id, listing_id, release_status, published_at DESC);
```

## appstore_release_note_localization

- profile: master
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_release_note_localization (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  release_id TEXT NOT NULL,
  locale TEXT NOT NULL,
  release_notes TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, release_id, locale)
);
```

### Indexes

No additional indexes defined in migration.

## appstore_release_artifact

- profile: master
- complianceLevel: L3

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_release_artifact (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  release_id TEXT NOT NULL,
  artifact_no TEXT NOT NULL,
  platform TEXT NOT NULL,
  architecture TEXT NOT NULL,
  package_format TEXT NOT NULL,
  artifact_status TEXT NOT NULL,
  drive_node_id TEXT NOT NULL,
  media_resource_id TEXT,
  file_size_bytes TEXT NOT NULL,
  content_type TEXT NOT NULL,
  checksum_sha256 TEXT NOT NULL,
  signature_snapshot_json TEXT NOT NULL DEFAULT '{}',
  sbom_ref TEXT,
  provenance_ref TEXT,
  min_os_version TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, artifact_no),
  UNIQUE (tenant_id, release_id, platform, architecture, package_format)
);
```

### Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_appstore_release_artifact_lookup
  ON appstore_release_artifact (tenant_id, release_id, platform, architecture, artifact_status);
```

## appstore_release_rollout

- profile: master
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_release_rollout (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  release_id TEXT NOT NULL,
  rollout_strategy TEXT NOT NULL,
  rollout_status TEXT NOT NULL,
  target_percentage INTEGER NOT NULL DEFAULT 100,
  current_percentage INTEGER NOT NULL DEFAULT 0,
  region_filter_json TEXT NOT NULL DEFAULT '[]',
  device_filter_json TEXT NOT NULL DEFAULT '{}',
  started_at TEXT,
  completed_at TEXT,
  paused_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, release_id)
);
```

### Indexes

No additional indexes defined in migration.

## appstore_market_channel

- profile: master
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_market_channel (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL DEFAULT '0',
  channel_code TEXT NOT NULL,
  channel_type TEXT NOT NULL,
  provider TEXT NOT NULL,
  channel_status TEXT NOT NULL,
  external_store_code TEXT,
  api_capability_json TEXT NOT NULL DEFAULT '{}',
  config_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, channel_code)
);
```

### Indexes

No additional indexes defined in migration.

## appstore_market_release

- profile: workflow
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_market_release (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  app_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  release_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  market_release_no TEXT NOT NULL,
  external_app_id TEXT,
  external_release_id TEXT,
  external_track TEXT,
  market_status TEXT NOT NULL,
  rollout_percent INTEGER,
  countries_json TEXT NOT NULL DEFAULT '[]',
  store_url TEXT,
  external_status_json TEXT NOT NULL DEFAULT '{}',
  submitted_at TEXT,
  approved_at TEXT,
  released_at TEXT,
  rejected_at TEXT,
  last_synced_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, market_release_no),
  UNIQUE (tenant_id, release_id, channel_id)
);
```

### Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_appstore_market_release_status
  ON appstore_market_release (tenant_id, channel_id, market_status, updated_at DESC);
```

## appstore_listing_submission

- profile: workflow
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_listing_submission (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  release_id TEXT,
  submission_no TEXT NOT NULL,
  submission_type TEXT NOT NULL,
  submission_status TEXT NOT NULL,
  submitted_by TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  payload_snapshot_json TEXT NOT NULL DEFAULT '{}',
  idempotency_key TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, submission_no),
  UNIQUE (tenant_id, listing_id, idempotency_key)
);
```

### Indexes

No additional indexes defined in migration.

## appstore_moderation_review

- profile: workflow
- complianceLevel: L3

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_moderation_review (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  submission_id TEXT NOT NULL,
  review_no TEXT NOT NULL,
  review_status TEXT NOT NULL,
  priority TEXT NOT NULL,
  assigned_to TEXT,
  queue_code TEXT NOT NULL,
  sla_due_at TEXT,
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, review_no),
  UNIQUE (tenant_id, submission_id)
);
```

### Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_appstore_moderation_queue
  ON appstore_moderation_review (tenant_id, review_status, priority, created_at ASC);
```

## appstore_moderation_decision

- profile: audit_event
- complianceLevel: L3

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_moderation_decision (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  review_id TEXT NOT NULL,
  decision_no TEXT NOT NULL,
  decision_type TEXT NOT NULL,
  decision_status TEXT NOT NULL,
  reason_code TEXT,
  reason_detail TEXT,
  policy_reference TEXT,
  decided_by TEXT NOT NULL,
  decided_at TEXT NOT NULL,
  payload_snapshot_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  UNIQUE (tenant_id, decision_no)
);
```

### Indexes

No additional indexes defined in migration.

## appstore_catalog_collection

- profile: master
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_catalog_collection (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  collection_code TEXT NOT NULL,
  collection_type TEXT NOT NULL,
  collection_status TEXT NOT NULL,
  audience_scope TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  cover_media_resource_id TEXT,
  starts_at TEXT,
  ends_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, collection_code)
);
```

### Indexes

No additional indexes defined in migration.

## appstore_catalog_collection_localization

- profile: master
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_catalog_collection_localization (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  collection_id TEXT NOT NULL,
  locale TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, collection_id, locale)
);
```

### Indexes

No additional indexes defined in migration.

## appstore_catalog_collection_item

- profile: relation
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_catalog_collection_item (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  collection_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  highlight_json TEXT NOT NULL DEFAULT '{}',
  starts_at TEXT,
  ends_at TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (tenant_id, collection_id, listing_id)
);
```

### Indexes

No additional indexes defined in migration.

## appstore_catalog_featured_slot

- profile: master
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_catalog_featured_slot (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  slot_code TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  slot_status TEXT NOT NULL,
  audience_scope TEXT NOT NULL,
  platform_scope TEXT NOT NULL DEFAULT 'ALL',
  region_scope_json TEXT NOT NULL DEFAULT '[]',
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, slot_code, starts_at)
);
```

### Indexes

No additional indexes defined in migration.

## appstore_catalog_chart_snapshot

- profile: read_model
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_catalog_chart_snapshot (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  chart_code TEXT NOT NULL,
  snapshot_date TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en-US',
  platform_scope TEXT NOT NULL DEFAULT 'ALL',
  ranking_json TEXT NOT NULL,
  generated_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (tenant_id, chart_code, snapshot_date, locale, platform_scope)
);
```

### Indexes

No additional indexes defined in migration.

## appstore_user_library_item

- profile: master
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_user_library_item (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  app_key TEXT NOT NULL,
  library_status TEXT NOT NULL,
  installed_release_id TEXT,
  installed_version_code TEXT,
  install_source TEXT NOT NULL,
  platform TEXT NOT NULL,
  architecture TEXT,
  device_id TEXT,
  last_checked_at TEXT,
  installed_at TEXT,
  updated_at TEXT NOT NULL,
  removed_at TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (tenant_id, user_id, app_key, platform)
);
```

### Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_appstore_user_library
  ON appstore_user_library_item (tenant_id, user_id, library_status, updated_at DESC);
```

## appstore_user_wishlist_item

- profile: master
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_user_wishlist_item (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  wishlist_status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, user_id, listing_id)
);
```

### Indexes

No additional indexes defined in migration.

## appstore_entitlement

- profile: master
- complianceLevel: L3

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_entitlement (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  app_id TEXT NOT NULL,
  listing_id TEXT,
  subject_type TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  entitlement_type TEXT NOT NULL,
  source_type TEXT NOT NULL,
  entitlement_status TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  expires_at TEXT,
  grant_snapshot_json TEXT NOT NULL DEFAULT '{}',
  revoked_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, app_id, subject_type, subject_id, entitlement_type)
);
```

### Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_appstore_entitlement_subject
  ON appstore_entitlement (tenant_id, subject_type, subject_id, entitlement_status, expires_at);
```

## appstore_download_grant

- profile: ledger_event
- complianceLevel: L3

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_download_grant (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  grant_no TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  release_id TEXT NOT NULL,
  artifact_id TEXT NOT NULL,
  user_id TEXT,
  grant_status TEXT NOT NULL,
  grant_reason TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  download_count INTEGER NOT NULL DEFAULT 0,
  max_download_count INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, grant_no)
);
```

### Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_appstore_download_grant_active
  ON appstore_download_grant (tenant_id, artifact_id, grant_status, expires_at);
```

## appstore_install_event

- profile: audit_event
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_install_event (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  event_no TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  release_id TEXT,
  artifact_id TEXT,
  user_id TEXT,
  device_id TEXT,
  event_type TEXT NOT NULL,
  platform TEXT NOT NULL,
  architecture TEXT,
  event_status TEXT NOT NULL,
  source_channel TEXT,
  client_version TEXT,
  region_code TEXT,
  payload_snapshot_json TEXT NOT NULL DEFAULT '{}',
  occurred_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (tenant_id, event_no)
);
```

### Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_appstore_install_event_listing
  ON appstore_install_event (tenant_id, listing_id, occurred_at DESC);
```

## appstore_listing_metric_snapshot

- profile: read_model
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_listing_metric_snapshot (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  snapshot_date TEXT NOT NULL,
  impression_count INTEGER NOT NULL DEFAULT 0,
  detail_view_count INTEGER NOT NULL DEFAULT 0,
  install_count INTEGER NOT NULL DEFAULT 0,
  uninstall_count INTEGER NOT NULL DEFAULT 0,
  update_count INTEGER NOT NULL DEFAULT 0,
  conversion_rate TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (tenant_id, listing_id, snapshot_date)
);
```

### Indexes

No additional indexes defined in migration.

## appstore_listing_iap_item

- profile: master
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_listing_iap_item (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  iap_no TEXT NOT NULL,
  iap_type TEXT NOT NULL,
  sku TEXT NOT NULL,
  display_name TEXT NOT NULL,
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency_code TEXT NOT NULL DEFAULT 'USD',
  subscription_period TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, listing_id, iap_no),
  UNIQUE (tenant_id, listing_id, sku)
);
```

### Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_appstore_listing_iap_item_listing
  ON appstore_listing_iap_item (tenant_id, listing_id, status);
```

## appstore_catalog_search_history

- profile: audit_event
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_catalog_search_history (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  query_text TEXT NOT NULL,
  filters_json TEXT NOT NULL DEFAULT '{}',
  result_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
```

### Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_appstore_catalog_search_history_user
  ON appstore_catalog_search_history (tenant_id, user_id, created_at DESC);
```

## appstore_catalog_trending_term

- profile: read_model
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_catalog_trending_term (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  term TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en',
  rank INTEGER NOT NULL,
  score REAL NOT NULL DEFAULT 0,
  snapshot_date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, term, locale, snapshot_date)
);
```

### Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_appstore_catalog_trending_term_snapshot
  ON appstore_catalog_trending_term (tenant_id, snapshot_date, rank);
```

## appstore_moderation_appeal

- profile: workflow
- complianceLevel: L3

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_moderation_appeal (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  decision_id TEXT NOT NULL,
  review_id TEXT NOT NULL,
  appeal_no TEXT NOT NULL,
  appellant_user_id TEXT NOT NULL,
  appeal_reason TEXT NOT NULL,
  appeal_status TEXT NOT NULL DEFAULT 'pending',
  decided_by TEXT,
  decision_note TEXT,
  submitted_at TEXT NOT NULL,
  decided_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, appeal_no)
);
```

### Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_appstore_moderation_appeal_status
  ON appstore_moderation_appeal (tenant_id, appeal_status, submitted_at);
```

```sql
CREATE INDEX IF NOT EXISTS idx_appstore_moderation_appeal_decision
  ON appstore_moderation_appeal (tenant_id, decision_id);
```

## appstore_release_beta_invite

- profile: master
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_release_beta_invite (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  release_id TEXT NOT NULL,
  invitee_user_id TEXT,
  invitee_email TEXT,
  invite_status TEXT NOT NULL DEFAULT 'pending',
  invited_by TEXT NOT NULL,
  invited_at TEXT NOT NULL,
  accepted_at TEXT,
  revoked_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, release_id, invitee_email)
);
```

### Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_appstore_release_beta_invite_release
  ON appstore_release_beta_invite (tenant_id, release_id, invite_status);
```

## appstore_app_template

- profile: master
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_app_template (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  template_code TEXT NOT NULL,
  template_name TEXT NOT NULL,
  template_kind TEXT NOT NULL,
  description TEXT,
  publisher_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, template_code)
);
```

### Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_appstore_app_template_status
  ON appstore_app_template (tenant_id, status, updated_at DESC);
```

## appstore_app_template_usage

- profile: relation
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_app_template_usage (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  app_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  usage_context_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  UNIQUE (tenant_id, app_id, template_id)
);
```

### Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_appstore_app_template_usage_template
  ON appstore_app_template_usage (tenant_id, template_id);
```

## appstore_app_template_version

- profile: master
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_app_template_version (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  version_label TEXT NOT NULL,
  manifest_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, template_id, version_label)
);
```

### Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_appstore_app_template_version_template
  ON appstore_app_template_version (tenant_id, template_id, status);
```


## appstore_listing_rating

- profile: master
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_listing_rating (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL DEFAULT '0',
  listing_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  rating INTEGER NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  UNIQUE (tenant_id, listing_id, user_id)
);
```

## appstore_feedback

- profile: master
- complianceLevel: L2

### DDL

```sql
CREATE TABLE IF NOT EXISTS appstore_feedback (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL DEFAULT '0',
  user_id TEXT,
  feedback_type TEXT NOT NULL,
  content TEXT NOT NULL,
  contact TEXT,
  listing_id TEXT,
  app_key TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
```
