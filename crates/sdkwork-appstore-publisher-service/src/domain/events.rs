//! Publisher domain events.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use super::models::PublisherId;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum PublisherDomainEvent {
    PublisherCreated(PublisherCreatedEvent),
    PublisherUpdated(PublisherUpdatedEvent),
    PublisherSuspended(PublisherSuspendedEvent),
    PublisherReactivated(PublisherReactivatedEvent),
    PublisherDeleted(PublisherDeletedEvent),
    MemberInvited(MemberInvitedEvent),
    MemberJoined(MemberJoinedEvent),
    MemberRemoved(MemberRemovedEvent),
    VerificationSubmitted(VerificationSubmittedEvent),
    VerificationApproved(VerificationApprovedEvent),
    VerificationRejected(VerificationRejectedEvent),
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PublisherCreatedEvent {
    pub publisher_id: PublisherId,
    pub tenant_id: String,
    pub organization_id: String,
    pub owner_user_id: String,
    pub display_name: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PublisherUpdatedEvent {
    pub publisher_id: PublisherId,
    pub tenant_id: String,
    pub updated_fields: Vec<String>,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PublisherSuspendedEvent {
    pub publisher_id: PublisherId,
    pub tenant_id: String,
    pub reason: Option<String>,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PublisherReactivatedEvent {
    pub publisher_id: PublisherId,
    pub tenant_id: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PublisherDeletedEvent {
    pub publisher_id: PublisherId,
    pub tenant_id: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct MemberInvitedEvent {
    pub publisher_id: PublisherId,
    pub tenant_id: String,
    pub user_id: String,
    pub member_role: String,
    pub invited_by: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct MemberJoinedEvent {
    pub publisher_id: PublisherId,
    pub tenant_id: String,
    pub user_id: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct MemberRemovedEvent {
    pub publisher_id: PublisherId,
    pub tenant_id: String,
    pub user_id: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct VerificationSubmittedEvent {
    pub publisher_id: PublisherId,
    pub tenant_id: String,
    pub verification_type: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct VerificationApprovedEvent {
    pub publisher_id: PublisherId,
    pub tenant_id: String,
    pub verification_type: String,
    pub reviewed_by: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct VerificationRejectedEvent {
    pub publisher_id: PublisherId,
    pub tenant_id: String,
    pub verification_type: String,
    pub reviewed_by: String,
    pub reason: Option<String>,
    pub occurred_at: DateTime<Utc>,
}
