//! User store domain events.
//!
//! One event per state transition the user store domain owns. Payloads carry
//! `listing_id` references only and never mirror listing fields, preserving the
//! anti-corruption boundary against the platform catalog.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use super::models::{ShareScope, ShareVisibility, UserCategoryStatus};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum UserStoreDomainEvent {
    UserCategoryCreated(UserCategoryCreatedEvent),
    UserCategoryUpdated(UserCategoryUpdatedEvent),
    UserCategoryDeleted(UserCategoryDeletedEvent),
    UserCategoryItemAdded(UserCategoryItemAddedEvent),
    UserCategoryItemRemoved(UserCategoryItemRemovedEvent),
    UserCategoryItemsReordered(UserCategoryItemsReorderedEvent),
    UserStoreShareCreated(UserStoreShareCreatedEvent),
    UserStoreShareUpdated(UserStoreShareUpdatedEvent),
    UserStoreShareRevoked(UserStoreShareRevokedEvent),
    UserStoreShareTokenRegenerated(UserStoreShareTokenRegeneratedEvent),
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UserCategoryCreatedEvent {
    pub user_category_id: String,
    pub tenant_id: String,
    pub owner_user_id: String,
    pub name: String,
    pub status: UserCategoryStatus,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UserCategoryUpdatedEvent {
    pub user_category_id: String,
    pub tenant_id: String,
    pub owner_user_id: String,
    pub name: String,
    pub status: UserCategoryStatus,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UserCategoryDeletedEvent {
    pub user_category_id: String,
    pub tenant_id: String,
    pub owner_user_id: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UserCategoryItemAddedEvent {
    pub user_category_item_id: String,
    pub user_category_id: String,
    pub tenant_id: String,
    pub owner_user_id: String,
    pub listing_id: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UserCategoryItemRemovedEvent {
    pub user_category_item_id: String,
    pub user_category_id: String,
    pub tenant_id: String,
    pub owner_user_id: String,
    pub listing_id: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UserCategoryItemsReorderedEvent {
    pub user_category_id: String,
    pub tenant_id: String,
    pub owner_user_id: String,
    pub ordered_item_ids: Vec<String>,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UserStoreShareCreatedEvent {
    pub user_store_share_id: String,
    pub tenant_id: String,
    pub owner_user_id: String,
    pub scope: ShareScope,
    pub visibility: ShareVisibility,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UserStoreShareUpdatedEvent {
    pub user_store_share_id: String,
    pub tenant_id: String,
    pub owner_user_id: String,
    pub scope: ShareScope,
    pub visibility: ShareVisibility,
    pub selected_category_ids: Vec<String>,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UserStoreShareRevokedEvent {
    pub user_store_share_id: String,
    pub tenant_id: String,
    pub owner_user_id: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UserStoreShareTokenRegeneratedEvent {
    pub user_store_share_id: String,
    pub tenant_id: String,
    pub owner_user_id: String,
    pub occurred_at: DateTime<Utc>,
}
