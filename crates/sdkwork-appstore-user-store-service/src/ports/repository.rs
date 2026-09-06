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

    async fn find_category_by_id(
        &self,
        context: &AppstoreRequestContext,
        category_id: &UserCategoryId,
    ) -> AppstoreServiceResult<Option<UserCategory>>;

    async fn find_category_by_name(
        &self,
        context: &AppstoreRequestContext,
        name: &str,
    ) -> AppstoreServiceResult<Option<UserCategory>>;

    async fn find_categories_by_ids(
        &self,
        context: &AppstoreRequestContext,
        category_ids: &[String],
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

    async fn update_category(
        &self,
        context: &AppstoreRequestContext,
        category: &UserCategory,
    ) -> AppstoreServiceResult<()>;

    /// Deletes the category together with its items (app-level cascade;
    /// the baseline style does not declare database-level foreign keys).
    async fn delete_category(
        &self,
        context: &AppstoreRequestContext,
        category_id: &UserCategoryId,
    ) -> AppstoreServiceResult<()>;

    async fn find_items_by_category(
        &self,
        context: &AppstoreRequestContext,
        category_id: &UserCategoryId,
        cursor: Option<&str>,
        limit: i32,
    ) -> AppstoreServiceResult<Vec<UserCategoryItem>>;

    async fn find_item_by_id(
        &self,
        context: &AppstoreRequestContext,
        item_id: &UserCategoryItemId,
    ) -> AppstoreServiceResult<Option<UserCategoryItem>>;

    async fn find_item_by_category_and_listing(
        &self,
        context: &AppstoreRequestContext,
        category_id: &UserCategoryId,
        listing_id: &str,
    ) -> AppstoreServiceResult<Option<UserCategoryItem>>;

    async fn count_items_by_categories(
        &self,
        context: &AppstoreRequestContext,
        category_ids: &[String],
    ) -> AppstoreServiceResult<Vec<(String, i64)>>;

    async fn insert_item(
        &self,
        context: &AppstoreRequestContext,
        item: &UserCategoryItem,
    ) -> AppstoreServiceResult<()>;

    async fn update_item(
        &self,
        context: &AppstoreRequestContext,
        item: &UserCategoryItem,
    ) -> AppstoreServiceResult<()>;

    async fn delete_item(
        &self,
        context: &AppstoreRequestContext,
        item_id: &UserCategoryItemId,
    ) -> AppstoreServiceResult<()>;

    /// Persists a new ordering: `ordered_item_ids` positions become
    /// `sort_order = position`.
    async fn reorder_items(
        &self,
        context: &AppstoreRequestContext,
        category_id: &UserCategoryId,
        ordered_item_ids: &[String],
    ) -> AppstoreServiceResult<()>;

    async fn find_share_by_token(
        &self,
        context: &AppstoreRequestContext,
        share_token: &str,
    ) -> AppstoreServiceResult<Option<UserStoreShare>>;

    async fn find_share_by_id(
        &self,
        context: &AppstoreRequestContext,
        share_id: &UserStoreShareId,
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

    async fn update_share(
        &self,
        context: &AppstoreRequestContext,
        share: &UserStoreShare,
    ) -> AppstoreServiceResult<()>;

    async fn increment_share_view_count(
        &self,
        context: &AppstoreRequestContext,
        share_id: &UserStoreShareId,
    ) -> AppstoreServiceResult<()>;
}
