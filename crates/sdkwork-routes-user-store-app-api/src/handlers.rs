use crate::mapper;
use sdkwork_appstore_user_store_service::context::AppstoreRequestContext;
use sdkwork_appstore_user_store_service::domain::commands::{
    CreateCategoryRequest, PublicUserStoreViewRequest,
};
use sdkwork_appstore_user_store_service::domain::results::{
    AddCategoryItemResult, CategoriesListResult, CategoryCreateResult, CategoryDeleteResult,
    CategoryItemsListResult, CategoryRetrieveResult, CategoryUpdateResult, ItemRemoveResult,
    ItemsReorderResult, PublicCategoryItemsResult, PublicUserStoreViewResult,
    RegenerateShareTokenResult, ShareCreateResult, ShareRevokeResult, ShareUpdateResult,
    SharesListResult,
};
use sdkwork_appstore_user_store_service::error::AppstoreServiceResult;
use sdkwork_appstore_user_store_service::UserStoreOperations;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct RouteHandlerPlan {
    pub operation_id: &'static str,
    pub handler_name: &'static str,
    pub service_method: &'static str,
}

pub const ROUTE_HANDLER_PLANS: &[RouteHandlerPlan] = &[
    RouteHandlerPlan {
        operation_id: "appstore.userStore.category.list",
        handler_name: "user_store_categories_list",
        service_method: "categories_list",
    },
    RouteHandlerPlan {
        operation_id: "appstore.userStore.category.create",
        handler_name: "user_store_category_create",
        service_method: "category_create",
    },
    RouteHandlerPlan {
        operation_id: "appstore.userStore.category.retrieve",
        handler_name: "user_store_category_retrieve",
        service_method: "category_retrieve",
    },
    RouteHandlerPlan {
        operation_id: "appstore.userStore.category.update",
        handler_name: "user_store_category_update",
        service_method: "category_update",
    },
    RouteHandlerPlan {
        operation_id: "appstore.userStore.category.delete",
        handler_name: "user_store_category_delete",
        service_method: "category_delete",
    },
    RouteHandlerPlan {
        operation_id: "appstore.userStore.item.list",
        handler_name: "user_store_items_list",
        service_method: "items_list",
    },
    RouteHandlerPlan {
        operation_id: "appstore.userStore.item.create",
        handler_name: "user_store_item_create",
        service_method: "item_create",
    },
    RouteHandlerPlan {
        operation_id: "appstore.userStore.item.update",
        handler_name: "user_store_items_update",
        service_method: "items_update",
    },
    RouteHandlerPlan {
        operation_id: "appstore.userStore.item.delete",
        handler_name: "user_store_item_delete",
        service_method: "item_delete",
    },
    RouteHandlerPlan {
        operation_id: "appstore.userStore.share.list",
        handler_name: "user_store_shares_list",
        service_method: "shares_list",
    },
    RouteHandlerPlan {
        operation_id: "appstore.userStore.share.create",
        handler_name: "user_store_share_create",
        service_method: "share_create",
    },
    RouteHandlerPlan {
        operation_id: "appstore.userStore.share.update",
        handler_name: "user_store_share_update",
        service_method: "share_update",
    },
    RouteHandlerPlan {
        operation_id: "appstore.userStore.share.delete",
        handler_name: "user_store_share_delete",
        service_method: "share_delete",
    },
    RouteHandlerPlan {
        operation_id: "appstore.userStore.share.refresh",
        handler_name: "user_store_share_refresh",
        service_method: "share_refresh",
    },
];

pub fn route_handler_plans() -> &'static [RouteHandlerPlan] {
    ROUTE_HANDLER_PLANS
}

pub async fn categories_list<S: UserStoreOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    cursor: Option<String>,
    page_size: Option<i32>,
) -> AppstoreServiceResult<CategoriesListResult> {
    let request = mapper::request::map_list_categories(cursor, page_size);
    service.categories_list(context, request).await
}

pub async fn category_create<S: UserStoreOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    request: CreateCategoryRequest,
) -> AppstoreServiceResult<CategoryCreateResult> {
    service.category_create(context, request).await
}

pub async fn category_retrieve<S: UserStoreOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    user_category_id: String,
) -> AppstoreServiceResult<CategoryRetrieveResult> {
    let request = mapper::request::map_retrieve_category(user_category_id);
    service.category_retrieve(context, request).await
}

pub async fn category_update<S: UserStoreOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    user_category_id: String,
    name: Option<String>,
    description: Option<String>,
    icon_media_resource_id: Option<String>,
    sort_order: Option<i32>,
) -> AppstoreServiceResult<CategoryUpdateResult> {
    let mut request =
        sdkwork_appstore_user_store_service::domain::commands::UpdateCategoryRequest::new(
            user_category_id,
        );
    request.name = name;
    request.description = description;
    request.icon_media_resource_id = icon_media_resource_id;
    request.sort_order = sort_order;
    service.category_update(context, request).await
}

pub async fn category_delete<S: UserStoreOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    user_category_id: String,
) -> AppstoreServiceResult<CategoryDeleteResult> {
    let request = mapper::request::map_delete_category(user_category_id);
    service.category_delete(context, request).await
}

pub async fn items_list<S: UserStoreOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    user_category_id: String,
    cursor: Option<String>,
    page_size: Option<i32>,
) -> AppstoreServiceResult<CategoryItemsListResult> {
    let request = mapper::request::map_list_category_items(user_category_id, cursor, page_size);
    service.items_list(context, request).await
}

pub async fn item_add<S: UserStoreOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    user_category_id: String,
    listing_id: String,
    note: Option<String>,
) -> AppstoreServiceResult<AddCategoryItemResult> {
    let request = mapper::request::map_add_category_item(user_category_id, listing_id, note);
    service.item_add(context, request).await
}

pub async fn items_reorder<S: UserStoreOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    user_category_id: String,
    item_ids: Vec<String>,
) -> AppstoreServiceResult<ItemsReorderResult> {
    let request = mapper::request::map_reorder_items(user_category_id, item_ids);
    service.items_reorder(context, request).await
}

pub async fn item_remove<S: UserStoreOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    user_category_id: String,
    item_id: String,
) -> AppstoreServiceResult<ItemRemoveResult> {
    let request = mapper::request::map_remove_category_item(user_category_id, item_id);
    service.item_remove(context, request).await
}

pub async fn shares_list<S: UserStoreOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    cursor: Option<String>,
    page_size: Option<i32>,
) -> AppstoreServiceResult<SharesListResult> {
    service.shares_list(context, cursor, page_size).await
}

pub async fn share_create<S: UserStoreOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    title: String,
    description: Option<String>,
    scope: Option<String>,
    selected_category_ids: Option<Vec<String>>,
    visibility: Option<String>,
) -> AppstoreServiceResult<ShareCreateResult> {
    let request = mapper::request::map_create_share(
        title,
        description,
        scope,
        selected_category_ids,
        visibility,
    );
    service.share_create(context, request).await
}

pub async fn share_update<S: UserStoreOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    share_id: String,
    title: Option<String>,
    description: Option<String>,
    scope: Option<String>,
    selected_category_ids: Option<Vec<String>>,
    visibility: Option<String>,
) -> AppstoreServiceResult<ShareUpdateResult> {
    let request = mapper::request::map_update_share(
        share_id,
        title,
        description,
        scope,
        selected_category_ids,
        visibility,
    );
    service.share_update(context, request).await
}

pub async fn share_revoke<S: UserStoreOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    share_id: String,
) -> AppstoreServiceResult<ShareRevokeResult> {
    let request = mapper::request::map_revoke_share(share_id);
    service.share_revoke(context, request).await
}

pub async fn share_regenerate_token<S: UserStoreOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    share_id: String,
) -> AppstoreServiceResult<RegenerateShareTokenResult> {
    let request = mapper::request::map_regenerate_share_token(share_id);
    service.share_regenerate_token(context, request).await
}

pub async fn public_user_store_view<S: UserStoreOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    request: PublicUserStoreViewRequest,
) -> AppstoreServiceResult<PublicUserStoreViewResult> {
    service.public_user_store_view(context, request).await
}

pub async fn public_category_items<S: UserStoreOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    share_token: String,
    user_category_id: String,
    cursor: Option<String>,
    page_size: Option<i32>,
) -> AppstoreServiceResult<PublicCategoryItemsResult> {
    let request = mapper::request::map_public_category_items(
        share_token,
        user_category_id,
        cursor,
        page_size,
    );
    service.public_category_items(context, request).await
}
