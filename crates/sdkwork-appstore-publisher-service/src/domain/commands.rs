//! Publisher operation requests.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PublisherOperationRequest {
    pub operation_id: &'static str,
    pub idempotency_key: Option<String>,
}

impl PublisherOperationRequest {
    pub fn new(operation_id: &'static str) -> Self {
        Self {
            operation_id,
            idempotency_key: None,
        }
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RetrieveCurrentPublisherRequest {
    pub idempotency_key: Option<String>,
}

impl RetrieveCurrentPublisherRequest {
    pub fn new() -> Self {
        Self {
            idempotency_key: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CreatePublisherRequest {
    pub display_name: String,
    pub legal_name: Option<String>,
    pub support_email: Option<String>,
    pub website_url: Option<String>,
    pub publisher_type: Option<String>,
    pub idempotency_key: Option<String>,
}

impl CreatePublisherRequest {
    pub fn new(display_name: impl Into<String>) -> Self {
        Self {
            display_name: display_name.into(),
            legal_name: None,
            support_email: None,
            website_url: None,
            publisher_type: None,
            idempotency_key: None,
        }
    }

    pub fn with_legal_name(mut self, legal_name: impl Into<String>) -> Self {
        self.legal_name = Some(legal_name.into());
        self
    }

    pub fn with_support_email(mut self, email: impl Into<String>) -> Self {
        self.support_email = Some(email.into());
        self
    }

    pub fn with_website_url(mut self, url: impl Into<String>) -> Self {
        self.website_url = Some(url.into());
        self
    }

    pub fn with_publisher_type(mut self, publisher_type: impl Into<String>) -> Self {
        self.publisher_type = Some(publisher_type.into());
        self
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UpdatePublisherRequest {
    pub publisher_id: String,
    pub display_name: Option<String>,
    pub website_url: Option<String>,
    pub support_email: Option<String>,
    pub idempotency_key: Option<String>,
}

impl UpdatePublisherRequest {
    pub fn new(publisher_id: impl Into<String>) -> Self {
        Self {
            publisher_id: publisher_id.into(),
            display_name: None,
            website_url: None,
            support_email: None,
            idempotency_key: None,
        }
    }

    pub fn with_display_name(mut self, name: impl Into<String>) -> Self {
        self.display_name = Some(name.into());
        self
    }

    pub fn with_website_url(mut self, url: impl Into<String>) -> Self {
        self.website_url = Some(url.into());
        self
    }

    pub fn with_support_email(mut self, email: impl Into<String>) -> Self {
        self.support_email = Some(email.into());
        self
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListPublisherMembersRequest {
    pub publisher_id: String,
    pub cursor: Option<String>,
    pub page_size: Option<i32>,
    pub idempotency_key: Option<String>,
}

impl ListPublisherMembersRequest {
    pub fn new(publisher_id: impl Into<String>) -> Self {
        Self {
            publisher_id: publisher_id.into(),
            cursor: None,
            page_size: None,
            idempotency_key: None,
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

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct InvitePublisherMemberRequest {
    pub publisher_id: String,
    pub user_id: String,
    pub member_role: String,
    pub idempotency_key: Option<String>,
}

impl InvitePublisherMemberRequest {
    pub fn new(
        publisher_id: impl Into<String>,
        user_id: impl Into<String>,
        member_role: impl Into<String>,
    ) -> Self {
        Self {
            publisher_id: publisher_id.into(),
            user_id: user_id.into(),
            member_role: member_role.into(),
            idempotency_key: None,
        }
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SubmitPublisherVerificationRequest {
    pub publisher_id: String,
    pub verification_type: String,
    pub credential_snapshot: Option<serde_json::Value>,
    pub evidence_media_resource_id: Option<String>,
    pub idempotency_key: Option<String>,
}

impl SubmitPublisherVerificationRequest {
    pub fn new(publisher_id: impl Into<String>, verification_type: impl Into<String>) -> Self {
        Self {
            publisher_id: publisher_id.into(),
            verification_type: verification_type.into(),
            credential_snapshot: None,
            evidence_media_resource_id: None,
            idempotency_key: None,
        }
    }

    pub fn with_credential_snapshot(mut self, snapshot: serde_json::Value) -> Self {
        self.credential_snapshot = Some(snapshot);
        self
    }

    pub fn with_evidence_media_resource_id(mut self, id: impl Into<String>) -> Self {
        self.evidence_media_resource_id = Some(id.into());
        self
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AdminVerifyPublisherRequest {
    pub publisher_id: String,
    pub verification_type: String,
    pub decision: String,
    pub reason: Option<String>,
    pub idempotency_key: Option<String>,
}

impl AdminVerifyPublisherRequest {
    pub fn new(
        publisher_id: impl Into<String>,
        verification_type: impl Into<String>,
        decision: impl Into<String>,
    ) -> Self {
        Self {
            publisher_id: publisher_id.into(),
            verification_type: verification_type.into(),
            decision: decision.into(),
            reason: None,
            idempotency_key: None,
        }
    }

    pub fn with_reason(mut self, reason: impl Into<String>) -> Self {
        self.reason = Some(reason.into());
        self
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}
