//! Catalog domain events.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use super::models::{CategoryId, CollectionId, FeaturedSlotId};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum CatalogDomainEvent {
    CategoryCreated(CategoryCreatedEvent),
    CategoryUpdated(CategoryUpdatedEvent),
    CategoryDeleted(CategoryDeletedEvent),
    CollectionCreated(CollectionCreatedEvent),
    CollectionUpdated(CollectionUpdatedEvent),
    CollectionDeleted(CollectionDeletedEvent),
    CollectionItemsUpserted(CollectionItemsUpsertedEvent),
    FeaturedSlotUpserted(FeaturedSlotUpsertedEvent),
    FeaturedSlotRemoved(FeaturedSlotRemovedEvent),
    ChartSnapshotGenerated(ChartSnapshotGeneratedEvent),
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CategoryCreatedEvent {
    pub category_id: CategoryId,
    pub tenant_id: String,
    pub category_code: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CategoryUpdatedEvent {
    pub category_id: CategoryId,
    pub tenant_id: String,
    pub updated_fields: Vec<String>,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CategoryDeletedEvent {
    pub category_id: CategoryId,
    pub tenant_id: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CollectionCreatedEvent {
    pub collection_id: CollectionId,
    pub tenant_id: String,
    pub collection_code: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CollectionUpdatedEvent {
    pub collection_id: CollectionId,
    pub tenant_id: String,
    pub updated_fields: Vec<String>,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CollectionDeletedEvent {
    pub collection_id: CollectionId,
    pub tenant_id: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CollectionItemsUpsertedEvent {
    pub collection_id: CollectionId,
    pub tenant_id: String,
    pub item_count: usize,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct FeaturedSlotUpsertedEvent {
    pub slot_id: FeaturedSlotId,
    pub tenant_id: String,
    pub slot_code: String,
    pub listing_id: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct FeaturedSlotRemovedEvent {
    pub slot_id: FeaturedSlotId,
    pub tenant_id: String,
    pub slot_code: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ChartSnapshotGeneratedEvent {
    pub chart_code: String,
    pub tenant_id: String,
    pub snapshot_date: String,
    pub occurred_at: DateTime<Utc>,
}
