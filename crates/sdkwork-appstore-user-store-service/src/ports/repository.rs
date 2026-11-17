//! Repository port for user store use cases.

use crate::context::AppstoreRequestContext;
use crate::domain::models::{
    UserCategory, UserCategoryId, UserCategoryItem, UserCategoryItemId, UserStoreShare,
    UserStoreShareId,
};
use crate::error::AppstoreServiceResult;

/// Cursor format for sort-ordered listings: `"<sort_order>:<id>"`, ordering by
/// `(sort_order ASC, id ASC)`.
#[async_trait::async_trait]
pub trait UserStoreRepositoryPort: Send + Sync {
    async fn find_categories_by_owner(
        &self,
        context: &AppstoreRequestContext,
        owner_user_id: &str,
        cursor: Option<&str>,
        limit: i32,
    ) -> AppstoreServiceResult<Vec<UserCategory>>;

    /// Reads one category only when it belongs to `owner_user_id`. Ownership is
    /// part of the query, so a foreign category id reads as `None` instead of
    /// being fetched and filtered by the caller.
    async fn find_category_by_id(
        &self,
        context: &AppstoreRequestContext,
        category_id: &UserCategoryId,
        owner_user_id: &str,
    ) -> AppstoreServiceResult<Option<UserCategory>>;

    async fn find_category_by_name(
        &self,
        context: &AppstoreRequestContext,
        name: &str,
    ) -> AppstoreServiceResult<Option<UserCategory>>;

    /// Reads categories by id, owner-scoped: ids owned by someone else are
    /// omitted from the result rather than returned to the caller.
    async fn find_categories_by_ids(
        &self,
        context: &AppstoreRequestContext,
        category_ids: &[String],
        owner_user_id: &str,
    ) -> AppstoreServiceResult<Vec<UserCategory>>;

    async fn count_categories_by_owner(
        &self,
        context: &AppstoreRequestContext,
        owner_user_id: &str,
    ) -> AppstoreServiceResult<i64>;

    async fn insert_category(
        &self,
        context: &AppstoreRequestContext,
        category: &UserCategory,
    ) -> AppstoreServiceResult<()>;

    /// Updates a category only when it is owned by the calling user; a foreign
    /// row is left untouched.
    async fn update_category(
        &self,
        context: &AppstoreRequestContext,
        category: &UserCategory,
    ) -> AppstoreServiceResult<()>;

    /// Deletes the category together with its items (app-level cascade;
    /// the baseline style does not declare database-level foreign keys).
    /// Both statements are owner-scoped, so a foreign category id deletes
    /// nothing.
    async fn delete_category(
        &self,
        context: &AppstoreRequestContext,
        category_id: &UserCategoryId,
    ) -> AppstoreServiceResult<()>;

    /// Lists the items of a category owned by `owner_user_id`; the owner joins
    /// the query so a foreign category id yields no items.
    async fn find_items_by_category(
        &self,
        context: &AppstoreRequestContext,
        category_id: &UserCategoryId,
        owner_user_id: &str,
        cursor: Option<&str>,
        limit: i32,
    ) -> AppstoreServiceResult<Vec<UserCategoryItem>>;

    /// Reads one item only when its category is owned by `owner_user_id` and
    /// matches `category_id`.
    async fn find_item_by_id(
        &self,
        context: &AppstoreRequestContext,
        item_id: &UserCategoryItemId,
        category_id: &UserCategoryId,
        owner_user_id: &str,
    ) -> AppstoreServiceResult<Option<UserCategoryItem>>;

    async fn find_item_by_category_and_listing(
        &self,
        context: &AppstoreRequestContext,
        category_id: &UserCategoryId,
        listing_id: &str,
        owner_user_id: &str,
    ) -> AppstoreServiceResult<Option<UserCategoryItem>>;

    async fn count_items_by_categories(
        &self,
        context: &AppstoreRequestContext,
        category_ids: &[String],
        owner_user_id: &str,
    ) -> AppstoreServiceResult<Vec<(String, i64)>>;

    async fn insert_item(
        &self,
        context: &AppstoreRequestContext,
        item: &UserCategoryItem,
    ) -> AppstoreServiceResult<()>;

    /// Updates an item only when its category is owned by the calling user.
    async fn update_item(
        &self,
        context: &AppstoreRequestContext,
        item: &UserCategoryItem,
    ) -> AppstoreServiceResult<()>;

    /// Deletes an item only when its category is owned by the calling user.
    async fn delete_item(
        &self,
        context: &AppstoreRequestContext,
        item_id: &UserCategoryItemId,
    ) -> AppstoreServiceResult<()>;

    /// Persists a new ordering: `ordered_item_ids` positions become
    /// `sort_order = position`. Only items of an owner-matched category move.
    async fn reorder_items(
        &self,
        context: &AppstoreRequestContext,
        category_id: &UserCategoryId,
        ordered_item_ids: &[String],
    ) -> AppstoreServiceResult<()>;

    /// Resolves a share by its token, which is the capability credential for
    /// the public view; it is intentionally tenant-scoped and not owner-scoped,
    /// because an anonymous visitor reads the share through the token alone.
    async fn find_share_by_token(
        &self,
        context: &AppstoreRequestContext,
        share_token: &str,
    ) -> AppstoreServiceResult<Option<UserStoreShare>>;

    /// Reads one share only when it belongs to `owner_user_id`; a foreign share
    /// id reads as `None`.
    async fn find_share_by_id(
        &self,
        context: &AppstoreRequestContext,
        share_id: &UserStoreShareId,
        owner_user_id: &str,
    ) -> AppstoreServiceResult<Option<UserStoreShare>>;

    async fn find_shares_by_owner(
        &self,
        context: &AppstoreRequestContext,
        cursor: Option<&str>,
        limit: i32,
    ) -> AppstoreServiceResult<Vec<UserStoreShare>>;

    async fn count_shares_by_owner(
        &self,
        context: &AppstoreRequestContext,
    ) -> AppstoreServiceResult<i64>;

    async fn insert_share(
        &self,
        context: &AppstoreRequestContext,
        share: &UserStoreShare,
    ) -> AppstoreServiceResult<()>;

    /// Updates a share only when it is owned by the calling user.
    async fn update_share(
        &self,
        context: &AppstoreRequestContext,
        share: &UserStoreShare,
    ) -> AppstoreServiceResult<()>;

    /// Public view counter: reachable for any visitor holding the token, so it
    /// stays tenant-scoped and deliberately has no owner predicate.
    async fn increment_share_view_count(
        &self,
        context: &AppstoreRequestContext,
        share_id: &UserStoreShareId,
    ) -> AppstoreServiceResult<()>;
}
