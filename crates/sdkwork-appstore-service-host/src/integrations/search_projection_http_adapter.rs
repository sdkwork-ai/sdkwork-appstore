//! Split-deployment sdkwork-search index projection adapter (HTTP).
//!
//! Selected only by `APPSTORE_INTEGRATION_MODE=http` plus
//! `APPSTORE_SEARCH_PROJECTION_ENABLED=1`; see `ports.rs`. The default
//! deployment projects in-process (`search_inprocess.rs`).
//!
//! Deliberate exception recorded in `specs/backend-module-call-boundary.allow.json`.

use async_trait::async_trait;
use serde_json::json;

use sdkwork_appstore_listing_service::ports::search_projection::{
    ListingSearchProjectionPort, PublishedListingSearchDocument,
};

use super::http_client::IntegrationHttpClient;

/// Published-listing projection backed by sdkwork-search's backend-api over HTTP.
#[derive(Debug, Clone)]
pub struct SearchProjectionHttpAdapter {
    http: IntegrationHttpClient,
    index_id: String,
}

impl SearchProjectionHttpAdapter {
    /// Build the split-deployment adapter from the documented environment
    /// contract.
    ///
    /// # Errors
    ///
    /// Fails when the search backend endpoint or the index id is absent. This is
    /// a startup failure on purpose (MODULE_SPEC.md §4.2.3).
    pub fn from_env() -> Result<Self, String> {
        let base_url = std::env::var("APPSTORE_SEARCH_BACKEND_BASE_URL").map_err(|_| {
            "APPSTORE_INTEGRATION_MODE=http with APPSTORE_SEARCH_PROJECTION_ENABLED=1 requires \
             APPSTORE_SEARCH_BACKEND_BASE_URL for the sdkwork-search split deployment"
                .to_string()
        })?;
        let index_id = std::env::var("APPSTORE_SEARCH_INDEX_ID").map_err(|_| {
            "APPSTORE_SEARCH_INDEX_ID is required for search index projection".to_string()
        })?;
        let auth_token = std::env::var("APPSTORE_SEARCH_SERVICE_AUTH_TOKEN")
            .ok()
            .or_else(|| std::env::var("APPSTORE_SEARCH_API_KEY").ok());
        let access_token = std::env::var("APPSTORE_SEARCH_SERVICE_ACCESS_TOKEN")
            .ok()
            .or_else(|| std::env::var("APPSTORE_SEARCH_ACCESS_TOKEN").ok());
        let http =
            IntegrationHttpClient::with_access_token(base_url, auth_token, access_token, 30)?;
        Ok(Self { http, index_id })
    }
}

#[async_trait]
impl ListingSearchProjectionPort for SearchProjectionHttpAdapter {
    async fn upsert_published_listing(
        &self,
        document: &PublishedListingSearchDocument,
    ) -> Result<(), String> {
        let path = format!(
            "/backend/v3/api/search/indexes/{}/documents/{}",
            urlencoding::encode(&self.index_id),
            urlencoding::encode(&document.listing_id),
        );
        let body = json!({
            "document": {
                "id": document.listing_id,
                "title": document.title,
                "description": document.description,
                "enabled": true,
                "group": document.category_id,
                "scope": document.tenant_id,
                "source": "sdkwork-appstore",
                "metadata": {
                    "listingSlug": document.listing_slug,
                    "tenantId": document.tenant_id,
                },
            }
        });
        let _: serde_json::Value = self
            .http
            .put_envelope_item(&path, &body)
            .await
            .map_err(|error| format!("search document upsert failed: {error}"))?;
        Ok(())
    }

    async fn remove_listing(&self, _tenant_id: &str, listing_id: &str) -> Result<(), String> {
        let path = format!(
            "/backend/v3/api/search/indexes/{}/documents/{}",
            urlencoding::encode(&self.index_id),
            urlencoding::encode(listing_id),
        );
        self.http
            .delete_envelope(&path)
            .await
            .map_err(|error| format!("search document delete failed: {error}"))
    }
}
