//! User store operation results.

use serde::{Deserialize, Serialize};

use super::models::{ListingCard, UserCategory, UserCategoryItem, UserStoreShare};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CategoryCreateResult {
    pub operation_id: &'static str,
    pub category: UserCategory,
}

impl CategoryCreateResult {
    pub fn created(operation_id: &'static str, category: UserCategory) -> Self {
        Self {
            operation_id,
            category,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CategoriesListResult {
    pub operation_id: &'static str,
    pub items: Vec<UserCategory>,
    pub item_counts: Vec<CategoryItemCount>,
    pub next_cursor: Option<String>,
    pub has_more: bool,
}

impl CategoriesListResult {
    pub fn new(
        operation_id: &'static str,
        items: Vec<UserCategory>,
        item_counts: Vec<CategoryItemCount>,
        next_cursor: Option<String>,
        has_more: bool,
    ) -> Self {
        Self {
            operation_id,
            items,
            item_counts,
            next_cursor,
            has_more,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CategoryItemCount {
    pub user_category_id: String,
    pub count: i64,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CategoryRetrieveResult {
    pub operation_id: &'static str,
    pub category: UserCategory,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CategoryUpdateResult {
    pub operation_id: &'static str,
    pub category: UserCategory,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CategoryDeleteResult {
    pub operation_id: &'static str,
    pub accepted: bool,
}

impl CategoryDeleteResult {
    pub fn accepted(operation_id: &'static str) -> Self {
        Self {
            operation_id,
            accepted: true,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CategoryItemWithCard {
    pub item: UserCategoryItem,
    pub listing_card: Option<ListingCard>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AddCategoryItemResult {
    pub operation_id: &'static str,
    pub item: UserCategoryItem,
    pub listing_card: Option<ListingCard>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ItemRemoveResult {
    pub operation_id: &'static str,
    pub accepted: bool,
}

impl ItemRemoveResult {
    pub fn accepted(operation_id: &'static str) -> Self {
        Self {
            operation_id,
            accepted: true,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CategoryItemsListResult {
    pub operation_id: &'static str,
    pub items: Vec<CategoryItemWithCard>,
    pub next_cursor: Option<String>,
    pub has_more: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ItemsReorderResult {
    pub operation_id: &'static str,
    pub accepted: bool,
}

impl ItemsReorderResult {
    pub fn accepted(operation_id: &'static str) -> Self {
        Self {
            operation_id,
            accepted: true,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ShareCreateResult {
    pub operation_id: &'static str,
    pub share: UserStoreShare,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SharesListResult {
    pub operation_id: &'static str,
    pub items: Vec<UserStoreShare>,
    pub next_cursor: Option<String>,
    pub has_more: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ShareUpdateResult {
    pub operation_id: &'static str,
    pub share: UserStoreShare,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ShareRevokeResult {
    pub operation_id: &'static str,
    pub accepted: bool,
}

impl ShareRevokeResult {
    pub fn accepted(operation_id: &'static str) -> Self {
        Self {
            operation_id,
            accepted: true,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RegenerateShareTokenResult {
    pub operation_id: &'static str,
    pub share: UserStoreShare,
}

/// Anonymous-visitor projection of a shared personal appstore. Only
/// visitor-safe fields are exposed (no owner account metadata beyond the id).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PublicUserStoreViewResult {
    pub operation_id: &'static str,
    pub share_token: String,
    pub title: String,
    pub description: Option<String>,
    pub owner_user_id: String,
    pub categories: Vec<PublicCategorySummary>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PublicCategorySummary {
    pub user_category_id: String,
    pub name: String,
    pub icon_media_resource_id: Option<String>,
    pub sort_order: i32,
    pub item_count: i64,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PublicCategoryItemsResult {
    pub operation_id: &'static str,
    pub user_category_id: String,
    pub category_name: String,
    pub items: Vec<ListingCard>,
    pub next_cursor: Option<String>,
    pub has_more: bool,
}
