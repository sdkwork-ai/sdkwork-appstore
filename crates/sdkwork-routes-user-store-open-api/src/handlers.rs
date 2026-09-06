use crate::mapper;
use sdkwork_appstore_user_store_service::context::AppstoreRequestContext;
use sdkwork_appstore_user_store_service::domain::results::{
    PublicCategoryItemsResult, PublicUserStoreViewResult,
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
        operation_id: "appstore.userStores.public.retrieve",
        handler_name: "user_stores_public_retrieve",
        service_method: "public_user_store_view",
    },
    RouteHandlerPlan {
        operation_id: "appstore.userStores.public.items.list",
        handler_name: "user_stores_public_items_list",
        service_method: "public_category_items",
    },
];

pub fn route_handler_plans() -> &'static [RouteHandlerPlan] {
    ROUTE_HANDLER_PLANS
}

pub async fn user_stores_public_retrieve<S: UserStoreOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    share_token: String,
) -> AppstoreServiceResult<PublicUserStoreViewResult> {
    let request = mapper::request::map_public_user_store_view(share_token);
    service.public_user_store_view(context, request).await
}

pub async fn user_stores_public_items_list<S: UserStoreOperations>(
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
