use crate::handlers::{
    listings_categories_bind, listings_create, listings_developer_other_list,
    listings_editorial_retrieve, listings_localization_upsert, listings_media_attach,
    listings_media_list, listings_media_remove, listings_rating_update, listings_ratings_list,
    listings_regions_update, listings_releases_history_list, listings_releases_list,
    listings_retrieve, listings_similar_list, listings_submissions_create, listings_update,
};
use axum::extract::{Extension, Json, Path, Query, State};
use axum::response::Response;
use axum::routing::{delete, get, post, put};
use axum::Router;
use sdkwork_appstore_listing_service::domain::commands::RegionEntry;
use sdkwork_web_core::WebRequestContext;

use sdkwork_appstore_routes_common::http_support::{
    created, map_listing_error, map_remix_error, ok_item, ok_page, to_listing_context,
    to_listing_context_public, CursorPageSizeQuery,
};
use sdkwork_appstore_routes_common::AppState;

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct ListingCreateBody {
    app_id: String,
    app_key: String,
    publisher_id: String,
    default_locale: String,
    listing_slug: Option<String>,
    pricing_model: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct ListingUpdateBody {
    pricing_model: Option<String>,
    official_website_url: Option<String>,
    support_url: Option<String>,
    privacy_policy_url: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct ListingLocalizationBody {
    display_name: String,
    short_description: String,
    full_description: String,
    subtitle: Option<String>,
    whats_new_summary: Option<String>,
    keywords: Option<Vec<String>>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct ListingMediaAttachBody {
    media_role: String,
    media_resource_id: String,
    platform_scope: Option<String>,
    locale: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct ListingCategoriesBindBody {
    category_ids: Vec<String>,
    primary_category_id: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct ListingRegionsUpdateBody {
    regions: Vec<RegionEntry>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct ListingSubmissionCreateBody {
    submission_type: String,
    release_id: Option<String>,
}

pub fn routes() -> Router<AppState> {
    Router::new()
        .route(
            "/app/v3/api/listings/{listingId}",
            get(listing_retrieve).patch(listing_update),
        )
        .route("/app/v3/api/listings", post(listing_create))
        .route(
            "/app/v3/api/listings/{listingId}/media",
            get(listing_media_list).post(listing_media_attach),
        )
        .route(
            "/app/v3/api/listings/{listingId}/media/{mediaId}",
            delete(listing_media_remove_handler),
        )
        .route(
            "/app/v3/api/listings/{listingId}/releases",
            get(listing_releases_list_handler),
        )
        .route(
            "/app/v3/api/listings/{listingId}/localizations/{locale}",
            put(listing_localization_upsert),
        )
        .route(
            "/app/v3/api/listings/{listingId}/categories",
            put(listing_categories_bind),
        )
        .route(
            "/app/v3/api/listings/{listingId}/regions",
            put(listing_regions_update),
        )
        .route(
            "/app/v3/api/listings/{listingId}/submissions",
            post(listing_submissions_create),
        )
        .route(
            "/app/v3/api/listings/{listingId}/releases/history",
            get(listing_releases_history_list_handler),
        )
        .route(
            "/app/v3/api/listings/{listingId}/similar",
            get(listing_similar_list_handler),
        )
        .route(
            "/app/v3/api/listings/{listingId}/developer_other",
            get(listing_developer_other_list_handler),
        )
        .route(
            "/app/v3/api/listings/{listingId}/editorial",
            get(listing_editorial_retrieve_handler),
        )
        .route(
            "/app/v3/api/listings/{listingId}/ratings",
            get(listing_ratings_list_handler),
        )
        .route(
            "/app/v3/api/listings/{listingId}/ratings/me",
            put(listing_rating_update_handler),
        )
        .route(
            "/app/v3/api/appstore/listings/{listingId}/remix",
            get(listing_remix_retrieve),
        )
}

async fn listing_retrieve(
    State(state): State<AppState>,
    Path(listing_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
) -> Response {
    let ctx = match to_listing_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match listings_retrieve(&state.listing_service, &ctx, listing_id).await {
        Ok(mut result) => {
            // Remix availability is derived per read from the deployment
            // binding and deploy's readiness verdict; the listing row itself
            // carries no remix state.
            if let Some(listing) = result.listing.as_mut() {
                listing.remixable = state
                    .remix_service
                    .is_app_remixable(&ctx.tenant_id, &listing.app_id)
                    .await;
            }
            ok_item(context.as_ref(), result.listing)
        }
        Err(error) => map_listing_error(context.as_ref(), error),
    }
}

/// Remix download coordinates of one storefront listing.
///
/// The storefront offers remix only for a published listing whose bound deploy
/// application has remix enabled and a ready source. Every other case is a
/// `404`; an App Store deployment that cannot consult deploy answers `503`
/// naming the unset `APPSTORE_DEPLOY_BASE_URL`.
async fn listing_remix_retrieve(
    State(state): State<AppState>,
    Path(listing_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
) -> Response {
    // A remix read is a storefront product read: it needs a tenant, not a
    // signed-in user, matching the catalog reads on the same page.
    let ctx = to_listing_context_public(context.as_ref());
    match state
        .remix_service
        .resolve_listing_remix(&ctx.tenant_id, &listing_id)
        .await
    {
        Ok(download) => ok_item(context.as_ref(), download),
        Err(error) => map_remix_error(context.as_ref(), error),
    }
}

async fn listing_media_list(
    State(state): State<AppState>,
    Path(listing_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
) -> Response {
    let ctx = match to_listing_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match listings_media_list(&state.listing_service, &ctx, listing_id).await {
        Ok(result) => ok_page(context.as_ref(), result.media, None, false),
        Err(error) => map_listing_error(context.as_ref(), error),
    }
}

async fn listing_releases_list_handler(
    State(state): State<AppState>,
    Path(listing_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<CursorPageSizeQuery>,
) -> Response {
    let ctx = match to_listing_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match listings_releases_list(
        &state.listing_service,
        &ctx,
        listing_id,
        query.cursor,
        query.page_size,
    )
    .await
    {
        Ok(result) => ok_page(
            context.as_ref(),
            result.releases,
            result.next_cursor,
            result.has_more,
        ),
        Err(error) => map_listing_error(context.as_ref(), error),
    }
}

async fn listing_create(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Json(body): Json<ListingCreateBody>,
) -> Response {
    let ctx = match to_listing_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match listings_create(
        &state.listing_service,
        &ctx,
        body.app_id,
        body.app_key,
        body.publisher_id,
        body.default_locale,
        body.listing_slug,
        body.pricing_model,
    )
    .await
    {
        Ok(result) => created(context.as_ref(), result.listing),
        Err(error) => map_listing_error(context.as_ref(), error),
    }
}

async fn listing_update(
    State(state): State<AppState>,
    Path(listing_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
    Json(body): Json<ListingUpdateBody>,
) -> Response {
    let ctx = match to_listing_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match listings_update(
        &state.listing_service,
        &ctx,
        listing_id,
        body.pricing_model,
        body.official_website_url,
        body.support_url,
        body.privacy_policy_url,
    )
    .await
    {
        Ok(result) => ok_item(context.as_ref(), result.listing),
        Err(error) => map_listing_error(context.as_ref(), error),
    }
}

async fn listing_localization_upsert(
    State(state): State<AppState>,
    Path((listing_id, locale)): Path<(String, String)>,
    context: Option<Extension<WebRequestContext>>,
    Json(body): Json<ListingLocalizationBody>,
) -> Response {
    let ctx = match to_listing_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match listings_localization_upsert(
        &state.listing_service,
        &ctx,
        listing_id,
        locale,
        body.display_name,
        body.short_description,
        body.full_description,
        body.subtitle,
        body.whats_new_summary,
        body.keywords,
    )
    .await
    {
        Ok(result) => ok_item(context.as_ref(), result.localization),
        Err(error) => map_listing_error(context.as_ref(), error),
    }
}

async fn listing_media_attach(
    State(state): State<AppState>,
    Path(listing_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
    Json(body): Json<ListingMediaAttachBody>,
) -> Response {
    let ctx = match to_listing_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match listings_media_attach(
        &state.listing_service,
        &ctx,
        listing_id,
        body.media_role,
        body.media_resource_id,
        body.platform_scope,
        body.locale,
    )
    .await
    {
        Ok(result) => ok_item(context.as_ref(), result.media),
        Err(error) => map_listing_error(context.as_ref(), error),
    }
}

async fn listing_media_remove_handler(
    State(state): State<AppState>,
    Path((listing_id, media_id)): Path<(String, String)>,
    context: Option<Extension<WebRequestContext>>,
) -> Response {
    let ctx = match to_listing_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match listings_media_remove(&state.listing_service, &ctx, listing_id, media_id).await {
        Ok(result) => ok_item(
            context.as_ref(),
            serde_json::json!({ "removed": result.removed }),
        ),
        Err(error) => map_listing_error(context.as_ref(), error),
    }
}

async fn listing_categories_bind(
    State(state): State<AppState>,
    Path(listing_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
    Json(body): Json<ListingCategoriesBindBody>,
) -> Response {
    let ctx = match to_listing_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match listings_categories_bind(
        &state.listing_service,
        &ctx,
        listing_id,
        body.category_ids,
        body.primary_category_id,
    )
    .await
    {
        Ok(result) => ok_item(
            context.as_ref(),
            serde_json::json!({
                "listing": result.listing,
                "bindings": result.bindings,
            }),
        ),
        Err(error) => map_listing_error(context.as_ref(), error),
    }
}

async fn listing_regions_update(
    State(state): State<AppState>,
    Path(listing_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
    Json(body): Json<ListingRegionsUpdateBody>,
) -> Response {
    let ctx = match to_listing_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match listings_regions_update(&state.listing_service, &ctx, listing_id, body.regions).await {
        Ok(result) => ok_page(context.as_ref(), result.availabilities, None, false),
        Err(error) => map_listing_error(context.as_ref(), error),
    }
}

async fn listing_submissions_create(
    State(state): State<AppState>,
    Path(listing_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
    Json(body): Json<ListingSubmissionCreateBody>,
) -> Response {
    let ctx = match to_listing_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match listings_submissions_create(
        &state.listing_service,
        &ctx,
        listing_id,
        body.submission_type,
        body.release_id,
    )
    .await
    {
        Ok(result) => created(context.as_ref(), result.submission),
        Err(error) => map_listing_error(context.as_ref(), error),
    }
}

async fn listing_releases_history_list_handler(
    State(state): State<AppState>,
    Path(listing_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<CursorPageSizeQuery>,
) -> Response {
    let ctx = match to_listing_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match listings_releases_history_list(
        &state.listing_service,
        &ctx,
        listing_id,
        query.cursor,
        query.page_size,
    )
    .await
    {
        Ok(result) => ok_page(
            context.as_ref(),
            result.releases,
            result.next_cursor,
            result.has_more,
        ),
        Err(error) => map_listing_error(context.as_ref(), error),
    }
}

async fn listing_similar_list_handler(
    State(state): State<AppState>,
    Path(listing_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<CursorPageSizeQuery>,
) -> Response {
    let ctx = match to_listing_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match listings_similar_list(
        &state.listing_service,
        &ctx,
        listing_id,
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
        Err(error) => map_listing_error(context.as_ref(), error),
    }
}

async fn listing_developer_other_list_handler(
    State(state): State<AppState>,
    Path(listing_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<CursorPageSizeQuery>,
) -> Response {
    let ctx = match to_listing_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match listings_developer_other_list(
        &state.listing_service,
        &ctx,
        listing_id,
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
        Err(error) => map_listing_error(context.as_ref(), error),
    }
}

async fn listing_editorial_retrieve_handler(
    State(state): State<AppState>,
    Path(listing_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
) -> Response {
    let ctx = match to_listing_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match listings_editorial_retrieve(&state.listing_service, &ctx, listing_id).await {
        Ok(result) => ok_item(context.as_ref(), result.editorial),
        Err(error) => map_listing_error(context.as_ref(), error),
    }
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct ListingRatingUpdateBody {
    rating: i32,
    title: Option<String>,
}

async fn listing_ratings_list_handler(
    State(state): State<AppState>,
    Path(listing_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<CursorPageSizeQuery>,
) -> Response {
    let ctx = match to_listing_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match listings_ratings_list(
        &state.listing_service,
        &ctx,
        listing_id,
        query.cursor,
        query.page_size,
    )
    .await
    {
        Ok(result) => ok_page(
            context.as_ref(),
            result.ratings,
            result.next_cursor,
            result.has_more,
        ),
        Err(error) => map_listing_error(context.as_ref(), error),
    }
}

async fn listing_rating_update_handler(
    State(state): State<AppState>,
    Path(listing_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
    Json(body): Json<ListingRatingUpdateBody>,
) -> Response {
    let ctx = match to_listing_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match listings_rating_update(
        &state.listing_service,
        &ctx,
        listing_id,
        body.rating,
        body.title,
    )
    .await
    {
        Ok(result) => ok_item(context.as_ref(), result.rating),
        Err(error) => map_listing_error(context.as_ref(), error),
    }
}
