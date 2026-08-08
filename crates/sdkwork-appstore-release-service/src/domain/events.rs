use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use super::models::{ArtifactId, DownloadGrantId, ReleaseChannelId, ReleaseId};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ReleaseDomainEvent {
    ReleaseCreated(ReleaseCreatedEvent),
    ReleaseUpdated(ReleaseUpdatedEvent),
    ReleaseSubmitted(ReleaseSubmittedEvent),
    ReleaseApproved(ReleaseApprovedEvent),
    ReleasePublished(ReleasePublishedEvent),
    ReleaseRetired(ReleaseRetiredEvent),
    ReleaseNotesUpserted(ReleaseNotesUpsertedEvent),
    ArtifactAttached(ArtifactAttachedEvent),
    RolloutUpdated(RolloutUpdatedEvent),
    DownloadGrantCreated(DownloadGrantCreatedEvent),
    DownloadGrantConsumed(DownloadGrantConsumedEvent),
    UpdateCheckPerformed(UpdateCheckPerformedEvent),
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReleaseCreatedEvent {
    pub release_id: ReleaseId,
    pub tenant_id: String,
    pub organization_id: String,
    pub listing_id: String,
    pub channel_id: ReleaseChannelId,
    pub version_name: String,
    pub version_code: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReleaseUpdatedEvent {
    pub release_id: ReleaseId,
    pub tenant_id: String,
    pub updated_fields: Vec<String>,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReleaseSubmittedEvent {
    pub release_id: ReleaseId,
    pub tenant_id: String,
    pub organization_id: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReleaseApprovedEvent {
    pub release_id: ReleaseId,
    pub tenant_id: String,
    pub organization_id: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReleasePublishedEvent {
    pub release_id: ReleaseId,
    pub tenant_id: String,
    pub organization_id: String,
    pub listing_id: String,
    pub version_code: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReleaseRetiredEvent {
    pub release_id: ReleaseId,
    pub tenant_id: String,
    pub organization_id: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReleaseNotesUpsertedEvent {
    pub release_id: ReleaseId,
    pub tenant_id: String,
    pub locale: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ArtifactAttachedEvent {
    pub artifact_id: ArtifactId,
    pub release_id: ReleaseId,
    pub tenant_id: String,
    pub platform: String,
    pub architecture: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RolloutUpdatedEvent {
    pub release_id: ReleaseId,
    pub tenant_id: String,
    pub rollout_strategy: String,
    pub target_percentage: i32,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct DownloadGrantCreatedEvent {
    pub grant_id: DownloadGrantId,
    pub release_id: ReleaseId,
    pub artifact_id: ArtifactId,
    pub tenant_id: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct DownloadGrantConsumedEvent {
    pub grant_id: DownloadGrantId,
    pub release_id: ReleaseId,
    pub artifact_id: ArtifactId,
    pub tenant_id: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UpdateCheckPerformedEvent {
    pub tenant_id: String,
    pub app_key: String,
    pub platform: String,
    pub installed_version_code: String,
    pub update_available: bool,
    pub occurred_at: DateTime<Utc>,
}
