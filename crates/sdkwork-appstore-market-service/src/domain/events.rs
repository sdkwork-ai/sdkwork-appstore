use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use super::models::{MarketChannelId, MarketReleaseId};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum MarketDomainEvent {
    ChannelCreated(ChannelCreatedEvent),
    ChannelUpdated(ChannelUpdatedEvent),
    ChannelSuspended(ChannelSuspendedEvent),
    ChannelReactivated(ChannelReactivatedEvent),
    ReleaseSubmitted(ReleaseSubmittedEvent),
    ReleaseApproved(ReleaseApprovedEvent),
    ReleaseRejected(ReleaseRejectedEvent),
    ReleasePublished(ReleasePublishedEvent),
    ReleaseRetired(ReleaseRetiredEvent),
    ReleaseSynced(ReleaseSyncedEvent),
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ChannelCreatedEvent {
    pub channel_id: MarketChannelId,
    pub tenant_id: String,
    pub channel_code: String,
    pub channel_type: String,
    pub provider: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ChannelUpdatedEvent {
    pub channel_id: MarketChannelId,
    pub tenant_id: String,
    pub updated_fields: Vec<String>,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ChannelSuspendedEvent {
    pub channel_id: MarketChannelId,
    pub tenant_id: String,
    pub reason: Option<String>,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ChannelReactivatedEvent {
    pub channel_id: MarketChannelId,
    pub tenant_id: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReleaseSubmittedEvent {
    pub release_id: MarketReleaseId,
    pub tenant_id: String,
    pub channel_id: MarketChannelId,
    pub market_release_no: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReleaseApprovedEvent {
    pub release_id: MarketReleaseId,
    pub tenant_id: String,
    pub channel_id: MarketChannelId,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReleaseRejectedEvent {
    pub release_id: MarketReleaseId,
    pub tenant_id: String,
    pub channel_id: MarketChannelId,
    pub reason: Option<String>,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReleasePublishedEvent {
    pub release_id: MarketReleaseId,
    pub tenant_id: String,
    pub channel_id: MarketChannelId,
    pub store_url: Option<String>,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReleaseRetiredEvent {
    pub release_id: MarketReleaseId,
    pub tenant_id: String,
    pub channel_id: MarketChannelId,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReleaseSyncedEvent {
    pub release_id: MarketReleaseId,
    pub tenant_id: String,
    pub channel_id: MarketChannelId,
    pub sync_mode: String,
    pub occurred_at: DateTime<Utc>,
}
