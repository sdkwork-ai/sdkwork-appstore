use crate::handlers::{
    catalog_categories_list, catalog_categories_retrieve, catalog_charts_retrieve,
    catalog_collections_list, catalog_collections_retrieve, catalog_events_list,
    catalog_events_retrieve, catalog_featured_list, catalog_feedback_create, catalog_home_retrieve,
    catalog_listings_search, catalog_recently_updated_list, catalog_recommendations_list,
    catalog_search_history_clear, catalog_search_history_list, catalog_search_history_upsert,
    catalog_search_suggestions_list, catalog_search_trending_list, catalog_template_create,
    catalog_template_retrieve, catalog_template_usage_create, catalog_templates_list,
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
struct CatalogTemplatesListQuery {
    #[serde(rename = "q")]
    q: Option<String>,
    category_code: Option<String>,
    template_type: Option<String>,
    template_platform: Option<String>,
    cursor: Option<String>,
    page_size: Option<i32>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct CatalogTemplateCreateBody {
    template_code: Option<String>,
    template_name: String,
    description: Option<String>,
    template_type: String,
    template_platform: Option<String>,
    category_code: Option<String>,
    framework: Option<String>,
    language: Option<String>,
    icon_media_resource_id: Option<String>,
    git_repo_url: Option<String>,
    capability_manifest: Option<serde_json::Value>,
    metadata: Option<serde_json::Value>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct CatalogTemplateUsageCreateBody {
    usage_type: String,
    metadata: Option<serde_json::Value>,
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
            "/app/v3/api/appstore/catalog/templates",
            get(catalog_templates_list_handler),
        )
        .route(
            "/app/v3/api/appstore/catalog/templates",
            post(catalog_template_create_handler),
        )
        .route(
            "/app/v3/api/appstore/catalog/templates/{templateId}",
            get(catalog_template_retrieve_handler),
        )
        .route(
            "/app/v3/api/appstore/catalog/templates/{templateId}/usage",
            post(catalog_template_usage_create_handler),
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
        Ok(result) => ok_page(
            context.as_ref(),
            result.listings,
            result.next_cursor,
            result.has_more,
        ),
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
        Ok(result) => ok_page(
            context.as_ref(),
            result.listings,
            result.next_cursor,
            result.has_more,
        ),
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
        Ok(result) => ok_page(
            context.as_ref(),
            result.listings,
            result.next_cursor,
            result.has_more,
        ),
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

async fn catalog_templates_list_handler(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<CatalogTemplatesListQuery>,
) -> Response {
    let ctx = match to_catalog_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_templates_list(
        &state.catalog_service,
        &ctx,
        query.q,
        query.category_code,
        query.template_type,
        query.template_platform,
        query.cursor,
        query.page_size,
    )
    .await
    {
        Ok(result) => ok_page(
            context.as_ref(),
            result.templates,
            result.next_cursor,
            result.has_more,
        ),
        Err(error) => map_catalog_error(context.as_ref(), error),
    }
}

async fn catalog_template_retrieve_handler(
    State(state): State<AppState>,
    Path(template_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
) -> Response {
    let ctx = match to_catalog_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_template_retrieve(&state.catalog_service, &ctx, template_id).await {
        Ok(result) => match result.template {
            Some(template) => ok_item(context.as_ref(), template),
            None => map_catalog_error(
                context.as_ref(),
                sdkwork_appstore_catalog_service::error::AppstoreServiceError::NotFound(
                    "App template not found".to_string(),
                ),
            ),
        },
        Err(error) => map_catalog_error(context.as_ref(), error),
    }
}

async fn catalog_template_create_handler(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Json(body): Json<CatalogTemplateCreateBody>,
) -> Response {
    let ctx = match to_catalog_context_auth(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_template_create(
        &state.catalog_service,
        &ctx,
        body.template_code,
        body.template_name,
        body.description,
        body.template_type,
        body.template_platform,
        body.category_code,
        body.framework,
        body.language,
        body.icon_media_resource_id,
        body.git_repo_url,
        body.capability_manifest,
        body.metadata,
    )
    .await
    {
        Ok(result) => created(context.as_ref(), result.template),
        Err(error) => map_catalog_error(context.as_ref(), error),
    }
}

async fn catalog_template_usage_create_handler(
    State(state): State<AppState>,
    Path(template_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
    Json(body): Json<CatalogTemplateUsageCreateBody>,
) -> Response {
    let ctx = match to_catalog_context_auth(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match catalog_template_usage_create(
        &state.catalog_service,
        &ctx,
        template_id,
        body.usage_type,
        body.metadata,
    )
    .await
    {
        Ok(result) => created(
            context.as_ref(),
            serde_json::json!({
                "templateId": result.template_id,
                "usageType": result.usage_type,
                "starCount": result.star_count,
                "forkCount": result.fork_count,
                "cloneCount": result.clone_count,
                "isStarred": result.is_starred,
                "isEnabled": result.is_enabled,
            }),
        ),
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
