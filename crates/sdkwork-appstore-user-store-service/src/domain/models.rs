//! User store domain models.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

macro_rules! string_id {
    ($name:ident) => {
        #[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
        pub struct $name(pub String);

        impl $name {
            pub fn new(id: impl Into<String>) -> Self {
                Self(id.into())
            }

            pub fn as_str(&self) -> &str {
                &self.0
            }
        }
    };
}

string_id!(UserCategoryId);
string_id!(UserCategoryItemId);
string_id!(UserStoreShareId);

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum UserCategoryStatus {
    Active,
    Archived,
}

impl UserCategoryStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Active => "active",
            Self::Archived => "archived",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "active" => Some(Self::Active),
            "archived" => Some(Self::Archived),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ShareScope {
    All,
    Selected,
}

impl ShareScope {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::All => "all",
            Self::Selected => "selected",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "all" => Some(Self::All),
            "selected" => Some(Self::Selected),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ShareVisibility {
    Public,
    Unlisted,
}

impl ShareVisibility {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Public => "public",
            Self::Unlisted => "unlisted",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "public" => Some(Self::Public),
            "unlisted" => Some(Self::Unlisted),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ShareStatus {
    Active,
    Revoked,
}

impl ShareStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Active => "active",
            Self::Revoked => "revoked",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "active" => Some(Self::Active),
            "revoked" => Some(Self::Revoked),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UserCategory {
    pub id: String,
    pub tenant_id: String,
    pub owner_user_id: String,
    pub name: String,
    pub description: Option<String>,
    pub icon_media_resource_id: Option<String>,
    pub sort_order: i32,
    pub status: UserCategoryStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UserCategoryItem {
    pub id: String,
    pub tenant_id: String,
    pub user_category_id: String,
    pub listing_id: String,
    pub note: Option<String>,
    pub sort_order: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UserStoreShare {
    pub id: String,
    pub tenant_id: String,
    pub owner_user_id: String,
    pub share_token: String,
    pub title: String,
    pub description: Option<String>,
    pub scope: ShareScope,
    pub selected_category_ids: Vec<String>,
    pub visibility: ShareVisibility,
    pub status: ShareStatus,
    pub expires_at: Option<DateTime<Utc>>,
    pub view_count: i64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Listing display card resolved through the listing domain port. The user
/// store domain persists only `listing_id` and never mirrors listing fields.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListingCard {
    pub listing_id: String,
    pub display_name: String,
    pub subtitle: Option<String>,
    pub icon_media_resource_id: Option<String>,
    pub average_rating: Option<String>,
    pub download_count: i64,
}
