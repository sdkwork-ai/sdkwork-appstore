//! User store operation requests.

use serde::{Deserialize, Serialize};

use super::models::{ShareScope, ShareVisibility};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CreateCategoryRequest {
    pub name: String,
    pub description: Option<String>,
    pub icon_media_resource_id: Option<String>,
}

impl CreateCategoryRequest {
    pub fn new(name: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            description: None,
            icon_media_resource_id: None,
        }
    }

    pub fn with_description(mut self, description: impl Into<String>) -> Self {
        self.description = Some(description.into());
        self
    }

    pub fn with_icon_media_resource_id(mut self, icon: impl Into<String>) -> Self {
        self.icon_media_resource_id = Some(icon.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListCategoriesRequest {
    pub cursor: Option<String>,
    pub page_size: Option<i32>,
}

impl ListCategoriesRequest {
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

impl Default for ListCategoriesRequest {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RetrieveCategoryRequest {
    pub user_category_id: String,
}

impl RetrieveCategoryRequest {
    pub fn new(user_category_id: impl Into<String>) -> Self {
        Self {
            user_category_id: user_category_id.into(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UpdateCategoryRequest {
    pub user_category_id: String,
    pub name: Option<String>,
    pub description: Option<String>,
    pub icon_media_resource_id: Option<String>,
    pub sort_order: Option<i32>,
}

impl UpdateCategoryRequest {
    pub fn new(user_category_id: impl Into<String>) -> Self {
        Self {
            user_category_id: user_category_id.into(),
            name: None,
            description: None,
            icon_media_resource_id: None,
            sort_order: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct DeleteCategoryRequest {
    pub user_category_id: String,
}

impl DeleteCategoryRequest {
    pub fn new(user_category_id: impl Into<String>) -> Self {
        Self {
            user_category_id: user_category_id.into(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AddCategoryItemRequest {
    pub user_category_id: String,
    pub listing_id: String,
    pub note: Option<String>,
}

impl AddCategoryItemRequest {
    pub fn new(user_category_id: impl Into<String>, listing_id: impl Into<String>) -> Self {
        Self {
            user_category_id: user_category_id.into(),
            listing_id: listing_id.into(),
            note: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RemoveCategoryItemRequest {
    pub user_category_id: String,
    pub item_id: String,
}

impl RemoveCategoryItemRequest {
    pub fn new(user_category_id: impl Into<String>, item_id: impl Into<String>) -> Self {
        Self {
            user_category_id: user_category_id.into(),
            item_id: item_id.into(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListCategoryItemsRequest {
    pub user_category_id: String,
    pub cursor: Option<String>,
    pub page_size: Option<i32>,
}

impl ListCategoryItemsRequest {
    pub fn new(user_category_id: impl Into<String>) -> Self {
        Self {
            user_category_id: user_category_id.into(),
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
pub struct ReorderCategoryItemsRequest {
    pub user_category_id: String,
    pub item_ids: Vec<String>,
}

impl ReorderCategoryItemsRequest {
    pub fn new(user_category_id: impl Into<String>, item_ids: Vec<String>) -> Self {
        Self {
            user_category_id: user_category_id.into(),
            item_ids,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CreateShareRequest {
    pub title: String,
    pub description: Option<String>,
    pub scope: Option<ShareScope>,
    pub selected_category_ids: Option<Vec<String>>,
    pub visibility: Option<ShareVisibility>,
    pub expires_at: Option<chrono::DateTime<chrono::Utc>>,
}

impl CreateShareRequest {
    pub fn new(title: impl Into<String>) -> Self {
        Self {
            title: title.into(),
            description: None,
            scope: None,
            selected_category_ids: None,
            visibility: None,
            expires_at: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UpdateShareRequest {
    pub share_id: String,
    pub title: Option<String>,
    pub description: Option<String>,
    pub scope: Option<ShareScope>,
    pub selected_category_ids: Option<Vec<String>>,
    pub visibility: Option<ShareVisibility>,
    pub expires_at: Option<Option<chrono::DateTime<chrono::Utc>>>,
}

impl UpdateShareRequest {
    pub fn new(share_id: impl Into<String>) -> Self {
        Self {
            share_id: share_id.into(),
            title: None,
            description: None,
            scope: None,
            selected_category_ids: None,
            visibility: None,
            expires_at: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RevokeShareRequest {
    pub share_id: String,
}

impl RevokeShareRequest {
    pub fn new(share_id: impl Into<String>) -> Self {
        Self {
            share_id: share_id.into(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RegenerateShareTokenRequest {
    pub share_id: String,
}

impl RegenerateShareTokenRequest {
    pub fn new(share_id: impl Into<String>) -> Self {
        Self {
            share_id: share_id.into(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PublicUserStoreViewRequest {
    pub share_token: String,
}

impl PublicUserStoreViewRequest {
    pub fn new(share_token: impl Into<String>) -> Self {
        Self {
            share_token: share_token.into(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PublicCategoryItemsRequest {
    pub share_token: String,
    pub user_category_id: String,
    pub cursor: Option<String>,
    pub page_size: Option<i32>,
}

impl PublicCategoryItemsRequest {
    pub fn new(share_token: impl Into<String>, user_category_id: impl Into<String>) -> Self {
        Self {
            share_token: share_token.into(),
            user_category_id: user_category_id.into(),
            cursor: None,
            page_size: None,
        }
    }
}
