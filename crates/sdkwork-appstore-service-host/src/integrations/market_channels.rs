use super::registry::{IntegrationCapability, IntegrationOwner, IntegrationSurface};
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

pub const CAPABILITY: IntegrationCapability = IntegrationCapability {
    key: "market_channels",
    owner: IntegrationOwner::AppStore,
    purpose: "Apple App Store, Google Play, enterprise channel, and external marketplace release projection.",
    surfaces: &[
        IntegrationSurface::ServicePort,
        IntegrationSurface::WorkerProjection,
        IntegrationSurface::ExternalConnector,
    ],
    required: false,
    todo: "",
};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct MarketSubmission {
    pub external_app_id: String,
    pub version_name: String,
    pub version_code: String,
    pub artifact_url: String,
    pub release_notes: String,
    pub metadata: serde_json::Value,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct MarketSubmissionResult {
    pub external_release_id: String,
    pub external_status: String,
    pub submitted_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct MarketStatusResult {
    pub external_release_id: String,
    pub external_status: String,
    pub store_url: Option<String>,
    pub rejection_reason: Option<String>,
    pub last_synced_at: chrono::DateTime<chrono::Utc>,
}

#[async_trait]
pub trait MarketChannelConnector: Send + Sync {
    async fn submit_release(
        &self,
        channel_code: &str,
        submission: &MarketSubmission,
    ) -> Result<MarketSubmissionResult, String>;

    async fn poll_status(
        &self,
        channel_code: &str,
        external_release_id: &str,
    ) -> Result<MarketStatusResult, String>;

    async fn resolve_store_url(
        &self,
        channel_code: &str,
        external_app_id: &str,
    ) -> Result<Option<String>, String>;

    async fn channel_code(&self) -> &str;
}
