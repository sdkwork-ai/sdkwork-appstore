//! Database row types.

use chrono::{DateTime, Utc};
use sqlx::FromRow;

#[derive(Debug, Clone, FromRow)]
pub struct PublisherRow {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub publisher_no: String,
    pub publisher_type: String,
    pub display_name: String,
    pub legal_name: Option<String>,
    pub publisher_status: String,
    pub verification_status: String,
    pub contact_snapshot_json: String,
    pub profile_snapshot_json: String,
    pub website_url: Option<String>,
    pub support_email: Option<String>,
    pub logo_media_resource_id: Option<String>,
    pub owner_user_id: String,
    pub version: i32,
    pub verified_at: Option<DateTime<Utc>>,
    pub suspended_at: Option<DateTime<Utc>>,
    pub deleted_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct PublisherMemberRow {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub publisher_id: String,
    pub user_id: String,
    pub member_role: String,
    pub member_status: String,
    pub invited_by: Option<String>,
    pub joined_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct PublisherVerificationRow {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub publisher_id: String,
    pub verification_type: String,
    pub verification_status: String,
    pub credential_snapshot_json: String,
    pub evidence_media_resource_id: Option<String>,
    pub reviewed_by: Option<String>,
    pub reviewed_at: Option<DateTime<Utc>>,
    pub expires_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct ListingRow {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub publisher_id: String,
    pub listing_no: String,
    pub app_id: String,
    pub app_key: String,
    pub listing_slug: String,
    pub listing_type: String,
    pub pricing_model: String,
    pub listing_status: String,
    pub storefront_visibility: String,
    pub review_status: String,
    pub primary_category_id: Option<String>,
    pub default_locale: String,
    pub age_rating_code: Option<String>,
    pub content_rating_json: String,
    pub official_website_url: Option<String>,
    pub support_url: Option<String>,
    pub privacy_policy_url: Option<String>,
    pub comments_thread_id: Option<String>,
    pub commerce_product_id: Option<String>,
    pub current_release_id: Option<String>,
    pub featured_score: i32,
    pub download_count: i32,
    pub average_rating: Option<String>,
    pub rating_count: i32,
    pub version: i32,
    pub submitted_at: Option<DateTime<Utc>>,
    pub published_at: Option<DateTime<Utc>>,
    pub delisted_at: Option<DateTime<Utc>>,
    pub deleted_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct ListingLocalizationRow {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub listing_id: String,
    pub locale: String,
    pub display_name: String,
    pub subtitle: Option<String>,
    pub short_description: String,
    pub full_description: String,
    pub whats_new_summary: Option<String>,
    pub keywords_json: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct ListingMediaRow {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub listing_id: String,
    pub media_role: String,
    pub media_resource_id: String,
    pub drive_node_id: Option<String>,
    pub platform_scope: String,
    pub sort_order: i32,
    pub locale: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct ListingCategoryBindingRow {
    pub id: String,
    pub tenant_id: String,
    pub listing_id: String,
    pub category_id: String,
    pub is_primary: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct ListingTagBindingRow {
    pub id: String,
    pub tenant_id: String,
    pub listing_id: String,
    pub tag_id: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct RegionalAvailabilityRow {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub listing_id: String,
    pub region_code: String,
    pub availability_status: String,
    pub effective_at: DateTime<Utc>,
    pub expires_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct ReleaseRow {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub listing_id: String,
    pub release_no: String,
    pub channel_id: String,
    pub version_name: String,
    pub version_code: String,
    pub build_number: Option<String>,
    pub release_status: String,
    pub minimum_os_version: Option<String>,
    pub release_notes_default_locale: Option<String>,
    pub manifest_snapshot_json: String,
    pub submitted_at: Option<DateTime<Utc>>,
    pub approved_at: Option<DateTime<Utc>>,
    pub published_at: Option<DateTime<Utc>>,
    pub retired_at: Option<DateTime<Utc>>,
    pub version: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct ReleaseChannelRow {
    pub id: String,
    pub tenant_id: String,
    pub channel_code: String,
    pub channel_type: String,
    pub channel_status: String,
    pub audience_scope: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct ReleaseNoteLocalizationRow {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub release_id: String,
    pub locale: String,
    pub release_notes: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct ReleaseArtifactRow {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub release_id: String,
    pub artifact_no: String,
    pub platform: String,
    pub architecture: String,
    pub package_format: String,
    pub artifact_status: String,
    pub drive_node_id: String,
    pub media_resource_id: Option<String>,
    pub file_size_bytes: String,
    pub content_type: String,
    pub checksum_sha256: String,
    pub signature_snapshot_json: String,
    pub sbom_ref: Option<String>,
    pub provenance_ref: Option<String>,
    pub min_os_version: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct ReleaseRolloutRow {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub release_id: String,
    pub rollout_strategy: String,
    pub rollout_status: String,
    pub target_percentage: i32,
    pub current_percentage: i32,
    pub region_filter_json: String,
    pub device_filter_json: String,
    pub started_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub paused_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct DownloadGrantRow {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub grant_no: String,
    pub listing_id: String,
    pub release_id: String,
    pub artifact_id: String,
    pub user_id: Option<String>,
    pub grant_status: String,
    pub grant_reason: String,
    pub expires_at: DateTime<Utc>,
    pub consumed_at: Option<DateTime<Utc>>,
    pub download_count: i32,
    pub max_download_count: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct ListingSubmissionRow {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub listing_id: String,
    pub release_id: Option<String>,
    pub submission_no: String,
    pub submission_type: String,
    pub submission_status: String,
    pub submitted_by: String,
    pub submitted_at: DateTime<Utc>,
    pub payload_snapshot_json: String,
    pub idempotency_key: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct CategoryRow {
    pub id: String,
    pub tenant_id: String,
    pub category_code: String,
    pub parent_category_id: Option<String>,
    pub category_level: i32,
    pub category_status: String,
    pub sort_order: i32,
    pub icon_media_resource_id: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct CategoryLocalizationRow {
    pub id: String,
    pub tenant_id: String,
    pub category_id: String,
    pub locale: String,
    pub display_name: String,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct CatalogCollectionRow {
    pub id: String,
    pub tenant_id: String,
    pub collection_code: String,
    pub collection_type: String,
    pub collection_status: String,
    pub audience_scope: String,
    pub sort_order: i32,
    pub cover_media_resource_id: Option<String>,
    pub starts_at: Option<DateTime<Utc>>,
    pub ends_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct CatalogCollectionLocalizationRow {
    pub id: String,
    pub tenant_id: String,
    pub collection_id: String,
    pub locale: String,
    pub display_name: String,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct CatalogCollectionItemRow {
    pub id: String,
    pub tenant_id: String,
    pub collection_id: String,
    pub listing_id: String,
    pub sort_order: i32,
    pub highlight_json: String,
    pub starts_at: Option<DateTime<Utc>>,
    pub ends_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct CatalogFeaturedSlotRow {
    pub id: String,
    pub tenant_id: String,
    pub slot_code: String,
    pub listing_id: String,
    pub slot_status: String,
    pub audience_scope: String,
    pub platform_scope: String,
    pub region_scope_json: String,
    pub starts_at: DateTime<Utc>,
    pub ends_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct CatalogChartSnapshotRow {
    pub id: String,
    pub tenant_id: String,
    pub chart_code: String,
    pub snapshot_date: String,
    pub locale: String,
    pub platform_scope: String,
    pub ranking_json: String,
    pub generated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct ListingMetricSnapshotRow {
    pub id: String,
    pub tenant_id: String,
    pub listing_id: String,
    pub snapshot_date: String,
    pub impression_count: i32,
    pub detail_view_count: i32,
    pub install_count: i32,
    pub uninstall_count: i32,
    pub update_count: i32,
    pub conversion_rate: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct ListingSearchRow {
    pub id: String,
    pub app_id: String,
    pub app_key: String,
    pub display_name: String,
    pub subtitle: Option<String>,
    pub listing_slug: String,
    pub pricing_model: String,
    pub icon_media_resource_id: Option<String>,
    pub developer_name: Option<String>,
    pub description: Option<String>,
    pub current_version: Option<String>,
    pub file_size_bytes: Option<String>,
    pub whats_new_summary: Option<String>,
    pub released_at: Option<DateTime<Utc>>,
    pub average_rating: Option<String>,
    pub rating_count: i32,
}

#[derive(Debug, Clone, FromRow)]
pub struct UserLibraryItemRow {
    pub id: String,
    pub tenant_id: String,
    pub user_id: String,
    pub listing_id: String,
    pub app_key: String,
    pub library_status: String,
    pub installed_release_id: Option<String>,
    pub installed_version_code: Option<String>,
    pub install_source: String,
    pub platform: String,
    pub architecture: Option<String>,
    pub device_id: Option<String>,
    pub last_checked_at: Option<DateTime<Utc>>,
    pub installed_at: Option<DateTime<Utc>>,
    pub updated_at: DateTime<Utc>,
    pub removed_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct UserWishlistItemRow {
    pub id: String,
    pub tenant_id: String,
    pub user_id: String,
    pub listing_id: String,
    pub wishlist_status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct ModerationReviewRow {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub submission_id: String,
    pub review_no: String,
    pub review_status: String,
    pub priority: String,
    pub assigned_to: Option<String>,
    pub queue_code: String,
    pub sla_due_at: Option<DateTime<Utc>>,
    pub started_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct ModerationDecisionRow {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub review_id: String,
    pub decision_no: String,
    pub decision_type: String,
    pub decision_status: String,
    pub reason_code: Option<String>,
    pub reason_detail: Option<String>,
    pub policy_reference: Option<String>,
    pub decided_by: String,
    pub decided_at: DateTime<Utc>,
    pub payload_snapshot_json: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct ComplianceProfileRow {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub listing_id: String,
    pub compliance_version: i32,
    pub privacy_nutrition_json: String,
    pub content_rating_questionnaire_json: String,
    pub data_safety_json: String,
    pub target_audience_json: String,
    pub compliance_status: String,
    pub reviewed_by: Option<String>,
    pub reviewed_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct CompliancePermissionDisclosureRow {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub listing_id: String,
    pub permission_code: String,
    pub usage_purpose: String,
    pub is_required: i32,
    pub disclosure_status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct MarketChannelRow {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: Option<String>,
    pub channel_code: String,
    pub channel_type: String,
    pub provider: String,
    pub channel_status: String,
    pub external_store_code: Option<String>,
    pub api_capability_json: String,
    pub config_json: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct MarketReleaseRow {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub app_id: String,
    pub listing_id: String,
    pub release_id: String,
    pub channel_id: String,
    pub market_release_no: String,
    pub external_app_id: Option<String>,
    pub external_release_id: Option<String>,
    pub external_track: Option<String>,
    pub market_status: String,
    pub rollout_percent: Option<i32>,
    pub countries_json: String,
    pub store_url: Option<String>,
    pub external_status_json: String,
    pub submitted_at: Option<DateTime<Utc>>,
    pub approved_at: Option<DateTime<Utc>>,
    pub released_at: Option<DateTime<Utc>>,
    pub rejected_at: Option<DateTime<Utc>>,
    pub last_synced_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct InstallEventRow {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub event_no: String,
    pub listing_id: String,
    pub release_id: Option<String>,
    pub artifact_id: Option<String>,
    pub user_id: Option<String>,
    pub device_id: Option<String>,
    pub event_type: String,
    pub platform: String,
    pub architecture: Option<String>,
    pub event_status: String,
    pub source_channel: Option<String>,
    pub client_version: Option<String>,
    pub region_code: Option<String>,
    pub payload_snapshot_json: String,
    pub occurred_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct CatalogSearchHistoryRow {
    pub id: String,
    pub tenant_id: String,
    pub user_id: String,
    pub query_text: String,
    pub filters_json: String,
    pub result_count: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct CatalogTrendingTermRow {
    pub id: String,
    pub tenant_id: String,
    pub term: String,
    pub locale: String,
    pub rank: i32,
    pub score: f64,
    pub snapshot_date: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct ListingSuggestionRow {
    pub listing_id: String,
    pub display_name: String,
}

#[derive(Debug, Clone, FromRow)]
pub struct ListingIapItemRow {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub listing_id: String,
    pub iap_no: String,
    pub iap_type: String,
    pub sku: String,
    pub display_name: String,
    pub price_cents: i32,
    pub currency_code: String,
    pub subscription_period: Option<String>,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct ModerationAppealRow {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub decision_id: String,
    pub review_id: String,
    pub appeal_no: String,
    pub appellant_user_id: String,
    pub appeal_reason: String,
    pub appeal_status: String,
    pub decided_by: Option<String>,
    pub decision_note: Option<String>,
    pub submitted_at: DateTime<Utc>,
    pub decided_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct AppTemplateRow {
    pub id: i64,
    pub tenant_id: String,
    pub organization_id: String,
    pub template_code: String,
    pub template_name: String,
    pub description: Option<String>,
    pub template_type: String,
    pub category_code: Option<String>,
    pub framework: Option<String>,
    pub language: Option<String>,
    pub icon_media_resource_id: Option<String>,
    pub git_repo_url: Option<String>,
    pub capability_manifest: String,
    pub metadata: String,
    pub star_count: i64,
    pub fork_count: i64,
    pub clone_count: i64,
    pub is_enabled: bool,
    pub published_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct AppTemplateUsageRow {
    pub id: i64,
    pub tenant_id: String,
    pub organization_id: String,
    pub template_id: i64,
    pub user_id: Option<i64>,
    pub usage_type: i32,
    pub metadata: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct FeedbackRow {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub user_id: Option<String>,
    pub feedback_type: String,
    pub content: String,
    pub contact: Option<String>,
    pub listing_id: Option<String>,
    pub app_key: Option<String>,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct ListingRatingRow {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub listing_id: String,
    pub user_id: String,
    pub rating: i32,
    pub title: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct UserCategoryRow {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub owner_user_id: String,
    pub name: String,
    pub description: Option<String>,
    pub icon_media_resource_id: Option<String>,
    pub sort_order: i32,
    pub category_status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct UserCategoryItemRow {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub user_category_id: String,
    pub listing_id: String,
    pub note: Option<String>,
    pub sort_order: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct UserStoreShareRow {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub owner_user_id: String,
    pub share_token: String,
    pub title: String,
    pub description: Option<String>,
    pub share_scope: String,
    pub selected_category_ids_json: String,
    pub share_visibility: String,
    pub share_status: String,
    pub expires_at: Option<DateTime<Utc>>,
    pub view_count: i64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
