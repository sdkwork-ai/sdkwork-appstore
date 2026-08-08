use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use super::models::LibraryItemId;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum LibraryDomainEvent {
    LibraryItemInstalled(LibraryItemInstalledEvent),
    LibraryItemUninstalled(LibraryItemUninstalledEvent),
    WishlistItemAdded(WishlistItemAddedEvent),
    WishlistItemRemoved(WishlistItemRemovedEvent),
    InstallEventRecorded(InstallEventRecordedEvent),
    DownloadGrantCreated(DownloadGrantCreatedEvent),
    DownloadGrantConsumed(DownloadGrantConsumedEvent),
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct LibraryItemInstalledEvent {
    pub library_item_id: LibraryItemId,
    pub tenant_id: String,
    pub user_id: String,
    pub listing_id: String,
    pub app_key: String,
    pub platform: String,
    pub install_source: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct LibraryItemUninstalledEvent {
    pub library_item_id: LibraryItemId,
    pub tenant_id: String,
    pub user_id: String,
    pub listing_id: String,
    pub app_key: String,
    pub platform: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct WishlistItemAddedEvent {
    pub tenant_id: String,
    pub user_id: String,
    pub listing_id: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct WishlistItemRemovedEvent {
    pub tenant_id: String,
    pub user_id: String,
    pub listing_id: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct InstallEventRecordedEvent {
    pub event_id: String,
    pub tenant_id: String,
    pub listing_id: String,
    pub user_id: Option<String>,
    pub event_type: String,
    pub platform: String,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct DownloadGrantCreatedEvent {
    pub grant_id: String,
    pub tenant_id: String,
    pub artifact_id: String,
    pub user_id: Option<String>,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct DownloadGrantConsumedEvent {
    pub grant_id: String,
    pub tenant_id: String,
    pub artifact_id: String,
    pub user_id: Option<String>,
    pub occurred_at: DateTime<Utc>,
}
