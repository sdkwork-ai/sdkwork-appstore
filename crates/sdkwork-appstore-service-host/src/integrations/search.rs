use super::registry::{IntegrationCapability, IntegrationOwner, IntegrationSurface};
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

pub const CAPABILITY: IntegrationCapability = IntegrationCapability {
    key: "search",
    owner: IntegrationOwner::PlatformProvider("sdkwork-search"),
    purpose: "Catalog search, keyword indexing, ranking projection, and category discovery.",
    surfaces: &[
        IntegrationSurface::OpenApi,
        IntegrationSurface::ServicePort,
        IntegrationSurface::WorkerProjection,
    ],
    required: false,
    todo: "",
};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SearchDocument {
    pub listing_id: String,
    pub tenant_id: String,
    pub display_name: String,
    pub subtitle: Option<String>,
    pub short_description: String,
    pub keywords: Vec<String>,
    pub category_ids: Vec<String>,
    pub locale: String,
    pub average_rating: Option<String>,
    pub download_count: i32,
    pub published_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SearchRequest {
    pub query: String,
    pub category_id: Option<String>,
    pub locale: Option<String>,
    pub limit: i32,
    pub offset: i32,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SearchResult {
    pub listing_id: String,
    pub score: f64,
    pub display_name: String,
    pub subtitle: Option<String>,
}

#[async_trait]
pub trait SearchConnector: Send + Sync {
    async fn index_document(&self, document: &SearchDocument) -> Result<(), String>;

    async fn remove_document(&self, tenant_id: &str, listing_id: &str) -> Result<(), String>;

    async fn search(
        &self,
        tenant_id: &str,
        request: &SearchRequest,
    ) -> Result<Vec<SearchResult>, String>;

    async fn refresh_index(&self, tenant_id: &str) -> Result<(), String>;
}
