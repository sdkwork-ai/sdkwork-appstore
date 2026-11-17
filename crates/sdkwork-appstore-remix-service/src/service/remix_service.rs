//! Remix service entrypoint.
//!
//! Composes three responsibilities:
//!
//! 1. Decide whether a listing is *remixable*, which needs the App Store
//!    deployment binding plus a live deploy readiness verdict.
//! 2. Project one listing's download coordinates for a storefront caller.
//! 3. Keep a deploy outage distinguishable from "this listing has no remix
//!    download", so list decorating degrades to `false` while the dedicated
//!    endpoint answers `503` naming the missing configuration.

use std::collections::{BTreeMap, BTreeSet};
use std::sync::Arc;

use tracing::warn;

use crate::domain::models::{RemixBinding, RemixDownload, RemixState, DEPLOY_BASE_URL_ENV};
use crate::error::{RemixServiceError, RemixServiceResult};
use crate::ports::deploy::{DeployRemixPort, RemixPortError};
use crate::ports::repository::RemixRepositoryPort;

/// Upper bound on deploy readiness reads a single list call performs.
///
/// List decorating never fails a page: beyond this bound the remaining
/// listings report `remixable: false` for that response and a warning is
/// logged. In the current data plane the deployment binding table is empty, so
/// a catalog page normally performs zero deploy calls; the bound exists for the
/// future where many listings are bound and deploy is slow.
pub const MAX_DEPLOY_LOOKUPS_PER_REQUEST: usize = 32;

/// Remix operations exposed to the route layer.
pub struct RemixService<R: RemixRepositoryPort> {
    repository: R,
    deploy: Option<Arc<dyn DeployRemixPort>>,
}

impl<R: RemixRepositoryPort> Clone for RemixService<R>
where
    R: Clone,
{
    fn clone(&self) -> Self {
        Self {
            repository: self.repository.clone(),
            deploy: self.deploy.clone(),
        }
    }
}

impl<R: RemixRepositoryPort> RemixService<R> {
    /// Build the service over the App Store binding repository.
    #[must_use]
    pub fn new(repository: R) -> Self {
        Self {
            repository,
            deploy: None,
        }
    }

    /// Attach the deploy app API port. Without it every remix read answers
    /// "unavailable", naming `APPSTORE_DEPLOY_BASE_URL`.
    #[must_use]
    pub fn with_deploy_port(mut self, deploy: Arc<dyn DeployRemixPort>) -> Self {
        self.deploy = Some(deploy);
        self
    }

    /// App Store application ids of the given listings that are currently
    /// remixable.
    ///
    /// Best-effort by contract: an unreadable binding store, a missing deploy
    /// configuration, or a deploy failure all resolve to "not remixable" for
    /// the affected listings, because a catalog page must still render.
    pub async fn remixable_app_ids(&self, tenant_id: &str, app_ids: &[String]) -> BTreeSet<String> {
        let mut unique_app_ids: Vec<String> = Vec::new();
        let mut seen = BTreeSet::new();
        for app_id in app_ids {
            let trimmed = app_id.trim();
            if !trimmed.is_empty() && seen.insert(trimmed.to_string()) {
                unique_app_ids.push(trimmed.to_string());
            }
        }
        if unique_app_ids.is_empty() {
            return BTreeSet::new();
        }

        let bindings = match self
            .repository
            .find_bindings(tenant_id, &unique_app_ids)
            .await
        {
            Ok(bindings) => bindings,
            Err(error) => {
                warn!(%error, "remix binding lookup failed; reporting listings as not remixable");
                return BTreeSet::new();
            }
        };
        if bindings.is_empty() {
            return BTreeSet::new();
        }
        let Some(deploy) = self.deploy.as_ref() else {
            warn!(
                env_var = DEPLOY_BASE_URL_ENV,
                "remix deploy port is not wired; reporting listings as not remixable"
            );
            return BTreeSet::new();
        };

        // Several App Store applications may bind the same deploy application
        // (for example a shared source across regional listings); resolve the
        // deploy application once per distinct uuid.
        let mut app_ids_by_deploy: BTreeMap<&str, Vec<&str>> = BTreeMap::new();
        for binding in &bindings {
            if binding.deploy_app_uuid.trim().is_empty() {
                continue;
            }
            app_ids_by_deploy
                .entry(binding.deploy_app_uuid.as_str())
                .or_default()
                .push(binding.app_id.as_str());
        }

        let mut remixable = BTreeSet::new();
        let mut lookups = 0usize;
        for (deploy_app_uuid, app_ids) in app_ids_by_deploy {
            if lookups >= MAX_DEPLOY_LOOKUPS_PER_REQUEST {
                warn!(
                    skipped = app_ids.len(),
                    limit = MAX_DEPLOY_LOOKUPS_PER_REQUEST,
                    "remix readiness lookup budget exhausted for this page"
                );
                break;
            }
            lookups += 1;
            match deploy.remix_state(tenant_id, deploy_app_uuid).await {
                Ok(state) if state.is_ready() => {
                    for app_id in app_ids {
                        remixable.insert(app_id.to_string());
                    }
                }
                Ok(_) => {}
                Err(error) => {
                    warn!(
                        %error,
                        deploy_app_uuid,
                        "deploy remix readiness read failed; reporting listings as not remixable"
                    );
                }
            }
        }
        remixable
    }

    /// Whether one App Store application is currently remixable.
    pub async fn is_app_remixable(&self, tenant_id: &str, app_id: &str) -> bool {
        self.remixable_app_ids(tenant_id, &[app_id.to_string()])
            .await
            .contains(app_id)
    }

    /// Resolve the remix download of one storefront listing.
    ///
    /// # Errors
    ///
    /// - [`RemixServiceError::NotFound`] when the listing is not published, has
    ///   no deployment binding, or deploy reports that remix is off / the source
    ///   is not ready / the deploy application no longer exists.
    /// - [`RemixServiceError::Unavailable`] when `APPSTORE_DEPLOY_BASE_URL` is
    ///   unset or deploy cannot be reached, so availability is undecidable.
    /// - [`RemixServiceError::Internal`] when the binding store cannot be read.
    pub async fn resolve_listing_remix(
        &self,
        tenant_id: &str,
        listing_id: &str,
    ) -> RemixServiceResult<RemixDownload> {
        let listing_id = listing_id.trim();
        if listing_id.is_empty() {
            return Err(RemixServiceError::NotFound(
                "listing id is required".to_string(),
            ));
        }

        let app_id = self
            .repository
            .find_visible_listing_app_id(tenant_id, listing_id)
            .await
            .map_err(RemixServiceError::Internal)?
            .ok_or_else(|| {
                RemixServiceError::NotFound(format!(
                    "listing {listing_id} is not published on the storefront"
                ))
            })?;

        let binding = self
            .repository
            .find_bindings(tenant_id, std::slice::from_ref(&app_id))
            .await
            .map_err(RemixServiceError::Internal)?
            .into_iter()
            .find(|binding| binding.app_id == app_id)
            .ok_or_else(|| {
                RemixServiceError::NotFound(format!(
                    "listing {listing_id} has no deployment binding for remix"
                ))
            })?;
        let deploy_app_uuid = deploy_target(&binding).ok_or_else(|| {
            RemixServiceError::NotFound(format!(
                "listing {listing_id} binds a deploy application without a uuid"
            ))
        })?;

        let deploy = self
            .deploy
            .as_ref()
            .ok_or_else(|| RemixServiceError::Unavailable(missing_deploy_message()))?;

        let state = deploy
            .remix_state(tenant_id, deploy_app_uuid)
            .await
            .map_err(|error| match error {
                RemixPortError::Unconfigured(variable) => RemixServiceError::Unavailable(format!(
                    "{variable} is not configured; listing remix downloads cannot be resolved"
                )),
                RemixPortError::UnknownApplication => RemixServiceError::NotFound(format!(
                    "listing {listing_id} binds a deploy application that no longer exists"
                )),
                RemixPortError::Unavailable(message) => RemixServiceError::Unavailable(format!(
                    "the deploy remix read failed; listing remix downloads cannot be resolved: {message}"
                )),
            })?;

        if !state.is_ready() {
            return Err(RemixServiceError::NotFound(format!(
                "listing {listing_id} is not remixable: {}",
                readiness_reason(&state)
            )));
        }
        state.download.ok_or_else(|| {
            RemixServiceError::NotFound(format!(
                "listing {listing_id} is not remixable: deploy returned no download coordinates"
            ))
        })
    }
}

fn missing_deploy_message() -> String {
    format!("{DEPLOY_BASE_URL_ENV} is not configured; listing remix downloads cannot be resolved")
}

/// Human-readable reason a remix state is unusable, for the `404` detail.
fn readiness_reason(state: &RemixState) -> String {
    if !state.remix_enabled {
        return "remix is not enabled for the bound deploy application".to_string();
    }
    if !state.source_ready {
        return "the deploy application source is not ready".to_string();
    }
    "the deploy application returned incomplete download coordinates".to_string()
}

/// Project one deployment binding onto the deploy application uuid the app API
/// addresses.
///
/// Kept as a free function so tests can exercise the mapping without a service.
#[must_use]
pub fn deploy_target(binding: &RemixBinding) -> Option<&str> {
    let candidate = binding.deploy_app_uuid.trim();
    (!candidate.is_empty()).then_some(candidate)
}
