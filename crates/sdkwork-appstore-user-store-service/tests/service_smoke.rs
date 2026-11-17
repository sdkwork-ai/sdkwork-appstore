//! Service-level smoke tests with in-memory adapters.

use std::collections::HashMap;
use std::sync::{Arc, Mutex};

use chrono::Utc;

use sdkwork_appstore_user_store_service::context::AppstoreRequestContext;
use sdkwork_appstore_user_store_service::domain::commands::{
    AddCategoryItemRequest, CreateCategoryRequest, CreateShareRequest, DeleteCategoryRequest,
    ListCategoryItemsRequest, RegenerateShareTokenRequest, RemoveCategoryItemRequest,
    ReorderCategoryItemsRequest, RetrieveCategoryRequest, RevokeShareRequest,
    UpdateCategoryRequest, UpdateShareRequest,
};
use sdkwork_appstore_user_store_service::domain::models::{
    ListingCard, UserCategory, UserCategoryItem, UserStoreShare,
};
use sdkwork_appstore_user_store_service::error::AppstoreServiceError;
use sdkwork_appstore_user_store_service::ports::provider::ListingCardProviderPort;
use sdkwork_appstore_user_store_service::ports::repository::UserStoreRepositoryPort;
use sdkwork_appstore_user_store_service::service::user_store_service::{
    UserStoreOperations, UserStoreService,
};

fn test_context(tenant: &str, user: &str) -> AppstoreRequestContext {
    AppstoreRequestContext {
        tenant_id: tenant.to_string(),
        organization_id: "0".to_string(),
        user_id: user.to_string(),
        request_id: "req-1".to_string(),
        trace_id: None,
        permission_scopes: vec![],
    }
}

#[derive(Default, Clone)]
struct InMemoryState {
    categories: HashMap<String, UserCategory>,
    items: HashMap<String, UserCategoryItem>,
    shares: HashMap<String, UserStoreShare>,
}

#[derive(Default)]
struct InMemoryRepository {
    state: Mutex<InMemoryState>,
}

impl InMemoryRepository {
    fn lock(&self) -> std::sync::MutexGuard<'_, InMemoryState> {
        self.state.lock().unwrap()
    }

    /// Mirrors the SQL owner predicate: an item belongs to the caller only
    /// through the category that owns it.
    fn item_owned_by(
        state: &InMemoryState,
        item: &UserCategoryItem,
        tenant_id: &str,
        owner_user_id: &str,
    ) -> bool {
        state
            .categories
            .get(&item.user_category_id)
            .map(|category| {
                category.tenant_id == tenant_id && category.owner_user_id == owner_user_id
            })
            .unwrap_or(false)
    }
}

#[async_trait::async_trait]
impl UserStoreRepositoryPort for InMemoryRepository {
    async fn find_categories_by_owner(
        &self,
        context: &AppstoreRequestContext,
        owner_user_id: &str,
        cursor: Option<&str>,
        limit: i32,
    ) -> Result<Vec<UserCategory>, AppstoreServiceError> {
        let state = self.lock();
        let mut categories: Vec<UserCategory> = state
            .categories
            .values()
            .filter(|c| c.tenant_id == context.tenant_id && c.owner_user_id == owner_user_id)
            .cloned()
            .collect();
        categories.sort_by(|a, b| (a.sort_order, &a.id).cmp(&(b.sort_order, &b.id)));
        if let Some(cursor) = cursor {
            let (order, id) = cursor.split_once(':').unwrap();
            let order: i32 = order.parse().unwrap();
            categories.retain(|c| (c.sort_order, c.id.clone()) > (order, id.to_string()));
        }
        categories.truncate(limit as usize);
        Ok(categories)
    }

    async fn find_category_by_id(
        &self,
        context: &AppstoreRequestContext,
        category_id: &sdkwork_appstore_user_store_service::domain::models::UserCategoryId,
        owner_user_id: &str,
    ) -> Result<Option<UserCategory>, AppstoreServiceError> {
        Ok(self
            .lock()
            .categories
            .get(category_id.as_str())
            .filter(|c| c.tenant_id == context.tenant_id && c.owner_user_id == owner_user_id)
            .cloned())
    }

    async fn find_category_by_name(
        &self,
        context: &AppstoreRequestContext,
        name: &str,
    ) -> Result<Option<UserCategory>, AppstoreServiceError> {
        Ok(self
            .lock()
            .categories
            .values()
            .find(|c| {
                c.tenant_id == context.tenant_id
                    && c.owner_user_id == context.user_id
                    && c.name == name
            })
            .cloned())
    }

    async fn find_categories_by_ids(
        &self,
        context: &AppstoreRequestContext,
        category_ids: &[String],
        owner_user_id: &str,
    ) -> Result<Vec<UserCategory>, AppstoreServiceError> {
        let state = self.lock();
        Ok(category_ids
            .iter()
            .filter_map(|id| state.categories.get(id).cloned())
            .filter(|c| c.tenant_id == context.tenant_id && c.owner_user_id == owner_user_id)
            .collect())
    }

    async fn count_categories_by_owner(
        &self,
        context: &AppstoreRequestContext,
        owner_user_id: &str,
    ) -> Result<i64, AppstoreServiceError> {
        Ok(self
            .lock()
            .categories
            .values()
            .filter(|c| c.tenant_id == context.tenant_id && c.owner_user_id == owner_user_id)
            .count() as i64)
    }

    async fn insert_category(
        &self,
        _context: &AppstoreRequestContext,
        category: &UserCategory,
    ) -> Result<(), AppstoreServiceError> {
        self.lock()
            .categories
            .insert(category.id.clone(), category.clone());
        Ok(())
    }

    async fn update_category(
        &self,
        context: &AppstoreRequestContext,
        category: &UserCategory,
    ) -> Result<(), AppstoreServiceError> {
        let mut state = self.lock();
        let owned = state
            .categories
            .get(&category.id)
            .map(|existing| {
                existing.tenant_id == context.tenant_id && existing.owner_user_id == context.user_id
            })
            .unwrap_or(false);
        if owned {
            state
                .categories
                .insert(category.id.clone(), category.clone());
        }
        Ok(())
    }

    async fn delete_category(
        &self,
        context: &AppstoreRequestContext,
        category_id: &sdkwork_appstore_user_store_service::domain::models::UserCategoryId,
    ) -> Result<(), AppstoreServiceError> {
        let mut state = self.lock();
        let owned = state
            .categories
            .get(category_id.as_str())
            .map(|category| {
                category.tenant_id == context.tenant_id && category.owner_user_id == context.user_id
            })
            .unwrap_or(false);
        if owned {
            state.items.retain(|_, item| {
                !(item.tenant_id == context.tenant_id
                    && item.user_category_id == category_id.as_str())
            });
            state.categories.remove(category_id.as_str());
        }
        Ok(())
    }

    async fn find_items_by_category(
        &self,
        context: &AppstoreRequestContext,
        category_id: &sdkwork_appstore_user_store_service::domain::models::UserCategoryId,
        owner_user_id: &str,
        cursor: Option<&str>,
        limit: i32,
    ) -> Result<Vec<UserCategoryItem>, AppstoreServiceError> {
        let state = self.lock();
        let mut items: Vec<UserCategoryItem> = state
            .items
            .values()
            .filter(|i| {
                i.tenant_id == context.tenant_id
                    && i.user_category_id == category_id.as_str()
                    && Self::item_owned_by(&state, i, &context.tenant_id, owner_user_id)
            })
            .cloned()
            .collect();
        items.sort_by(|a, b| (a.sort_order, &a.id).cmp(&(b.sort_order, &b.id)));
        if let Some(cursor) = cursor {
            let (order, id) = cursor.split_once(':').unwrap();
            let order: i32 = order.parse().unwrap();
            items.retain(|i| (i.sort_order, i.id.clone()) > (order, id.to_string()));
        }
        items.truncate(limit as usize);
        Ok(items)
    }

    async fn find_item_by_id(
        &self,
        context: &AppstoreRequestContext,
        item_id: &sdkwork_appstore_user_store_service::domain::models::UserCategoryItemId,
        category_id: &sdkwork_appstore_user_store_service::domain::models::UserCategoryId,
        owner_user_id: &str,
    ) -> Result<Option<UserCategoryItem>, AppstoreServiceError> {
        let state = self.lock();
        Ok(state
            .items
            .get(item_id.as_str())
            .filter(|i| {
                i.tenant_id == context.tenant_id
                    && i.user_category_id == category_id.as_str()
                    && Self::item_owned_by(&state, i, &context.tenant_id, owner_user_id)
            })
            .cloned())
    }

    async fn find_item_by_category_and_listing(
        &self,
        context: &AppstoreRequestContext,
        category_id: &sdkwork_appstore_user_store_service::domain::models::UserCategoryId,
        listing_id: &str,
        owner_user_id: &str,
    ) -> Result<Option<UserCategoryItem>, AppstoreServiceError> {
        let state = self.lock();
        Ok(state
            .items
            .values()
            .find(|i| {
                i.tenant_id == context.tenant_id
                    && i.user_category_id == category_id.as_str()
                    && i.listing_id == listing_id
                    && Self::item_owned_by(&state, i, &context.tenant_id, owner_user_id)
            })
            .cloned())
    }

    async fn count_items_by_categories(
        &self,
        context: &AppstoreRequestContext,
        category_ids: &[String],
        owner_user_id: &str,
    ) -> Result<Vec<(String, i64)>, AppstoreServiceError> {
        let state = self.lock();
        Ok(category_ids
            .iter()
            .map(|id| {
                let count = state
                    .items
                    .values()
                    .filter(|i| {
                        i.tenant_id == context.tenant_id
                            && &i.user_category_id == id
                            && Self::item_owned_by(&state, i, &context.tenant_id, owner_user_id)
                    })
                    .count() as i64;
                (id.clone(), count)
            })
            .collect())
    }

    async fn insert_item(
        &self,
        _context: &AppstoreRequestContext,
        item: &UserCategoryItem,
    ) -> Result<(), AppstoreServiceError> {
        self.lock().items.insert(item.id.clone(), item.clone());
        Ok(())
    }

    async fn update_item(
        &self,
        context: &AppstoreRequestContext,
        item: &UserCategoryItem,
    ) -> Result<(), AppstoreServiceError> {
        let mut state = self.lock();
        let owned = state
            .items
            .get(&item.id)
            .map(|existing| {
                Self::item_owned_by(&state, existing, &context.tenant_id, &context.user_id)
            })
            .unwrap_or(false);
        if owned {
            state.items.insert(item.id.clone(), item.clone());
        }
        Ok(())
    }

    async fn delete_item(
        &self,
        context: &AppstoreRequestContext,
        item_id: &sdkwork_appstore_user_store_service::domain::models::UserCategoryItemId,
    ) -> Result<(), AppstoreServiceError> {
        let mut state = self.lock();
        let owned = state
            .items
            .get(item_id.as_str())
            .map(|existing| {
                Self::item_owned_by(&state, existing, &context.tenant_id, &context.user_id)
            })
            .unwrap_or(false);
        if owned {
            state.items.remove(item_id.as_str());
        }
        Ok(())
    }

    async fn reorder_items(
        &self,
        context: &AppstoreRequestContext,
        category_id: &sdkwork_appstore_user_store_service::domain::models::UserCategoryId,
        ordered_item_ids: &[String],
    ) -> Result<(), AppstoreServiceError> {
        let mut state = self.lock();
        for (position, item_id) in ordered_item_ids.iter().enumerate() {
            let owned = state
                .items
                .get(item_id)
                .map(|item| {
                    item.user_category_id == category_id.as_str()
                        && Self::item_owned_by(&state, item, &context.tenant_id, &context.user_id)
                })
                .unwrap_or(false);
            if !owned {
                continue;
            }
            if let Some(item) = state.items.get_mut(item_id) {
                item.sort_order = position as i32;
            }
        }
        Ok(())
    }

    async fn find_share_by_token(
        &self,
        context: &AppstoreRequestContext,
        share_token: &str,
    ) -> Result<Option<UserStoreShare>, AppstoreServiceError> {
        Ok(self
            .lock()
            .shares
            .values()
            .find(|s| s.tenant_id == context.tenant_id && s.share_token == share_token)
            .cloned())
    }

    async fn find_share_by_id(
        &self,
        context: &AppstoreRequestContext,
        share_id: &sdkwork_appstore_user_store_service::domain::models::UserStoreShareId,
        owner_user_id: &str,
    ) -> Result<Option<UserStoreShare>, AppstoreServiceError> {
        Ok(self
            .lock()
            .shares
            .get(share_id.as_str())
            .filter(|s| s.tenant_id == context.tenant_id && s.owner_user_id == owner_user_id)
            .cloned())
    }

    async fn find_shares_by_owner(
        &self,
        context: &AppstoreRequestContext,
        _cursor: Option<&str>,
        limit: i32,
    ) -> Result<Vec<UserStoreShare>, AppstoreServiceError> {
        let state = self.lock();
        let mut shares: Vec<UserStoreShare> = state
            .shares
            .values()
            .filter(|s| s.tenant_id == context.tenant_id && s.owner_user_id == context.user_id)
            .cloned()
            .collect();
        shares.sort_by(|a, b| a.id.cmp(&b.id));
        shares.truncate(limit as usize);
        Ok(shares)
    }

    async fn count_shares_by_owner(
        &self,
        context: &AppstoreRequestContext,
    ) -> Result<i64, AppstoreServiceError> {
        Ok(self
            .lock()
            .shares
            .values()
            .filter(|s| s.tenant_id == context.tenant_id && s.owner_user_id == context.user_id)
            .count() as i64)
    }

    async fn insert_share(
        &self,
        _context: &AppstoreRequestContext,
        share: &UserStoreShare,
    ) -> Result<(), AppstoreServiceError> {
        self.lock().shares.insert(share.id.clone(), share.clone());
        Ok(())
    }

    async fn update_share(
        &self,
        context: &AppstoreRequestContext,
        share: &UserStoreShare,
    ) -> Result<(), AppstoreServiceError> {
        let mut state = self.lock();
        let owned = state
            .shares
            .get(&share.id)
            .map(|existing| {
                existing.tenant_id == context.tenant_id && existing.owner_user_id == context.user_id
            })
            .unwrap_or(false);
        if owned {
            state.shares.insert(share.id.clone(), share.clone());
        }
        Ok(())
    }

    async fn increment_share_view_count(
        &self,
        context: &AppstoreRequestContext,
        share_id: &sdkwork_appstore_user_store_service::domain::models::UserStoreShareId,
    ) -> Result<(), AppstoreServiceError> {
        let mut state = self.lock();
        if let Some(share) = state
            .shares
            .get_mut(share_id.as_str())
            .filter(|s| s.tenant_id == context.tenant_id)
        {
            share.view_count += 1;
        }
        Ok(())
    }
}

struct StaticListingCardProvider;

#[async_trait::async_trait]
impl ListingCardProviderPort for StaticListingCardProvider {
    async fn resolve_listing_card(
        &self,
        _tenant_id: &str,
        listing_id: &str,
    ) -> Result<Option<ListingCard>, String> {
        if listing_id == "listing-1" {
            Ok(Some(ListingCard {
                listing_id: listing_id.to_string(),
                display_name: "Demo App".to_string(),
                subtitle: None,
                icon_media_resource_id: None,
                average_rating: Some("4.5".to_string()),
                download_count: 1000,
            }))
        } else {
            Ok(None)
        }
    }

    async fn resolve_listing_cards(
        &self,
        tenant_id: &str,
        listing_ids: &[String],
    ) -> Result<Vec<ListingCard>, String> {
        let mut cards = Vec::new();
        for id in listing_ids {
            if let Some(card) = self.resolve_listing_card(tenant_id, id).await? {
                cards.push(card);
            }
        }
        Ok(cards)
    }
}

fn service() -> UserStoreService<InMemoryRepository> {
    UserStoreService::new(InMemoryRepository::default())
        .with_listing_cards(Arc::new(StaticListingCardProvider))
}

#[tokio::test]
async fn category_create_list_and_add_item() {
    let service = service();
    let ctx = test_context("tenant-1", "user-1");

    let created = service
        .category_create(&ctx, CreateCategoryRequest::new("我的工具"))
        .await
        .unwrap();
    assert_eq!(created.category.name, "我的工具");
    assert_eq!(created.category.owner_user_id, "user-1");

    let list = service
        .categories_list(&ctx, Default::default())
        .await
        .unwrap();
    assert_eq!(list.items.len(), 1);
    assert_eq!(list.item_counts.len(), 1);
    assert_eq!(list.item_counts[0].count, 0);

    let added = service
        .item_add(
            &ctx,
            AddCategoryItemRequest::new(&created.category.id, "listing-1"),
        )
        .await
        .unwrap();
    assert_eq!(added.item.listing_id, "listing-1");
    assert!(added.listing_card.is_some());

    // Duplicate add is rejected.
    let duplicate = service
        .item_add(
            &ctx,
            AddCategoryItemRequest::new(&created.category.id, "listing-1"),
        )
        .await;
    assert!(matches!(
        duplicate,
        Err(AppstoreServiceError::AlreadyExists(_))
    ));

    // Unknown listing is rejected.
    let missing = service
        .item_add(
            &ctx,
            AddCategoryItemRequest::new(&created.category.id, "listing-404"),
        )
        .await;
    assert!(matches!(missing, Err(AppstoreServiceError::NotFound(_))));
}

#[tokio::test]
async fn duplicate_category_name_rejected() {
    let service = service();
    let ctx = test_context("tenant-1", "user-1");
    service
        .category_create(&ctx, CreateCategoryRequest::new("dev"))
        .await
        .unwrap();
    let second = service
        .category_create(&ctx, CreateCategoryRequest::new("dev"))
        .await;
    assert!(matches!(
        second,
        Err(AppstoreServiceError::AlreadyExists(_))
    ));
}

#[tokio::test]
async fn cross_user_access_rejected() {
    let service = service();
    let owner = test_context("tenant-1", "user-1");
    let stranger = test_context("tenant-1", "user-2");

    let created = service
        .category_create(&owner, CreateCategoryRequest::new("private"))
        .await
        .unwrap();

    let result = service
        .category_retrieve(
            &stranger,
            RetrieveCategoryRequest::new(&created.category.id),
        )
        .await;
    assert!(matches!(result, Err(AppstoreServiceError::NotFound(_))));
}

#[tokio::test]
async fn public_share_flow() {
    let service = service();
    let owner = test_context("tenant-1", "user-1");
    let visitor = test_context("tenant-1", "");

    let category = service
        .category_create(&owner, CreateCategoryRequest::new("shared"))
        .await
        .unwrap();
    service
        .item_add(
            &owner,
            AddCategoryItemRequest::new(&category.category.id, "listing-1"),
        )
        .await
        .unwrap();

    let share = service
        .share_create(&owner, CreateShareRequest::new("My Appstore"))
        .await
        .unwrap();
    assert_eq!(share.share.share_token.len(), 32);

    let view = service
        .public_user_store_view(
            &visitor,
            sdkwork_appstore_user_store_service::domain::commands::PublicUserStoreViewRequest::new(
                &share.share.share_token,
            ),
        )
        .await
        .unwrap();
    assert_eq!(view.categories.len(), 1);
    assert_eq!(view.categories[0].item_count, 1);

    let items = service
        .public_category_items(
            &visitor,
            sdkwork_appstore_user_store_service::domain::commands::PublicCategoryItemsRequest::new(
                &share.share.share_token,
                &category.category.id,
            ),
        )
        .await
        .unwrap();
    assert_eq!(items.items.len(), 1);
    assert_eq!(items.items[0].display_name, "Demo App");

    // Anonymous visitor cannot see owner-scoped management listings.
    let anonymous_list = service.categories_list(&visitor, Default::default()).await;
    assert!(anonymous_list.is_err());

    let _ = Utc::now();
}

#[tokio::test]
async fn unauthenticated_management_call_rejected() {
    let service = service();
    let anonymous = test_context("tenant-1", "");
    let result = service
        .category_create(&anonymous, CreateCategoryRequest::new("nope"))
        .await;
    assert!(matches!(
        result,
        Err(AppstoreServiceError::PermissionDenied(_))
    ));
}

#[tokio::test]
async fn cross_user_category_mutation_rejected() {
    let service = service();
    let owner = test_context("tenant-1", "user-1");
    let stranger = test_context("tenant-1", "user-2");

    let created = service
        .category_create(&owner, CreateCategoryRequest::new("private"))
        .await
        .unwrap();
    let added = service
        .item_add(
            &owner,
            AddCategoryItemRequest::new(&created.category.id, "listing-1"),
        )
        .await
        .unwrap();

    // Ownership is part of the query, so every management path resolves the
    // foreign category to not-found instead of touching the owner's rows.
    let mut update_request = UpdateCategoryRequest::new(&created.category.id);
    update_request.name = Some("hijacked".to_string());
    let update = service.category_update(&stranger, update_request).await;
    assert!(matches!(update, Err(AppstoreServiceError::NotFound(_))));

    let delete = service
        .category_delete(&stranger, DeleteCategoryRequest::new(&created.category.id))
        .await;
    assert!(matches!(delete, Err(AppstoreServiceError::NotFound(_))));

    let list = service
        .items_list(
            &stranger,
            ListCategoryItemsRequest::new(&created.category.id),
        )
        .await;
    assert!(matches!(list, Err(AppstoreServiceError::NotFound(_))));

    let add = service
        .item_add(
            &stranger,
            AddCategoryItemRequest::new(&created.category.id, "listing-1"),
        )
        .await;
    assert!(matches!(add, Err(AppstoreServiceError::NotFound(_))));

    let remove = service
        .item_remove(
            &stranger,
            RemoveCategoryItemRequest::new(&created.category.id, &added.item.id),
        )
        .await;
    assert!(matches!(remove, Err(AppstoreServiceError::NotFound(_))));

    let reorder = service
        .items_reorder(
            &stranger,
            ReorderCategoryItemsRequest::new(&created.category.id, vec![added.item.id.clone()]),
        )
        .await;
    assert!(matches!(reorder, Err(AppstoreServiceError::NotFound(_))));

    // The owner's data is untouched by the rejected attempts.
    let owner_categories = service
        .categories_list(&owner, Default::default())
        .await
        .unwrap();
    assert_eq!(owner_categories.items.len(), 1);
    assert_eq!(owner_categories.items[0].name, "private");

    let owner_items = service
        .items_list(&owner, ListCategoryItemsRequest::new(&created.category.id))
        .await
        .unwrap();
    assert_eq!(owner_items.items.len(), 1);
    assert_eq!(owner_items.items[0].item.id, added.item.id);
}

#[tokio::test]
async fn cross_user_share_mutation_rejected() {
    let service = service();
    let owner = test_context("tenant-1", "user-1");
    let stranger = test_context("tenant-1", "user-2");
    let visitor = test_context("tenant-1", "");

    let share = service
        .share_create(&owner, CreateShareRequest::new("My Appstore"))
        .await
        .unwrap();
    let original_token = share.share.share_token.clone();

    let mut update_request = UpdateShareRequest::new(&share.share.id);
    update_request.title = Some("hijacked".to_string());
    let update = service.share_update(&stranger, update_request).await;
    assert!(matches!(update, Err(AppstoreServiceError::NotFound(_))));

    let revoke = service
        .share_revoke(&stranger, RevokeShareRequest::new(&share.share.id))
        .await;
    assert!(matches!(revoke, Err(AppstoreServiceError::NotFound(_))));

    let regenerate = service
        .share_regenerate_token(&stranger, RegenerateShareTokenRequest::new(&share.share.id))
        .await;
    assert!(matches!(regenerate, Err(AppstoreServiceError::NotFound(_))));

    // The owner still holds one active share with its original token, and the
    // public view stays readable through that token alone.
    let owner_shares = service.shares_list(&owner, None, None).await.unwrap();
    assert_eq!(owner_shares.items.len(), 1);
    assert_eq!(owner_shares.items[0].title, "My Appstore");
    assert_eq!(owner_shares.items[0].share_token, original_token);

    let view = service
        .public_user_store_view(
            &visitor,
            sdkwork_appstore_user_store_service::domain::commands::PublicUserStoreViewRequest::new(
                &original_token,
            ),
        )
        .await
        .unwrap();
    assert_eq!(view.share_token, original_token);
}
