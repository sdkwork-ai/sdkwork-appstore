use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct ReleaseChannelId(pub String);

impl ReleaseChannelId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct ReleaseId(pub String);

impl ReleaseId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct ArtifactId(pub String);

impl ArtifactId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct DownloadGrantId(pub String);

impl DownloadGrantId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ChannelType {
    Stable,
    Beta,
    Alpha,
    Nightly,
    Lts,
}

impl ChannelType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Stable => "stable",
            Self::Beta => "beta",
            Self::Alpha => "alpha",
            Self::Nightly => "nightly",
            Self::Lts => "lts",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "stable" => Some(Self::Stable),
            "beta" => Some(Self::Beta),
            "alpha" => Some(Self::Alpha),
            "nightly" => Some(Self::Nightly),
            "lts" => Some(Self::Lts),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ChannelStatus {
    Active,
    Deprecated,
    Disabled,
}

impl ChannelStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Active => "active",
            Self::Deprecated => "deprecated",
            Self::Disabled => "disabled",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "active" => Some(Self::Active),
            "deprecated" => Some(Self::Deprecated),
            "disabled" => Some(Self::Disabled),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum AudienceScope {
    Public,
    Internal,
    Private,
}

impl AudienceScope {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Public => "public",
            Self::Internal => "internal",
            Self::Private => "private",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "public" => Some(Self::Public),
            "internal" => Some(Self::Internal),
            "private" => Some(Self::Private),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ReleaseStatus {
    Draft,
    Submitted,
    Approved,
    Published,
    Retired,
}

impl ReleaseStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Draft => "draft",
            Self::Submitted => "submitted",
            Self::Approved => "approved",
            Self::Published => "published",
            Self::Retired => "retired",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "draft" => Some(Self::Draft),
            "submitted" => Some(Self::Submitted),
            "approved" => Some(Self::Approved),
            "published" => Some(Self::Published),
            "retired" => Some(Self::Retired),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum RolloutStrategy {
    Full,
    Staged,
    Pause,
}

impl RolloutStrategy {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Full => "full",
            Self::Staged => "staged",
            Self::Pause => "pause",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "full" => Some(Self::Full),
            "staged" => Some(Self::Staged),
            "pause" => Some(Self::Pause),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum RolloutStatus {
    Pending,
    InProgress,
    Paused,
    Completed,
    Cancelled,
}

impl RolloutStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Pending => "pending",
            Self::InProgress => "in_progress",
            Self::Paused => "paused",
            Self::Completed => "completed",
            Self::Cancelled => "cancelled",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "pending" => Some(Self::Pending),
            "in_progress" => Some(Self::InProgress),
            "paused" => Some(Self::Paused),
            "completed" => Some(Self::Completed),
            "cancelled" => Some(Self::Cancelled),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ArtifactStatus {
    Pending,
    Verified,
    Rejected,
    Retired,
}

impl ArtifactStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Pending => "pending",
            Self::Verified => "verified",
            Self::Rejected => "rejected",
            Self::Retired => "retired",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "pending" => Some(Self::Pending),
            "verified" => Some(Self::Verified),
            "rejected" => Some(Self::Rejected),
            "retired" => Some(Self::Retired),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum GrantStatus {
    Active,
    Consumed,
    Expired,
    Revoked,
}

impl GrantStatus {
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
pub enum GrantReason {
    Purchase,
    Entitlement,
    Promotion,
    Review,
    Admin,
}

impl GrantReason {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Purchase => "purchase",
            Self::Entitlement => "entitlement",
            Self::Promotion => "promotion",
            Self::Review => "review",
            Self::Admin => "admin",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "purchase" => Some(Self::Purchase),
            "entitlement" => Some(Self::Entitlement),
            "promotion" => Some(Self::Promotion),
            "review" => Some(Self::Review),
            "admin" => Some(Self::Admin),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SignatureSnapshot {
    pub algorithm: Option<String>,
    pub public_key_ref: Option<String>,
    pub signature_value: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReleaseChannel {
    pub id: ReleaseChannelId,
    pub tenant_id: String,
    pub channel_code: String,
    pub channel_type: ChannelType,
    pub channel_status: ChannelStatus,
    pub audience_scope: AudienceScope,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Release {
    pub id: ReleaseId,
    pub tenant_id: String,
    pub organization_id: String,
    pub listing_id: String,
    pub release_no: String,
    pub channel_id: ReleaseChannelId,
    pub version_name: String,
    pub version_code: String,
    pub build_number: Option<String>,
    pub release_status: ReleaseStatus,
    pub minimum_os_version: Option<String>,
    pub release_notes_default_locale: Option<String>,
    pub manifest_snapshot: serde_json::Value,
    pub submitted_at: Option<DateTime<Utc>>,
    pub approved_at: Option<DateTime<Utc>>,
    pub published_at: Option<DateTime<Utc>>,
    pub retired_at: Option<DateTime<Utc>>,
    pub version: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl Release {
    pub fn is_draft(&self) -> bool {
        self.release_status == ReleaseStatus::Draft
    }

    pub fn is_published(&self) -> bool {
        self.release_status == ReleaseStatus::Published
    }

    pub fn is_retired(&self) -> bool {
        self.release_status == ReleaseStatus::Retired
    }

    pub fn can_transition_to(&self, target: &ReleaseStatus) -> bool {
        match (&self.release_status, target) {
            (ReleaseStatus::Draft, ReleaseStatus::Submitted) => true,
            (ReleaseStatus::Submitted, ReleaseStatus::Approved) => true,
            (ReleaseStatus::Submitted, ReleaseStatus::Draft) => true,
            (ReleaseStatus::Approved, ReleaseStatus::Published) => true,
            (ReleaseStatus::Approved, ReleaseStatus::Draft) => true,
            (ReleaseStatus::Published, ReleaseStatus::Retired) => true,
            _ => false,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReleaseNoteLocalization {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub release_id: ReleaseId,
    pub locale: String,
    pub release_notes: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReleaseArtifact {
    pub id: ArtifactId,
    pub tenant_id: String,
    pub organization_id: String,
    pub release_id: ReleaseId,
    pub artifact_no: String,
    pub platform: String,
    pub architecture: String,
    pub package_format: String,
    pub artifact_status: ArtifactStatus,
    pub drive_node_id: String,
    pub media_resource_id: Option<String>,
    pub file_size_bytes: String,
    pub content_type: String,
    pub checksum_sha256: String,
    pub signature_snapshot: SignatureSnapshot,
    pub sbom_ref: Option<String>,
    pub provenance_ref: Option<String>,
    pub min_os_version: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReleaseRollout {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub release_id: ReleaseId,
    pub rollout_strategy: RolloutStrategy,
    pub rollout_status: RolloutStatus,
    pub target_percentage: i32,
    pub current_percentage: i32,
    pub region_filter: Vec<String>,
    pub device_filter: serde_json::Value,
    pub started_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub paused_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl ReleaseRollout {
    pub fn is_active(&self) -> bool {
        matches!(
            self.rollout_status,
            RolloutStatus::InProgress | RolloutStatus::Pending
        )
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct DownloadGrant {
    pub id: DownloadGrantId,
    pub tenant_id: String,
    pub organization_id: String,
    pub grant_no: String,
    pub listing_id: String,
    pub release_id: ReleaseId,
    pub artifact_id: ArtifactId,
    pub user_id: Option<String>,
    pub grant_status: GrantStatus,
    pub grant_reason: GrantReason,
    pub expires_at: DateTime<Utc>,
    pub consumed_at: Option<DateTime<Utc>>,
    pub download_count: i32,
    pub max_download_count: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl DownloadGrant {
    pub fn is_consumable(&self) -> bool {
        self.grant_status == GrantStatus::Active
            && self.expires_at > Utc::now()
            && self.download_count < self.max_download_count
    }
}
