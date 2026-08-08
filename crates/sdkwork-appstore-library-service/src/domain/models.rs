use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct LibraryItemId(pub String);

impl LibraryItemId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum LibraryStatus {
    Installed,
    Uninstalled,
    UpdateAvailable,
}

impl LibraryStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Installed => "installed",
            Self::Uninstalled => "uninstalled",
            Self::UpdateAvailable => "update_available",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "installed" => Some(Self::Installed),
            "uninstalled" => Some(Self::Uninstalled),
            "update_available" => Some(Self::UpdateAvailable),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum WishlistStatus {
    Active,
    Removed,
}

impl WishlistStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Active => "active",
            Self::Removed => "removed",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "active" => Some(Self::Active),
            "removed" => Some(Self::Removed),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum InstallEventType {
    Install,
    Uninstall,
    Update,
    Reinstall,
}

impl InstallEventType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Install => "install",
            Self::Uninstall => "uninstall",
            Self::Update => "update",
            Self::Reinstall => "reinstall",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "install" => Some(Self::Install),
            "uninstall" => Some(Self::Uninstall),
            "update" => Some(Self::Update),
            "reinstall" => Some(Self::Reinstall),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum InstallSource {
    Store,
    DirectLink,
    Update,
    Silent,
}

impl InstallSource {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Store => "store",
            Self::DirectLink => "direct_link",
            Self::Update => "update",
            Self::Silent => "silent",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "store" => Some(Self::Store),
            "direct_link" => Some(Self::DirectLink),
            "update" => Some(Self::Update),
            "silent" => Some(Self::Silent),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum InstallEventStatus {
    Recorded,
    Processed,
    Failed,
}

impl InstallEventStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Recorded => "recorded",
            Self::Processed => "processed",
            Self::Failed => "failed",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "recorded" => Some(Self::Recorded),
            "processed" => Some(Self::Processed),
            "failed" => Some(Self::Failed),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum DownloadGrantStatus {
    Active,
    Consumed,
    Expired,
    Revoked,
}

impl DownloadGrantStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Active => "active",
            Self::Consumed => "consumed",
            Self::Expired => "expired",
            Self::Revoked => "revoked",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "active" => Some(Self::Active),
            "consumed" => Some(Self::Consumed),
            "expired" => Some(Self::Expired),
            "revoked" => Some(Self::Revoked),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum DownloadGrantReason {
    Purchase,
    FreeDownload,
    Promotion,
    Restore,
}

impl DownloadGrantReason {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Purchase => "purchase",
            Self::FreeDownload => "free_download",
            Self::Promotion => "promotion",
            Self::Restore => "restore",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "purchase" => Some(Self::Purchase),
            "free_download" => Some(Self::FreeDownload),
            "promotion" => Some(Self::Promotion),
            "restore" => Some(Self::Restore),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UserLibraryItem {
    pub id: LibraryItemId,
    pub tenant_id: String,
    pub user_id: String,
    pub listing_id: String,
    pub app_key: String,
    pub library_status: LibraryStatus,
    pub installed_release_id: Option<String>,
    pub installed_version_code: Option<String>,
    pub install_source: InstallSource,
    pub platform: String,
    pub architecture: Option<String>,
    pub device_id: Option<String>,
    pub last_checked_at: Option<DateTime<Utc>>,
    pub installed_at: Option<DateTime<Utc>>,
    pub updated_at: DateTime<Utc>,
    pub removed_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UserWishlistItem {
    pub id: String,
    pub tenant_id: String,
    pub user_id: String,
    pub listing_id: String,
    pub wishlist_status: WishlistStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct InstallEvent {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub event_no: String,
    pub listing_id: String,
    pub release_id: Option<String>,
    pub artifact_id: Option<String>,
    pub user_id: Option<String>,
    pub device_id: Option<String>,
    pub event_type: InstallEventType,
    pub platform: String,
    pub architecture: Option<String>,
    pub event_status: InstallEventStatus,
    pub source_channel: Option<String>,
    pub client_version: Option<String>,
    pub region_code: Option<String>,
    pub payload_snapshot: serde_json::Value,
    pub occurred_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct DownloadGrant {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub grant_no: String,
    pub listing_id: String,
    pub release_id: String,
    pub artifact_id: String,
    pub user_id: Option<String>,
    pub grant_status: DownloadGrantStatus,
    pub grant_reason: DownloadGrantReason,
    pub expires_at: DateTime<Utc>,
    pub consumed_at: Option<DateTime<Utc>>,
    pub download_count: i32,
    pub max_download_count: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[serde(deny_unknown_fields)]
pub struct UpdateCheckItem {
    pub app_key: String,
    pub platform: String,
    pub installed_version_code: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UpdateAvailable {
    pub app_key: String,
    pub platform: String,
    pub installed_version_code: String,
    pub latest_version_code: String,
    pub latest_version_name: String,
    pub release_id: String,
    pub artifact_id: Option<String>,
    pub file_size_bytes: Option<String>,
    pub release_notes: Option<String>,
    pub released_at: Option<chrono::DateTime<chrono::Utc>>,
}
