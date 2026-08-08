use serde::{Deserialize, Serialize};

use super::models::UpdateCheckItem;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LibraryOperationRequest {
    pub operation_id: &'static str,
    pub idempotency_key: Option<String>,
}

impl LibraryOperationRequest {
    pub fn new(operation_id: &'static str) -> Self {
        Self {
            operation_id,
            idempotency_key: None,
        }
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListLibraryItemsRequest {
    pub cursor: Option<String>,
    pub page_size: Option<i32>,
}

impl ListLibraryItemsRequest {
    pub fn new() -> Self {
        Self {
            cursor: None,
            page_size: None,
        }
    }

    pub fn with_cursor(mut self, cursor: impl Into<String>) -> Self {
        self.cursor = Some(cursor.into());
        self
    }

    pub fn with_page_size(mut self, page_size: i32) -> Self {
        self.page_size = Some(page_size);
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RetrieveLibraryItemRequest {
    pub library_item_id: String,
}

impl RetrieveLibraryItemRequest {
    pub fn new(library_item_id: impl Into<String>) -> Self {
        Self {
            library_item_id: library_item_id.into(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct LibraryInstallRequest {
    pub listing_id: String,
    pub platform: String,
    pub architecture: Option<String>,
    pub device_id: Option<String>,
}

impl LibraryInstallRequest {
    pub fn new(listing_id: impl Into<String>, platform: impl Into<String>) -> Self {
        Self {
            listing_id: listing_id.into(),
            platform: platform.into(),
            architecture: None,
            device_id: None,
        }
    }

    pub fn with_architecture(mut self, architecture: impl Into<String>) -> Self {
        self.architecture = Some(architecture.into());
        self
    }

    pub fn with_device_id(mut self, device_id: impl Into<String>) -> Self {
        self.device_id = Some(device_id.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct LibraryUninstallRequest {
    pub library_item_id: String,
}

impl LibraryUninstallRequest {
    pub fn new(library_item_id: impl Into<String>) -> Self {
        Self {
            library_item_id: library_item_id.into(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct LibraryUpdatesCheckRequest {
    pub items: Vec<UpdateCheckItem>,
}

impl LibraryUpdatesCheckRequest {
    pub fn new(items: Vec<UpdateCheckItem>) -> Self {
        Self { items }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListWishlistItemsRequest {
    pub cursor: Option<String>,
    pub page_size: Option<i32>,
}

impl ListWishlistItemsRequest {
    pub fn new() -> Self {
        Self {
            cursor: None,
            page_size: None,
        }
    }

    pub fn with_cursor(mut self, cursor: impl Into<String>) -> Self {
        self.cursor = Some(cursor.into());
        self
    }

    pub fn with_page_size(mut self, page_size: i32) -> Self {
        self.page_size = Some(page_size);
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AddWishlistItemRequest {
    pub listing_id: String,
}

impl AddWishlistItemRequest {
    pub fn new(listing_id: impl Into<String>) -> Self {
        Self {
            listing_id: listing_id.into(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RemoveWishlistItemRequest {
    pub listing_id: String,
}

impl RemoveWishlistItemRequest {
    pub fn new(listing_id: impl Into<String>) -> Self {
        Self {
            listing_id: listing_id.into(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CreateDownloadGrantRequest {
    pub artifact_id: String,
}

impl CreateDownloadGrantRequest {
    pub fn new(artifact_id: impl Into<String>) -> Self {
        Self {
            artifact_id: artifact_id.into(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ConsumeDownloadGrantRequest {
    pub grant_id: String,
}

impl ConsumeDownloadGrantRequest {
    pub fn new(grant_id: impl Into<String>) -> Self {
        Self {
            grant_id: grant_id.into(),
        }
    }
}
