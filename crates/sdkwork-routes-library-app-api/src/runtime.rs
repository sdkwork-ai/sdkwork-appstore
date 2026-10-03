use crate::handlers::{
    download_grants_consume, download_grants_create, library_install, library_items_list,
    library_items_retrieve, library_uninstall, library_updates_check, wishlist_items_add,
    wishlist_items_list, wishlist_items_remove,
};
use crate::mapper::response::{
    map_consumed_download_grant, map_download_grant, map_library_install, map_library_item,
    map_update_available, map_wishlist_item,
};
use axum::extract::{Extension, Json, Path, Query, State};
use axum::response::Response;
use axum::routing::{delete, get, post};
use axum::Router;
use sdkwork_appstore_library_service::domain::models::UpdateCheckItem;
use sdkwork_web_core::WebRequestContext;

use sdkwork_appstore_routes_common::http_support::{
    created, map_library_error, ok_item, ok_page, to_library_context, CursorPageSizeQuery,
};
use sdkwork_appstore_routes_common::AppState;

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct LibraryInstallBody {
    listing_id: String,
    platform: String,
    architecture: Option<String>,
    device_id: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct LibraryUninstallBody {
    library_item_id: String,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct LibraryUpdatesCheckBody {
    items: Vec<UpdateCheckItem>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct WishlistAddBody {
    listing_id: String,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct DownloadGrantCreateBody {
    artifact_id: String,
}

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/app/v3/api/library/items", get(library_items_list_handler))
        .route(
            "/app/v3/api/library/items/{libraryItemId}",
            get(library_item_retrieve),
        )
        .route("/app/v3/api/library/install", post(library_install_handler))
        .route(
            "/app/v3/api/library/uninstall",
            post(library_uninstall_handler),
        )
        .route(
            "/app/v3/api/library/updates/check",
            post(library_updates_check_handler),
        )
        .route(
            "/app/v3/api/wishlist/items",
            get(wishlist_items_list_handler).post(wishlist_add),
        )
        .route(
            "/app/v3/api/wishlist/items/{listingId}",
            delete(wishlist_remove),
        )
        .route("/app/v3/api/download_grants", post(download_grant_create))
        .route(
            "/app/v3/api/download_grants/{grantId}/consume",
            post(download_grant_consume_handler),
        )
}

async fn library_items_list_handler(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<CursorPageSizeQuery>,
) -> Response {
    let ctx = match to_library_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match library_items_list(&state.library_service, &ctx, query.cursor, query.page_size).await {
        Ok(result) => ok_page(
            context.as_ref(),
            result
                .items
                .into_iter()
                .map(map_library_item)
                .collect::<Vec<_>>(),
            result.next_cursor,
            result.has_more,
        ),
        Err(error) => map_library_error(context.as_ref(), error),
    }
}

async fn library_item_retrieve(
    State(state): State<AppState>,
    Path(library_item_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
) -> Response {
    let ctx = match to_library_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match library_items_retrieve(&state.library_service, &ctx, library_item_id).await {
        Ok(result) => ok_item(context.as_ref(), map_library_item(result.item)),
        Err(error) => map_library_error(context.as_ref(), error),
    }
}

async fn library_install_handler(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Json(body): Json<LibraryInstallBody>,
) -> Response {
    let ctx = match to_library_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match library_install(
        &state.library_service,
        &ctx,
        body.listing_id,
        body.platform,
        body.architecture,
        body.device_id,
    )
    .await
    {
        Ok(result) => ok_item(context.as_ref(), map_library_install(result)),
        Err(error) => map_library_error(context.as_ref(), error),
    }
}

async fn library_uninstall_handler(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Json(body): Json<LibraryUninstallBody>,
) -> Response {
    let ctx = match to_library_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match library_uninstall(&state.library_service, &ctx, body.library_item_id).await {
        Ok(_result) => ok_item(context.as_ref(), serde_json::json!({ "accepted": true })),
        Err(error) => map_library_error(context.as_ref(), error),
    }
}

async fn library_updates_check_handler(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Json(body): Json<LibraryUpdatesCheckBody>,
) -> Response {
    let ctx = match to_library_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match library_updates_check(&state.library_service, &ctx, body.items).await {
        Ok(result) => ok_page(
            context.as_ref(),
            result
                .updates
                .into_iter()
                .map(map_update_available)
                .collect::<Vec<_>>(),
            None,
            false,
        ),
        Err(error) => map_library_error(context.as_ref(), error),
    }
}

async fn wishlist_items_list_handler(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<CursorPageSizeQuery>,
) -> Response {
    let ctx = match to_library_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match wishlist_items_list(&state.library_service, &ctx, query.cursor, query.page_size).await {
        Ok(result) => ok_page(
            context.as_ref(),
            result
                .items
                .into_iter()
                .map(map_wishlist_item)
                .collect::<Vec<_>>(),
            result.next_cursor,
            result.has_more,
        ),
        Err(error) => map_library_error(context.as_ref(), error),
    }
}

async fn wishlist_add(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Json(body): Json<WishlistAddBody>,
) -> Response {
    let ctx = match to_library_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match wishlist_items_add(&state.library_service, &ctx, body.listing_id).await {
        Ok(result) => created(context.as_ref(), map_wishlist_item(result.item)),
        Err(error) => map_library_error(context.as_ref(), error),
    }
}

async fn wishlist_remove(
    State(state): State<AppState>,
    Path(listing_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
) -> Response {
    let ctx = match to_library_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match wishlist_items_remove(&state.library_service, &ctx, listing_id).await {
        Ok(_result) => ok_item(context.as_ref(), serde_json::json!({ "accepted": true })),
        Err(error) => map_library_error(context.as_ref(), error),
    }
}

async fn download_grant_create(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Json(body): Json<DownloadGrantCreateBody>,
) -> Response {
    let ctx = match to_library_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match download_grants_create(&state.library_service, &ctx, body.artifact_id).await {
        Ok(result) => created(context.as_ref(), map_download_grant(result.grant)),
        Err(error) => map_library_error(context.as_ref(), error),
    }
}

async fn download_grant_consume_handler(
    State(state): State<AppState>,
    Path(grant_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
) -> Response {
    let ctx = match to_library_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match download_grants_consume(&state.library_service, &ctx, grant_id).await {
        Ok(result) => ok_item(context.as_ref(), map_consumed_download_grant(result)),
        Err(error) => map_library_error(context.as_ref(), error),
    }
}
