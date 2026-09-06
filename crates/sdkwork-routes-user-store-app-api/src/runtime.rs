use crate::handlers::{
    categories_list, category_create, category_delete, category_retrieve, category_update,
    item_add, item_remove, items_list, items_reorder, share_create, share_regenerate_token,
    share_revoke, share_update, shares_list,
};
use crate::mapper;
use crate::mapper::response::{
    map_categories_page, map_category_created, map_category_retrieved, map_category_updated,
    map_item_added, map_item_with_card, map_share_created, map_share_regenerated,
    map_share_updated, map_shares_page,
};
use axum::extract::{Extension, Json, Path, Query, State};
use axum::http::StatusCode;
use axum::response::Response;
use axum::routing::{delete, get, patch, post};
use axum::Router;
use sdkwork_appstore_routes_common::http_support::{
    created, map_user_store_error, ok_item, ok_page, to_user_store_context, CursorPageSizeQuery,
};
use sdkwork_appstore_routes_common::AppState;
use sdkwork_web_core::WebRequestContext;

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct CategoryCreateBody {
    name: String,
    description: Option<String>,
    icon_media_resource_id: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct CategoryUpdateBody {
    name: Option<String>,
    description: Option<String>,
    icon_media_resource_id: Option<String>,
    sort_order: Option<i32>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct ItemAddBody {
    listing_id: String,
    note: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct ReorderBody {
    item_ids: Vec<String>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct ShareCreateBody {
    title: String,
    description: Option<String>,
    scope: Option<String>,
    selected_category_ids: Option<Vec<String>>,
    visibility: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct ShareUpdateBody {
    title: Option<String>,
    description: Option<String>,
    scope: Option<String>,
    selected_category_ids: Option<Vec<String>>,
    visibility: Option<String>,
}

pub fn routes() -> Router<AppState> {
    Router::new()
        .route(
            "/app/v3/api/user-store/categories",
            get(categories_list_handler).post(category_create_handler),
        )
        .route(
            "/app/v3/api/user-store/categories/{userCategoryId}",
            get(category_retrieve_handler)
                .patch(category_update_handler)
                .delete(category_delete_handler),
        )
        .route(
            "/app/v3/api/user-store/categories/{userCategoryId}/items",
            get(items_list_handler)
                .post(item_add_handler)
                .patch(items_reorder_handler),
        )
        .route(
            "/app/v3/api/user-store/categories/{userCategoryId}/items/{itemId}",
            delete(item_remove_handler),
        )
        .route(
            "/app/v3/api/user-store/shares",
            get(shares_list_handler).post(share_create_handler),
        )
        .route(
            "/app/v3/api/user-store/shares/{shareId}",
            patch(share_update_handler).delete(share_revoke_handler),
        )
        .route(
            "/app/v3/api/user-store/shares/{shareId}/refresh",
            post(share_regenerate_token_handler),
        )
}

async fn categories_list_handler(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<CursorPageSizeQuery>,
) -> Response {
    let ctx = match to_user_store_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match categories_list(
        &state.user_store_service,
        &ctx,
        query.cursor,
        query.page_size,
    )
    .await
    {
        Ok(result) => {
            let (items, next_cursor, has_more) = map_categories_page(result);
            ok_page(context.as_ref(), items, next_cursor, has_more)
        }
        Err(error) => map_user_store_error(context.as_ref(), error),
    }
}

async fn category_create_handler(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Json(body): Json<CategoryCreateBody>,
) -> Response {
    let ctx = match to_user_store_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    let request = mapper::request::map_create_category(
        body.name,
        body.description,
        body.icon_media_resource_id,
    );
    match category_create(&state.user_store_service, &ctx, request).await {
        Ok(result) => created(context.as_ref(), map_category_created(result)),
        Err(error) => map_user_store_error(context.as_ref(), error),
    }
}

async fn category_retrieve_handler(
    State(state): State<AppState>,
    Path(user_category_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
) -> Response {
    let ctx = match to_user_store_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match category_retrieve(&state.user_store_service, &ctx, user_category_id).await {
        Ok(result) => ok_item(context.as_ref(), map_category_retrieved(result)),
        Err(error) => map_user_store_error(context.as_ref(), error),
    }
}

async fn category_update_handler(
    State(state): State<AppState>,
    Path(user_category_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
    Json(body): Json<CategoryUpdateBody>,
) -> Response {
    let ctx = match to_user_store_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match category_update(
        &state.user_store_service,
        &ctx,
        user_category_id,
        body.name,
        body.description,
        body.icon_media_resource_id,
        body.sort_order,
    )
    .await
    {
        Ok(result) => ok_item(context.as_ref(), map_category_updated(result)),
        Err(error) => map_user_store_error(context.as_ref(), error),
    }
}

async fn category_delete_handler(
    State(state): State<AppState>,
    Path(user_category_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
) -> Response {
    let ctx = match to_user_store_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match category_delete(&state.user_store_service, &ctx, user_category_id).await {
        Ok(_result) => no_content(),
        Err(error) => map_user_store_error(context.as_ref(), error),
    }
}

fn no_content() -> Response {
    Response::builder()
        .status(StatusCode::NO_CONTENT)
        .body(axum::body::Body::empty())
        .expect("static no-content response")
}

async fn items_list_handler(
    State(state): State<AppState>,
    Path(user_category_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<CursorPageSizeQuery>,
) -> Response {
    let ctx = match to_user_store_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match items_list(
        &state.user_store_service,
        &ctx,
        user_category_id,
        query.cursor,
        query.page_size,
    )
    .await
    {
        Ok(result) => ok_page(
            context.as_ref(),
            result
                .items
                .iter()
                .map(map_item_with_card)
                .collect::<Vec<_>>(),
            result.next_cursor,
            result.has_more,
        ),
        Err(error) => map_user_store_error(context.as_ref(), error),
    }
}

async fn item_add_handler(
    State(state): State<AppState>,
    Path(user_category_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
    Json(body): Json<ItemAddBody>,
) -> Response {
    let ctx = match to_user_store_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match item_add(
        &state.user_store_service,
        &ctx,
        user_category_id,
        body.listing_id,
        body.note,
    )
    .await
    {
        Ok(result) => created(context.as_ref(), map_item_added(result)),
        Err(error) => map_user_store_error(context.as_ref(), error),
    }
}

async fn items_reorder_handler(
    State(state): State<AppState>,
    Path(user_category_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
    Json(body): Json<ReorderBody>,
) -> Response {
    let ctx = match to_user_store_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match items_reorder(
        &state.user_store_service,
        &ctx,
        user_category_id,
        body.item_ids,
    )
    .await
    {
        Ok(_result) => ok_item(context.as_ref(), serde_json::json!({ "accepted": true })),
        Err(error) => map_user_store_error(context.as_ref(), error),
    }
}

async fn item_remove_handler(
    State(state): State<AppState>,
    Path((user_category_id, item_id)): Path<(String, String)>,
    context: Option<Extension<WebRequestContext>>,
) -> Response {
    let ctx = match to_user_store_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match item_remove(&state.user_store_service, &ctx, user_category_id, item_id).await {
        Ok(_result) => ok_item(context.as_ref(), serde_json::json!({ "accepted": true })),
        Err(error) => map_user_store_error(context.as_ref(), error),
    }
}

async fn shares_list_handler(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<CursorPageSizeQuery>,
) -> Response {
    let ctx = match to_user_store_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match shares_list(
        &state.user_store_service,
        &ctx,
        query.cursor,
        query.page_size,
    )
    .await
    {
        Ok(result) => {
            let (items, next_cursor, has_more) = map_shares_page(result);
            ok_page(context.as_ref(), items, next_cursor, has_more)
        }
        Err(error) => map_user_store_error(context.as_ref(), error),
    }
}

async fn share_create_handler(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Json(body): Json<ShareCreateBody>,
) -> Response {
    let ctx = match to_user_store_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match share_create(
        &state.user_store_service,
        &ctx,
        body.title,
        body.description,
        body.scope,
        body.selected_category_ids,
        body.visibility,
    )
    .await
    {
        Ok(result) => created(context.as_ref(), map_share_created(result)),
        Err(error) => map_user_store_error(context.as_ref(), error),
    }
}

async fn share_update_handler(
    State(state): State<AppState>,
    Path(share_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
    Json(body): Json<ShareUpdateBody>,
) -> Response {
    let ctx = match to_user_store_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match share_update(
        &state.user_store_service,
        &ctx,
        share_id,
        body.title,
        body.description,
        body.scope,
        body.selected_category_ids,
        body.visibility,
    )
    .await
    {
        Ok(result) => ok_item(context.as_ref(), map_share_updated(result)),
        Err(error) => map_user_store_error(context.as_ref(), error),
    }
}

async fn share_revoke_handler(
    State(state): State<AppState>,
    Path(share_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
) -> Response {
    let ctx = match to_user_store_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match share_revoke(&state.user_store_service, &ctx, share_id).await {
        Ok(_result) => no_content(),
        Err(error) => map_user_store_error(context.as_ref(), error),
    }
}

async fn share_regenerate_token_handler(
    State(state): State<AppState>,
    Path(share_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
) -> Response {
    let ctx = match to_user_store_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match share_regenerate_token(&state.user_store_service, &ctx, share_id).await {
        Ok(result) => ok_item(context.as_ref(), map_share_regenerated(result)),
        Err(error) => map_user_store_error(context.as_ref(), error),
    }
}
