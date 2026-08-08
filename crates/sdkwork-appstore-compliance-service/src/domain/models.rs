use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct ComplianceProfileId(pub String);

impl ComplianceProfileId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ComplianceStatus {
    Draft,
    Submitted,
    Approved,
    Rejected,
    RevisionRequired,
}

impl ComplianceStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Draft => "draft",
            Self::Submitted => "submitted",
            Self::Approved => "approved",
            Self::Rejected => "rejected",
            Self::RevisionRequired => "revision_required",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "draft" => Some(Self::Draft),
            "submitted" => Some(Self::Submitted),
            "approved" => Some(Self::Approved),
            "rejected" => Some(Self::Rejected),
            "revision_required" => Some(Self::RevisionRequired),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum DisclosureStatus {
    Draft,
    Published,
    Superseded,
}

impl DisclosureStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Draft => "draft",
            Self::Published => "published",
            Self::Superseded => "superseded",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "draft" => Some(Self::Draft),
            "published" => Some(Self::Published),
            "superseded" => Some(Self::Superseded),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ComplianceProfile {
    pub id: ComplianceProfileId,
    pub tenant_id: String,
    pub organization_id: String,
    pub listing_id: String,
    pub compliance_version: i32,
    pub privacy_nutrition_json: serde_json::Value,
    pub content_rating_questionnaire_json: serde_json::Value,
    pub data_safety_json: serde_json::Value,
    pub target_audience_json: serde_json::Value,
    pub compliance_status: ComplianceStatus,
    pub reviewed_by: Option<String>,
    pub reviewed_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl ComplianceProfile {
    pub fn is_editable(&self) -> bool {
        matches!(
            self.compliance_status,
            ComplianceStatus::Draft | ComplianceStatus::RevisionRequired
        )
    }

    pub fn can_submit(&self) -> bool {
        matches!(
            self.compliance_status,
            ComplianceStatus::Draft | ComplianceStatus::RevisionRequired
        )
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CompliancePermissionDisclosure {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub listing_id: String,
    pub permission_code: String,
    pub usage_purpose: String,
    pub is_required: bool,
    pub disclosure_status: DisclosureStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListingIapItem {
    pub id: String,
    pub tenant_id: String,
    pub organization_id: String,
    pub listing_id: String,
    pub iap_no: String,
    pub iap_type: String,
    pub sku: String,
    pub display_name: String,
    pub price_cents: i32,
    pub currency_code: String,
    pub subscription_period: Option<String>,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
