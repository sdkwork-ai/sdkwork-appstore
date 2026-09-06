//! Gateway HTTP helpers delegating to sdkwork-appstore-routes-common.

use crate::{
    authenticated_context_from_web, created_item, map_appstore_service_error,
    request_context_from_web, success_item, success_page, AppstoreRequestContext,
    AppstoreServiceErrorKind,
};
use axum::extract::Extension;
use axum::response::Response;
use sdkwork_web_core::WebRequestContext;
use serde::Deserialize;

pub fn web_context(ext: Option<&Extension<WebRequestContext>>) -> Option<&WebRequestContext> {
    ext.map(|Extension(ctx)| ctx)
}

fn permission_scopes(web: Option<&WebRequestContext>) -> Vec<String> {
    web.and_then(|ctx| ctx.principal.as_ref())
        .map(|principal| principal.scopes.permission_scope.iter().cloned().collect())
        .unwrap_or_default()
}

fn trace_id(web: Option<&WebRequestContext>) -> Option<String> {
    web.and_then(|ctx| ctx.trace_id.clone())
}

fn base_context(web: Option<&WebRequestContext>) -> AppstoreRequestContext {
    request_context_from_web(web)
}

fn authenticated_base(
    ext: Option<&Extension<WebRequestContext>>,
) -> Result<AppstoreRequestContext, Response> {
    authenticated_context_from_web(web_context(ext))
}

fn require_user_id(base: &AppstoreRequestContext) -> Result<String, Response> {
    base.user_id
        .clone()
        .filter(|id| !id.trim().is_empty())
        .ok_or_else(|| crate::unauthorized_response(None, "Authenticated user is required"))
}

fn require_org_id(base: &AppstoreRequestContext) -> Result<String, Response> {
    base.organization_id
        .clone()
        .filter(|id| !id.trim().is_empty())
        .ok_or_else(|| crate::unauthorized_response(None, "Organization context is required"))
}

/// PERMISSION_STANDARD_SPEC §Tenant-Default Organization Context: consumer app-api
/// surfaces must not reject a personal (tenant-scope) session for lacking organization
/// context; a missing organization normalizes to "0".
fn organization_id_or_default(base: &AppstoreRequestContext) -> String {
    base.organization_id
        .clone()
        .filter(|id| !id.trim().is_empty())
        .unwrap_or_else(|| "0".to_string())
}

pub fn to_catalog_context(
    ext: Option<&Extension<WebRequestContext>>,
) -> Result<sdkwork_appstore_catalog_service::context::AppstoreRequestContext, Response> {
    let base = base_context(web_context(ext));
    Ok(
        sdkwork_appstore_catalog_service::context::AppstoreRequestContext {
            tenant_id: base.tenant_id,
            organization_id: base.organization_id,
            user_id: base.user_id,
            request_id: base.request_id,
            permission_scopes: permission_scopes(web_context(ext)),
        },
    )
}

pub fn to_catalog_context_auth(
    ext: Option<&Extension<WebRequestContext>>,
) -> Result<sdkwork_appstore_catalog_service::context::AppstoreRequestContext, Response> {
    let base = authenticated_base(ext)?;
    Ok(
        sdkwork_appstore_catalog_service::context::AppstoreRequestContext {
            tenant_id: base.tenant_id,
            organization_id: base.organization_id,
            user_id: base.user_id,
            request_id: base.request_id,
            permission_scopes: permission_scopes(web_context(ext)),
        },
    )
}

pub fn to_listing_context_public(
    ext: Option<&Extension<WebRequestContext>>,
) -> sdkwork_appstore_listing_service::context::AppstoreRequestContext {
    let base = base_context(web_context(ext));
    sdkwork_appstore_listing_service::context::AppstoreRequestContext {
        tenant_id: base.tenant_id,
        organization_id: base.organization_id.unwrap_or_default(),
        user_id: base.user_id.unwrap_or_default(),
        request_id: base.request_id,
        trace_id: trace_id(web_context(ext)),
        permission_scopes: permission_scopes(web_context(ext)),
    }
}

pub fn to_listing_context(
    ext: Option<&Extension<WebRequestContext>>,
) -> Result<sdkwork_appstore_listing_service::context::AppstoreRequestContext, Response> {
    let base = authenticated_base(ext)?;
    let organization_id = organization_id_or_default(&base);
    let user_id = require_user_id(&base)?;
    Ok(
        sdkwork_appstore_listing_service::context::AppstoreRequestContext {
            tenant_id: base.tenant_id,
            organization_id,
            user_id,
            request_id: base.request_id,
            trace_id: trace_id(web_context(ext)),
            permission_scopes: permission_scopes(web_context(ext)),
        },
    )
}

pub fn to_publisher_context(
    ext: Option<&Extension<WebRequestContext>>,
) -> Result<sdkwork_appstore_publisher_service::context::AppstoreRequestContext, Response> {
    let base = authenticated_base(ext)?;
    let organization_id = require_org_id(&base)?;
    let user_id = require_user_id(&base)?;
    Ok(
        sdkwork_appstore_publisher_service::context::AppstoreRequestContext {
            tenant_id: base.tenant_id,
            organization_id,
            user_id,
            request_id: base.request_id,
            trace_id: trace_id(web_context(ext)),
            permission_scopes: permission_scopes(web_context(ext)),
        },
    )
}

pub fn to_release_context(
    ext: Option<&Extension<WebRequestContext>>,
) -> Result<sdkwork_appstore_release_service::context::AppstoreRequestContext, Response> {
    let base = authenticated_base(ext)?;
    Ok(
        sdkwork_appstore_release_service::context::AppstoreRequestContext {
            tenant_id: base.tenant_id,
            organization_id: base.organization_id,
            user_id: base.user_id,
            request_id: base.request_id,
            permission_scopes: permission_scopes(web_context(ext)),
        },
    )
}

pub fn to_release_context_public(
    ext: Option<&Extension<WebRequestContext>>,
) -> sdkwork_appstore_release_service::context::AppstoreRequestContext {
    let base = base_context(web_context(ext));
    sdkwork_appstore_release_service::context::AppstoreRequestContext {
        tenant_id: base.tenant_id,
        organization_id: base.organization_id,
        user_id: base.user_id,
        request_id: base.request_id,
        permission_scopes: permission_scopes(web_context(ext)),
    }
}

pub fn to_library_context(
    ext: Option<&Extension<WebRequestContext>>,
) -> Result<sdkwork_appstore_library_service::context::AppstoreRequestContext, Response> {
    let base = authenticated_base(ext)?;
    let organization_id = organization_id_or_default(&base);
    let user_id = require_user_id(&base)?;
    Ok(
        sdkwork_appstore_library_service::context::AppstoreRequestContext {
            tenant_id: base.tenant_id,
            organization_id,
            user_id,
            request_id: base.request_id,
            trace_id: trace_id(web_context(ext)),
            permission_scopes: permission_scopes(web_context(ext)),
        },
    )
}

pub fn to_moderation_context(
    ext: Option<&Extension<WebRequestContext>>,
) -> Result<sdkwork_appstore_moderation_service::context::AppstoreRequestContext, Response> {
    let base = authenticated_base(ext)?;
    Ok(
        sdkwork_appstore_moderation_service::context::AppstoreRequestContext {
            tenant_id: base.tenant_id,
            organization_id: base.organization_id,
            user_id: base.user_id,
            request_id: base.request_id.clone(),
            trace_id: trace_id(web_context(ext)),
            permission_scopes: permission_scopes(web_context(ext)),
        },
    )
}

pub fn to_compliance_context(
    ext: Option<&Extension<WebRequestContext>>,
) -> Result<sdkwork_appstore_compliance_service::context::AppstoreRequestContext, Response> {
    let base = authenticated_base(ext)?;
    Ok(
        sdkwork_appstore_compliance_service::context::AppstoreRequestContext {
            tenant_id: base.tenant_id,
            organization_id: base.organization_id,
            user_id: base.user_id,
            request_id: base.request_id,
            permission_scopes: permission_scopes(web_context(ext)),
        },
    )
}

pub fn to_market_context(
    ext: Option<&Extension<WebRequestContext>>,
) -> Result<sdkwork_appstore_market_service::context::AppstoreRequestContext, Response> {
    let base = authenticated_base(ext)?;
    Ok(
        sdkwork_appstore_market_service::context::AppstoreRequestContext {
            tenant_id: base.tenant_id,
            organization_id: base.organization_id,
            user_id: base.user_id,
            request_id: base.request_id,
            permission_scopes: permission_scopes(web_context(ext)),
        },
    )
}

pub fn ok_item(
    ext: Option<&Extension<WebRequestContext>>,
    item: impl serde::Serialize,
) -> Response {
    success_item(web_context(ext), item)
}

pub fn created(
    ext: Option<&Extension<WebRequestContext>>,
    item: impl serde::Serialize,
) -> Response {
    created_item(web_context(ext), item)
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CursorPageSizeQuery {
    pub cursor: Option<String>,
    pub page_size: Option<i32>,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct LocaleQuery {
    pub locale: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SearchQuery {
    #[serde(rename = "q")]
    pub q: Option<String>,
    pub category_id: Option<String>,
    pub ids: Option<String>,
    pub cursor: Option<String>,
    pub page_size: Option<i32>,
}

pub fn ok_page<T: serde::Serialize>(
    ext: Option<&Extension<WebRequestContext>>,
    items: Vec<T>,
    next_cursor: Option<String>,
    has_more: bool,
) -> Response {
    success_page(web_context(ext), items, next_cursor, has_more)
}

macro_rules! map_service_err {
    ($ext:expr, $error:expr, $($pattern:pat => $kind:expr),+ $(,)?) => {
        match $error {
            $($pattern => map_appstore_service_error(web_context($ext), $kind)),+
        }
    };
}

pub fn map_catalog_error(
    ext: Option<&Extension<WebRequestContext>>,
    error: sdkwork_appstore_catalog_service::error::AppstoreServiceError,
) -> Response {
    use sdkwork_appstore_catalog_service::error::AppstoreServiceError;
    map_service_err!(ext, error,
        AppstoreServiceError::NotFound(m) => AppstoreServiceErrorKind::NotFound(m),
        AppstoreServiceError::AlreadyExists(m) => AppstoreServiceErrorKind::AlreadyExists(m),
        AppstoreServiceError::InvalidState(m) => AppstoreServiceErrorKind::InvalidState(m),
        AppstoreServiceError::ValidationFailed(m) => AppstoreServiceErrorKind::ValidationFailed(m),
        AppstoreServiceError::PermissionDenied(m) => AppstoreServiceErrorKind::PermissionDenied(m),
        AppstoreServiceError::Conflict(m) => AppstoreServiceErrorKind::Conflict(m),
        AppstoreServiceError::Internal(m) => AppstoreServiceErrorKind::Internal(m),
    )
}

pub fn map_listing_error(
    ext: Option<&Extension<WebRequestContext>>,
    error: sdkwork_appstore_listing_service::error::AppstoreServiceError,
) -> Response {
    use sdkwork_appstore_listing_service::error::AppstoreServiceError;
    map_service_err!(ext, error,
        AppstoreServiceError::NotFound(m) => AppstoreServiceErrorKind::NotFound(m),
        AppstoreServiceError::AlreadyExists(m) => AppstoreServiceErrorKind::AlreadyExists(m),
        AppstoreServiceError::InvalidState(m) => AppstoreServiceErrorKind::InvalidState(m),
        AppstoreServiceError::ValidationFailed(m) => AppstoreServiceErrorKind::ValidationFailed(m),
        AppstoreServiceError::PermissionDenied(m) => AppstoreServiceErrorKind::PermissionDenied(m),
        AppstoreServiceError::Conflict(m) => AppstoreServiceErrorKind::Conflict(m),
        AppstoreServiceError::Internal(m) => AppstoreServiceErrorKind::Internal(m),
    )
}

pub fn map_publisher_error(
    ext: Option<&Extension<WebRequestContext>>,
    error: sdkwork_appstore_publisher_service::error::AppstoreServiceError,
) -> Response {
    use sdkwork_appstore_publisher_service::error::AppstoreServiceError;
    map_service_err!(ext, error,
        AppstoreServiceError::NotFound(m) => AppstoreServiceErrorKind::NotFound(m),
        AppstoreServiceError::AlreadyExists(m) => AppstoreServiceErrorKind::AlreadyExists(m),
        AppstoreServiceError::InvalidState(m) => AppstoreServiceErrorKind::InvalidState(m),
        AppstoreServiceError::ValidationFailed(m) => AppstoreServiceErrorKind::ValidationFailed(m),
        AppstoreServiceError::PermissionDenied(m) => AppstoreServiceErrorKind::PermissionDenied(m),
        AppstoreServiceError::Conflict(m) => AppstoreServiceErrorKind::Conflict(m),
        AppstoreServiceError::Internal(m) => AppstoreServiceErrorKind::Internal(m),
    )
}

pub fn map_release_error(
    ext: Option<&Extension<WebRequestContext>>,
    error: sdkwork_appstore_release_service::error::AppstoreServiceError,
) -> Response {
    use sdkwork_appstore_release_service::error::AppstoreServiceError;
    map_service_err!(ext, error,
        AppstoreServiceError::NotFound(m) => AppstoreServiceErrorKind::NotFound(m),
        AppstoreServiceError::AlreadyExists(m) => AppstoreServiceErrorKind::AlreadyExists(m),
        AppstoreServiceError::InvalidState(m) => AppstoreServiceErrorKind::InvalidState(m),
        AppstoreServiceError::ValidationFailed(m) => AppstoreServiceErrorKind::ValidationFailed(m),
        AppstoreServiceError::PermissionDenied(m) => AppstoreServiceErrorKind::PermissionDenied(m),
        AppstoreServiceError::Conflict(m) => AppstoreServiceErrorKind::Conflict(m),
        AppstoreServiceError::Internal(m) => AppstoreServiceErrorKind::Internal(m),
    )
}

pub fn map_library_error(
    ext: Option<&Extension<WebRequestContext>>,
    error: sdkwork_appstore_library_service::error::AppstoreServiceError,
) -> Response {
    use sdkwork_appstore_library_service::error::AppstoreServiceError;
    map_service_err!(ext, error,
        AppstoreServiceError::NotFound(m) => AppstoreServiceErrorKind::NotFound(m),
        AppstoreServiceError::AlreadyExists(m) => AppstoreServiceErrorKind::AlreadyExists(m),
        AppstoreServiceError::InvalidState(m) => AppstoreServiceErrorKind::InvalidState(m),
        AppstoreServiceError::ValidationFailed(m) => AppstoreServiceErrorKind::ValidationFailed(m),
        AppstoreServiceError::PermissionDenied(m) => AppstoreServiceErrorKind::PermissionDenied(m),
        AppstoreServiceError::Conflict(m) => AppstoreServiceErrorKind::Conflict(m),
        AppstoreServiceError::Internal(m) => AppstoreServiceErrorKind::Internal(m),
    )
}

pub fn map_moderation_error(
    ext: Option<&Extension<WebRequestContext>>,
    error: sdkwork_appstore_moderation_service::error::AppstoreServiceError,
) -> Response {
    use sdkwork_appstore_moderation_service::error::AppstoreServiceError;
    map_service_err!(ext, error,
        AppstoreServiceError::NotFound(m) => AppstoreServiceErrorKind::NotFound(m),
        AppstoreServiceError::AlreadyExists(m) => AppstoreServiceErrorKind::AlreadyExists(m),
        AppstoreServiceError::InvalidState(m) => AppstoreServiceErrorKind::InvalidState(m),
        AppstoreServiceError::ValidationFailed(m) => AppstoreServiceErrorKind::ValidationFailed(m),
        AppstoreServiceError::PermissionDenied(m) => AppstoreServiceErrorKind::PermissionDenied(m),
        AppstoreServiceError::Conflict(m) => AppstoreServiceErrorKind::Conflict(m),
        AppstoreServiceError::Internal(m) => AppstoreServiceErrorKind::Internal(m),
    )
}

pub fn map_compliance_error(
    ext: Option<&Extension<WebRequestContext>>,
    error: sdkwork_appstore_compliance_service::error::AppstoreServiceError,
) -> Response {
    use sdkwork_appstore_compliance_service::error::AppstoreServiceError;
    map_service_err!(ext, error,
        AppstoreServiceError::NotFound(m) => AppstoreServiceErrorKind::NotFound(m),
        AppstoreServiceError::AlreadyExists(m) => AppstoreServiceErrorKind::AlreadyExists(m),
        AppstoreServiceError::InvalidState(m) => AppstoreServiceErrorKind::InvalidState(m),
        AppstoreServiceError::ValidationFailed(m) => AppstoreServiceErrorKind::ValidationFailed(m),
        AppstoreServiceError::PermissionDenied(m) => AppstoreServiceErrorKind::PermissionDenied(m),
        AppstoreServiceError::Conflict(m) => AppstoreServiceErrorKind::Conflict(m),
        AppstoreServiceError::Internal(m) => AppstoreServiceErrorKind::Internal(m),
    )
}

pub fn map_market_error(
    ext: Option<&Extension<WebRequestContext>>,
    error: sdkwork_appstore_market_service::error::AppstoreServiceError,
) -> Response {
    use sdkwork_appstore_market_service::error::AppstoreServiceError;
    map_service_err!(ext, error,
        AppstoreServiceError::NotFound(m) => AppstoreServiceErrorKind::NotFound(m),
        AppstoreServiceError::AlreadyExists(m) => AppstoreServiceErrorKind::AlreadyExists(m),
        AppstoreServiceError::InvalidState(m) => AppstoreServiceErrorKind::InvalidState(m),
        AppstoreServiceError::ValidationFailed(m) => AppstoreServiceErrorKind::ValidationFailed(m),
        AppstoreServiceError::PermissionDenied(m) => AppstoreServiceErrorKind::PermissionDenied(m),
        AppstoreServiceError::Conflict(m) => AppstoreServiceErrorKind::Conflict(m),
        AppstoreServiceError::Internal(m) => AppstoreServiceErrorKind::Internal(m),
    )
}

pub fn to_user_store_context(
    ext: Option<&Extension<WebRequestContext>>,
) -> Result<sdkwork_appstore_user_store_service::context::AppstoreRequestContext, Response> {
    let base = authenticated_base(ext)?;
    let organization_id = organization_id_or_default(&base);
    let user_id = require_user_id(&base)?;
    Ok(
        sdkwork_appstore_user_store_service::context::AppstoreRequestContext {
            tenant_id: base.tenant_id,
            organization_id,
            user_id,
            request_id: base.request_id,
            trace_id: trace_id(web_context(ext)),
            permission_scopes: permission_scopes(web_context(ext)),
        },
    )
}

pub fn to_user_store_context_public(
    ext: Option<&Extension<WebRequestContext>>,
) -> sdkwork_appstore_user_store_service::context::AppstoreRequestContext {
    let base = base_context(web_context(ext));
    sdkwork_appstore_user_store_service::context::AppstoreRequestContext {
        tenant_id: base.tenant_id,
        organization_id: base.organization_id.unwrap_or_default(),
        user_id: base.user_id.unwrap_or_default(),
        request_id: base.request_id,
        trace_id: trace_id(web_context(ext)),
        permission_scopes: permission_scopes(web_context(ext)),
    }
}

pub fn map_user_store_error(
    ext: Option<&Extension<WebRequestContext>>,
    error: sdkwork_appstore_user_store_service::error::AppstoreServiceError,
) -> Response {
    use sdkwork_appstore_user_store_service::error::AppstoreServiceError;
    map_service_err!(ext, error,
        AppstoreServiceError::NotFound(m) => AppstoreServiceErrorKind::NotFound(m),
        AppstoreServiceError::AlreadyExists(m) => AppstoreServiceErrorKind::AlreadyExists(m),
        AppstoreServiceError::InvalidState(m) => AppstoreServiceErrorKind::InvalidState(m),
        AppstoreServiceError::ValidationFailed(m) => AppstoreServiceErrorKind::ValidationFailed(m),
        AppstoreServiceError::PermissionDenied(m) => AppstoreServiceErrorKind::PermissionDenied(m),
        AppstoreServiceError::Conflict(m) => AppstoreServiceErrorKind::Conflict(m),
        AppstoreServiceError::Internal(m) => AppstoreServiceErrorKind::Internal(m),
    )
}
