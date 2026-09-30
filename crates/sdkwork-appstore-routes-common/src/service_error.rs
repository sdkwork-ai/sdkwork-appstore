//! Maps duplicated App Store service error enums to ProblemDetail responses.

use axum::http::StatusCode;
use axum::response::Response;
use sdkwork_utils_rust::SdkWorkResultCode;
use sdkwork_web_core::WebRequestContext;

use crate::api_response::map_service_error_message;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AppstoreServiceErrorKind {
    NotFound(String),
    AlreadyExists(String),
    InvalidState(String),
    ValidationFailed(String),
    PermissionDenied(String),
    Conflict(String),
    Internal(String),
}

impl AppstoreServiceErrorKind {
    pub fn message(&self) -> &str {
        match self {
            Self::NotFound(message)
            | Self::AlreadyExists(message)
            | Self::InvalidState(message)
            | Self::ValidationFailed(message)
            | Self::PermissionDenied(message)
            | Self::Conflict(message)
            | Self::Internal(message) => message,
        }
    }
}

/// Public detail returned for any 5xx. Internal diagnostics (SQL dialect,
/// constraint names, table shapes) must never leak into responses; they are
/// only written to logs and correlated through the trace id header.
pub const INTERNAL_ERROR_PUBLIC_DETAIL: &str = "Internal server error";

pub fn classify_service_error_message(message: &str) -> (StatusCode, SdkWorkResultCode) {
    let lower = message.to_ascii_lowercase();
    if lower.contains("not found") {
        (StatusCode::NOT_FOUND, SdkWorkResultCode::NotFound)
    } else if lower.contains("permission denied") || lower.contains("forbidden") {
        (StatusCode::FORBIDDEN, SdkWorkResultCode::PermissionRequired)
    } else if lower.contains("invalid state") {
        // Must be tested before the generic "invalid" match, otherwise
        // invalid-state failures collapse into 400 validation errors.
        (
            StatusCode::UNPROCESSABLE_ENTITY,
            SdkWorkResultCode::UnprocessableEntity,
        )
    } else if lower.contains("validation failed") || lower.contains("invalid") {
        (StatusCode::BAD_REQUEST, SdkWorkResultCode::ValidationError)
    } else if lower.contains("conflict") || lower.contains("already exists") {
        (StatusCode::CONFLICT, SdkWorkResultCode::Conflict)
    } else {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            SdkWorkResultCode::InternalError,
        )
    }
}

pub fn map_appstore_service_error(
    context: Option<&WebRequestContext>,
    error: AppstoreServiceErrorKind,
) -> Response {
    let (status, result_code) = match &error {
        AppstoreServiceErrorKind::NotFound(_) => {
            (StatusCode::NOT_FOUND, SdkWorkResultCode::NotFound)
        }
        AppstoreServiceErrorKind::AlreadyExists(_) => {
            (StatusCode::CONFLICT, SdkWorkResultCode::Conflict)
        }
        AppstoreServiceErrorKind::InvalidState(_) => (
            StatusCode::UNPROCESSABLE_ENTITY,
            SdkWorkResultCode::UnprocessableEntity,
        ),
        AppstoreServiceErrorKind::ValidationFailed(_) => {
            (StatusCode::BAD_REQUEST, SdkWorkResultCode::ValidationError)
        }
        AppstoreServiceErrorKind::PermissionDenied(_) => {
            (StatusCode::FORBIDDEN, SdkWorkResultCode::PermissionRequired)
        }
        AppstoreServiceErrorKind::Conflict(_) => {
            (StatusCode::CONFLICT, SdkWorkResultCode::Conflict)
        }
        AppstoreServiceErrorKind::Internal(message) => {
            tracing::error!(%message, "appstore internal error");
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                SdkWorkResultCode::InternalError,
            )
        }
    };
    let detail = match &error {
        AppstoreServiceErrorKind::Internal(_) => INTERNAL_ERROR_PUBLIC_DETAIL,
        _ => error.message(),
    };
    map_service_error_message(context, status, result_code, detail)
}

pub fn map_display_error(
    context: Option<&WebRequestContext>,
    error: impl std::fmt::Display,
) -> Response {
    let message = error.to_string();
    let (status, result_code) = classify_service_error_message(&message);
    let detail = if status.is_server_error() {
        tracing::error!(%message, "appstore internal display error");
        INTERNAL_ERROR_PUBLIC_DETAIL
    } else {
        message.as_str()
    };
    map_service_error_message(context, status, result_code, detail)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn invalid_state_classifies_before_generic_invalid() {
        let (status, _) =
            classify_service_error_message("Download grant already consumed: invalid state");
        assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
    }

    #[test]
    fn invalid_input_classifies_as_validation() {
        let (status, _) = classify_service_error_message("Validation failed: invalid page_size");
        assert_eq!(status, StatusCode::BAD_REQUEST);
    }

    #[test]
    fn unknown_message_falls_back_to_internal() {
        let (status, _) = classify_service_error_message("database exploded");
        assert_eq!(status, StatusCode::INTERNAL_SERVER_ERROR);
    }
}
