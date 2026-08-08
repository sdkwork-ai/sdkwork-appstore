//! Listing domain events.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use super::models::ListingId;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ListingDomainEvent {
    ListingCreated(ListingCreatedEvent),
    ListingUpdated(ListingUpdatedEvent),
    ListingActivated(ListingActivatedEvent),
    ListingDelisted(ListingDelistedEvent),
    ListingSuspended(ListingSuspendedEvent),
    ListingDeleted(ListingDeletedEvent),
    LocalizationUpserted(LocalizationUpsertedEvent),
    MediaAttached(MediaAttachedEvent),
    MediaRemoved(MediaRemovedEvent),
    CategoriesBound(CategoriesBoundEvent),
    RegionalAvailabilityUpdated(RegionalAvailabilityUpdatedEvent),
    SubmissionCreated(SubmissionCreatedEvent),
    VisibilityChanged(VisibilityChangedEvent),
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListingCreatedEvent {
    pub listing_id: ListingId,
    pub tenant_id: String,
    pub organization_id: String,
    pub publisher_id: String,
    pub app_id: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListingUpdatedEvent {
    pub listing_id: ListingId,
    pub tenant_id: String,
    pub updated_fields: Vec<String>,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListingActivatedEvent {
    pub listing_id: ListingId,
    pub tenant_id: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListingDelistedEvent {
    pub listing_id: ListingId,
    pub tenant_id: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListingSuspendedEvent {
    pub listing_id: ListingId,
    pub tenant_id: String,
    pub reason: Option<String>,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListingDeletedEvent {
    pub listing_id: ListingId,
    pub tenant_id: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct LocalizationUpsertedEvent {
    pub listing_id: ListingId,
    pub tenant_id: String,
    pub locale: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct MediaAttachedEvent {
    pub listing_id: ListingId,
    pub tenant_id: String,
    pub media_id: String,
    pub media_role: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct MediaRemovedEvent {
    pub listing_id: ListingId,
    pub tenant_id: String,
    pub media_id: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CategoriesBoundEvent {
    pub listing_id: ListingId,
    pub tenant_id: String,
    pub category_ids: Vec<String>,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RegionalAvailabilityUpdatedEvent {
    pub listing_id: ListingId,
    pub tenant_id: String,
    pub region_codes: Vec<String>,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SubmissionCreatedEvent {
    pub listing_id: ListingId,
    pub tenant_id: String,
    pub submission_id: String,
    pub submission_type: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct VisibilityChangedEvent {
    pub listing_id: ListingId,
    pub tenant_id: String,
    pub old_visibility: String,
    pub new_visibility: String,
    pub occurred_at: DateTime<Utc>,
}
