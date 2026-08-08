//! Repository port for listing use cases.

use crate::context::AppstoreRequestContext;
use crate::domain::models::{
    Listing, ListingCategoryBinding, ListingId, ListingLocalization, ListingMedia,
    ListingSubmission, RegionalAvailability, StoreApp,
};
use crate::error::AppstoreServiceResult;

#[async_trait::async_trait]
pub trait ListingRepositoryPort: Send + Sync {
    async fn find_listing_by_id(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &ListingId,
    ) -> AppstoreServiceResult<Option<Listing>>;

    async fn find_listing_by_slug(
        &self,
        context: &AppstoreRequestContext,
        tenant_id: &str,
        listing_slug: &str,
    ) -> AppstoreServiceResult<Option<Listing>>;

    async fn find_listing_by_app_id(
        &self,
        context: &AppstoreRequestContext,
        app_id: &str,
    ) -> AppstoreServiceResult<Option<Listing>>;

    /// Returns the caller's role for a publisher (owner or accepted member)
    /// when the subject has publisher access; `None` otherwise.
    async fn find_publisher_member_role(
        &self,
        context: &AppstoreRequestContext,
        publisher_id: &str,
        user_id: &str,
    ) -> AppstoreServiceResult<Option<String>>;

    async fn find_listings_by_publisher(
        &self,
        context: &AppstoreRequestContext,
        publisher_id: &str,
        cursor: Option<&str>,
        limit: i32,
    ) -> AppstoreServiceResult<Vec<Listing>>;

    async fn insert_listing(
        &self,
        context: &AppstoreRequestContext,
        listing: &Listing,
    ) -> AppstoreServiceResult<()>;

    async fn update_listing(
        &self,
        context: &AppstoreRequestContext,
        listing: &Listing,
    ) -> AppstoreServiceResult<()>;

    async fn find_localization(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &ListingId,
        locale: &str,
    ) -> AppstoreServiceResult<Option<ListingLocalization>>;

    async fn upsert_localization(
        &self,
        context: &AppstoreRequestContext,
        localization: &ListingLocalization,
    ) -> AppstoreServiceResult<()>;

    async fn find_media_by_listing(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &ListingId,
    ) -> AppstoreServiceResult<Vec<ListingMedia>>;

    async fn find_media_by_id(
        &self,
        context: &AppstoreRequestContext,
        media_id: &str,
    ) -> AppstoreServiceResult<Option<ListingMedia>>;

    async fn insert_media(
        &self,
        context: &AppstoreRequestContext,
        media: &ListingMedia,
    ) -> AppstoreServiceResult<()>;

    async fn delete_media(
        &self,
        context: &AppstoreRequestContext,
        media_id: &str,
    ) -> AppstoreServiceResult<()>;

    async fn find_category_bindings(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &ListingId,
    ) -> AppstoreServiceResult<Vec<ListingCategoryBinding>>;

    async fn replace_category_bindings(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &ListingId,
        bindings: &[ListingCategoryBinding],
    ) -> AppstoreServiceResult<()>;

    async fn find_regional_availability(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &ListingId,
    ) -> AppstoreServiceResult<Vec<RegionalAvailability>>;

    async fn replace_regional_availability(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &ListingId,
        availabilities: &[RegionalAvailability],
    ) -> AppstoreServiceResult<()>;

    async fn find_releases_by_listing(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &ListingId,
        cursor: Option<&str>,
        limit: i32,
    ) -> AppstoreServiceResult<Vec<serde_json::Value>>;

    async fn insert_submission(
        &self,
        context: &AppstoreRequestContext,
        submission: &ListingSubmission,
    ) -> AppstoreServiceResult<()>;

    async fn find_submission_by_id(
        &self,
        context: &AppstoreRequestContext,
        submission_id: &str,
    ) -> AppstoreServiceResult<Option<ListingSubmission>>;

    async fn update_submission(
        &self,
        context: &AppstoreRequestContext,
        submission: &ListingSubmission,
    ) -> AppstoreServiceResult<()>;

    async fn find_submissions_by_listing(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &ListingId,
    ) -> AppstoreServiceResult<Vec<ListingSubmission>>;

    async fn admin_list_listings(
        &self,
        context: &AppstoreRequestContext,
        status_filter: Option<&str>,
        review_status_filter: Option<&str>,
        publisher_id: Option<&str>,
        cursor: Option<&str>,
        limit: i32,
    ) -> AppstoreServiceResult<Vec<Listing>>;

    async fn find_app_by_key(
        &self,
        context: &AppstoreRequestContext,
        app_key: &str,
    ) -> AppstoreServiceResult<Option<StoreApp>>;

    async fn bootstrap_app_and_listing(
        &self,
        context: &AppstoreRequestContext,
        app: &StoreApp,
        listing: &Listing,
    ) -> AppstoreServiceResult<()>;

    async fn find_release_history_by_listing(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &ListingId,
        cursor: Option<&str>,
        limit: i32,
    ) -> AppstoreServiceResult<Vec<serde_json::Value>>;

    async fn find_similar_listings(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &ListingId,
        primary_category_id: &str,
        cursor: Option<&str>,
        limit: i32,
    ) -> AppstoreServiceResult<Vec<Listing>>;

    async fn find_developer_other_listings(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &ListingId,
        publisher_id: &str,
        cursor: Option<&str>,
        limit: i32,
    ) -> AppstoreServiceResult<Vec<Listing>>;

    async fn find_listing_editorial(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &ListingId,
        default_locale: &str,
    ) -> AppstoreServiceResult<(Option<String>, Option<String>)>;

    async fn find_ratings(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &ListingId,
        cursor: Option<&str>,
        limit: i32,
    ) -> AppstoreServiceResult<Vec<crate::domain::models::ListingRating>>;

    async fn upsert_rating(
        &self,
        context: &AppstoreRequestContext,
        rating: &crate::domain::models::ListingRating,
    ) -> AppstoreServiceResult<()>;

    async fn recompute_listing_rating_stats(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &ListingId,
    ) -> AppstoreServiceResult<()>;
}
