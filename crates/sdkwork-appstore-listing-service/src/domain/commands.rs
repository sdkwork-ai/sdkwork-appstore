//! Listing operation requests.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ListingOperationRequest {
    pub operation_id: &'static str,
    pub idempotency_key: Option<String>,
}

impl ListingOperationRequest {
    pub fn new(operation_id: &'static str) -> Self {
        Self {
            operation_id,
            idempotency_key: None,
        }
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RetrieveListingRequest {
    pub listing_id: String,
    pub idempotency_key: Option<String>,
}

impl RetrieveListingRequest {
    pub fn new(listing_id: impl Into<String>) -> Self {
        Self {
            listing_id: listing_id.into(),
            idempotency_key: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CreateListingRequest {
    pub app_id: String,
    pub app_key: String,
    pub publisher_id: String,
    pub listing_slug: Option<String>,
    pub pricing_model: Option<String>,
    pub default_locale: String,
    pub idempotency_key: Option<String>,
}

impl CreateListingRequest {
    pub fn new(
        app_id: impl Into<String>,
        app_key: impl Into<String>,
        publisher_id: impl Into<String>,
        default_locale: impl Into<String>,
    ) -> Self {
        Self {
            app_id: app_id.into(),
            app_key: app_key.into(),
            publisher_id: publisher_id.into(),
            listing_slug: None,
            pricing_model: None,
            default_locale: default_locale.into(),
            idempotency_key: None,
        }
    }

    pub fn with_listing_slug(mut self, slug: impl Into<String>) -> Self {
        self.listing_slug = Some(slug.into());
        self
    }

    pub fn with_pricing_model(mut self, model: impl Into<String>) -> Self {
        self.pricing_model = Some(model.into());
        self
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UpdateListingRequest {
    pub listing_id: String,
    pub pricing_model: Option<String>,
    pub official_website_url: Option<String>,
    pub support_url: Option<String>,
    pub privacy_policy_url: Option<String>,
    pub idempotency_key: Option<String>,
}

impl UpdateListingRequest {
    pub fn new(listing_id: impl Into<String>) -> Self {
        Self {
            listing_id: listing_id.into(),
            pricing_model: None,
            official_website_url: None,
            support_url: None,
            privacy_policy_url: None,
            idempotency_key: None,
        }
    }

    pub fn with_pricing_model(mut self, model: impl Into<String>) -> Self {
        self.pricing_model = Some(model.into());
        self
    }

    pub fn with_official_website_url(mut self, url: impl Into<String>) -> Self {
        self.official_website_url = Some(url.into());
        self
    }

    pub fn with_support_url(mut self, url: impl Into<String>) -> Self {
        self.support_url = Some(url.into());
        self
    }

    pub fn with_privacy_policy_url(mut self, url: impl Into<String>) -> Self {
        self.privacy_policy_url = Some(url.into());
        self
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UpsertListingLocalizationRequest {
    pub listing_id: String,
    pub locale: String,
    pub display_name: String,
    pub subtitle: Option<String>,
    pub short_description: String,
    pub full_description: String,
    pub whats_new_summary: Option<String>,
    pub keywords: Option<Vec<String>>,
    pub idempotency_key: Option<String>,
}

impl UpsertListingLocalizationRequest {
    pub fn new(
        listing_id: impl Into<String>,
        locale: impl Into<String>,
        display_name: impl Into<String>,
        short_description: impl Into<String>,
        full_description: impl Into<String>,
    ) -> Self {
        Self {
            listing_id: listing_id.into(),
            locale: locale.into(),
            display_name: display_name.into(),
            subtitle: None,
            short_description: short_description.into(),
            full_description: full_description.into(),
            whats_new_summary: None,
            keywords: None,
            idempotency_key: None,
        }
    }

    pub fn with_subtitle(mut self, subtitle: impl Into<String>) -> Self {
        self.subtitle = Some(subtitle.into());
        self
    }

    pub fn with_whats_new_summary(mut self, summary: impl Into<String>) -> Self {
        self.whats_new_summary = Some(summary.into());
        self
    }

    pub fn with_keywords(mut self, keywords: Vec<String>) -> Self {
        self.keywords = Some(keywords);
        self
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListListingMediaRequest {
    pub listing_id: String,
    pub idempotency_key: Option<String>,
}

impl ListListingMediaRequest {
    pub fn new(listing_id: impl Into<String>) -> Self {
        Self {
            listing_id: listing_id.into(),
            idempotency_key: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AttachListingMediaRequest {
    pub listing_id: String,
    pub media_role: String,
    pub media_resource_id: String,
    pub platform_scope: Option<String>,
    pub locale: Option<String>,
    pub idempotency_key: Option<String>,
}

impl AttachListingMediaRequest {
    pub fn new(
        listing_id: impl Into<String>,
        media_role: impl Into<String>,
        media_resource_id: impl Into<String>,
    ) -> Self {
        Self {
            listing_id: listing_id.into(),
            media_role: media_role.into(),
            media_resource_id: media_resource_id.into(),
            platform_scope: None,
            locale: None,
            idempotency_key: None,
        }
    }

    pub fn with_platform_scope(mut self, scope: impl Into<String>) -> Self {
        self.platform_scope = Some(scope.into());
        self
    }

    pub fn with_locale(mut self, locale: impl Into<String>) -> Self {
        self.locale = Some(locale.into());
        self
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RemoveListingMediaRequest {
    pub listing_id: String,
    pub media_id: String,
    pub idempotency_key: Option<String>,
}

impl RemoveListingMediaRequest {
    pub fn new(listing_id: impl Into<String>, media_id: impl Into<String>) -> Self {
        Self {
            listing_id: listing_id.into(),
            media_id: media_id.into(),
            idempotency_key: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct BindListingCategoriesRequest {
    pub listing_id: String,
    pub primary_category_id: Option<String>,
    pub category_ids: Vec<String>,
    pub idempotency_key: Option<String>,
}

impl BindListingCategoriesRequest {
    pub fn new(listing_id: impl Into<String>, category_ids: Vec<String>) -> Self {
        Self {
            listing_id: listing_id.into(),
            primary_category_id: None,
            category_ids,
            idempotency_key: None,
        }
    }

    pub fn with_primary_category_id(mut self, id: impl Into<String>) -> Self {
        self.primary_category_id = Some(id.into());
        self
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RegionEntry {
    pub region_code: String,
    pub availability_status: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UpdateRegionalAvailabilityRequest {
    pub listing_id: String,
    pub regions: Vec<RegionEntry>,
    pub idempotency_key: Option<String>,
}

impl UpdateRegionalAvailabilityRequest {
    pub fn new(listing_id: impl Into<String>, regions: Vec<RegionEntry>) -> Self {
        Self {
            listing_id: listing_id.into(),
            regions,
            idempotency_key: None,
        }
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListPublisherListingsRequest {
    pub publisher_id: String,
    pub cursor: Option<String>,
    pub page_size: Option<i32>,
    pub idempotency_key: Option<String>,
}

impl ListPublisherListingsRequest {
    pub fn new(publisher_id: impl Into<String>) -> Self {
        Self {
            publisher_id: publisher_id.into(),
            cursor: None,
            page_size: None,
            idempotency_key: None,
        }
    }

    pub fn with_cursor(mut self, cursor: impl Into<String>) -> Self {
        self.cursor = Some(cursor.into());
        self
    }

    pub fn with_page_size(mut self, page_size: i32) -> Self {
        self.page_size = Some(page_size);
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListListingReleasesRequest {
    pub listing_id: String,
    pub cursor: Option<String>,
    pub page_size: Option<i32>,
    pub idempotency_key: Option<String>,
}

impl ListListingReleasesRequest {
    pub fn new(listing_id: impl Into<String>) -> Self {
        Self {
            listing_id: listing_id.into(),
            cursor: None,
            page_size: None,
            idempotency_key: None,
        }
    }

    pub fn with_cursor(mut self, cursor: impl Into<String>) -> Self {
        self.cursor = Some(cursor.into());
        self
    }

    pub fn with_page_size(mut self, page_size: i32) -> Self {
        self.page_size = Some(page_size);
        self
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CreateListingSubmissionRequest {
    pub listing_id: String,
    pub submission_type: String,
    pub release_id: Option<String>,
    pub idempotency_key: Option<String>,
}

impl CreateListingSubmissionRequest {
    pub fn new(listing_id: impl Into<String>, submission_type: impl Into<String>) -> Self {
        Self {
            listing_id: listing_id.into(),
            submission_type: submission_type.into(),
            release_id: None,
            idempotency_key: None,
        }
    }

    pub fn with_release_id(mut self, id: impl Into<String>) -> Self {
        self.release_id = Some(id.into());
        self
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ApplyModerationDecisionRequest {
    pub submission_id: String,
    pub decision_type: String,
    pub idempotency_key: Option<String>,
}

impl ApplyModerationDecisionRequest {
    pub fn new(submission_id: impl Into<String>, decision_type: impl Into<String>) -> Self {
        Self {
            submission_id: submission_id.into(),
            decision_type: decision_type.into(),
            idempotency_key: None,
        }
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AdminListListingsRequest {
    pub status_filter: Option<String>,
    pub review_status_filter: Option<String>,
    pub publisher_id: Option<String>,
    pub cursor: Option<String>,
    pub page_size: Option<i32>,
    pub idempotency_key: Option<String>,
}

impl AdminListListingsRequest {
    pub fn new() -> Self {
        Self {
            status_filter: None,
            review_status_filter: None,
            publisher_id: None,
            cursor: None,
            page_size: None,
            idempotency_key: None,
        }
    }

    pub fn with_status_filter(mut self, status: impl Into<String>) -> Self {
        self.status_filter = Some(status.into());
        self
    }

    pub fn with_review_status_filter(mut self, status: impl Into<String>) -> Self {
        self.review_status_filter = Some(status.into());
        self
    }

    pub fn with_publisher_id(mut self, id: impl Into<String>) -> Self {
        self.publisher_id = Some(id.into());
        self
    }

    pub fn with_cursor(mut self, cursor: impl Into<String>) -> Self {
        self.cursor = Some(cursor.into());
        self
    }

    pub fn with_page_size(mut self, page_size: i32) -> Self {
        self.page_size = Some(page_size);
        self
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AdminRetrieveListingRequest {
    pub listing_id: String,
    pub idempotency_key: Option<String>,
}

impl AdminRetrieveListingRequest {
    pub fn new(listing_id: impl Into<String>) -> Self {
        Self {
            listing_id: listing_id.into(),
            idempotency_key: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AdminUpdateListingVisibilityRequest {
    pub listing_id: String,
    pub storefront_visibility: String,
    pub idempotency_key: Option<String>,
}

impl AdminUpdateListingVisibilityRequest {
    pub fn new(listing_id: impl Into<String>, storefront_visibility: impl Into<String>) -> Self {
        Self {
            listing_id: listing_id.into(),
            storefront_visibility: storefront_visibility.into(),
            idempotency_key: None,
        }
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PublicRetrieveListingRequest {
    pub listing_slug: String,
    pub idempotency_key: Option<String>,
}

impl PublicRetrieveListingRequest {
    pub fn new(listing_slug: impl Into<String>) -> Self {
        Self {
            listing_slug: listing_slug.into(),
            idempotency_key: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct BootstrapPublisherAppRequest {
    pub publisher_id: String,
    pub app_key: String,
    pub display_name: String,
    pub default_locale: String,
    pub app_type: Option<String>,
    pub listing_slug: Option<String>,
    pub pricing_model: Option<String>,
    pub idempotency_key: Option<String>,
}

impl BootstrapPublisherAppRequest {
    pub fn new(
        publisher_id: impl Into<String>,
        app_key: impl Into<String>,
        display_name: impl Into<String>,
        default_locale: impl Into<String>,
    ) -> Self {
        Self {
            publisher_id: publisher_id.into(),
            app_key: app_key.into(),
            display_name: display_name.into(),
            default_locale: default_locale.into(),
            app_type: None,
            listing_slug: None,
            pricing_model: None,
            idempotency_key: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListListingReleaseHistoryRequest {
    pub listing_id: String,
    pub cursor: Option<String>,
    pub page_size: Option<i32>,
}

impl ListListingReleaseHistoryRequest {
    pub fn new(listing_id: impl Into<String>) -> Self {
        Self {
            listing_id: listing_id.into(),
            cursor: None,
            page_size: None,
        }
    }

    pub fn with_cursor(mut self, cursor: impl Into<String>) -> Self {
        self.cursor = Some(cursor.into());
        self
    }

    pub fn with_page_size(mut self, page_size: i32) -> Self {
        self.page_size = Some(page_size);
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListSimilarListingsRequest {
    pub listing_id: String,
    pub cursor: Option<String>,
    pub page_size: Option<i32>,
}

impl ListSimilarListingsRequest {
    pub fn new(listing_id: impl Into<String>) -> Self {
        Self {
            listing_id: listing_id.into(),
            cursor: None,
            page_size: None,
        }
    }

    pub fn with_cursor(mut self, cursor: impl Into<String>) -> Self {
        self.cursor = Some(cursor.into());
        self
    }

    pub fn with_page_size(mut self, page_size: i32) -> Self {
        self.page_size = Some(page_size);
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListDeveloperOtherListingsRequest {
    pub listing_id: String,
    pub cursor: Option<String>,
    pub page_size: Option<i32>,
}

impl ListDeveloperOtherListingsRequest {
    pub fn new(listing_id: impl Into<String>) -> Self {
        Self {
            listing_id: listing_id.into(),
            cursor: None,
            page_size: None,
        }
    }

    pub fn with_cursor(mut self, cursor: impl Into<String>) -> Self {
        self.cursor = Some(cursor.into());
        self
    }

    pub fn with_page_size(mut self, page_size: i32) -> Self {
        self.page_size = Some(page_size);
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RetrieveListingEditorialRequest {
    pub listing_id: String,
}

impl RetrieveListingEditorialRequest {
    pub fn new(listing_id: impl Into<String>) -> Self {
        Self {
            listing_id: listing_id.into(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RatingsListRequest {
    pub listing_id: String,
    pub cursor: Option<String>,
    pub page_size: Option<i32>,
}

impl RatingsListRequest {
    pub fn new(listing_id: impl Into<String>) -> Self {
        Self {
            listing_id: listing_id.into(),
            cursor: None,
            page_size: None,
        }
    }

    pub fn with_cursor(mut self, cursor: impl Into<String>) -> Self {
        self.cursor = Some(cursor.into());
        self
    }

    pub fn with_page_size(mut self, page_size: i32) -> Self {
        self.page_size = Some(page_size);
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RatingUpdateRequest {
    pub listing_id: String,
    pub rating: i32,
    pub title: Option<String>,
}

impl RatingUpdateRequest {
    pub fn new(listing_id: impl Into<String>, rating: i32) -> Self {
        Self {
            listing_id: listing_id.into(),
            rating,
            title: None,
        }
    }
}
