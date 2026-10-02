use serde::{Deserialize, Serialize};

use super::models::{
    DownloadGrant, InstallEvent, UpdateAvailable, UserLibraryItem, UserWishlistItem,
};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct LibraryOperationResult {
    pub operation_id: &'static str,
    pub accepted: bool,
}

impl LibraryOperationResult {
    pub fn accepted(operation_id: &'static str) -> Self {
        Self {
            operation_id,
            accepted: true,
        }
    }

    pub fn rejected(operation_id: &'static str) -> Self {
        Self {
            operation_id,
            accepted: false,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListLibraryItemsResult {
    pub operation_id: &'static str,
    pub items: Vec<UserLibraryItem>,
    pub next_cursor: Option<String>,
    pub has_more: bool,
}

impl ListLibraryItemsResult {
    pub fn new(
        operation_id: &'static str,
        items: Vec<UserLibraryItem>,
        next_cursor: Option<String>,
        has_more: bool,
    ) -> Self {
        Self {
            operation_id,
            items,
            next_cursor,
            has_more,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RetrieveLibraryItemResult {
    pub operation_id: &'static str,
    pub item: UserLibraryItem,
}

impl RetrieveLibraryItemResult {
    pub fn found(operation_id: &'static str, item: UserLibraryItem) -> Self {
        Self { operation_id, item }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct LibraryInstallResult {
    pub operation_id: &'static str,
    pub library_item: UserLibraryItem,
    pub install_event: InstallEvent,
}

impl LibraryInstallResult {
    pub fn installed(
        operation_id: &'static str,
        library_item: UserLibraryItem,
        install_event: InstallEvent,
    ) -> Self {
        Self {
            operation_id,
            library_item,
            install_event,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct LibraryUninstallResult {
    pub operation_id: &'static str,
}

impl LibraryUninstallResult {
    pub fn uninstalled(operation_id: &'static str) -> Self {
        Self { operation_id }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct LibraryUpdatesCheckResult {
    pub operation_id: &'static str,
    pub updates: Vec<UpdateAvailable>,
}

impl LibraryUpdatesCheckResult {
    pub fn new(operation_id: &'static str, updates: Vec<UpdateAvailable>) -> Self {
        Self {
            operation_id,
            updates,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListWishlistItemsResult {
    pub operation_id: &'static str,
    pub items: Vec<UserWishlistItem>,
    pub next_cursor: Option<String>,
    pub has_more: bool,
}

impl ListWishlistItemsResult {
    pub fn new(
        operation_id: &'static str,
        items: Vec<UserWishlistItem>,
        next_cursor: Option<String>,
        has_more: bool,
    ) -> Self {
        Self {
            operation_id,
            items,
            next_cursor,
            has_more,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AddWishlistItemResult {
    pub operation_id: &'static str,
    pub item: UserWishlistItem,
}

impl AddWishlistItemResult {
    pub fn added(operation_id: &'static str, item: UserWishlistItem) -> Self {
        Self { operation_id, item }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RemoveWishlistItemResult {
    pub operation_id: &'static str,
}

impl RemoveWishlistItemResult {
    pub fn removed(operation_id: &'static str) -> Self {
        Self { operation_id }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CreateDownloadGrantResult {
    pub operation_id: &'static str,
    pub grant: DownloadGrant,
}

impl CreateDownloadGrantResult {
    pub fn created(operation_id: &'static str, grant: DownloadGrant) -> Self {
        Self {
            operation_id,
            grant,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ConsumeDownloadGrantResult {
    pub operation_id: &'static str,
    pub grant: DownloadGrant,
    /// Delivery projection of the consumed artifact, present when the artifact
    /// row was resolved; `download_url` additionally requires the drive
    /// integration so the storefront can hand a presigned link to the browser.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub delivery: Option<DownloadDelivery>,
}

impl ConsumeDownloadGrantResult {
    pub fn consumed(operation_id: &'static str, grant: DownloadGrant) -> Self {
        Self {
            operation_id,
            grant,
            delivery: None,
        }
    }

    pub fn with_delivery(mut self, delivery: DownloadDelivery) -> Self {
        self.delivery = Some(delivery);
        self
    }
}

/// Platform metadata (and, when drive integration is enabled, the presigned
/// download URL) of the artifact behind a consumed download grant.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct DownloadDelivery {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub download_url: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub download_url_expires_at: Option<String>,
    pub platform: String,
    pub architecture: String,
    pub package_format: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub file_size_bytes: Option<String>,
}

/// Result of a commerce entitlement sync (idempotent upsert).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CommerceEntitlementSyncResult {
    pub operation_id: &'static str,
    pub accepted: bool,
}

impl CommerceEntitlementSyncResult {
    pub fn accepted(operation_id: &'static str) -> Self {
        Self {
            operation_id,
            accepted: true,
        }
    }
}

/// Result of an entitlement check for one subject/app pair.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CommerceEntitlementCheckResult {
    pub operation_id: &'static str,
    pub has_entitlement: bool,
    pub entitlement_type: Option<String>,
    pub expires_at: Option<chrono::DateTime<chrono::Utc>>,
}

impl CommerceEntitlementCheckResult {
    pub fn granted(
        operation_id: &'static str,
        entitlement_type: Option<String>,
        expires_at: Option<chrono::DateTime<chrono::Utc>>,
    ) -> Self {
        Self {
            operation_id,
            has_entitlement: true,
            entitlement_type,
            expires_at,
        }
    }

    pub fn denied(operation_id: &'static str) -> Self {
        Self {
            operation_id,
            has_entitlement: false,
            entitlement_type: None,
            expires_at: None,
        }
    }
}

/// Result of an entitlement revoke.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CommerceEntitlementRevokeResult {
    pub operation_id: &'static str,
    pub revoked: bool,
}

impl CommerceEntitlementRevokeResult {
    pub fn revoked(operation_id: &'static str, revoked: bool) -> Self {
        Self {
            operation_id,
            revoked,
        }
    }
}
