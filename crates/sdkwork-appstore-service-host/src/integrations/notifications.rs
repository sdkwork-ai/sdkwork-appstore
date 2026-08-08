use super::registry::{IntegrationCapability, IntegrationOwner, IntegrationSurface};
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

pub const CAPABILITY: IntegrationCapability = IntegrationCapability {
    key: "notifications",
    owner: IntegrationOwner::PlatformProvider("sdkwork-notifications"),
    purpose: "Review decisions, release approvals, install/update lifecycle, and publisher alerts.",
    surfaces: &[
        IntegrationSurface::Event,
        IntegrationSurface::ServicePort,
        IntegrationSurface::WorkerProjection,
    ],
    required: false,
    todo: "",
};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct NotificationPayload {
    pub notification_type: String,
    pub recipient_user_id: String,
    pub tenant_id: String,
    pub title: String,
    pub body: String,
    pub data: serde_json::Value,
    pub channel: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct NotificationResult {
    pub notification_id: String,
    pub delivered: bool,
    pub delivered_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[async_trait]
pub trait NotificationConnector: Send + Sync {
    async fn send(&self, payload: &NotificationPayload) -> Result<NotificationResult, String>;

    async fn send_batch(
        &self,
        payloads: &[NotificationPayload],
    ) -> Result<Vec<NotificationResult>, String>;
}
