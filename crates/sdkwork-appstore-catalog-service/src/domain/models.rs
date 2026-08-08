//! Catalog domain models.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct CategoryId(pub String);

impl CategoryId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct CollectionId(pub String);

impl CollectionId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct FeaturedSlotId(pub String);

impl FeaturedSlotId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum CategoryStatus {
    Active,
    Inactive,
    Deleted,
}

impl CategoryStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Active => "active",
            Self::Inactive => "inactive",
            Self::Deleted => "deleted",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "active" => Some(Self::Active),
            "inactive" => Some(Self::Inactive),
            "deleted" => Some(Self::Deleted),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum CollectionType {
    Editorial,
    Algorithmic,
    Thematic,
}

impl CollectionType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Editorial => "editorial",
            Self::Algorithmic => "algorithmic",
            Self::Thematic => "thematic",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "editorial" => Some(Self::Editorial),
            "algorithmic" => Some(Self::Algorithmic),
            "thematic" => Some(Self::Thematic),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum CollectionStatus {
    Draft,
    Published,
    Archived,
}

impl CollectionStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Draft => "draft",
            Self::Published => "published",
            Self::Archived => "archived",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "draft" => Some(Self::Draft),
            "published" => Some(Self::Published),
            "archived" => Some(Self::Archived),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum FeaturedSlotStatus {
    Active,
    Paused,
    Expired,
}

impl FeaturedSlotStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Active => "active",
            Self::Paused => "paused",
            Self::Expired => "expired",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "active" => Some(Self::Active),
            "paused" => Some(Self::Paused),
            "expired" => Some(Self::Expired),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum AudienceScope {
    Public,
    Internal,
    Beta,
}

impl AudienceScope {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Public => "public",
            Self::Internal => "internal",
            Self::Beta => "beta",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "public" => Some(Self::Public),
            "internal" => Some(Self::Internal),
            "beta" => Some(Self::Beta),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum PlatformScope {
    All,
    Android,
    Ios,
    Web,
    Desktop,
}

impl PlatformScope {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::All => "ALL",
            Self::Android => "ANDROID",
            Self::Ios => "IOS",
            Self::Web => "WEB",
            Self::Desktop => "DESKTOP",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "ALL" => Some(Self::All),
            "ANDROID" => Some(Self::Android),
            "IOS" => Some(Self::Ios),
            "WEB" => Some(Self::Web),
            "DESKTOP" => Some(Self::Desktop),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Category {
    pub id: CategoryId,
    pub tenant_id: String,
    pub category_code: String,
    pub parent_category_id: Option<String>,
    pub category_level: i32,
    pub status: CategoryStatus,
    pub sort_order: i32,
    pub icon_media_resource_id: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CategoryLocalization {
    pub id: String,
    pub tenant_id: String,
    pub category_id: CategoryId,
    pub locale: String,
    pub display_name: String,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CategoryWithLocalizations {
    pub category: Category,
    pub localizations: Vec<CategoryLocalization>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CatalogCollection {
    pub id: CollectionId,
    pub tenant_id: String,
    pub collection_code: String,
    pub collection_type: CollectionType,
    pub status: CollectionStatus,
    pub audience_scope: AudienceScope,
    pub sort_order: i32,
    pub cover_media_resource_id: Option<String>,
    pub starts_at: Option<DateTime<Utc>>,
    pub ends_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CatalogCollectionLocalization {
    pub id: String,
    pub tenant_id: String,
    pub collection_id: CollectionId,
    pub locale: String,
    pub display_name: String,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CatalogCollectionItem {
    pub id: String,
    pub tenant_id: String,
    pub collection_id: CollectionId,
    pub listing_id: String,
    pub sort_order: i32,
    pub highlight: serde_json::Value,
    pub starts_at: Option<DateTime<Utc>>,
    pub ends_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CollectionWithLocalizations {
    pub collection: CatalogCollection,
    pub localizations: Vec<CatalogCollectionLocalization>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CollectionWithItems {
    pub collection: CatalogCollection,
    pub localizations: Vec<CatalogCollectionLocalization>,
    pub items: Vec<CatalogCollectionItem>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CatalogFeaturedSlot {
    pub id: FeaturedSlotId,
    pub tenant_id: String,
    pub slot_code: String,
    pub listing_id: String,
    pub status: FeaturedSlotStatus,
    pub audience_scope: AudienceScope,
    pub platform_scope: PlatformScope,
    pub region_scope: Vec<String>,
    pub starts_at: DateTime<Utc>,
    pub ends_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CatalogChartSnapshot {
    pub id: String,
    pub tenant_id: String,
    pub chart_code: String,
    pub snapshot_date: String,
    pub locale: String,
    pub platform_scope: PlatformScope,
    pub ranking: serde_json::Value,
    pub generated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListingMetricSnapshot {
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

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListingSummary {
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
    pub released_at: Option<String>,
    pub average_rating: Option<String>,
    pub rating_count: i32,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SearchSuggestion {
    pub text: String,
    pub suggestion_type: String,
    pub listing_id: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct TrendingTerm {
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

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SearchHistoryEntry {
    pub id: String,
    pub tenant_id: String,
    pub user_id: String,
    pub query_text: String,
    pub filters_json: String,
    pub result_count: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PublisherAnalyticsOverview {
    pub publisher_id: String,
    pub listing_count: i32,
    pub total_impressions: i64,
    pub total_detail_views: i64,
    pub total_installs: i64,
    pub total_uninstalls: i64,
    pub total_updates: i64,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PublisherListingMetricsSummary {
    pub listing_id: String,
    pub listing_slug: String,
    pub display_name: Option<String>,
    pub impression_count: i64,
    pub detail_view_count: i64,
    pub install_count: i64,
    pub uninstall_count: i64,
    pub update_count: i64,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct OperatorDashboardStats {
    pub listing_count: i32,
    pub publisher_count: i32,
    pub pending_review_count: i32,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct OperatorSearchAnalytics {
    pub recent_searches: Vec<SearchHistoryEntry>,
    pub trending_terms: Vec<TrendingTerm>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum AppTemplateUsageKind {
    Star,
    Fork,
    Clone,
    Enable,
    Disable,
}

impl AppTemplateUsageKind {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Star => "STAR",
            Self::Fork => "FORK",
            Self::Clone => "CLONE",
            Self::Enable => "ENABLE",
            Self::Disable => "DISABLE",
        }
    }

    pub fn from_str(value: &str) -> Option<Self> {
        match value {
            "STAR" => Some(Self::Star),
            "FORK" => Some(Self::Fork),
            "CLONE" => Some(Self::Clone),
            "ENABLE" => Some(Self::Enable),
            "DISABLE" => Some(Self::Disable),
            _ => None,
        }
    }

    pub fn as_i32(&self) -> i32 {
        match self {
            Self::Star => 1,
            Self::Fork => 2,
            Self::Clone => 3,
            Self::Enable => 4,
            Self::Disable => 5,
        }
    }

    pub fn from_i32(value: i32) -> Option<Self> {
        match value {
            1 => Some(Self::Star),
            2 => Some(Self::Fork),
            3 => Some(Self::Clone),
            4 => Some(Self::Enable),
            5 => Some(Self::Disable),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AppTemplate {
    pub id: String,
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
    pub author_name: Option<String>,
    pub capability_manifest: serde_json::Value,
    pub metadata: serde_json::Value,
    pub star_count: i64,
    pub fork_count: i64,
    pub clone_count: i64,
    pub is_enabled: bool,
    pub published_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AppTemplateUsage {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub template_id: String,
    pub user_id: Option<String>,
    pub usage_kind: AppTemplateUsageKind,
    pub metadata: serde_json::Value,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AppTemplateUsageCounts {
    pub template_id: String,
    pub star_count: i64,
    pub fork_count: i64,
    pub clone_count: i64,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Feedback {
    pub id: String,
    pub tenant_id: String,
    pub user_id: Option<String>,
    pub feedback_type: String,
    pub content: String,
    pub contact: Option<String>,
    pub listing_id: Option<String>,
    pub app_key: Option<String>,
    pub status: String,
    pub created_at: DateTime<Utc>,
}
