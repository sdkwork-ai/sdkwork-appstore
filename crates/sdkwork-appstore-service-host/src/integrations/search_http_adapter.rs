//! Split-deployment sdkwork-search federation adapter (HTTP).
//!
//! Selected only by `APPSTORE_INTEGRATION_MODE=http` plus
//! `APPSTORE_SEARCH_ENABLED=1`; see `ports.rs`. The default deployment
//! federates in-process (`search_inprocess.rs`).
//!
//! Deliberate exception recorded in `specs/backend-module-call-boundary.allow.json`.

use async_trait::async_trait;
use serde::Deserialize;
use serde_json::json;

use sdkwork_appstore_catalog_service::ports::search_federation::CatalogSearchFederationPort;

use super::http_client::IntegrationHttpClient;

/// Catalog search federation backed by sdkwork-search's app-api over HTTP.
#[derive(Debug, Clone)]
pub struct SearchFederationHttpAdapter {
    http: IntegrationHttpClient,
    capability_ids: Vec<String>,
}

impl SearchFederationHttpAdapter {
    /// Build the split-deployment adapter from the documented environment
    /// contract.
    ///
    /// # Errors
    ///
    /// Fails when the search endpoint is absent. This is a startup failure on
    /// purpose (MODULE_SPEC.md §4.2.3).
    pub fn from_env() -> Result<Self, String> {
        let base_url = std::env::var("APPSTORE_SEARCH_BASE_URL").map_err(|_| {
            "APPSTORE_INTEGRATION_MODE=http with APPSTORE_SEARCH_ENABLED=1 requires \
             APPSTORE_SEARCH_BASE_URL for the sdkwork-search split deployment"
                .to_string()
        })?;
        let auth_token = std::env::var("APPSTORE_SEARCH_SERVICE_AUTH_TOKEN")
            .ok()
            .or_else(|| std::env::var("APPSTORE_SEARCH_API_KEY").ok());
        let access_token = std::env::var("APPSTORE_SEARCH_SERVICE_ACCESS_TOKEN")
            .ok()
            .or_else(|| std::env::var("APPSTORE_SEARCH_ACCESS_TOKEN").ok());
        let capability_ids = std::env::var("APPSTORE_SEARCH_CAPABILITY_IDS")
            .ok()
            .map(|value| {
                value
                    .split(',')
                    .map(str::trim)
                    .filter(|part| !part.is_empty())
                    .map(str::to_string)
                    .collect::<Vec<_>>()
            })
            .unwrap_or_default();
        let http =
            IntegrationHttpClient::with_access_token(base_url, auth_token, access_token, 30)?;
        Ok(Self {
            http,
            capability_ids,
        })
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SearchQueryWire {
    items: Vec<SearchResultWire>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SearchResultWire {
    document: SearchDocumentWire,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SearchDocumentWire {
    id: String,
}

#[async_trait]
impl CatalogSearchFederationPort for SearchFederationHttpAdapter {
    async fn resolve_listing_ids(
        &self,
        _tenant_id: &str,
        query: &str,
        _category_id: Option<&str>,
        limit: i32,
    ) -> Result<Vec<String>, String> {
        let mut body = json!({
            "q": query,
            "page": 1,
            "pageSize": limit.max(1).min(200),
        });
        if !self.capability_ids.is_empty() {
            body["capabilityIds"] = json!(self.capability_ids);
        }
        let response: SearchQueryWire = self
            .http
            .post_envelope_item("/app/v3/api/search/queries", &body)
            .await
            .map_err(|error| format!("sdkwork-search queries.create failed: {error}"))?;
        Ok(response
            .items
            .into_iter()
            .map(|item| item.document.id)
            .filter(|id| !id.trim().is_empty())
            .collect())
    }
}
