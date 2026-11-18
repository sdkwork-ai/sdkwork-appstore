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
#[serde(rename_all = "camelCase")]
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

/// The storefront taxonomy is a five-level tree.
pub const CATEGORY_MAX_DEPTH: i32 = 5;

/// Derive the only legal level for a category from its parent.
///
/// Root categories stay at level 1 unless the caller explicitly asks for
/// another legal root level; a child must be exactly one level below its parent
/// and may never exceed [`CATEGORY_MAX_DEPTH`].
pub fn derive_category_level(
    parent_level: Option<i32>,
    requested_level: Option<i32>,
) -> Result<i32, String> {
    match parent_level {
        Some(parent) => {
            let derived = parent + 1;
            if derived > CATEGORY_MAX_DEPTH {
                return Err(format!(
                    "Category depth cannot exceed {CATEGORY_MAX_DEPTH} levels"
                ));
            }
            if let Some(requested) = requested_level {
                if requested != derived {
                    return Err("Category level must be the parent level plus one".to_string());
                }
            }
            Ok(derived)
        }
        None => {
            let level = requested_level.unwrap_or(1);
            if !(1..=CATEGORY_MAX_DEPTH).contains(&level) {
                return Err(format!(
                    "Category level must be between 1 and {CATEGORY_MAX_DEPTH}"
                ));
            }
            Ok(level)
        }
    }
}

/// Height of the category subtree rooted at `root_id` (a leaf has height 1).
///
/// The service uses this before a re-parent so an already-valid tree cannot be
/// pushed past [`CATEGORY_MAX_DEPTH`] just because the moved node itself fits.
pub fn category_subtree_height(root_id: &str, categories: &[Category]) -> i32 {
    if !categories
        .iter()
        .any(|category| category.id.as_str() == root_id)
    {
        return 0;
    }
    let mut children: std::collections::HashMap<String, Vec<String>> =
        std::collections::HashMap::new();
    for category in categories {
        if let Some(parent_id) = category.parent_category_id.as_deref() {
            children
                .entry(parent_id.to_string())
                .or_default()
                .push(category.id.0.clone());
        }
    }

    fn visit(
        id: &str,
        children: &std::collections::HashMap<String, Vec<String>>,
        seen: &mut std::collections::HashSet<String>,
    ) -> i32 {
        if !seen.insert(id.to_string()) {
            return 0;
        }
        let mut tallest = 0;
        if let Some(kids) = children.get(id) {
            for child in kids {
                tallest = tallest.max(visit(child, children, seen));
            }
        }
        1 + tallest
    }

    visit(root_id, &children, &mut std::collections::HashSet::new())
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
#[serde(rename_all = "camelCase")]
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
#[serde(rename_all = "camelCase")]
pub struct CategoryWithLocalizations {
    pub category: Category,
    pub localizations: Vec<CategoryLocalization>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
#[serde(rename_all = "camelCase")]
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
#[serde(rename_all = "camelCase")]
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
#[serde(rename_all = "camelCase")]
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
#[serde(rename_all = "camelCase")]
pub struct CollectionWithLocalizations {
    pub collection: CatalogCollection,
    pub localizations: Vec<CatalogCollectionLocalization>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
#[serde(rename_all = "camelCase")]
pub struct CollectionWithItems {
    pub collection: CatalogCollection,
    pub localizations: Vec<CatalogCollectionLocalization>,
    pub items: Vec<CatalogCollectionItem>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
#[serde(rename_all = "camelCase")]
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
#[serde(rename_all = "camelCase")]
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
#[serde(rename_all = "camelCase")]
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
#[serde(rename_all = "camelCase")]
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
    /// Raw platform codes from `appstore_application.platforms` (see
    /// `appstore_platform_dictionary`): android, ios, harmonyos, windows,
    /// macos, linux, web, h5, miniprogram-*, browser-extension-*.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub platforms: Vec<String>,
    /// `appstore_application.app_type` (for example `app`, `game`, `plugin`).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub app_type: Option<String>,
    /// `appstore_application.access_url`: the direct-open URL for web/H5
    /// distributions; the scan target encoded into distribution QR codes.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub access_url: Option<String>,
    /// Per-platform scan/delivery links from `appstore_application_platform`
    /// (`platform code -> qrUrl`), preferred by QR distributions.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub platform_links: Option<std::collections::BTreeMap<String, String>>,
    /// Whether the listing currently offers a remix download.
    ///
    /// Not a catalog column: the catalog route projects it per response from
    /// the deployment binding plus deploy's source readiness. Every read path
    /// that does not project it reports `false`, which is the safe default
    /// ("do not offer remix") rather than a claim.
    #[serde(default)]
    pub remixable: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
#[serde(rename_all = "camelCase")]
pub struct SearchSuggestion {
    pub text: String,
    pub suggestion_type: String,
    pub listing_id: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
#[serde(rename_all = "camelCase")]
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
#[serde(rename_all = "camelCase")]
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
#[serde(rename_all = "camelCase")]
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
#[serde(rename_all = "camelCase")]
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
#[serde(rename_all = "camelCase")]
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

/// One curated AI expert of the storefront roster.
///
/// The roster lives in its own catalog store (migration 0009,
/// `appstore_expert_catalog`), so reading the expert page never depends on an
/// application-scaffold shelf. The presentation payload the storefront renders —
/// nickname, tags, prompts, avatar, rating, popularity, badge, usage counters —
/// travels verbatim in [`Self::profile`].
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
#[serde(rename_all = "camelCase")]
pub struct ExpertCatalogEntry {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub expert_code: String,
    pub expert_name: String,
    pub description: Option<String>,
    pub category_code: Option<String>,
    pub profile: serde_json::Value,
    pub expert_status: String,
    pub featured: bool,
    pub sort_weight: i32,
    pub published_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
#[serde(rename_all = "camelCase")]
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

#[cfg(test)]
mod category_level_tests {
    use super::{
        category_subtree_height, derive_category_level, Category, CategoryId, CategoryStatus,
        CATEGORY_MAX_DEPTH,
    };

    fn category(id: &str, parent_id: Option<&str>) -> Category {
        Category {
            id: CategoryId::new(id),
            tenant_id: "tenant-1".to_string(),
            category_code: id.to_string(),
            parent_category_id: parent_id.map(ToOwned::to_owned),
            category_level: 1,
            status: CategoryStatus::Active,
            sort_order: 0,
            icon_media_resource_id: None,
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
        }
    }

    #[test]
    fn root_levels_stay_within_the_cap() {
        assert_eq!(derive_category_level(None, None), Ok(1));
        assert_eq!(derive_category_level(None, Some(3)), Ok(3));
        assert!(derive_category_level(None, Some(0)).is_err());
        assert!(derive_category_level(None, Some(CATEGORY_MAX_DEPTH + 1)).is_err());
    }

    #[test]
    fn child_levels_follow_the_parent_and_stop_at_five() {
        assert_eq!(derive_category_level(Some(1), None), Ok(2));
        assert_eq!(derive_category_level(Some(4), Some(5)), Ok(5));
        assert!(derive_category_level(Some(5), None).is_err());
        assert!(derive_category_level(Some(2), Some(4)).is_err());
    }

    #[test]
    fn subtree_height_drives_the_move_cap() {
        let categories = [
            category("root", None),
            category("child", Some("root")),
            category("grandchild", Some("child")),
            category("other", None),
        ];
        assert_eq!(category_subtree_height("root", &categories), 3);
        assert_eq!(category_subtree_height("grandchild", &categories), 1);
        assert_eq!(category_subtree_height("missing", &categories), 0);
    }
}
