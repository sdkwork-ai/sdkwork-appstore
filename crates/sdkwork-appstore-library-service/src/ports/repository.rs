use crate::context::AppstoreRequestContext;
use crate::domain::models::{
    CommerceEntitlement, DownloadGrant, InstallEvent, LibraryItemId, UserLibraryItem,
    UserWishlistItem,
};
use crate::error::AppstoreServiceResult;

#[async_trait::async_trait]
pub trait LibraryRepositoryPort: Send + Sync {
    async fn find_library_items_by_user(
        &self,
        context: &AppstoreRequestContext,
        cursor: Option<&str>,
        limit: i32,
    ) -> AppstoreServiceResult<Vec<UserLibraryItem>>;

    async fn find_library_item_by_id(
        &self,
        context: &AppstoreRequestContext,
        library_item_id: &LibraryItemId,
    ) -> AppstoreServiceResult<Option<UserLibraryItem>>;

    async fn find_library_item_by_listing(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
    ) -> AppstoreServiceResult<Option<UserLibraryItem>>;

    async fn find_library_item_by_app_key_and_platform(
        &self,
        context: &AppstoreRequestContext,
        app_key: &str,
        platform: &str,
    ) -> AppstoreServiceResult<Option<UserLibraryItem>>;

    async fn insert_library_item(
        &self,
        context: &AppstoreRequestContext,
        item: &UserLibraryItem,
    ) -> AppstoreServiceResult<()>;

    async fn update_library_item(
        &self,
        context: &AppstoreRequestContext,
        item: &UserLibraryItem,
    ) -> AppstoreServiceResult<()>;

    async fn find_wishlist_items_by_user(
        &self,
        context: &AppstoreRequestContext,
        cursor: Option<&str>,
        limit: i32,
    ) -> AppstoreServiceResult<Vec<UserWishlistItem>>;

    async fn find_wishlist_item_by_listing(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
    ) -> AppstoreServiceResult<Option<UserWishlistItem>>;

    async fn insert_wishlist_item(
        &self,
        context: &AppstoreRequestContext,
        item: &UserWishlistItem,
    ) -> AppstoreServiceResult<()>;

    async fn update_wishlist_item(
        &self,
        context: &AppstoreRequestContext,
        item: &UserWishlistItem,
    ) -> AppstoreServiceResult<()>;

    async fn insert_install_event(
        &self,
        context: &AppstoreRequestContext,
        event: &InstallEvent,
    ) -> AppstoreServiceResult<()>;

    async fn find_download_grant_by_id(
        &self,
        context: &AppstoreRequestContext,
        grant_id: &str,
    ) -> AppstoreServiceResult<Option<DownloadGrant>>;

    /// Atomically consumes one download attempt for the grant owner.
    ///
    /// The conditional UPDATE guards on owner, active status, remaining
    /// quota, and expiry inside a single statement, so concurrent consumers
    /// can never double-spend the same grant. Returns the updated grant when
    /// the consumption succeeded and `None` when the guard rejected it.
    async fn consume_download_grant_atomically(
        &self,
        context: &AppstoreRequestContext,
        grant_id: &str,
        user_id: &str,
    ) -> AppstoreServiceResult<Option<DownloadGrant>>;

    /// Resolves the listing/release identity and verification status that an
    /// artifact belongs to, so issued grants stay traceable to the product.
    /// Returns `(listing_id, release_id, artifact_status)`.
    async fn find_artifact_context(
        &self,
        context: &AppstoreRequestContext,
        artifact_id: &str,
    ) -> AppstoreServiceResult<Option<(String, String, String)>>;

    async fn insert_download_grant(
        &self,
        context: &AppstoreRequestContext,
        grant: &DownloadGrant,
    ) -> AppstoreServiceResult<()>;

    async fn find_latest_release_for_listing(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
    ) -> AppstoreServiceResult<Option<(String, String, String, Option<String>)>>;

    async fn find_release_notes(
        &self,
        context: &AppstoreRequestContext,
        release_id: &str,
        locale: Option<&str>,
    ) -> AppstoreServiceResult<Option<String>>;

    async fn find_latest_artifact_for_release(
        &self,
        context: &AppstoreRequestContext,
        release_id: &str,
        platform: &str,
        architecture: Option<&str>,
    ) -> AppstoreServiceResult<Option<(String, String)>>;

    async fn find_listing_info(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
    ) -> AppstoreServiceResult<Option<String>>;

    /// Idempotently upserts a commerce-synced entitlement snapshot keyed by
    /// (tenant, app, subject_type, subject, entitlement_type).
    async fn upsert_entitlement(
        &self,
        context: &AppstoreRequestContext,
        entitlement: &CommerceEntitlement,
    ) -> AppstoreServiceResult<()>;

    /// Finds the active entitlement a subject holds for one app, if any.
    async fn find_active_entitlement(
        &self,
        context: &AppstoreRequestContext,
        app_id: &str,
        subject_id: &str,
    ) -> AppstoreServiceResult<Option<CommerceEntitlement>>;

    /// Marks the entitlement revoked (CAS on the active status) so later
    /// sync replays cannot resurrect it.
    async fn revoke_entitlement(
        &self,
        context: &AppstoreRequestContext,
        app_id: &str,
        subject_id: &str,
        entitlement_type: &str,
        revoked_at: chrono::DateTime<chrono::Utc>,
    ) -> AppstoreServiceResult<bool>;
}
