use crate::handlers::{publishers_admin_list, publishers_admin_verify};
use axum::extract::{Extension, Json, Path, Query, State};
use axum::response::Response;
use axum::routing::{get, post};
use axum::Router;
use sdkwork_web_core::WebRequestContext;

use sdkwork_appstore_routes_common::http_support::{
    map_publisher_error, ok_item, ok_page, to_publisher_context,
};
use sdkwork_appstore_routes_common::AppState;

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct AdminVerifyPublisherBody {
    verification_type: String,
    decision: String,
    reason: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct AdminListPublishersQuery {
    cursor: Option<String>,
    page_size: Option<i32>,
}

pub fn routes() -> Router<AppState> {
    Router::new()
        .route(
            "/backend/v3/api/publishers",
            get(admin_list_publishers),
        )
        .route(
            "/backend/v3/api/publishers/{publisherId}/verify",
            post(admin_verify_publisher),
        )
}

async fn admin_list_publishers(
    State(state): State<AppState>,
    context: Option<Extension<WebRequestContext>>,
    Query(query): Query<AdminListPublishersQuery>,
) -> Response {
    let ctx = match to_publisher_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match publishers_admin_list(&state.publisher_service, &ctx, query.cursor, query.page_size).await
    {
        Ok(result) => ok_page(
            context.as_ref(),
            result.publishers,
            result.next_cursor,
            result.has_more,
        ),
        Err(error) => map_publisher_error(context.as_ref(), error),
    }
}

async fn admin_verify_publisher(
    State(state): State<AppState>,
    Path(publisher_id): Path<String>,
    context: Option<Extension<WebRequestContext>>,
    Json(body): Json<AdminVerifyPublisherBody>,
) -> Response {
    let ctx = match to_publisher_context(context.as_ref()) {
        Ok(ctx) => ctx,
        Err(resp) => return resp,
    };
    match publishers_admin_verify(
        &state.publisher_service,
        &ctx,
        publisher_id,
        body.verification_type,
        body.decision,
        body.reason,
    )
    .await
    {
        Ok(result) => ok_item(context.as_ref(), result.verification),
        Err(error) => map_publisher_error(context.as_ref(), error),
    }
}
