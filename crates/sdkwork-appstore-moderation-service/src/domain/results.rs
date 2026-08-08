use serde::{Deserialize, Serialize};

use super::models::{ModerationDecision, ModerationReview};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ModerationOperationResult {
    pub operation_id: &'static str,
    pub accepted: bool,
}

impl ModerationOperationResult {
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
pub struct ListModerationQueueResult {
    pub operation_id: &'static str,
    pub reviews: Vec<ModerationReview>,
    pub next_cursor: Option<String>,
    pub has_more: bool,
}

impl ListModerationQueueResult {
    pub fn new(
        operation_id: &'static str,
        reviews: Vec<ModerationReview>,
        next_cursor: Option<String>,
        has_more: bool,
    ) -> Self {
        Self {
            operation_id,
            reviews,
            next_cursor,
            has_more,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RetrieveModerationReviewResult {
    pub operation_id: &'static str,
    pub review: ModerationReview,
}

impl RetrieveModerationReviewResult {
    pub fn found(operation_id: &'static str, review: ModerationReview) -> Self {
        Self {
            operation_id,
            review,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AssignModerationReviewResult {
    pub operation_id: &'static str,
    pub review: ModerationReview,
}

impl AssignModerationReviewResult {
    pub fn assigned(operation_id: &'static str, review: ModerationReview) -> Self {
        Self {
            operation_id,
            review,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct EnqueueSubmissionReviewResult {
    pub operation_id: &'static str,
    pub review: ModerationReview,
}

impl EnqueueSubmissionReviewResult {
    pub fn created(operation_id: &'static str, review: ModerationReview) -> Self {
        Self {
            operation_id,
            review,
        }
    }

    pub fn existing(operation_id: &'static str, review: ModerationReview) -> Self {
        Self {
            operation_id,
            review,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CreateModerationDecisionResult {
    pub operation_id: &'static str,
    pub decision: ModerationDecision,
    pub review: ModerationReview,
}

impl CreateModerationDecisionResult {
    pub fn created(
        operation_id: &'static str,
        decision: ModerationDecision,
        review: ModerationReview,
    ) -> Self {
        Self {
            operation_id,
            decision,
            review,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CreateModerationAppealResult {
    pub operation_id: &'static str,
    pub appeal: super::models::ModerationAppeal,
}

impl CreateModerationAppealResult {
    pub fn created(operation_id: &'static str, appeal: super::models::ModerationAppeal) -> Self {
        Self {
            operation_id,
            appeal,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListModerationAppealsResult {
    pub operation_id: &'static str,
    pub appeals: Vec<super::models::ModerationAppeal>,
    pub next_cursor: Option<String>,
    pub has_more: bool,
}

impl ListModerationAppealsResult {
    pub fn new(
        operation_id: &'static str,
        appeals: Vec<super::models::ModerationAppeal>,
        next_cursor: Option<String>,
        has_more: bool,
    ) -> Self {
        Self {
            operation_id,
            appeals,
            next_cursor,
            has_more,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RetrieveModerationAppealResult {
    pub operation_id: &'static str,
    pub appeal: super::models::ModerationAppeal,
}

impl RetrieveModerationAppealResult {
    pub fn found(operation_id: &'static str, appeal: super::models::ModerationAppeal) -> Self {
        Self {
            operation_id,
            appeal,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct DecideModerationAppealResult {
    pub operation_id: &'static str,
    pub appeal: super::models::ModerationAppeal,
}

impl DecideModerationAppealResult {
    pub fn decided(operation_id: &'static str, appeal: super::models::ModerationAppeal) -> Self {
        Self {
            operation_id,
            appeal,
        }
    }
}
