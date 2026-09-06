use sdkwork_appstore_user_store_service::domain::commands::{
    PublicCategoryItemsRequest, PublicUserStoreViewRequest,
};

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
