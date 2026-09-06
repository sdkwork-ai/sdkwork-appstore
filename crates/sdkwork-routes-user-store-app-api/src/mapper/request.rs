use sdkwork_appstore_user_store_service::domain::commands::{
    AddCategoryItemRequest, CreateCategoryRequest, CreateShareRequest, DeleteCategoryRequest,
    ListCategoriesRequest, ListCategoryItemsRequest, PublicCategoryItemsRequest,
    PublicUserStoreViewRequest, RegenerateShareTokenRequest, RemoveCategoryItemRequest,
    ReorderCategoryItemsRequest, RetrieveCategoryRequest, RevokeShareRequest,
    UpdateShareRequest,
};
use sdkwork_appstore_user_store_service::domain::models::{ShareScope, ShareVisibility};

pub fn map_create_category(
    name: String,
    description: Option<String>,
    icon_media_resource_id: Option<String>,
) -> CreateCategoryRequest {
    let mut request = CreateCategoryRequest::new(name);
    if let Some(description) = description {
        request = request.with_description(description);
    }
    if let Some(icon) = icon_media_resource_id {
        request = request.with_icon_media_resource_id(icon);
    }
    request
}

pub fn map_list_categories(
    cursor: Option<String>,
    page_size: Option<i32>,
) -> ListCategoriesRequest {
    let mut request = ListCategoriesRequest::new();
    if let Some(cursor) = cursor {
        request = request.with_cursor(cursor);
    }
    if let Some(page_size) = page_size {
        request = request.with_page_size(page_size);
    }
    request
}

pub fn map_retrieve_category(user_category_id: String) -> RetrieveCategoryRequest {
    RetrieveCategoryRequest::new(user_category_id)
}

pub fn map_delete_category(user_category_id: String) -> DeleteCategoryRequest {
    DeleteCategoryRequest::new(user_category_id)
}

pub fn map_add_category_item(
    user_category_id: String,
    listing_id: String,
    note: Option<String>,
) -> AddCategoryItemRequest {
    let mut request = AddCategoryItemRequest::new(user_category_id, listing_id);
    request.note = note;
    request
}

pub fn map_remove_category_item(
    user_category_id: String,
    item_id: String,
) -> RemoveCategoryItemRequest {
    RemoveCategoryItemRequest::new(user_category_id, item_id)
}

pub fn map_list_category_items(
    user_category_id: String,
    cursor: Option<String>,
    page_size: Option<i32>,
) -> ListCategoryItemsRequest {
    let mut request = ListCategoryItemsRequest::new(user_category_id);
    if let Some(cursor) = cursor {
        request = request.with_cursor(cursor);
    }
    if let Some(page_size) = page_size {
        request = request.with_page_size(page_size);
    }
    request
}

pub fn map_reorder_items(
    user_category_id: String,
    item_ids: Vec<String>,
) -> ReorderCategoryItemsRequest {
    ReorderCategoryItemsRequest::new(user_category_id, item_ids)
}

pub fn map_create_share(
    title: String,
    description: Option<String>,
    scope: Option<String>,
    selected_category_ids: Option<Vec<String>>,
    visibility: Option<String>,
) -> CreateShareRequest {
    let mut request = CreateShareRequest::new(title);
    request.description = description;
    request.scope = scope.as_deref().and_then(ShareScope::from_str);
    request.selected_category_ids = selected_category_ids;
    request.visibility = visibility.as_deref().and_then(ShareVisibility::from_str);
    request
}

pub fn map_update_share(
    share_id: String,
    title: Option<String>,
    description: Option<String>,
    scope: Option<String>,
    selected_category_ids: Option<Vec<String>>,
    visibility: Option<String>,
) -> UpdateShareRequest {
    let mut request = UpdateShareRequest::new(share_id);
    request.title = title;
    request.description = description;
    request.scope = scope.as_deref().and_then(ShareScope::from_str);
    request.selected_category_ids = selected_category_ids;
    request.visibility = visibility.as_deref().and_then(ShareVisibility::from_str);
    request
}

pub fn map_revoke_share(share_id: String) -> RevokeShareRequest {
    RevokeShareRequest::new(share_id)
}

pub fn map_regenerate_share_token(share_id: String) -> RegenerateShareTokenRequest {
    RegenerateShareTokenRequest::new(share_id)
}

pub fn map_public_user_store_view(share_token: String) -> PublicUserStoreViewRequest {
    PublicUserStoreViewRequest::new(share_token)
}

pub fn map_public_category_items(
    share_token: String,
    user_category_id: String,
    cursor: Option<String>,
    page_size: Option<i32>,
) -> PublicCategoryItemsRequest {
    let mut request = PublicCategoryItemsRequest::new(share_token, user_category_id);
    if let Some(cursor) = cursor {
        request.cursor = Some(cursor);
    }
    if let Some(page_size) = page_size {
        request.page_size = Some(page_size);
    }
    request
}
