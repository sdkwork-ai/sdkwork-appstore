CREATE TABLE IF NOT EXISTS appstore_idempotency_key (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT,
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
  icon TEXT NOT NULL DEFAULT '{}',
  icon_resource_snapshot TEXT NOT NULL DEFAULT '',
  resource_list TEXT NOT NULL DEFAULT '[]',
  access_url TEXT,
  config TEXT NOT NULL DEFAULT '{}',
  runtime_status INTEGER NOT NULL DEFAULT 1,
  install_skill TEXT NOT NULL DEFAULT '{}',
  install_config TEXT NOT NULL DEFAULT '{}',
  install_platforms TEXT NOT NULL DEFAULT '[]',
  platforms TEXT NOT NULL DEFAULT '[]',
  release_notes TEXT NOT NULL DEFAULT '[]',
  package_name TEXT,
  bundle_id TEXT,
  store_url TEXT,
  artifact_resource_snapshot TEXT NOT NULL DEFAULT '',
  download_count INTEGER NOT NULL DEFAULT 0,
  rating_avg TEXT NOT NULL DEFAULT '0',
  rating_count INTEGER NOT NULL DEFAULT 0,
  legacy_uuid TEXT,
  owner_user_id TEXT,
  project_id TEXT,
  description TEXT,
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

CREATE TABLE IF NOT EXISTS appstore_listing_category_binding (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  UNIQUE (tenant_id, listing_id, category_id)
);

CREATE TABLE IF NOT EXISTS appstore_listing_tag_binding (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (tenant_id, listing_id, tag_id)
);

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

CREATE TABLE IF NOT EXISTS appstore_market_channel (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT,
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

CREATE INDEX IF NOT EXISTS idx_appstore_listing_catalog
  ON appstore_listing (tenant_id, listing_status, storefront_visibility, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_appstore_app_status
  ON appstore_app (tenant_id, organization_id, distribution_status, review_status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_appstore_listing_publisher
  ON appstore_listing (tenant_id, publisher_id, listing_status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_appstore_release_update_check
  ON appstore_release (tenant_id, listing_id, release_status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_appstore_release_artifact_lookup
  ON appstore_release_artifact (tenant_id, release_id, platform, architecture, artifact_status);

CREATE INDEX IF NOT EXISTS idx_appstore_market_release_status
  ON appstore_market_release (tenant_id, channel_id, market_status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_appstore_user_library
  ON appstore_user_library_item (tenant_id, user_id, library_status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_appstore_entitlement_subject
  ON appstore_entitlement (tenant_id, subject_type, subject_id, entitlement_status, expires_at);

CREATE INDEX IF NOT EXISTS idx_appstore_moderation_queue
  ON appstore_moderation_review (tenant_id, review_status, priority, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_appstore_download_grant_active
  ON appstore_download_grant (tenant_id, artifact_id, grant_status, expires_at);

CREATE INDEX IF NOT EXISTS idx_appstore_install_event_listing
  ON appstore_install_event (tenant_id, listing_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS appstore_app_template (
  id TEXT PRIMARY KEY,
  uuid TEXT NOT NULL,
  tenant_id TEXT NOT NULL DEFAULT '0',
  organization_id TEXT NOT NULL DEFAULT '0',
  data_scope INTEGER NOT NULL DEFAULT 0,
  status INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 0,
  deleted_at TEXT,
  deleted_by TEXT,
  metadata TEXT NOT NULL DEFAULT '{}',
  template_no TEXT,
  template_code TEXT,
  template_name TEXT,
  description TEXT,
  category_id TEXT,
  category_code TEXT,
  template_type TEXT,
  runtime TEXT,
  framework TEXT,
  language TEXT,
  icon_media_resource_id TEXT,
  icon_object_blob_id TEXT,
  icon_resource_snapshot TEXT,
  cover_media_resource_id TEXT,
  cover_object_blob_id TEXT,
  cover_resource_snapshot TEXT,
  visibility INTEGER,
  publish_status INTEGER,
  featured INTEGER,
  sort_weight INTEGER,
  owner_user_id TEXT,
  source_app_id TEXT,
  git_repo_url TEXT,
  git_ref TEXT,
  git_sub_path TEXT,
  current_version_id TEXT,
  app_config_schema TEXT,
  default_app_config TEXT,
  variable_schema TEXT,
  dependency_manifest TEXT,
  capability_manifest TEXT,
  published_at TEXT,
  deprecated_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_appstore_app_template_no ON appstore_app_template (tenant_id, template_no);
CREATE UNIQUE INDEX IF NOT EXISTS uk_appstore_app_template_code ON appstore_app_template (tenant_id, organization_id, template_code);
CREATE INDEX IF NOT EXISTS idx_appstore_app_template_scope_status ON appstore_app_template (tenant_id, organization_id, visibility, publish_status, status, updated_at, id);
CREATE INDEX IF NOT EXISTS idx_appstore_app_template_category ON appstore_app_template (tenant_id, organization_id, category_id, publish_status, sort_weight, id);

CREATE TABLE IF NOT EXISTS appstore_app_template_version (
  id TEXT PRIMARY KEY,
  uuid TEXT NOT NULL,
  tenant_id TEXT NOT NULL DEFAULT '0',
  organization_id TEXT NOT NULL DEFAULT '0',
  data_scope INTEGER NOT NULL DEFAULT 0,
  status INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 0,
  deleted_at TEXT,
  deleted_by TEXT,
  metadata TEXT NOT NULL DEFAULT '{}',
  template_id TEXT,
  version_no TEXT,
  artifact_id TEXT,
  changelog TEXT,
  file_manifest TEXT,
  dependency_manifest TEXT,
  capability_manifest TEXT,
  variable_schema TEXT,
  app_config_schema TEXT,
  default_app_config TEXT,
  publish_status INTEGER,
  published_at TEXT,
  deprecated_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_appstore_app_template_version_no ON appstore_app_template_version (tenant_id, organization_id, template_id, version_no);
CREATE INDEX IF NOT EXISTS idx_appstore_app_template_version_template ON appstore_app_template_version (tenant_id, organization_id, template_id, publish_status, created_at, id);

CREATE TABLE IF NOT EXISTS appstore_app_template_usage (
  id TEXT PRIMARY KEY,
  uuid TEXT NOT NULL,
  tenant_id TEXT NOT NULL DEFAULT '0',
  organization_id TEXT NOT NULL DEFAULT '0',
  user_id TEXT,
  request_id TEXT,
  trace_id TEXT,
  payload_hash TEXT,
  status INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  retention_until TEXT,
  legal_hold INTEGER NOT NULL DEFAULT 0,
  metadata TEXT NOT NULL DEFAULT '{}',
  template_id TEXT,
  template_version_id TEXT,
  target_app_id TEXT,
  usage_type INTEGER,
  input_snapshot TEXT,
  output_snapshot TEXT,
  UNIQUE (tenant_id, user_id, template_id, usage_type)
);

CREATE INDEX IF NOT EXISTS idx_appstore_app_template_usage_template ON appstore_app_template_usage (tenant_id, organization_id, template_id, template_version_id, created_at, id);
CREATE INDEX IF NOT EXISTS idx_appstore_app_template_usage_target ON appstore_app_template_usage (tenant_id, organization_id, target_app_id, created_at, id);
CREATE INDEX IF NOT EXISTS idx_appstore_app_template_usage_user ON appstore_app_template_usage (tenant_id, organization_id, user_id, created_at, id);

CREATE TABLE IF NOT EXISTS appstore_listing_rating (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL DEFAULT '0',
  listing_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  rating INTEGER NOT NULL,
  title TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, listing_id, user_id)
);

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
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS appstore_catalog_search_history (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  query_text TEXT NOT NULL,
  filters_json TEXT NOT NULL DEFAULT '{}',
  result_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

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
