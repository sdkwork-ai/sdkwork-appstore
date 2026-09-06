//! Canonical column registry for `appstore_*` tables.
//!
//! Each constant enumerates the column names of one table in the same order as
//! the authoritative baseline DDL (`database/ddl/baseline/postgres/0001_appstore_baseline.sql`)
//! and the corresponding `*Row` struct in [`super::rows`]. The registry is the
//! single source of truth for column metadata — repository implementations
//! consume it via [`columns_csv`] to build SELECT clauses, and future tooling
//! (schema validators, migration generators) can introspect the `&[&str]`
//! slices directly.
//!
//! Tables are ordered alphabetically by table name, matching
//! [`super::schema::APPSTORE_TABLES`].

/// Joins a column registry slice into a comma-separated SQL column list.
///
/// Repository callers should prefer `columns_csv(APPSTORE_*_COLUMNS)` over
/// hand-maintained raw strings so that column names stay synchronized with
/// this registry and the underlying migration SQL.
pub fn columns_csv(columns: &[&str]) -> String {
    columns.join(", ")
}

pub const APPSTORE_IDEMPOTENCY_KEY_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "organization_id",
    "scope",
    "idempotency_key",
    "request_hash",
    "response_json",
    "status",
    "locked_until",
    "expires_at",
    "created_at",
    "updated_at",
];

pub const APPSTORE_PUBLISHER_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "organization_id",
    "publisher_no",
    "publisher_type",
    "display_name",
    "legal_name",
    "publisher_status",
    "verification_status",
    "contact_snapshot_json",
    "profile_snapshot_json",
    "website_url",
    "support_email",
    "logo_media_resource_id",
    "owner_user_id",
    "version",
    "verified_at",
    "suspended_at",
    "deleted_at",
    "created_at",
    "updated_at",
];

pub const APPSTORE_PUBLISHER_MEMBER_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "organization_id",
    "publisher_id",
    "user_id",
    "member_role",
    "member_status",
    "invited_by",
    "joined_at",
    "created_at",
    "updated_at",
];

pub const APPSTORE_PUBLISHER_VERIFICATION_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "organization_id",
    "publisher_id",
    "verification_type",
    "verification_status",
    "credential_snapshot_json",
    "evidence_media_resource_id",
    "reviewed_by",
    "reviewed_at",
    "expires_at",
    "created_at",
    "updated_at",
];

pub const APPSTORE_APP_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "organization_id",
    "publisher_id",
    "app_no",
    "app_key",
    "app_slug",
    "display_name",
    "default_locale",
    "app_type",
    "runtime_family",
    "runtime_framework",
    "app_status",
    "distribution_status",
    "review_status",
    "monetization_mode",
    "primary_category_id",
    "secondary_category_id",
    "age_rating_code",
    "content_rating_json",
    "official_website_url",
    "support_url",
    "privacy_policy_url",
    "terms_url",
    "icon_media_id",
    "current_listing_id",
    "current_release_id",
    "latest_released_version",
    "manifest_snapshot_json",
    "version",
    "submitted_at",
    "approved_at",
    "released_at",
    "suspended_at",
    "retired_at",
    "deleted_at",
    "created_at",
    "updated_at",
];

pub const APPSTORE_APP_DEPENDENCY_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "organization_id",
    "app_id",
    "dependency_app_id",
    "dependency_key",
    "dependency_kind",
    "version_requirement",
    "dependency_status",
    "metadata_json",
    "created_at",
    "updated_at",
];

pub const APPSTORE_CATEGORY_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "category_code",
    "parent_category_id",
    "category_level",
    "category_status",
    "sort_order",
    "icon_media_resource_id",
    "created_at",
    "updated_at",
];

pub const APPSTORE_CATEGORY_LOCALIZATION_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "category_id",
    "locale",
    "display_name",
    "description",
    "created_at",
    "updated_at",
];

pub const APPSTORE_TAG_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "tag_code",
    "tag_type",
    "tag_status",
    "created_at",
    "updated_at",
];

pub const APPSTORE_TAG_LOCALIZATION_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "tag_id",
    "locale",
    "display_name",
    "created_at",
    "updated_at",
];

pub const APPSTORE_LISTING_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "organization_id",
    "publisher_id",
    "listing_no",
    "app_id",
    "app_key",
    "listing_slug",
    "listing_type",
    "pricing_model",
    "listing_status",
    "storefront_visibility",
    "review_status",
    "primary_category_id",
    "default_locale",
    "age_rating_code",
    "content_rating_json",
    "official_website_url",
    "support_url",
    "privacy_policy_url",
    "comments_thread_id",
    "commerce_product_id",
    "current_release_id",
    "featured_score",
    "download_count",
    "average_rating",
    "rating_count",
    "version",
    "submitted_at",
    "published_at",
    "delisted_at",
    "deleted_at",
    "created_at",
    "updated_at",
];

pub const APPSTORE_LISTING_LOCALIZATION_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "organization_id",
    "listing_id",
    "locale",
    "display_name",
    "subtitle",
    "short_description",
    "full_description",
    "whats_new_summary",
    "keywords_json",
    "created_at",
    "updated_at",
];

pub const APPSTORE_LISTING_MEDIA_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "organization_id",
    "listing_id",
    "media_role",
    "media_resource_id",
    "drive_node_id",
    "platform_scope",
    "sort_order",
    "locale",
    "created_at",
    "updated_at",
];

pub const APPSTORE_LISTING_CATEGORY_BINDING_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "listing_id",
    "category_id",
    "is_primary",
    "created_at",
];

pub const APPSTORE_LISTING_TAG_BINDING_COLUMNS: &[&str] =
    &["id", "tenant_id", "listing_id", "tag_id", "created_at"];

pub const APPSTORE_REGIONAL_AVAILABILITY_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "organization_id",
    "listing_id",
    "region_code",
    "availability_status",
    "effective_at",
    "expires_at",
    "created_at",
    "updated_at",
];

pub const APPSTORE_COMPLIANCE_PROFILE_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "organization_id",
    "listing_id",
    "compliance_version",
    "privacy_nutrition_json",
    "content_rating_questionnaire_json",
    "data_safety_json",
    "target_audience_json",
    "compliance_status",
    "reviewed_by",
    "reviewed_at",
    "created_at",
    "updated_at",
];

pub const APPSTORE_COMPLIANCE_PERMISSION_DISCLOSURE_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "organization_id",
    "listing_id",
    "permission_code",
    "usage_purpose",
    "is_required",
    "disclosure_status",
    "created_at",
    "updated_at",
];

pub const APPSTORE_RELEASE_CHANNEL_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "channel_code",
    "channel_type",
    "channel_status",
    "audience_scope",
    "created_at",
    "updated_at",
];

pub const APPSTORE_RELEASE_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "organization_id",
    "listing_id",
    "release_no",
    "channel_id",
    "version_name",
    "version_code",
    "build_number",
    "release_status",
    "minimum_os_version",
    "release_notes_default_locale",
    "manifest_snapshot_json",
    "submitted_at",
    "approved_at",
    "published_at",
    "retired_at",
    "version",
    "created_at",
    "updated_at",
];

pub const APPSTORE_RELEASE_NOTE_LOCALIZATION_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "organization_id",
    "release_id",
    "locale",
    "release_notes",
    "created_at",
    "updated_at",
];

pub const APPSTORE_RELEASE_ARTIFACT_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "organization_id",
    "release_id",
    "artifact_no",
    "platform",
    "architecture",
    "package_format",
    "artifact_status",
    "drive_node_id",
    "media_resource_id",
    "file_size_bytes",
    "content_type",
    "checksum_sha256",
    "signature_snapshot_json",
    "sbom_ref",
    "provenance_ref",
    "min_os_version",
    "created_at",
    "updated_at",
];

pub const APPSTORE_RELEASE_ROLLOUT_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "organization_id",
    "release_id",
    "rollout_strategy",
    "rollout_status",
    "target_percentage",
    "current_percentage",
    "region_filter_json",
    "device_filter_json",
    "started_at",
    "completed_at",
    "paused_at",
    "created_at",
    "updated_at",
];

pub const APPSTORE_MARKET_CHANNEL_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "organization_id",
    "channel_code",
    "channel_type",
    "provider",
    "channel_status",
    "external_store_code",
    "api_capability_json",
    "config_json",
    "created_at",
    "updated_at",
];

pub const APPSTORE_MARKET_RELEASE_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "organization_id",
    "app_id",
    "listing_id",
    "release_id",
    "channel_id",
    "market_release_no",
    "external_app_id",
    "external_release_id",
    "external_track",
    "market_status",
    "rollout_percent",
    "countries_json",
    "store_url",
    "external_status_json",
    "submitted_at",
    "approved_at",
    "released_at",
    "rejected_at",
    "last_synced_at",
    "created_at",
    "updated_at",
];

pub const APPSTORE_LISTING_SUBMISSION_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "organization_id",
    "listing_id",
    "release_id",
    "submission_no",
    "submission_type",
    "submission_status",
    "submitted_by",
    "submitted_at",
    "payload_snapshot_json",
    "idempotency_key",
    "created_at",
    "updated_at",
];

pub const APPSTORE_MODERATION_REVIEW_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "organization_id",
    "submission_id",
    "review_no",
    "review_status",
    "priority",
    "assigned_to",
    "queue_code",
    "sla_due_at",
    "started_at",
    "completed_at",
    "created_at",
    "updated_at",
];

pub const APPSTORE_MODERATION_DECISION_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "organization_id",
    "review_id",
    "decision_no",
    "decision_type",
    "decision_status",
    "reason_code",
    "reason_detail",
    "policy_reference",
    "decided_by",
    "decided_at",
    "payload_snapshot_json",
    "created_at",
];

pub const APPSTORE_CATALOG_COLLECTION_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "collection_code",
    "collection_type",
    "collection_status",
    "audience_scope",
    "sort_order",
    "cover_media_resource_id",
    "starts_at",
    "ends_at",
    "created_at",
    "updated_at",
];

pub const APPSTORE_CATALOG_COLLECTION_LOCALIZATION_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "collection_id",
    "locale",
    "display_name",
    "description",
    "created_at",
    "updated_at",
];

pub const APPSTORE_CATALOG_COLLECTION_ITEM_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "collection_id",
    "listing_id",
    "sort_order",
    "highlight_json",
    "starts_at",
    "ends_at",
    "created_at",
];

pub const APPSTORE_CATALOG_FEATURED_SLOT_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "slot_code",
    "listing_id",
    "slot_status",
    "audience_scope",
    "platform_scope",
    "region_scope_json",
    "starts_at",
    "ends_at",
    "created_at",
    "updated_at",
];

pub const APPSTORE_CATALOG_CHART_SNAPSHOT_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "chart_code",
    "snapshot_date",
    "locale",
    "platform_scope",
    "ranking_json",
    "generated_at",
    "created_at",
];

pub const APPSTORE_USER_LIBRARY_ITEM_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "user_id",
    "listing_id",
    "app_key",
    "library_status",
    "installed_release_id",
    "installed_version_code",
    "install_source",
    "platform",
    "architecture",
    "device_id",
    "last_checked_at",
    "installed_at",
    "updated_at",
    "removed_at",
    "created_at",
];

pub const APPSTORE_USER_WISHLIST_ITEM_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "user_id",
    "listing_id",
    "wishlist_status",
    "created_at",
    "updated_at",
];

pub const APPSTORE_ENTITLEMENT_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "organization_id",
    "app_id",
    "listing_id",
    "subject_type",
    "subject_id",
    "entitlement_type",
    "source_type",
    "entitlement_status",
    "starts_at",
    "expires_at",
    "grant_snapshot_json",
    "revoked_at",
    "created_at",
    "updated_at",
];

pub const APPSTORE_DOWNLOAD_GRANT_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "organization_id",
    "grant_no",
    "listing_id",
    "release_id",
    "artifact_id",
    "user_id",
    "grant_status",
    "grant_reason",
    "expires_at",
    "consumed_at",
    "download_count",
    "max_download_count",
    "created_at",
    "updated_at",
];

pub const APPSTORE_INSTALL_EVENT_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "organization_id",
    "event_no",
    "listing_id",
    "release_id",
    "artifact_id",
    "user_id",
    "device_id",
    "event_type",
    "platform",
    "architecture",
    "event_status",
    "source_channel",
    "client_version",
    "region_code",
    "payload_snapshot_json",
    "occurred_at",
    "created_at",
];

pub const APPSTORE_LISTING_METRIC_SNAPSHOT_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "listing_id",
    "snapshot_date",
    "impression_count",
    "detail_view_count",
    "install_count",
    "uninstall_count",
    "update_count",
    "conversion_rate",
    "created_at",
];

pub const APPSTORE_APP_TEMPLATE_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "template_code",
    "template_name",
    "template_kind",
    "description",
    "publisher_id",
    "status",
    "created_at",
    "updated_at",
];

pub const APPSTORE_APP_TEMPLATE_USAGE_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "app_id",
    "template_id",
    "usage_context_json",
    "created_at",
];

pub const APPSTORE_APP_TEMPLATE_VERSION_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "template_id",
    "version_label",
    "manifest_json",
    "status",
    "published_at",
    "created_at",
    "updated_at",
];

pub const APPSTORE_CATALOG_SEARCH_HISTORY_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "user_id",
    "query_text",
    "filters_json",
    "result_count",
    "created_at",
];

pub const APPSTORE_CATALOG_TRENDING_TERM_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "term",
    "locale",
    "rank",
    "score",
    "snapshot_date",
    "created_at",
    "updated_at",
];

pub const APPSTORE_LISTING_IAP_ITEM_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "organization_id",
    "listing_id",
    "iap_no",
    "iap_type",
    "sku",
    "display_name",
    "price_cents",
    "currency_code",
    "subscription_period",
    "status",
    "created_at",
    "updated_at",
];

pub const APPSTORE_MODERATION_APPEAL_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "organization_id",
    "decision_id",
    "review_id",
    "appeal_no",
    "appellant_user_id",
    "appeal_reason",
    "appeal_status",
    "decided_by",
    "decision_note",
    "submitted_at",
    "decided_at",
    "created_at",
    "updated_at",
];

pub const APPSTORE_RELEASE_BETA_INVITE_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "organization_id",
    "release_id",
    "invitee_user_id",
    "invitee_email",
    "invite_status",
    "invited_by",
    "invited_at",
    "accepted_at",
    "revoked_at",
    "created_at",
    "updated_at",
];

pub const APPSTORE_USER_CATEGORY_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "organization_id",
    "owner_user_id",
    "name",
    "description",
    "icon_media_resource_id",
    "sort_order",
    "category_status",
    "created_at",
    "updated_at",
];

pub const APPSTORE_USER_CATEGORY_ITEM_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "organization_id",
    "user_category_id",
    "listing_id",
    "note",
    "sort_order",
    "created_at",
    "updated_at",
];

pub const APPSTORE_USER_STORE_SHARE_COLUMNS: &[&str] = &[
    "id",
    "tenant_id",
    "organization_id",
    "owner_user_id",
    "share_token",
    "title",
    "description",
    "share_scope",
    "selected_category_ids_json",
    "share_visibility",
    "share_status",
    "expires_at",
    "view_count",
    "created_at",
    "updated_at",
];
