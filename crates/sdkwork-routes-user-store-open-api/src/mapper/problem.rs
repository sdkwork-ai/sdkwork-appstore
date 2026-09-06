use sdkwork_appstore_user_store_service::error::AppstoreServiceError;

pub fn map_service_error(error: AppstoreServiceError) -> (u16, String) {
    match error {
        AppstoreServiceError::NotFound(msg) => (404, msg),
        AppstoreServiceError::AlreadyExists(msg) => (409, msg),
        AppstoreServiceError::InvalidState(msg) => (422, msg),
        AppstoreServiceError::ValidationFailed(msg) => (400, msg),
        AppstoreServiceError::PermissionDenied(msg) => (403, msg),
        AppstoreServiceError::Conflict(msg) => (409, msg),
        AppstoreServiceError::Internal(msg) => (500, msg),
    }
}
