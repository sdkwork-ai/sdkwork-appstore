use crate::handlers::{
    catalog_admin_categories_list, catalog_admin_collections_list, catalog_admin_featured_list,
    catalog_categories_create, catalog_categories_update, catalog_collections_create,
    catalog_collections_items_upsert, catalog_collections_update, catalog_featured_upsert,
};
use axum::extract::{Extension, Json, Path, Query, State};
use axum::response::Response;
use axum::routing::{get, patch, put};
use axum::Router;
use sdkwork_appstore_catalog_service::domain::commands::{
    CategoryLocalizationInput, CollectionItemInput, CollectionLocalizationInput,
};
use sdkwork_web_core::WebRequestContext;

use sdkwork_appstore_routes_common::http_support::{
    created, map_catalog_error, ok_item, ok_page, to_catalog_context_auth,
};
use sdkwork_appstore_routes_common::AppState;

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct CollectionCreateBody {
    collection_code: String,
    collection_type: String,
    audience_scope: String,
    sort_order: Option<i32>,
    cover_media_resource_id: Option<String>,
    starts_at: Option<String>,
    ends_at: Option<String>,
    localizations: Option<Vec<CollectionLocalizationInput>>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct CollectionUpdateBody {
    collection_type: Option<String>,
    audience_scope: Option<String>,
    sort_order: Option<i32>,
    cover_media_resource_id: Option<String>,
    starts_at: Option<String>,
    ends_at: Option<String>,
    status: Option<String>,
    localizations: Option<Vec<CollectionLocalizationInput>>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct CollectionItemsUpsertBody {
    items: Vec<CollectionItemInput>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct FeaturedUpsertBody {
    listing_id: String,
    audience_scope: String,
    platform_scope: Option<String>,
    region_scope: Option<Vec<String>>,
    starts_at: String,
    ends_at: String,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct CategoryCreateBody {
    category_code: String,
    parent_category_id: Option<String>,
    category_level: Option<i32>,
    sort_order: Option<i32>,
    icon_media_resource_id: Option<String>,
    localizations: Option<Vec<CategoryLocalizationInput>>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct CategoryUpdateBody {
    parent_category_id: Option<String>,
    category_level: Option<i32>,
    sort_order: Option<i32>,
    icon_media_resource_id: Option<String>,
    status: Option<String>,
    localizations: Option<Vec<CategoryLocalizationInput>>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct AdminListQuery {
    cursor: Option<String>,
    page_size: Option<i32>,
}

pub fn routes() -> Router<AppState> {
    Router::new()
        .route(
            "/backend/v3/api/appstore/catalog/categories",
            get(admin_categories_list).post(categories_create),
        )
        .route(
            "/backend/v3/api/appstore/catalog/collections",
            get(admin_collections_list).post(collections_create),
        )
        .route(
            "/backend/v3/api/appstore/catalog/featured",
            get(admin_featured_list),
        )
        .route(
            "/backend/v3/api/appstore/catalog/collections/{collectionId}",
            patch(collections_update),
        )
        .route(
            "/backend/v3/api/appstore/catalog/collections/{collectionId}/items",
            put(collections_items_upsert),
        )
        .route(
            "/backend/v3/api/appstore/catalog/featured/{slotCode}",
            put(featured_upsert),
        )
        .route(
            "/backend/v3/api/appstore/catalog/categories/{categoryId}",
            patch(categories_update),
        )
}

async fn admin_categories_list(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<AdminListQuery>,
) -> Response {
    let ctx = match to_catalog_context_auth(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_admin_categories_list(&state.catalog_service, &ctx, query.cursor, query.page_size)
        .await
    {
        Ok(result) => ok_page(
            context.as_ref(),
            result.categories,
            result.next_cursor,
            result.has_more,
        ),
        Err(error) => map_catalog_error(context.as_ref(), error),
    }
}

async fn admin_collections_list(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<AdminListQuery>,
) -> Response {
    let ctx = match to_catalog_context_auth(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_admin_collections_list(&state.catalog_service, &ctx, query.cursor, query.page_size)
        .await
    {
        Ok(result) => ok_page(
            context.as_ref(),
            result.collections,
            result.next_cursor,
            result.has_more,
        ),
        Err(error) => map_catalog_error(context.as_ref(), error),
    }
}

async fn admin_featured_list(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
) -> Response {
    let ctx = match to_catalog_context_auth(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_admin_featured_list(&state.catalog_service, &ctx).await {
        Ok(result) => ok_page(context.as_ref(), result.slots, None, false),
        Err(error) => map_catalog_error(context.as_ref(), error),
    }
}

async fn collections_create(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Json(body): Json<CollectionCreateBody>,
) -> Response {
    let ctx = match to_catalog_context_auth(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_collections_create(
        &state.catalog_service,
        &ctx,
        body.collection_code,
        body.collection_type,
        body.audience_scope,
        body.sort_order,
        body.cover_media_resource_id,
        body.starts_at,
        body.ends_at,
        body.localizations.unwrap_or_default(),
    )
    .await
    {
        Ok(result) => created(
            context.as_ref(),
            serde_json::json!({
                "collection": result.collection,
                "localizations": result.localizations,
            }),
        ),
        Err(error) => map_catalog_error(context.as_ref(), error),
    }
}

async fn collections_update(
    State(state): State<AppState>,
    Path(collection_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
    Json(body): Json<CollectionUpdateBody>,
) -> Response {
    let ctx = match to_catalog_context_auth(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_collections_update(
        &state.catalog_service,
        &ctx,
        collection_id,
        body.collection_type,
        body.audience_scope,
        body.sort_order,
        body.cover_media_resource_id,
        body.starts_at,
        body.ends_at,
        body.status,
        body.localizations,
    )
    .await
    {
        Ok(result) => ok_item(
            context.as_ref(),
            serde_json::json!({
                "collection": result.collection,
                "localizations": result.localizations,
            }),
        ),
        Err(error) => map_catalog_error(context.as_ref(), error),
    }
}

async fn collections_items_upsert(
    State(state): State<AppState>,
    Path(collection_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
    Json(body): Json<CollectionItemsUpsertBody>,
) -> Response {
    let ctx = match to_catalog_context_auth(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_collections_items_upsert(&state.catalog_service, &ctx, collection_id, body.items)
        .await
    {
        Ok(result) => ok_page(context.as_ref(), result.items, None, false),
        Err(error) => map_catalog_error(context.as_ref(), error),
    }
}

async fn featured_upsert(
    State(state): State<AppState>,
    Path(slot_code): Path<String>,
    context: Option<Extension<WebRequestContext>>,
    Json(body): Json<FeaturedUpsertBody>,
) -> Response {
    let ctx = match to_catalog_context_auth(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_featured_upsert(
        &state.catalog_service,
        &ctx,
        slot_code,
        body.listing_id,
        body.audience_scope,
        body.platform_scope,
        body.region_scope,
        body.starts_at,
        body.ends_at,
    )
    .await
    {
        Ok(result) => ok_item(context.as_ref(), result.slot),
        Err(error) => map_catalog_error(context.as_ref(), error),
    }
}

async fn categories_create(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Json(body): Json<CategoryCreateBody>,
) -> Response {
    let ctx = match to_catalog_context_auth(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_categories_create(
        &state.catalog_service,
        &ctx,
        body.category_code,
        body.parent_category_id,
        body.category_level,
        body.sort_order,
        body.icon_media_resource_id,
        body.localizations.unwrap_or_default(),
    )
    .await
    {
        Ok(result) => created(
            context.as_ref(),
            serde_json::json!({
                "category": result.category,
                "localizations": result.localizations,
            }),
        ),
        Err(error) => map_catalog_error(context.as_ref(), error),
    }
}

async fn categories_update(
    State(state): State<AppState>,
    Path(category_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
    Json(body): Json<CategoryUpdateBody>,
) -> Response {
    let ctx = match to_catalog_context_auth(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_categories_update(
        &state.catalog_service,
        &ctx,
        category_id,
        body.parent_category_id,
        body.category_level,
        body.sort_order,
        body.icon_media_resource_id,
        body.status,
        body.localizations,
    )
    .await
    {
        Ok(result) => ok_item(
            context.as_ref(),
            serde_json::json!({
                "category": result.category,
                "localizations": result.localizations,
            }),
        ),
        Err(error) => map_catalog_error(context.as_ref(), error),
    }
}
