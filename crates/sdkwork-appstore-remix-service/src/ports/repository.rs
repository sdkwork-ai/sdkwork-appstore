//! Deployment binding reads owned by the App Store database.

use async_trait::async_trait;

use crate::domain::models::RemixBinding;

/// Reads that resolve a store listing onto the deployment that produced it.
///
/// `appstore_application_deployment_binding` is the only join between the two
/// modules (`app_id` <-> `deploy_app_id`); it is read here and never written,
/// because the binding lifecycle belongs to the deploys/publisher flows.
#[async_trait]
pub trait RemixRepositoryPort: Send + Sync {
    /// Application id of a listing that is currently published on the
    /// storefront.
    ///
    /// Returns `None` for a missing, deleted, non-active, or hidden listing, so
    /// the caller cannot expose a remix download for a listing the storefront
    /// does not show.
    async fn find_visible_listing_app_id(
        &self,
        tenant_id: &str,
        listing_id: &str,
    ) -> Result<Option<String>, String>;

    /// Deployment bindings for the given App Store application ids.
    ///
    /// At most one binding per application is returned: a live binding that is
    /// not revoked or invalid, preferring an active default production binding.
    async fn find_bindings(
        &self,
        tenant_id: &str,
        app_ids: &[String],
    ) -> Result<Vec<RemixBinding>, String>;
}
