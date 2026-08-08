//! Publisher domain models.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct PublisherId(pub String);

impl PublisherId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum PublisherStatus {
    Draft,
    Active,
    Suspended,
    Deleted,
}

impl PublisherStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Draft => "draft",
            Self::Active => "active",
            Self::Suspended => "suspended",
            Self::Deleted => "deleted",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "draft" => Some(Self::Draft),
            "active" => Some(Self::Active),
            "suspended" => Some(Self::Suspended),
            "deleted" => Some(Self::Deleted),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum VerificationStatus {
    Unverified,
    Pending,
    Verified,
    Rejected,
    Expired,
}

impl VerificationStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Unverified => "unverified",
            Self::Pending => "pending",
            Self::Verified => "verified",
            Self::Rejected => "rejected",
            Self::Expired => "expired",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "unverified" => Some(Self::Unverified),
            "pending" => Some(Self::Pending),
            "verified" => Some(Self::Verified),
            "rejected" => Some(Self::Rejected),
            "expired" => Some(Self::Expired),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum PublisherType {
    Individual,
    Organization,
}

impl PublisherType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Individual => "individual",
            Self::Organization => "organization",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "individual" => Some(Self::Individual),
            "organization" => Some(Self::Organization),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(deny_unknown_fields)]
pub struct ContactSnapshot {
    pub email: Option<String>,
    pub phone: Option<String>,
    pub address: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(deny_unknown_fields)]
pub struct ProfileSnapshot {
    pub bio: Option<String>,
    pub website_url: Option<String>,
    pub social_links: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Publisher {
    pub id: PublisherId,
    pub tenant_id: String,
    pub organization_id: String,
    pub publisher_no: String,
    pub publisher_type: PublisherType,
    pub display_name: String,
    pub legal_name: Option<String>,
    pub status: PublisherStatus,
    pub verification_status: VerificationStatus,
    pub contact_snapshot: ContactSnapshot,
    pub profile_snapshot: ProfileSnapshot,
    pub website_url: Option<String>,
    pub support_email: Option<String>,
    pub logo_media_resource_id: Option<String>,
    pub owner_user_id: String,
    pub version: i32,
    pub verified_at: Option<DateTime<Utc>>,
    pub suspended_at: Option<DateTime<Utc>>,
    pub deleted_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl Publisher {
    pub fn is_active(&self) -> bool {
        self.status == PublisherStatus::Active && self.deleted_at.is_none()
    }

    pub fn is_verified(&self) -> bool {
        self.verification_status == VerificationStatus::Verified
    }

    pub fn can_submit_verification(&self) -> bool {
        matches!(
            self.verification_status,
            VerificationStatus::Unverified
                | VerificationStatus::Rejected
                | VerificationStatus::Expired
        )
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PublisherMember {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub publisher_id: PublisherId,
    pub user_id: String,
    pub member_role: MemberRole,
    pub member_status: MemberStatus,
    pub invited_by: Option<String>,
    pub joined_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum MemberRole {
    Owner,
    Admin,
    Member,
}

impl MemberRole {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Owner => "owner",
            Self::Admin => "admin",
            Self::Member => "member",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "owner" => Some(Self::Owner),
            "admin" => Some(Self::Admin),
            "member" => Some(Self::Member),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum MemberStatus {
    Invited,
    Active,
    Suspended,
    Removed,
}

impl MemberStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Invited => "invited",
            Self::Active => "active",
            Self::Suspended => "suspended",
            Self::Removed => "removed",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "invited" => Some(Self::Invited),
            "active" => Some(Self::Active),
            "suspended" => Some(Self::Suspended),
            "removed" => Some(Self::Removed),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PublisherVerification {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub publisher_id: PublisherId,
    pub verification_type: VerificationType,
    pub verification_status: VerificationStatus,
    pub credential_snapshot: serde_json::Value,
    pub evidence_media_resource_id: Option<String>,
    pub reviewed_by: Option<String>,
    pub reviewed_at: Option<DateTime<Utc>>,
    pub expires_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum VerificationType {
    Identity,
    Business,
    Developer,
}

impl VerificationType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Identity => "identity",
            Self::Business => "business",
            Self::Developer => "developer",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "identity" => Some(Self::Identity),
            "business" => Some(Self::Business),
            "developer" => Some(Self::Developer),
            _ => None,
        }
    }
}
