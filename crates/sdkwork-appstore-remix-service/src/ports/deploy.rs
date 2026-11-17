//! Deploy app API port: one application's remix state.

use std::fmt::{Display, Formatter};

use async_trait::async_trait;

use crate::domain::models::RemixState;

/// Why a deploy remix read produced no state.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RemixPortError {
    /// The deploy base URL is not configured. The value is the environment
    /// variable the deployment must set; the HTTP layer turns this into a `503`
    /// that names it.
    Unconfigured(&'static str),
    /// Deploy does not know the application in the caller's tenant. The binding
    /// is stale, which is "not remixable" rather than an outage.
    UnknownApplication,
    /// Transport, status, or payload failure.
    Unavailable(String),
}

impl Display for RemixPortError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Unconfigured(variable) => {
                write!(
                    formatter,
                    "deploy integration is not configured: {variable}"
                )
            }
            Self::UnknownApplication => {
                write!(formatter, "deploy does not know the requested application")
            }
            Self::Unavailable(message) => write!(formatter, "deploy remix read failed: {message}"),
        }
    }
}

impl std::error::Error for RemixPortError {}

/// Deploy-owned remix reads (sdkwork-deploy app API).
#[async_trait]
pub trait DeployRemixPort: Send + Sync {
    /// Read the remix state of one deploy application.
    ///
    /// # Errors
    ///
    /// Fails with [`RemixPortError::Unconfigured`] when the base URL is absent,
    /// [`RemixPortError::UnknownApplication`] when deploy answers `404`, and
    /// [`RemixPortError::Unavailable`] for any other transport failure.
    async fn remix_state(
        &self,
        tenant_id: &str,
        deploy_app_uuid: &str,
    ) -> Result<RemixState, RemixPortError>;
}
