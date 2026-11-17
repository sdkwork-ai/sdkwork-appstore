//! SDKWork App Store remix service boundary.
//!
//! Remix hands a storefront visitor the source of a published application: a
//! Git repository to clone, or a source archive whose bytes they fetch through
//! sdkwork-drive. The App Store owns neither the source nor its readiness —
//! sdkwork-deploy does — so this crate only:
//!
//! - reads the single join that maps a store application onto a deploy
//!   application (`appstore_application_deployment_binding`),
//! - reads deploy's per-application remix state through a port,
//! - projects `remixable` onto listing reads and the download coordinates onto
//!   the dedicated remix endpoint.
//!
//! It never writes the binding table and never fabricates coordinates: when
//! deploy cannot be consulted, the read is `unavailable`, not "not remixable".

pub mod domain;
pub mod error;
pub mod ports;
pub mod service;

pub use domain::models::{
    RemixArchiveCoordinates, RemixBinding, RemixDownload, RemixGitCoordinates, RemixMode,
    RemixState, DEPLOY_BASE_URL_ENV,
};
pub use error::{RemixServiceError, RemixServiceResult};
pub use ports::deploy::{DeployRemixPort, RemixPortError};
pub use ports::repository::RemixRepositoryPort;
pub use service::remix_service::{deploy_target, RemixService, MAX_DEPLOY_LOOKUPS_PER_REQUEST};

/// Capability name, matching the route capability prefix.
pub const CAPABILITY: &str = "remix";

/// Capability name accessor.
#[must_use]
pub fn capability_name() -> &'static str {
    CAPABILITY
}
