use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use super::models::ModerationReviewId;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ModerationDomainEvent {
    ReviewCreated(ReviewCreatedEvent),
    ReviewAssigned(ReviewAssignedEvent),
    ReviewStarted(ReviewStartedEvent),
    DecisionRecorded(DecisionRecordedEvent),
    ReviewApproved(ReviewApprovedEvent),
    ReviewRejected(ReviewRejectedEvent),
    ReviewChangesRequested(ReviewChangesRequestedEvent),
    ReviewEscalated(ReviewEscalatedEvent),
    ReviewCancelled(ReviewCancelledEvent),
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReviewCreatedEvent {
    pub review_id: ModerationReviewId,
    pub tenant_id: String,
    pub organization_id: String,
    pub submission_id: String,
    pub queue_code: String,
    pub priority: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReviewAssignedEvent {
    pub review_id: ModerationReviewId,
    pub tenant_id: String,
    pub assigned_to: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReviewStartedEvent {
    pub review_id: ModerationReviewId,
    pub tenant_id: String,
    pub assigned_to: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct DecisionRecordedEvent {
    pub review_id: ModerationReviewId,
    pub tenant_id: String,
    pub decision_no: String,
    pub decision_type: String,
    pub decided_by: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReviewApprovedEvent {
    pub review_id: ModerationReviewId,
    pub tenant_id: String,
    pub decision_no: String,
    pub decided_by: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReviewRejectedEvent {
    pub review_id: ModerationReviewId,
    pub tenant_id: String,
    pub decision_no: String,
    pub decided_by: String,
    pub reason_code: Option<String>,
    pub reason_detail: Option<String>,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReviewChangesRequestedEvent {
    pub review_id: ModerationReviewId,
    pub tenant_id: String,
    pub decision_no: String,
    pub decided_by: String,
    pub reason_detail: Option<String>,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReviewEscalatedEvent {
    pub review_id: ModerationReviewId,
    pub tenant_id: String,
    pub escalated_by: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReviewCancelledEvent {
    pub review_id: ModerationReviewId,
    pub tenant_id: String,
    pub cancelled_by: String,
    pub occurred_at: DateTime<Utc>,
}
