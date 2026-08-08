//! Publisher operation results.

use serde::{Deserialize, Serialize};

use super::models::{Publisher, PublisherMember, PublisherVerification};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PublisherOperationResult {
    pub operation_id: &'static str,
    pub accepted: bool,
}

impl PublisherOperationResult {
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
pub struct RetrieveCurrentPublisherResult {
    pub operation_id: &'static str,
    pub publisher: Option<Publisher>,
}

impl RetrieveCurrentPublisherResult {
    pub fn found(operation_id: &'static str, publisher: Publisher) -> Self {
        Self {
            operation_id,
            publisher: Some(publisher),
        }
    }

    pub fn not_found(operation_id: &'static str) -> Self {
        Self {
            operation_id,
            publisher: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CreatePublisherResult {
    pub operation_id: &'static str,
    pub publisher: Publisher,
}

impl CreatePublisherResult {
    pub fn created(operation_id: &'static str, publisher: Publisher) -> Self {
        Self {
            operation_id,
            publisher,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UpdatePublisherResult {
    pub operation_id: &'static str,
    pub publisher: Publisher,
}

impl UpdatePublisherResult {
    pub fn updated(operation_id: &'static str, publisher: Publisher) -> Self {
        Self {
            operation_id,
            publisher,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListPublisherMembersResult {
    pub operation_id: &'static str,
    pub members: Vec<PublisherMember>,
    pub next_cursor: Option<String>,
    pub has_more: bool,
}

impl ListPublisherMembersResult {
    pub fn new(
        operation_id: &'static str,
        members: Vec<PublisherMember>,
        next_cursor: Option<String>,
        has_more: bool,
    ) -> Self {
        Self {
            operation_id,
            members,
            next_cursor,
            has_more,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct InvitePublisherMemberResult {
    pub operation_id: &'static str,
    pub member: PublisherMember,
}

impl InvitePublisherMemberResult {
    pub fn invited(operation_id: &'static str, member: PublisherMember) -> Self {
        Self {
            operation_id,
            member,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SubmitPublisherVerificationResult {
    pub operation_id: &'static str,
    pub verification: PublisherVerification,
}

impl SubmitPublisherVerificationResult {
    pub fn submitted(operation_id: &'static str, verification: PublisherVerification) -> Self {
        Self {
            operation_id,
            verification,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AdminVerifyPublisherResult {
    pub operation_id: &'static str,
    pub verification: PublisherVerification,
}

impl AdminVerifyPublisherResult {
    pub fn verified(operation_id: &'static str, verification: PublisherVerification) -> Self {
        Self {
            operation_id,
            verification,
        }
    }
}
