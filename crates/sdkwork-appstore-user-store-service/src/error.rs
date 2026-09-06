//! Service errors.

use std::fmt::{Display, Formatter};

pub type AppstoreServiceResult<T> = Result<T, AppstoreServiceError>;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AppstoreServiceError {
    NotFound(String),
    AlreadyExists(String),
    InvalidState(String),
    ValidationFailed(String),
    PermissionDenied(String),
    Conflict(String),
    Internal(String),
}

impl Display for AppstoreServiceError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::NotFound(message) => write!(formatter, "Not found: {}", message),
            Self::AlreadyExists(message) => write!(formatter, "Already exists: {}", message),
            Self::InvalidState(message) => write!(formatter, "Invalid state: {}", message),
            Self::ValidationFailed(message) => write!(formatter, "Validation failed: {}", message),
            Self::PermissionDenied(message) => write!(formatter, "Permission denied: {}", message),
            Self::Conflict(message) => write!(formatter, "Conflict: {}", message),
            Self::Internal(message) => write!(formatter, "Internal error: {}", message),
        }
    }
}

impl std::error::Error for AppstoreServiceError {}
