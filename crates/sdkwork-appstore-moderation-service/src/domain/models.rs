use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct ModerationReviewId(pub String);

impl ModerationReviewId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct ModerationDecisionId(pub String);

impl ModerationDecisionId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ReviewStatus {
    Pending,
    InReview,
    Approved,
    Rejected,
    ChangesRequested,
    Escalated,
    Cancelled,
}

impl ReviewStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Pending => "pending",
            Self::InReview => "in_review",
            Self::Approved => "approved",
            Self::Rejected => "rejected",
            Self::ChangesRequested => "changes_requested",
            Self::Escalated => "escalated",
            Self::Cancelled => "cancelled",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "pending" => Some(Self::Pending),
            "in_review" => Some(Self::InReview),
            "approved" => Some(Self::Approved),
            "rejected" => Some(Self::Rejected),
            "changes_requested" => Some(Self::ChangesRequested),
            "escalated" => Some(Self::Escalated),
            "cancelled" => Some(Self::Cancelled),
            _ => None,
        }
    }

    pub fn is_terminal(&self) -> bool {
        matches!(
            self,
            Self::Approved | Self::Rejected | Self::ChangesRequested | Self::Cancelled
        )
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum Priority {
    Low,
    Normal,
    High,
    Critical,
}

impl Priority {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Low => "low",
            Self::Normal => "normal",
            Self::High => "high",
            Self::Critical => "critical",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "low" => Some(Self::Low),
            "normal" => Some(Self::Normal),
            "high" => Some(Self::High),
            "critical" => Some(Self::Critical),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum QueueCode {
    ContentReview,
    PolicyCompliance,
    SecurityScan,
    BrandApproval,
    AgeRating,
    Custom(String),
}

impl QueueCode {
    pub fn as_str(&self) -> &str {
        match self {
            Self::ContentReview => "content_review",
            Self::PolicyCompliance => "policy_compliance",
            Self::SecurityScan => "security_scan",
            Self::BrandApproval => "brand_approval",
            Self::AgeRating => "age_rating",
            Self::Custom(code) => code,
        }
    }

    pub fn from_str(s: &str) -> Self {
        match s {
            "content_review" => Self::ContentReview,
            "policy_compliance" => Self::PolicyCompliance,
            "security_scan" => Self::SecurityScan,
            "brand_approval" => Self::BrandApproval,
            "age_rating" => Self::AgeRating,
            other => Self::Custom(other.to_string()),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum DecisionType {
    Approve,
    Reject,
    RequestChanges,
}

impl DecisionType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Approve => "APPROVE",
            Self::Reject => "REJECT",
            Self::RequestChanges => "REQUEST_CHANGES",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "APPROVE" => Some(Self::Approve),
            "REJECT" => Some(Self::Reject),
            "REQUEST_CHANGES" => Some(Self::RequestChanges),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum DecisionStatus {
    Draft,
    Final,
    Overturned,
}

impl DecisionStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Draft => "draft",
            Self::Final => "final",
            Self::Overturned => "overturned",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "draft" => Some(Self::Draft),
            "final" => Some(Self::Final),
            "overturned" => Some(Self::Overturned),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ReasonCode {
    PolicyViolation,
    InappropriateContent,
    SecurityRisk,
    TrademarkInfringement,
    MetadataIncomplete,
    AgeRatingMismatch,
    Custom(String),
}

impl ReasonCode {
    pub fn as_str(&self) -> &str {
        match self {
            Self::PolicyViolation => "policy_violation",
            Self::InappropriateContent => "inappropriate_content",
            Self::SecurityRisk => "security_risk",
            Self::TrademarkInfringement => "trademark_infringement",
            Self::MetadataIncomplete => "metadata_incomplete",
            Self::AgeRatingMismatch => "age_rating_mismatch",
            Self::Custom(code) => code,
        }
    }

    pub fn from_str(s: &str) -> Self {
        match s {
            "policy_violation" => Self::PolicyViolation,
            "inappropriate_content" => Self::InappropriateContent,
            "security_risk" => Self::SecurityRisk,
            "trademark_infringement" => Self::TrademarkInfringement,
            "metadata_incomplete" => Self::MetadataIncomplete,
            "age_rating_mismatch" => Self::AgeRatingMismatch,
            other => Self::Custom(other.to_string()),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ModerationReview {
    pub id: ModerationReviewId,
    pub tenant_id: String,
    pub organization_id: String,
    pub submission_id: String,
    pub review_no: String,
    pub review_status: ReviewStatus,
    pub priority: Priority,
    pub assigned_to: Option<String>,
    pub queue_code: QueueCode,
    pub sla_due_at: Option<DateTime<Utc>>,
    pub started_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl ModerationReview {
    pub fn is_pending(&self) -> bool {
        self.review_status == ReviewStatus::Pending
    }

    pub fn is_in_review(&self) -> bool {
        self.review_status == ReviewStatus::InReview
    }

    pub fn is_terminal(&self) -> bool {
        self.review_status.is_terminal()
    }

    pub fn can_assign(&self) -> bool {
        matches!(
            self.review_status,
            ReviewStatus::Pending | ReviewStatus::InReview
        )
    }

    pub fn can_decide(&self) -> bool {
        matches!(
            self.review_status,
            ReviewStatus::Pending | ReviewStatus::InReview
        )
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ModerationDecision {
    pub id: ModerationDecisionId,
    pub tenant_id: String,
    pub organization_id: String,
    pub review_id: ModerationReviewId,
    pub decision_no: String,
    pub decision_type: DecisionType,
    pub decision_status: DecisionStatus,
    pub reason_code: Option<ReasonCode>,
    pub reason_detail: Option<String>,
    pub policy_reference: Option<String>,
    pub decided_by: String,
    pub decided_at: DateTime<Utc>,
    pub payload_snapshot: serde_json::Value,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct ModerationAppealId(pub String);

impl ModerationAppealId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum AppealStatus {
    Pending,
    Approved,
    Rejected,
}

impl AppealStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Pending => "pending",
            Self::Approved => "approved",
            Self::Rejected => "rejected",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "pending" => Some(Self::Pending),
            "approved" => Some(Self::Approved),
            "rejected" => Some(Self::Rejected),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ModerationAppeal {
    pub id: ModerationAppealId,
    pub tenant_id: String,
    pub organization_id: String,
    pub decision_id: String,
    pub review_id: String,
    pub appeal_no: String,
    pub appellant_user_id: String,
    pub appeal_reason: String,
    pub appeal_status: AppealStatus,
    pub decided_by: Option<String>,
    pub decision_note: Option<String>,
    pub submitted_at: DateTime<Utc>,
    pub decided_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl ModerationAppeal {
    pub fn is_pending(&self) -> bool {
        self.appeal_status == AppealStatus::Pending
    }
}
