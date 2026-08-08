use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct MarketChannelId(pub String);

impl MarketChannelId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct MarketReleaseId(pub String);

impl MarketReleaseId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ChannelType {
    AppleAppStore,
    GooglePlay,
    Enterprise,
    External,
}

impl ChannelType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::AppleAppStore => "APPLE_APP_STORE",
            Self::GooglePlay => "GOOGLE_PLAY",
            Self::Enterprise => "ENTERPRISE",
            Self::External => "EXTERNAL",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "APPLE_APP_STORE" => Some(Self::AppleAppStore),
            "GOOGLE_PLAY" => Some(Self::GooglePlay),
            "ENTERPRISE" => Some(Self::Enterprise),
            "EXTERNAL" => Some(Self::External),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ChannelStatus {
    Active,
    Inactive,
    Suspended,
}

impl ChannelStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Active => "active",
            Self::Inactive => "inactive",
            Self::Suspended => "suspended",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "active" => Some(Self::Active),
            "inactive" => Some(Self::Inactive),
            "suspended" => Some(Self::Suspended),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum MarketStatus {
    Draft,
    Submitted,
    InReview,
    Approved,
    Rejected,
    Published,
    Retired,
}

impl MarketStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Draft => "draft",
            Self::Submitted => "submitted",
            Self::InReview => "in_review",
            Self::Approved => "approved",
            Self::Rejected => "rejected",
            Self::Published => "published",
            Self::Retired => "retired",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "draft" => Some(Self::Draft),
            "submitted" => Some(Self::Submitted),
            "in_review" => Some(Self::InReview),
            "approved" => Some(Self::Approved),
            "rejected" => Some(Self::Rejected),
            "published" => Some(Self::Published),
            "retired" => Some(Self::Retired),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct MarketChannel {
    pub id: MarketChannelId,
    pub tenant_id: String,
    pub organization_id: Option<String>,
    pub channel_code: String,
    pub channel_type: ChannelType,
    pub provider: String,
    pub channel_status: ChannelStatus,
    pub external_store_code: Option<String>,
    pub api_capability: serde_json::Value,
    pub config: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl MarketChannel {
    pub fn is_active(&self) -> bool {
        self.channel_status == ChannelStatus::Active
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct MarketRelease {
    pub id: MarketReleaseId,
    pub tenant_id: String,
    pub organization_id: String,
    pub app_id: String,
    pub listing_id: String,
    pub release_id: String,
    pub channel_id: MarketChannelId,
    pub market_release_no: String,
    pub external_app_id: Option<String>,
    pub external_release_id: Option<String>,
    pub external_track: Option<String>,
    pub market_status: MarketStatus,
    pub rollout_percent: Option<i32>,
    pub countries: Vec<String>,
    pub store_url: Option<String>,
    pub external_status: serde_json::Value,
    pub submitted_at: Option<DateTime<Utc>>,
    pub approved_at: Option<DateTime<Utc>>,
    pub released_at: Option<DateTime<Utc>>,
    pub rejected_at: Option<DateTime<Utc>>,
    pub last_synced_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl MarketRelease {
    pub fn is_published(&self) -> bool {
        self.market_status == MarketStatus::Published
    }

    pub fn can_sync(&self) -> bool {
        !matches!(
            self.market_status,
            MarketStatus::Draft | MarketStatus::Retired
        )
    }
}
