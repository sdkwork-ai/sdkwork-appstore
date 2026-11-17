//! Service layer of the remix capability.

pub mod remix_service;

pub use remix_service::{deploy_target, RemixService, MAX_DEPLOY_LOOKUPS_PER_REQUEST};
