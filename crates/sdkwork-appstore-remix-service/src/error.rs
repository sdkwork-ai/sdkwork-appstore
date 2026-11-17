//! Remix service errors.

use std::fmt::{Display, Formatter};

/// Why a remix read could not be satisfied.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RemixServiceError {
    /// No remix download exists for the requested listing. The storefront
    /// answers `404` for this: an unpublished listing, an unbound application,
    /// and a listing whose deploy source is not ready are indistinguishable to
    /// a storefront caller on purpose.
    NotFound(String),
    /// The deploy integration is not configured or unreachable, so availability
    /// cannot be decided. The storefront answers `503` naming the missing
    /// configuration instead of reporting "not remixable".
    Unavailable(String),
    /// Unexpected failure while reading the binding or the deploy response.
    Internal(String),
}

impl Display for RemixServiceError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::NotFound(message) => write!(formatter, "Not found: {message}"),
            Self::Unavailable(message) => write!(formatter, "Service unavailable: {message}"),
            Self::Internal(message) => write!(formatter, "Internal error: {message}"),
        }
    }
}

impl std::error::Error for RemixServiceError {}

/// Result alias of the remix service.
pub type RemixServiceResult<T> = Result<T, RemixServiceError>;
