//! User store service: categories, category items, and shareable personal
//! appstore views.

use std::sync::Arc;

use chrono::Utc;

use crate::context::AppstoreRequestContext;
use crate::domain::commands::{
    AddCategoryItemRequest, CreateCategoryRequest, CreateShareRequest, DeleteCategoryRequest,
    ListCategoriesRequest, ListCategoryItemsRequest, PublicCategoryItemsRequest,
    PublicUserStoreViewRequest, RegenerateShareTokenRequest, RemoveCategoryItemRequest,
    ReorderCategoryItemsRequest, RetrieveCategoryRequest, RevokeShareRequest,
    UpdateCategoryRequest, UpdateShareRequest,
};
use crate::domain::models::{
    ListingCard, ShareScope, ShareStatus, ShareVisibility, UserCategory, UserCategoryId,
    UserCategoryItem, UserCategoryItemId, UserCategoryStatus, UserStoreShare, UserStoreShareId,
};
use crate::domain::results::{
    AddCategoryItemResult, CategoriesListResult, CategoryCreateResult, CategoryDeleteResult,
    CategoryItemCount, CategoryItemWithCard, CategoryItemsListResult, CategoryRetrieveResult,
    CategoryUpdateResult, ItemRemoveResult, ItemsReorderResult, PublicCategoryItemsResult,
    PublicCategorySummary, PublicUserStoreViewResult, RegenerateShareTokenResult,
    ShareCreateResult, ShareRevokeResult, ShareUpdateResult, SharesListResult,
};
use crate::error::{AppstoreServiceError, AppstoreServiceResult};
use crate::ports::provider::ListingCardProviderPort;
use crate::ports::repository::UserStoreRepositoryPort;

const MAX_CATEGORIES_PER_USER: i64 = 100;
const MAX_ITEMS_PER_CATEGORY: i64 = 500;
const MAX_ACTIVE_SHARES_PER_USER: i64 = 20;
const MAX_NAME_LENGTH: usize = 64;
const MAX_TITLE_LENGTH: usize = 128;

pub trait UserStoreOperations {
    async fn category_create(
        &self,
        context: &AppstoreRequestContext,
        request: CreateCategoryRequest,
    ) -> AppstoreServiceResult<CategoryCreateResult>;

    async fn categories_list(
        &self,
        context: &AppstoreRequestContext,
        request: ListCategoriesRequest,
    ) -> AppstoreServiceResult<CategoriesListResult>;

    async fn category_retrieve(
        &self,
        context: &AppstoreRequestContext,
        request: RetrieveCategoryRequest,
    ) -> AppstoreServiceResult<CategoryRetrieveResult>;

    async fn category_update(
        &self,
        context: &AppstoreRequestContext,
        request: UpdateCategoryRequest,
    ) -> AppstoreServiceResult<CategoryUpdateResult>;

    async fn category_delete(
        &self,
        context: &AppstoreRequestContext,
        request: DeleteCategoryRequest,
    ) -> AppstoreServiceResult<CategoryDeleteResult>;

    async fn item_add(
        &self,
        context: &AppstoreRequestContext,
        request: AddCategoryItemRequest,
    ) -> AppstoreServiceResult<AddCategoryItemResult>;

    async fn item_remove(
        &self,
        context: &AppstoreRequestContext,
        request: RemoveCategoryItemRequest,
    ) -> AppstoreServiceResult<ItemRemoveResult>;

    async fn items_list(
        &self,
        context: &AppstoreRequestContext,
        request: ListCategoryItemsRequest,
    ) -> AppstoreServiceResult<CategoryItemsListResult>;

    async fn items_reorder(
        &self,
        context: &AppstoreRequestContext,
        request: ReorderCategoryItemsRequest,
    ) -> AppstoreServiceResult<ItemsReorderResult>;

    async fn share_create(
        &self,
        context: &AppstoreRequestContext,
        request: CreateShareRequest,
    ) -> AppstoreServiceResult<ShareCreateResult>;

    async fn shares_list(
        &self,
        context: &AppstoreRequestContext,
        cursor: Option<String>,
        page_size: Option<i32>,
    ) -> AppstoreServiceResult<SharesListResult>;

    async fn share_update(
        &self,
        context: &AppstoreRequestContext,
        request: UpdateShareRequest,
    ) -> AppstoreServiceResult<ShareUpdateResult>;

    async fn share_revoke(
        &self,
        context: &AppstoreRequestContext,
        request: RevokeShareRequest,
    ) -> AppstoreServiceResult<ShareRevokeResult>;

    async fn share_regenerate_token(
        &self,
        context: &AppstoreRequestContext,
        request: RegenerateShareTokenRequest,
    ) -> AppstoreServiceResult<RegenerateShareTokenResult>;

    async fn public_user_store_view(
        &self,
        context: &AppstoreRequestContext,
        request: PublicUserStoreViewRequest,
    ) -> AppstoreServiceResult<PublicUserStoreViewResult>;

    async fn public_category_items(
        &self,
        context: &AppstoreRequestContext,
        request: PublicCategoryItemsRequest,
    ) -> AppstoreServiceResult<PublicCategoryItemsResult>;
}

pub struct UserStoreService<R> {
    repository: R,
    listing_cards: Option<Arc<dyn ListingCardProviderPort>>,
}

impl<R: std::fmt::Debug> std::fmt::Debug for UserStoreService<R> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("UserStoreService")
            .field("repository", &self.repository)
            .field("listing_cards", &self.listing_cards.is_some())
            .finish()
    }
}

impl<R> Clone for UserStoreService<R>
where
    R: Clone,
{
    fn clone(&self) -> Self {
        Self {
            repository: self.repository.clone(),
            listing_cards: self.listing_cards.clone(),
        }
    }
}

impl<R> UserStoreService<R> {
    pub fn new(repository: R) -> Self {
        Self {
            repository,
            listing_cards: None,
        }
    }

    pub fn with_listing_cards(mut self, port: Arc<dyn ListingCardProviderPort>) -> Self {
        self.listing_cards = Some(port);
        self
    }

    fn listing_cards(&self) -> AppstoreServiceResult<&Arc<dyn ListingCardProviderPort>> {
        self.listing_cards.as_ref().ok_or_else(|| {
            AppstoreServiceError::Internal("Listing card provider is not configured".to_string())
        })
    }

    fn require_user_id(context: &AppstoreRequestContext) -> AppstoreServiceResult<String> {
        let user_id = context.user_id.trim().to_string();
        if user_id.is_empty() {
            return Err(AppstoreServiceError::PermissionDenied(
                "Authenticated user is required".to_string(),
            ));
        }
        Ok(user_id)
    }

    fn validate_name(name: &str) -> AppstoreServiceResult<String> {
        let name = name.trim().to_string();
        if name.is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Category name is required".to_string(),
            ));
        }
        if name.chars().count() > MAX_NAME_LENGTH {
            return Err(AppstoreServiceError::ValidationFailed(format!(
                "Category name must be at most {MAX_NAME_LENGTH} characters"
            )));
        }
        Ok(name)
    }

    fn validate_title(title: &str) -> AppstoreServiceResult<String> {
        let title = title.trim().to_string();
        if title.is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Share title is required".to_string(),
            ));
        }
        if title.chars().count() > MAX_TITLE_LENGTH {
            return Err(AppstoreServiceError::ValidationFailed(format!(
                "Share title must be at most {MAX_TITLE_LENGTH} characters"
            )));
        }
        Ok(title)
    }

    /// Validates share state for anonymous access: active, not revoked, not
    /// expired. Not-found responses do not leak existence.
    fn validate_publicly_viewable(share: &UserStoreShare) -> AppstoreServiceResult<()> {
        if share.status != ShareStatus::Active {
            return Err(AppstoreServiceError::NotFound(
                "Shared store not available".to_string(),
            ));
        }
        if let Some(expires_at) = share.expires_at {
            if expires_at <= Utc::now() {
                return Err(AppstoreServiceError::NotFound(
                    "Shared store not available".to_string(),
                ));
            }
        }
        Ok(())
    }

    fn categories_in_scope(
        share: &UserStoreShare,
        categories: &[UserCategory],
    ) -> Vec<UserCategory> {
        match share.scope {
            ShareScope::All => categories.to_vec(),
            ShareScope::Selected => categories
                .iter()
                .filter(|category| share.selected_category_ids.contains(&category.id))
                .cloned()
                .collect(),
        }
    }

    fn encode_cursor(sort_order: i32, id: &str) -> String {
        format!("{sort_order}:{id}")
    }

    fn decode_cursor(cursor: &str) -> AppstoreServiceResult<(i32, String)> {
        let (order, id) = cursor
            .split_once(':')
            .ok_or_else(|| AppstoreServiceError::ValidationFailed("Invalid cursor".to_string()))?;
        let sort_order: i32 = order
            .parse()
            .map_err(|_| AppstoreServiceError::ValidationFailed("Invalid cursor".to_string()))?;
        Ok((sort_order, id.to_string()))
    }
}

impl<R> UserStoreOperations for UserStoreService<R>
where
    R: UserStoreRepositoryPort + Send + Sync,
{
    async fn category_create(
        &self,
        context: &AppstoreRequestContext,
        request: CreateCategoryRequest,
    ) -> AppstoreServiceResult<CategoryCreateResult> {
        let owner_user_id = Self::require_user_id(context)?;
        let name = Self::validate_name(&request.name)?;

        let existing = self
            .repository
            .find_category_by_name(context, &name)
            .await?;
        if existing.is_some() {
            return Err(AppstoreServiceError::AlreadyExists(format!(
                "Category '{name}' already exists"
            )));
        }

        let count = self
            .repository
            .count_categories_by_owner(context, &owner_user_id)
            .await?;
        if count >= MAX_CATEGORIES_PER_USER {
            return Err(AppstoreServiceError::InvalidState(format!(
                "Category limit reached ({MAX_CATEGORIES_PER_USER})"
            )));
        }

        let now = Utc::now();
        let category = UserCategory {
            id: uuid::Uuid::new_v4().to_string(),
            tenant_id: context.tenant_id.clone(),
            owner_user_id,
            name,
            description: request.description,
            icon_media_resource_id: request.icon_media_resource_id,
            sort_order: count.clamp(0, i32::MAX as i64) as i32,
            status: UserCategoryStatus::Active,
            created_at: now,
            updated_at: now,
        };
        self.repository.insert_category(context, &category).await?;

        Ok(CategoryCreateResult::created(
            "appstore.userStore.category.create",
            category,
        ))
    }

    async fn categories_list(
        &self,
        context: &AppstoreRequestContext,
        request: ListCategoriesRequest,
    ) -> AppstoreServiceResult<CategoriesListResult> {
        let owner_user_id = Self::require_user_id(context)?;
        let limit = request.page_size.unwrap_or(50).clamp(1, 200);
        let mut categories = self
            .repository
            .find_categories_by_owner(
                context,
                &owner_user_id,
                request.cursor.as_deref(),
                limit + 1,
            )
            .await?;

        let has_more = categories.len() > limit as usize;
        let next_cursor = if has_more {
            categories
                .get(limit as usize - 1)
                .map(|c| Self::encode_cursor(c.sort_order, &c.id))
        } else {
            None
        };
        categories.truncate(limit as usize);

        let category_ids: Vec<String> = categories.iter().map(|c| c.id.clone()).collect();
        let counts = self
            .repository
            .count_items_by_categories(context, &category_ids)
            .await?;
        let item_counts: Vec<CategoryItemCount> = counts
            .into_iter()
            .map(|(user_category_id, count)| CategoryItemCount {
                user_category_id,
                count,
            })
            .collect();

        Ok(CategoriesListResult::new(
            "appstore.userStore.category.list",
            categories,
            item_counts,
            next_cursor,
            has_more,
        ))
    }

    async fn category_retrieve(
        &self,
        context: &AppstoreRequestContext,
        request: RetrieveCategoryRequest,
    ) -> AppstoreServiceResult<CategoryRetrieveResult> {
        let owner_user_id = Self::require_user_id(context)?;
        let category = self
            .repository
            .find_category_by_id(context, &UserCategoryId::new(&request.user_category_id))
            .await?
            .filter(|c| c.owner_user_id == owner_user_id)
            .ok_or_else(|| AppstoreServiceError::NotFound("Category not found".to_string()))?;
        Ok(CategoryRetrieveResult {
            operation_id: "appstore.userStore.category.retrieve",
            category,
        })
    }

    async fn category_update(
        &self,
        context: &AppstoreRequestContext,
        request: UpdateCategoryRequest,
    ) -> AppstoreServiceResult<CategoryUpdateResult> {
        let owner_user_id = Self::require_user_id(context)?;
        let category_id = UserCategoryId::new(&request.user_category_id);
        let mut category = self
            .repository
            .find_category_by_id(context, &category_id)
            .await?
            .filter(|c| c.owner_user_id == owner_user_id)
            .ok_or_else(|| AppstoreServiceError::NotFound("Category not found".to_string()))?;

        if let Some(name) = request.name.as_deref() {
            let name = Self::validate_name(name)?;
            if name != category.name {
                let existing = self
                    .repository
                    .find_category_by_name(context, &name)
                    .await?;
                if existing.is_some() {
                    return Err(AppstoreServiceError::AlreadyExists(format!(
                        "Category '{name}' already exists"
                    )));
                }
            }
            category.name = name;
        }
        if let Some(description) = request.description {
            category.description = Some(description);
        }
        if let Some(icon) = request.icon_media_resource_id {
            category.icon_media_resource_id = Some(icon);
        }
        if let Some(sort_order) = request.sort_order {
            category.sort_order = sort_order;
        }
        category.updated_at = Utc::now();
        self.repository.update_category(context, &category).await?;

        Ok(CategoryUpdateResult {
            operation_id: "appstore.userStore.category.update",
            category,
        })
    }

    async fn category_delete(
        &self,
        context: &AppstoreRequestContext,
        request: DeleteCategoryRequest,
    ) -> AppstoreServiceResult<CategoryDeleteResult> {
        let owner_user_id = Self::require_user_id(context)?;
        let category_id = UserCategoryId::new(&request.user_category_id);
        let category = self
            .repository
            .find_category_by_id(context, &category_id)
            .await?
            .filter(|c| c.owner_user_id == owner_user_id)
            .ok_or_else(|| AppstoreServiceError::NotFound("Category not found".to_string()))?;
        drop(category);

        self.repository
            .delete_category(context, &category_id)
            .await?;
        Ok(CategoryDeleteResult::accepted(
            "appstore.userStore.category.delete",
        ))
    }

    async fn item_add(
        &self,
        context: &AppstoreRequestContext,
        request: AddCategoryItemRequest,
    ) -> AppstoreServiceResult<AddCategoryItemResult> {
        let owner_user_id = Self::require_user_id(context)?;
        if request.listing_id.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Listing ID is required".to_string(),
            ));
        }

        let category_id = UserCategoryId::new(&request.user_category_id);
        let category = self
            .repository
            .find_category_by_id(context, &category_id)
            .await?
            .filter(|c| c.owner_user_id == owner_user_id)
            .ok_or_else(|| AppstoreServiceError::NotFound("Category not found".to_string()))?;
        let _ = category;

        let listing_card = self
            .listing_cards()?
            .resolve_listing_card(&context.tenant_id, request.listing_id.trim())
            .await
            .map_err(AppstoreServiceError::Internal)?
            .ok_or_else(|| AppstoreServiceError::NotFound("Listing not found".to_string()))?;

        let existing = self
            .repository
            .find_item_by_category_and_listing(
                context,
                &category_id,
                listing_card.listing_id.as_str(),
            )
            .await?;
        if existing.is_some() {
            return Err(AppstoreServiceError::AlreadyExists(
                "Listing is already in this category".to_string(),
            ));
        }

        let count = self
            .repository
            .count_items_by_categories(context, &[category_id.as_str().to_string()])
            .await?
            .first()
            .map(|(_, count)| *count)
            .unwrap_or(0);
        if count >= MAX_ITEMS_PER_CATEGORY {
            return Err(AppstoreServiceError::InvalidState(format!(
                "Category item limit reached ({MAX_ITEMS_PER_CATEGORY})"
            )));
        }

        let now = Utc::now();
        let item = UserCategoryItem {
            id: uuid::Uuid::new_v4().to_string(),
            tenant_id: context.tenant_id.clone(),
            user_category_id: category_id.as_str().to_string(),
            listing_id: listing_card.listing_id.clone(),
            note: request.note,
            sort_order: count.clamp(0, i32::MAX as i64) as i32,
            created_at: now,
            updated_at: now,
        };
        self.repository.insert_item(context, &item).await?;

        Ok(AddCategoryItemResult {
            operation_id: "appstore.userStore.item.create",
            item,
            listing_card: Some(listing_card),
        })
    }

    async fn item_remove(
        &self,
        context: &AppstoreRequestContext,
        request: RemoveCategoryItemRequest,
    ) -> AppstoreServiceResult<ItemRemoveResult> {
        let owner_user_id = Self::require_user_id(context)?;
        let category_id = UserCategoryId::new(&request.user_category_id);
        let category = self
            .repository
            .find_category_by_id(context, &category_id)
            .await?
            .filter(|c| c.owner_user_id == owner_user_id)
            .ok_or_else(|| AppstoreServiceError::NotFound("Category not found".to_string()))?;
        let _ = category;

        let item = self
            .repository
            .find_item_by_id(context, &UserCategoryItemId::new(&request.item_id))
            .await?
            .filter(|i| i.user_category_id == category_id.as_str())
            .ok_or_else(|| AppstoreServiceError::NotFound("Category item not found".to_string()))?;
        let _ = item;

        self.repository
            .delete_item(context, &UserCategoryItemId::new(&request.item_id))
            .await?;
        Ok(ItemRemoveResult::accepted("appstore.userStore.item.delete"))
    }

    async fn items_list(
        &self,
        context: &AppstoreRequestContext,
        request: ListCategoryItemsRequest,
    ) -> AppstoreServiceResult<CategoryItemsListResult> {
        let owner_user_id = Self::require_user_id(context)?;
        let category_id = UserCategoryId::new(&request.user_category_id);
        let category = self
            .repository
            .find_category_by_id(context, &category_id)
            .await?
            .filter(|c| c.owner_user_id == owner_user_id)
            .ok_or_else(|| AppstoreServiceError::NotFound("Category not found".to_string()))?;
        drop(category);

        let limit = request.page_size.unwrap_or(50).clamp(1, 200);
        let mut items = self
            .repository
            .find_items_by_category(context, &category_id, request.cursor.as_deref(), limit + 1)
            .await?;

        let has_more = items.len() > limit as usize;
        let next_cursor = if has_more {
            items
                .get(limit as usize - 1)
                .map(|i| Self::encode_cursor(i.sort_order, &i.id))
        } else {
            None
        };
        items.truncate(limit as usize);

        let listing_ids: Vec<String> = items.iter().map(|i| i.listing_id.clone()).collect();
        let cards = self
            .listing_cards()?
            .resolve_listing_cards(&context.tenant_id, &listing_ids)
            .await
            .map_err(AppstoreServiceError::Internal)?;

        let with_cards: Vec<CategoryItemWithCard> = items
            .into_iter()
            .map(|item| {
                let listing_card = cards
                    .iter()
                    .find(|card| card.listing_id == item.listing_id)
                    .cloned();
                CategoryItemWithCard { item, listing_card }
            })
            .collect();

        Ok(CategoryItemsListResult {
            operation_id: "appstore.userStore.item.list",
            items: with_cards,
            next_cursor,
            has_more,
        })
    }

    async fn items_reorder(
        &self,
        context: &AppstoreRequestContext,
        request: ReorderCategoryItemsRequest,
    ) -> AppstoreServiceResult<ItemsReorderResult> {
        let owner_user_id = Self::require_user_id(context)?;
        let category_id = UserCategoryId::new(&request.user_category_id);
        let category = self
            .repository
            .find_category_by_id(context, &category_id)
            .await?
            .filter(|c| c.owner_user_id == owner_user_id)
            .ok_or_else(|| AppstoreServiceError::NotFound("Category not found".to_string()))?;
        let _ = category;

        if request.item_ids.is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "item_ids must not be empty".to_string(),
            ));
        }
        let unique: std::collections::HashSet<&String> = request.item_ids.iter().collect();
        if unique.len() != request.item_ids.len() {
            return Err(AppstoreServiceError::ValidationFailed(
                "item_ids must not contain duplicates".to_string(),
            ));
        }

        self.repository
            .reorder_items(context, &category_id, &request.item_ids)
            .await?;
        Ok(ItemsReorderResult::accepted(
            "appstore.userStore.item.update",
        ))
    }

    async fn share_create(
        &self,
        context: &AppstoreRequestContext,
        request: CreateShareRequest,
    ) -> AppstoreServiceResult<ShareCreateResult> {
        let owner_user_id = Self::require_user_id(context)?;
        let title = Self::validate_title(&request.title)?;
        let scope = request.scope.unwrap_or(ShareScope::All);
        let visibility = request.visibility.unwrap_or(ShareVisibility::Public);
        let selected_category_ids = request.selected_category_ids.unwrap_or_default();

        if scope == ShareScope::Selected && selected_category_ids.is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "selected_category_ids is required when scope is 'selected'".to_string(),
            ));
        }

        let count = self.repository.count_shares_by_owner(context).await?;
        if count >= MAX_ACTIVE_SHARES_PER_USER {
            return Err(AppstoreServiceError::InvalidState(format!(
                "Active share limit reached ({MAX_ACTIVE_SHARES_PER_USER})"
            )));
        }

        let now = Utc::now();
        let share = UserStoreShare {
            id: uuid::Uuid::new_v4().to_string(),
            tenant_id: context.tenant_id.clone(),
            owner_user_id: owner_user_id.clone(),
            share_token: generate_share_token(),
            title,
            description: request.description,
            scope,
            selected_category_ids,
            visibility,
            status: ShareStatus::Active,
            expires_at: request.expires_at,
            view_count: 0,
            created_at: now,
            updated_at: now,
        };
        self.repository.insert_share(context, &share).await?;

        Ok(ShareCreateResult {
            operation_id: "appstore.userStore.share.create",
            share,
        })
    }

    async fn shares_list(
        &self,
        context: &AppstoreRequestContext,
        cursor: Option<String>,
        page_size: Option<i32>,
    ) -> AppstoreServiceResult<SharesListResult> {
        Self::require_user_id(context)?;
        let limit = page_size.unwrap_or(50).clamp(1, 200);
        let mut shares = self
            .repository
            .find_shares_by_owner(context, cursor.as_deref(), limit + 1)
            .await?;

        let has_more = shares.len() > limit as usize;
        let next_cursor = if has_more {
            shares.get(limit as usize - 1).map(|s| s.id.clone())
        } else {
            None
        };
        shares.truncate(limit as usize);

        Ok(SharesListResult {
            operation_id: "appstore.userStore.share.list",
            items: shares,
            next_cursor,
            has_more,
        })
    }

    async fn share_update(
        &self,
        context: &AppstoreRequestContext,
        request: UpdateShareRequest,
    ) -> AppstoreServiceResult<ShareUpdateResult> {
        let owner_user_id = Self::require_user_id(context)?;
        let share_id = UserStoreShareId::new(&request.share_id);
        let mut share = self
            .repository
            .find_share_by_id(context, &share_id)
            .await?
            .filter(|s| s.owner_user_id == owner_user_id)
            .ok_or_else(|| AppstoreServiceError::NotFound("Share not found".to_string()))?;

        if let Some(title) = request.title.as_deref() {
            share.title = Self::validate_title(title)?;
        }
        if let Some(description) = request.description {
            share.description = Some(description);
        }
        if let Some(scope) = request.scope {
            share.scope = scope;
        }
        if let Some(selected) = request.selected_category_ids {
            share.selected_category_ids = selected;
        }
        if share.scope == ShareScope::Selected && share.selected_category_ids.is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "selected_category_ids is required when scope is 'selected'".to_string(),
            ));
        }
        if let Some(visibility) = request.visibility {
            share.visibility = visibility;
        }
        if let Some(expires_at) = request.expires_at {
            share.expires_at = expires_at;
        }
        share.updated_at = Utc::now();
        self.repository.update_share(context, &share).await?;

        Ok(ShareUpdateResult {
            operation_id: "appstore.userStore.share.update",
            share,
        })
    }

    async fn share_revoke(
        &self,
        context: &AppstoreRequestContext,
        request: RevokeShareRequest,
    ) -> AppstoreServiceResult<ShareRevokeResult> {
        let owner_user_id = Self::require_user_id(context)?;
        let share_id = UserStoreShareId::new(&request.share_id);
        let mut share = self
            .repository
            .find_share_by_id(context, &share_id)
            .await?
            .filter(|s| s.owner_user_id == owner_user_id)
            .ok_or_else(|| AppstoreServiceError::NotFound("Share not found".to_string()))?;

        share.status = ShareStatus::Revoked;
        share.updated_at = Utc::now();
        self.repository.update_share(context, &share).await?;

        Ok(ShareRevokeResult::accepted(
            "appstore.userStore.share.delete",
        ))
    }

    async fn share_regenerate_token(
        &self,
        context: &AppstoreRequestContext,
        request: RegenerateShareTokenRequest,
    ) -> AppstoreServiceResult<RegenerateShareTokenResult> {
        let owner_user_id = Self::require_user_id(context)?;
        let share_id = UserStoreShareId::new(&request.share_id);
        let mut share = self
            .repository
            .find_share_by_id(context, &share_id)
            .await?
            .filter(|s| s.owner_user_id == owner_user_id)
            .ok_or_else(|| AppstoreServiceError::NotFound("Share not found".to_string()))?;

        share.share_token = generate_share_token();
        share.updated_at = Utc::now();
        self.repository.update_share(context, &share).await?;

        Ok(RegenerateShareTokenResult {
            operation_id: "appstore.userStore.share.refresh",
            share,
        })
    }

    async fn public_user_store_view(
        &self,
        context: &AppstoreRequestContext,
        request: PublicUserStoreViewRequest,
    ) -> AppstoreServiceResult<PublicUserStoreViewResult> {
        let share = self
            .repository
            .find_share_by_token(context, request.share_token.trim())
            .await?
            .ok_or_else(|| AppstoreServiceError::NotFound("Shared store not found".to_string()))?;
        Self::validate_publicly_viewable(&share)?;

        let owner_categories = self
            .repository
            .find_categories_by_owner(context, &share.owner_user_id, None, i32::MAX)
            .await?;
        let categories = Self::categories_in_scope(&share, &owner_categories);

        let category_ids: Vec<String> = categories.iter().map(|c| c.id.clone()).collect();
        let counts = self
            .repository
            .count_items_by_categories(context, &category_ids)
            .await?;

        let summaries: Vec<PublicCategorySummary> = categories
            .iter()
            .map(|category| PublicCategorySummary {
                user_category_id: category.id.clone(),
                name: category.name.clone(),
                icon_media_resource_id: category.icon_media_resource_id.clone(),
                sort_order: category.sort_order,
                item_count: counts
                    .iter()
                    .find(|(id, _)| *id == category.id)
                    .map(|(_, count)| *count)
                    .unwrap_or(0),
            })
            .collect();

        self.repository
            .increment_share_view_count(context, &UserStoreShareId::new(&share.id))
            .await?;

        Ok(PublicUserStoreViewResult {
            operation_id: "appstore.userStore.public.retrieve",
            share_token: share.share_token,
            title: share.title,
            description: share.description,
            owner_user_id: share.owner_user_id,
            categories: summaries,
        })
    }

    async fn public_category_items(
        &self,
        context: &AppstoreRequestContext,
        request: PublicCategoryItemsRequest,
    ) -> AppstoreServiceResult<PublicCategoryItemsResult> {
        let share = self
            .repository
            .find_share_by_token(context, request.share_token.trim())
            .await?
            .ok_or_else(|| AppstoreServiceError::NotFound("Shared store not found".to_string()))?;
        Self::validate_publicly_viewable(&share)?;

        let category_id = UserCategoryId::new(&request.user_category_id);
        let category = self
            .repository
            .find_category_by_id(context, &category_id)
            .await?
            .filter(|c| {
                c.owner_user_id == share.owner_user_id && c.status == UserCategoryStatus::Active
            })
            .ok_or_else(|| AppstoreServiceError::NotFound("Category not found".to_string()))?;

        let visible_owner_categories = self
            .repository
            .find_categories_by_owner(context, &share.owner_user_id, None, i32::MAX)
            .await?;
        let visible = Self::categories_in_scope(&share, &visible_owner_categories);
        if !visible.iter().any(|c| c.id == category.id) {
            return Err(AppstoreServiceError::NotFound(
                "Category not found".to_string(),
            ));
        }

        let limit = request.page_size.unwrap_or(50).clamp(1, 200);
        let mut items = self
            .repository
            .find_items_by_category(context, &category_id, request.cursor.as_deref(), limit + 1)
            .await?;

        let has_more = items.len() > limit as usize;
        let next_cursor = if has_more {
            items
                .get(limit as usize - 1)
                .map(|i| Self::encode_cursor(i.sort_order, &i.id))
        } else {
            None
        };
        items.truncate(limit as usize);

        let listing_ids: Vec<String> = items.iter().map(|i| i.listing_id.clone()).collect();
        let mut cards: Vec<ListingCard> = self
            .listing_cards()?
            .resolve_listing_cards(&context.tenant_id, &listing_ids)
            .await
            .map_err(AppstoreServiceError::Internal)?;
        // Delisted listings silently disappear from the public view.
        cards.retain(|card| listing_ids.contains(&card.listing_id));

        Ok(PublicCategoryItemsResult {
            operation_id: "appstore.userStore.public.items.list",
            user_category_id: category.id,
            category_name: category.name,
            items: cards,
            next_cursor,
            has_more,
        })
    }
}

/// 128-bit unguessable token (32 lowercase hex chars), URL-safe and free of
/// user-identifying segments.
fn generate_share_token() -> String {
    uuid::Uuid::new_v4().simple().to_string()
}
