use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use super::models::ComplianceProfileId;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ComplianceDomainEvent {
    ComplianceProfileCreated(ComplianceProfileCreatedEvent),
    ComplianceProfileUpdated(ComplianceProfileUpdatedEvent),
    ComplianceProfileSubmitted(ComplianceProfileSubmittedEvent),
    ComplianceProfileApproved(ComplianceProfileApprovedEvent),
    ComplianceProfileRejected(ComplianceProfileRejectedEvent),
    PermissionDisclosuresUpserted(PermissionDisclosuresUpsertedEvent),
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ComplianceProfileCreatedEvent {
    pub profile_id: ComplianceProfileId,
    pub tenant_id: String,
    pub organization_id: String,
    pub listing_id: String,
    pub compliance_version: i32,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ComplianceProfileUpdatedEvent {
    pub profile_id: ComplianceProfileId,
    pub tenant_id: String,
    pub listing_id: String,
    pub updated_fields: Vec<String>,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ComplianceProfileSubmittedEvent {
    pub profile_id: ComplianceProfileId,
    pub tenant_id: String,
    pub listing_id: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ComplianceProfileApprovedEvent {
    pub profile_id: ComplianceProfileId,
    pub tenant_id: String,
    pub listing_id: String,
    pub reviewed_by: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ComplianceProfileRejectedEvent {
    pub profile_id: ComplianceProfileId,
    pub tenant_id: String,
    pub listing_id: String,
    pub reviewed_by: String,
    pub reason: Option<String>,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PermissionDisclosuresUpsertedEvent {
    pub tenant_id: String,
    pub listing_id: String,
    pub permission_codes: Vec<String>,
    pub occurred_at: DateTime<Utc>,
}
