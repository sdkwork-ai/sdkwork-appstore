use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ComplianceOperationRequest {
    pub operation_id: &'static str,
    pub idempotency_key: Option<String>,
}

impl ComplianceOperationRequest {
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
pub struct RetrieveComplianceProfileRequest {
    pub listing_id: String,
    pub idempotency_key: Option<String>,
}

impl RetrieveComplianceProfileRequest {
    pub fn new(listing_id: impl Into<String>) -> Self {
        Self {
            listing_id: listing_id.into(),
            idempotency_key: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UpdateComplianceProfileRequest {
    pub listing_id: String,
    pub privacy_nutrition: Option<serde_json::Value>,
    pub content_rating_questionnaire: Option<serde_json::Value>,
    pub data_safety: Option<serde_json::Value>,
    pub target_audience: Option<serde_json::Value>,
    pub idempotency_key: Option<String>,
}

impl UpdateComplianceProfileRequest {
    pub fn new(listing_id: impl Into<String>) -> Self {
        Self {
            listing_id: listing_id.into(),
            privacy_nutrition: None,
            content_rating_questionnaire: None,
            data_safety: None,
            target_audience: None,
            idempotency_key: None,
        }
    }

    pub fn with_privacy_nutrition(mut self, value: serde_json::Value) -> Self {
        self.privacy_nutrition = Some(value);
        self
    }

    pub fn with_content_rating_questionnaire(mut self, value: serde_json::Value) -> Self {
        self.content_rating_questionnaire = Some(value);
        self
    }

    pub fn with_data_safety(mut self, value: serde_json::Value) -> Self {
        self.data_safety = Some(value);
        self
    }

    pub fn with_target_audience(mut self, value: serde_json::Value) -> Self {
        self.target_audience = Some(value);
        self
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PermissionDisclosureItem {
    pub permission_code: String,
    pub usage_purpose: String,
    pub is_required: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UpsertPermissionDisclosuresRequest {
    pub listing_id: String,
    pub permissions: Vec<PermissionDisclosureItem>,
    pub idempotency_key: Option<String>,
}

impl UpsertPermissionDisclosuresRequest {
    pub fn new(listing_id: impl Into<String>, permissions: Vec<PermissionDisclosureItem>) -> Self {
        Self {
            listing_id: listing_id.into(),
            permissions,
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
pub struct ListIapItemsRequest {
    pub listing_id: String,
    pub cursor: Option<String>,
    pub page_size: Option<i32>,
}

impl ListIapItemsRequest {
    pub fn new(listing_id: impl Into<String>) -> Self {
        Self {
            listing_id: listing_id.into(),
            cursor: None,
            page_size: None,
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
}
