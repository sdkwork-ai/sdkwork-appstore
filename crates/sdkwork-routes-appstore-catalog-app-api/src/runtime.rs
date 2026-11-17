use crate::handlers::{
    catalog_categories_list, catalog_categories_retrieve, catalog_charts_retrieve,
    catalog_collections_list, catalog_collections_retrieve, catalog_events_list,
    catalog_events_retrieve, catalog_expert_retrieve, catalog_experts_list, catalog_featured_list,
    catalog_feedback_create, catalog_home_retrieve, catalog_listings_search,
    catalog_recently_updated_list, catalog_recommendations_list, catalog_search_history_clear,
    catalog_search_history_list, catalog_search_history_upsert, catalog_search_suggestions_list,
    catalog_search_trending_list,
};
use axum::extract::{Extension, Json, Path, Query, State};
use axum::http::StatusCode;
use axum::response::Response;
use axum::routing::{delete, get, post, put};
use axum::Router;
use sdkwork_web_core::WebRequestContext;

use sdkwork_appstore_routes_common::http_support::{
    created, map_catalog_error, ok_item, ok_page, to_catalog_context, to_catalog_context_auth,
    CursorPageSizeQuery, LocaleQuery, SearchQuery,
};
use sdkwork_appstore_routes_common::AppState;

use sdkwork_appstore_catalog_service::domain::models::ListingSummary;

/// Project `remixable` onto a page of listing summaries.
///
/// Remix is a deploy-owned projection, so the catalog service stays deploy
/// agnostic and the route attaches the flag once for the whole page: one
/// binding lookup plus one deploy readiness read per distinct deploy
/// application. A binding or deploy failure degrades to `false` for the
/// affected rows instead of failing the page.
async fn decorate_remixable(state: &AppState, tenant_id: &str, listings: &mut [ListingSummary]) {
    if listings.is_empty() {
        return;
    }
    let app_ids: Vec<String> = listings
        .iter()
        .map(|listing| listing.app_id.clone())
        .collect();
    let remixable = state
        .remix_service
        .remixable_app_ids(tenant_id, &app_ids)
        .await;
    for listing in listings.iter_mut() {
        listing.remixable = remixable.contains(&listing.app_id);
    }
}

#[derive(Debug, serde::Deserialize)]
struct CatalogHomeQuery {
    locale: Option<String>,
    platform: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
struct CatalogCategoriesListQuery {
    locale: Option<String>,
    cursor: Option<String>,
    page_size: Option<i32>,
}

#[derive(Debug, serde::Deserialize)]
struct CatalogCollectionsListQuery {
    cursor: Option<String>,
    page_size: Option<i32>,
    audience_scope: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
struct CatalogFeaturedQuery {
    audience_scope: Option<String>,
    platform_scope: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
struct CatalogChartsQuery {
    locale: Option<String>,
    platform_scope: Option<String>,
    snapshot_date: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
struct CatalogRecommendationsQuery {
    locale: Option<String>,
    platform: Option<String>,
    cursor: Option<String>,
    page_size: Option<i32>,
}

#[derive(Debug, serde::Deserialize)]
struct CatalogRecentlyUpdatedQuery {
    locale: Option<String>,
    cursor: Option<String>,
    page_size: Option<i32>,
}

#[derive(Debug, serde::Deserialize)]
struct CatalogEventsListQuery {
    cursor: Option<String>,
    page_size: Option<i32>,
    status: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
struct CatalogSearchSuggestionsQuery {
    #[serde(rename = "q")]
    q: String,
    locale: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
struct CatalogSearchTrendingQuery {
    locale: Option<String>,
    page_size: Option<i32>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct SearchHistoryUpsertBody {
    query_text: String,
    filters: Option<serde_json::Value>,
}

#[derive(Debug, serde::Deserialize)]
struct CatalogExpertsListQuery {
    category_code: Option<String>,
    /// `sort_weight_asc` (default) or `sort_weight_desc`.
    sort: Option<String>,
    cursor: Option<String>,
    page_size: Option<i32>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct CatalogFeedbackCreateBody {
    r#type: String,
    content: String,
    contact: Option<String>,
    listing_id: Option<String>,
    app_key: Option<String>,
}

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/app/v3/api/appstore/catalog/home", get(catalog_home))
        .route(
            "/app/v3/api/appstore/catalog/categories",
            get(catalog_categories_list_handler),
        )
        .route(
            "/app/v3/api/appstore/catalog/categories/{categoryId}",
            get(catalog_category_retrieve_handler),
        )
        .route(
            "/app/v3/api/appstore/catalog/collections",
            get(catalog_collections_list_handler),
        )
        .route(
            "/app/v3/api/appstore/catalog/collections/{collectionId}",
            get(catalog_collection_retrieve_handler),
        )
        .route(
            "/app/v3/api/appstore/catalog/featured",
            get(catalog_featured_list_handler),
        )
        .route(
            "/app/v3/api/appstore/catalog/charts/{chartCode}",
            get(catalog_charts_retrieve_handler),
        )
        .route(
            "/app/v3/api/appstore/catalog/listings/search",
            get(catalog_listings_search_handler),
        )
        .route(
            "/app/v3/api/appstore/catalog/recommendations",
            get(catalog_recommendations_list_handler),
        )
        .route(
            "/app/v3/api/appstore/catalog/recently_updated",
            get(catalog_recently_updated_list_handler),
        )
        .route(
            "/app/v3/api/appstore/catalog/events",
            get(catalog_events_list_handler),
        )
        .route(
            "/app/v3/api/appstore/catalog/events/{eventId}",
            get(catalog_event_retrieve_handler),
        )
        .route(
            "/app/v3/api/appstore/catalog/search/suggestions",
            get(catalog_search_suggestions_list_handler),
        )
        .route(
            "/app/v3/api/appstore/catalog/search/trending",
            get(catalog_search_trending_list_handler),
        )
        .route(
            "/app/v3/api/appstore/catalog/search/history",
            get(catalog_search_history_list_handler),
        )
        .route(
            "/app/v3/api/appstore/catalog/search/history",
            put(catalog_search_history_upsert_handler),
        )
        .route(
            "/app/v3/api/appstore/catalog/search/history",
            delete(catalog_search_history_clear_handler),
        )
        .route(
            "/app/v3/api/appstore/catalog/experts",
            get(catalog_experts_list_handler),
        )
        .route(
            "/app/v3/api/appstore/catalog/experts/{expertRef}",
            get(catalog_expert_retrieve_handler),
        )
        .route(
            "/app/v3/api/appstore/catalog/feedback",
            post(catalog_feedback_create_handler),
        )
}

async fn catalog_home(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<CatalogHomeQuery>,
) -> Response {
    let ctx = match to_catalog_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_home_retrieve(&state.catalog_service, &ctx, query.locale, query.platform).await {
        Ok(result) => ok_item(
            context.as_ref(),
            serde_json::json!({
                "featuredSlots": result.featured_slots,
                "collections": result.collections,
                "charts": result.charts,
            }),
        ),
        Err(error) => map_catalog_error(context.as_ref(), error),
    }
}

async fn catalog_categories_list_handler(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<CatalogCategoriesListQuery>,
) -> Response {
    let ctx = match to_catalog_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_categories_list(
        &state.catalog_service,
        &ctx,
        query.locale,
        query.cursor,
        query.page_size,
    )
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

async fn catalog_category_retrieve_handler(
    State(state): State<AppState>,
    Path(category_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<LocaleQuery>,
) -> Response {
    let ctx = match to_catalog_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_categories_retrieve(&state.catalog_service, &ctx, category_id, query.locale).await
    {
        Ok(result) => ok_item(context.as_ref(), result.category),
        Err(error) => map_catalog_error(context.as_ref(), error),
    }
}

async fn catalog_collections_list_handler(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<CatalogCollectionsListQuery>,
) -> Response {
    let ctx = match to_catalog_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_collections_list(
        &state.catalog_service,
        &ctx,
        query.cursor,
        query.page_size,
        query.audience_scope,
    )
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

async fn catalog_collection_retrieve_handler(
    State(state): State<AppState>,
    Path(collection_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<LocaleQuery>,
) -> Response {
    let ctx = match to_catalog_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_collections_retrieve(&state.catalog_service, &ctx, collection_id, query.locale)
        .await
    {
        Ok(result) => ok_item(context.as_ref(), result.collection),
        Err(error) => map_catalog_error(context.as_ref(), error),
    }
}

async fn catalog_featured_list_handler(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<CatalogFeaturedQuery>,
) -> Response {
    let ctx = match to_catalog_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_featured_list(
        &state.catalog_service,
        &ctx,
        query.audience_scope,
        query.platform_scope,
    )
    .await
    {
        Ok(result) => ok_page(context.as_ref(), result.slots, None, false),
        Err(error) => map_catalog_error(context.as_ref(), error),
    }
}

async fn catalog_charts_retrieve_handler(
    State(state): State<AppState>,
    Path(chart_code): Path<String>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<CatalogChartsQuery>,
) -> Response {
    let ctx = match to_catalog_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_charts_retrieve(
        &state.catalog_service,
        &ctx,
        chart_code,
        query.locale,
        query.platform_scope,
        query.snapshot_date,
    )
    .await
    {
        Ok(result) => ok_item(context.as_ref(), result.chart),
        Err(error) => map_catalog_error(context.as_ref(), error),
    }
}

async fn catalog_listings_search_handler(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<SearchQuery>,
) -> Response {
    let ctx = match to_catalog_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_listings_search(
        &state.catalog_service,
        &ctx,
        query.q,
        query.category_id,
        query.ids,
        query.cursor,
        query.page_size,
    )
    .await
    {
        Ok(result) => {
            let mut listings = result.listings;
            decorate_remixable(&state, &ctx.tenant_id, &mut listings).await;
            ok_page(
                context.as_ref(),
                listings,
                result.next_cursor,
                result.has_more,
            )
        }
        Err(error) => map_catalog_error(context.as_ref(), error),
    }
}

async fn catalog_recommendations_list_handler(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<CatalogRecommendationsQuery>,
) -> Response {
    let ctx = match to_catalog_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_recommendations_list(
        &state.catalog_service,
        &ctx,
        query.locale,
        query.platform,
        query.cursor,
        query.page_size,
    )
    .await
    {
        Ok(result) => {
            let mut listings = result.listings;
            decorate_remixable(&state, &ctx.tenant_id, &mut listings).await;
            ok_page(
                context.as_ref(),
                listings,
                result.next_cursor,
                result.has_more,
            )
        }
        Err(error) => map_catalog_error(context.as_ref(), error),
    }
}

async fn catalog_recently_updated_list_handler(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<CatalogRecentlyUpdatedQuery>,
) -> Response {
    let ctx = match to_catalog_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_recently_updated_list(
        &state.catalog_service,
        &ctx,
        query.locale,
        query.cursor,
        query.page_size,
    )
    .await
    {
        Ok(result) => {
            let mut listings = result.listings;
            decorate_remixable(&state, &ctx.tenant_id, &mut listings).await;
            ok_page(
                context.as_ref(),
                listings,
                result.next_cursor,
                result.has_more,
            )
        }
        Err(error) => map_catalog_error(context.as_ref(), error),
    }
}

async fn catalog_events_list_handler(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<CatalogEventsListQuery>,
) -> Response {
    let ctx = match to_catalog_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_events_list(
        &state.catalog_service,
        &ctx,
        query.cursor,
        query.page_size,
        query.status,
    )
    .await
    {
        Ok(result) => ok_page(
            context.as_ref(),
            result.events,
            result.next_cursor,
            result.has_more,
        ),
        Err(error) => map_catalog_error(context.as_ref(), error),
    }
}

async fn catalog_event_retrieve_handler(
    State(state): State<AppState>,
    Path(event_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<LocaleQuery>,
) -> Response {
    let ctx = match to_catalog_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_events_retrieve(&state.catalog_service, &ctx, event_id, query.locale).await {
        Ok(result) => ok_item(context.as_ref(), result.event),
        Err(error) => map_catalog_error(context.as_ref(), error),
    }
}

async fn catalog_search_suggestions_list_handler(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<CatalogSearchSuggestionsQuery>,
) -> Response {
    let ctx = match to_catalog_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_search_suggestions_list(&state.catalog_service, &ctx, query.q, query.locale).await
    {
        Ok(result) => ok_page(context.as_ref(), result.suggestions, None, false),
        Err(error) => map_catalog_error(context.as_ref(), error),
    }
}

async fn catalog_search_trending_list_handler(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<CatalogSearchTrendingQuery>,
) -> Response {
    let ctx = match to_catalog_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_search_trending_list(&state.catalog_service, &ctx, query.locale, query.page_size)
        .await
    {
        Ok(result) => ok_page(context.as_ref(), result.terms, None, false),
        Err(error) => map_catalog_error(context.as_ref(), error),
    }
}

async fn catalog_search_history_list_handler(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<CursorPageSizeQuery>,
) -> Response {
    let ctx = match to_catalog_context_auth(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_search_history_list(&state.catalog_service, &ctx, query.cursor, query.page_size)
        .await
    {
        Ok(result) => ok_page(
            context.as_ref(),
            result.entries,
            result.next_cursor,
            result.has_more,
        ),
        Err(error) => map_catalog_error(context.as_ref(), error),
    }
}

async fn catalog_search_history_upsert_handler(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Json(body): Json<SearchHistoryUpsertBody>,
) -> Response {
    let ctx = match to_catalog_context_auth(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_search_history_upsert(
        &state.catalog_service,
        &ctx,
        body.query_text,
        body.filters.map(|filters| filters.to_string()),
    )
    .await
    {
        Ok(result) => ok_item(context.as_ref(), result.entry),
        Err(error) => map_catalog_error(context.as_ref(), error),
    }
}

async fn catalog_search_history_clear_handler(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
) -> Response {
    let ctx = match to_catalog_context_auth(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_search_history_clear(&state.catalog_service, &ctx).await {
        Ok(_result) => Response::builder()
            .status(StatusCode::NO_CONTENT)
            .body(axum::body::Body::empty())
            .unwrap(),
        Err(error) => map_catalog_error(context.as_ref(), error),
    }
}

async fn catalog_feedback_create_handler(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Json(body): Json<CatalogFeedbackCreateBody>,
) -> Response {
    let ctx = match to_catalog_context_auth(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_feedback_create(
        &state.catalog_service,
        &ctx,
        body.r#type,
        body.content,
        body.contact,
        body.listing_id,
        body.app_key,
    )
    .await
    {
        Ok(result) => created(context.as_ref(), result.feedback),
        Err(error) => map_catalog_error(context.as_ref(), error),
    }
}

async fn catalog_experts_list_handler(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<CatalogExpertsListQuery>,
) -> Response {
    let ctx = match to_catalog_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_experts_list(
        &state.catalog_service,
        &ctx,
        query.category_code,
        query.sort,
        query.cursor,
        query.page_size,
    )
    .await
    {
        Ok(result) => ok_page(
            context.as_ref(),
            result.experts,
            result.next_cursor,
            result.has_more,
        ),
        Err(error) => map_catalog_error(context.as_ref(), error),
    }
}

async fn catalog_expert_retrieve_handler(
    State(state): State<AppState>,
    Path(expert_ref): Path<String>,
    context: Option<Extension<WebRequestContext>>,
) -> Response {
    let ctx = match to_catalog_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_expert_retrieve(&state.catalog_service, &ctx, expert_ref).await {
        Ok(result) => match result.expert {
            Some(expert) => ok_item(context.as_ref(), expert),
            None => map_catalog_error(
                context.as_ref(),
                sdkwork_appstore_catalog_service::error::AppstoreServiceError::NotFound(
                    "Expert not found".to_string(),
                ),
            ),
        },
        Err(error) => map_catalog_error(context.as_ref(), error),
    }
}
