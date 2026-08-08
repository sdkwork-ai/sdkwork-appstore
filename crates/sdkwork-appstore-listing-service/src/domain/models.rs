//! Listing domain models.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct ListingId(pub String);

impl ListingId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ListingStatus {
    Draft,
    Active,
    Delisted,
    Suspended,
    Deleted,
}

impl ListingStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Draft => "draft",
            Self::Active => "active",
            Self::Delisted => "delisted",
            Self::Suspended => "suspended",
            Self::Deleted => "deleted",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "draft" => Some(Self::Draft),
            "active" => Some(Self::Active),
            "delisted" => Some(Self::Delisted),
            "suspended" => Some(Self::Suspended),
            "deleted" => Some(Self::Deleted),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum StorefrontVisibility {
    Visible,
    Hidden,
    Featured,
}

impl StorefrontVisibility {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Visible => "visible",
            Self::Hidden => "hidden",
            Self::Featured => "featured",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "visible" => Some(Self::Visible),
            "hidden" => Some(Self::Hidden),
            "featured" => Some(Self::Featured),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ReviewStatus {
    NotSubmitted,
    Pending,
    InReview,
    Approved,
    Rejected,
}

impl ReviewStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::NotSubmitted => "not_submitted",
            Self::Pending => "pending",
            Self::InReview => "in_review",
            Self::Approved => "approved",
            Self::Rejected => "rejected",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "not_submitted" => Some(Self::NotSubmitted),
            "pending" => Some(Self::Pending),
            "in_review" => Some(Self::InReview),
            "approved" => Some(Self::Approved),
            "rejected" => Some(Self::Rejected),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum PricingModel {
    Free,
    Paid,
    Freemium,
    Subscription,
}

impl PricingModel {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Free => "free",
            Self::Paid => "paid",
            Self::Freemium => "freemium",
            Self::Subscription => "subscription",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "free" | "FREE" => Some(Self::Free),
            "paid" | "PAID" => Some(Self::Paid),
            "freemium" | "FREEMIUM" => Some(Self::Freemium),
            "subscription" | "SUBSCRIPTION" => Some(Self::Subscription),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ListingType {
    App,
    Game,
    Plugin,
    Extension,
}

impl ListingType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::App => "app",
            Self::Game => "game",
            Self::Plugin => "plugin",
            Self::Extension => "extension",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "app" | "APP" => Some(Self::App),
            "game" | "GAME" => Some(Self::Game),
            "plugin" | "PLUGIN" => Some(Self::Plugin),
            "extension" | "EXTENSION" => Some(Self::Extension),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum SubmissionType {
    Initial,
    Metadata,
    Release,
}

impl SubmissionType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Initial => "initial",
            Self::Metadata => "metadata",
            Self::Release => "release",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "initial" | "INITIAL" => Some(Self::Initial),
            "metadata" | "METADATA" => Some(Self::Metadata),
            "release" | "RELEASE" => Some(Self::Release),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum SubmissionStatus {
    Submitted,
    UnderReview,
    Approved,
    Rejected,
    Withdrawn,
}

impl SubmissionStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Submitted => "submitted",
            Self::UnderReview => "under_review",
            Self::Approved => "approved",
            Self::Rejected => "rejected",
            Self::Withdrawn => "withdrawn",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "submitted" => Some(Self::Submitted),
            "under_review" => Some(Self::UnderReview),
            "approved" => Some(Self::Approved),
            "rejected" => Some(Self::Rejected),
            "withdrawn" => Some(Self::Withdrawn),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum MediaRole {
    Icon,
    Screenshot,
    PreviewVideo,
    FeatureGraphic,
}

impl MediaRole {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Icon => "icon",
            Self::Screenshot => "screenshot",
            Self::PreviewVideo => "preview_video",
            Self::FeatureGraphic => "feature_graphic",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "icon" | "ICON" => Some(Self::Icon),
            "screenshot" | "SCREENSHOT" => Some(Self::Screenshot),
            "preview_video" | "PREVIEW_VIDEO" => Some(Self::PreviewVideo),
            "feature_graphic" | "FEATURE_GRAPHIC" => Some(Self::FeatureGraphic),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Listing {
    pub id: ListingId,
    pub tenant_id: String,
    pub organization_id: String,
    pub publisher_id: String,
    pub listing_no: String,
    pub app_id: String,
    pub app_key: String,
    pub listing_slug: String,
    pub listing_type: ListingType,
    pub pricing_model: PricingModel,
    pub listing_status: ListingStatus,
    pub storefront_visibility: StorefrontVisibility,
    pub review_status: ReviewStatus,
    pub primary_category_id: Option<String>,
    pub default_locale: String,
    pub age_rating_code: Option<String>,
    pub content_rating_json: serde_json::Value,
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

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct StoreApp {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub publisher_id: String,
    pub app_no: String,
    pub app_key: String,
    pub app_slug: String,
    pub display_name: String,
    pub default_locale: String,
    pub app_type: String,
    pub app_status: String,
    pub distribution_status: String,
    pub review_status: String,
    pub current_listing_id: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl Listing {
    pub fn is_active(&self) -> bool {
        self.listing_status == ListingStatus::Active && self.deleted_at.is_none()
    }

    pub fn is_visible(&self) -> bool {
        self.is_active()
            && matches!(
                self.storefront_visibility,
                StorefrontVisibility::Visible | StorefrontVisibility::Featured
            )
    }

    pub fn can_submit(&self) -> bool {
        matches!(
            self.listing_status,
            ListingStatus::Draft | ListingStatus::Active
        ) && self.deleted_at.is_none()
    }

    pub fn can_update(&self) -> bool {
        !matches!(
            self.listing_status,
            ListingStatus::Suspended | ListingStatus::Deleted
        ) && self.deleted_at.is_none()
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListingLocalization {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub listing_id: ListingId,
    pub locale: String,
    pub display_name: String,
    pub subtitle: Option<String>,
    pub short_description: String,
    pub full_description: String,
    pub whats_new_summary: Option<String>,
    pub keywords_json: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListingMedia {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub listing_id: ListingId,
    pub media_role: MediaRole,
    pub media_resource_id: String,
    pub drive_node_id: Option<String>,
    pub platform_scope: String,
    pub sort_order: i32,
    pub locale: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListingCategoryBinding {
    pub id: String,
    pub tenant_id: String,
    pub listing_id: ListingId,
    pub category_id: String,
    pub is_primary: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListingSubmission {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub listing_id: ListingId,
    pub release_id: Option<String>,
    pub submission_no: String,
    pub submission_type: SubmissionType,
    pub submission_status: SubmissionStatus,
    pub submitted_by: String,
    pub submitted_at: DateTime<Utc>,
    pub payload_snapshot_json: serde_json::Value,
    pub idempotency_key: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RegionalAvailability {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub listing_id: ListingId,
    pub region_code: String,
    pub availability_status: String,
    pub effective_at: DateTime<Utc>,
    pub expires_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListingRating {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub listing_id: ListingId,
    pub user_id: String,
    pub rating: i32,
    pub title: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
