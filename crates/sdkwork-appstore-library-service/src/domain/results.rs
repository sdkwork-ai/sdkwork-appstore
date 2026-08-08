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
}

impl ConsumeDownloadGrantResult {
    pub fn consumed(operation_id: &'static str, grant: DownloadGrant) -> Self {
        Self {
            operation_id,
            grant,
        }
    }
}
