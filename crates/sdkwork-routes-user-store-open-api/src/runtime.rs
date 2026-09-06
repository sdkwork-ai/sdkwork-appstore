use crate::handlers::{user_stores_public_items_list, user_stores_public_retrieve};
use crate::mapper::response::{map_listing_cards, map_public_view};
use axum::extract::{Extension, Path, Query, State};
use axum::response::Response;
use axum::routing::get;
use axum::Router;
use sdkwork_appstore_routes_common::http_support::{
    map_user_store_error, ok_item, ok_page, to_user_store_context_public, CursorPageSizeQuery,
};
use sdkwork_appstore_routes_common::AppState;
use sdkwork_web_core::WebRequestContext;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route(
            "/store/v3/api/user-stores/{shareToken}",
            get(public_user_store_retrieve),
        )
        .route(
            "/store/v3/api/user-stores/{shareToken}/categories/{userCategoryId}/items",
            get(public_user_store_items),
        )
}

async fn public_user_store_retrieve(
    State(state): State<AppState>,
    Path(share_token): Path<String>,
    context: Option<Extension<WebRequestContext>>,
) -> Response {
    let ctx = to_user_store_context_public(context.as_ref());
    match user_stores_public_retrieve(&state.user_store_service, &ctx, share_token).await {
        Ok(result) => ok_item(context.as_ref(), map_public_view(result)),
        Err(error) => map_user_store_error(context.as_ref(), error),
    }
}

async fn public_user_store_items(
    State(state): State<AppState>,
    Path((share_token, user_category_id)): Path<(String, String)>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<CursorPageSizeQuery>,
) -> Response {
    let ctx = to_user_store_context_public(context.as_ref());
    match user_stores_public_items_list(
        &state.user_store_service,
        &ctx,
        share_token,
        user_category_id,
        query.cursor,
        query.page_size,
    )
    .await
    {
        Ok(result) => ok_page(
            context.as_ref(),
            map_listing_cards(&result.items),
            result.next_cursor,
            result.has_more,
        ),
        Err(error) => map_user_store_error(context.as_ref(), error),
    }
}
