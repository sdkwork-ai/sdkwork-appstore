use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListMarketChannelsRequest {
    pub channel_status: Option<String>,
    pub cursor: Option<String>,
    pub page_size: Option<i32>,
    pub idempotency_key: Option<String>,
}

impl ListMarketChannelsRequest {
    pub fn new() -> Self {
        Self {
            channel_status: None,
            cursor: None,
            page_size: None,
            idempotency_key: None,
        }
    }

    pub fn with_channel_status(mut self, status: impl Into<String>) -> Self {
        self.channel_status = Some(status.into());
        self
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
pub struct CreateMarketChannelRequest {
    pub channel_code: String,
    pub channel_type: String,
    pub provider: String,
    pub external_store_code: Option<String>,
    pub api_capability: Option<serde_json::Value>,
    pub config: Option<serde_json::Value>,
    pub idempotency_key: Option<String>,
}

impl CreateMarketChannelRequest {
    pub fn new(
        channel_code: impl Into<String>,
        channel_type: impl Into<String>,
        provider: impl Into<String>,
    ) -> Self {
        Self {
            channel_code: channel_code.into(),
            channel_type: channel_type.into(),
            provider: provider.into(),
            external_store_code: None,
            api_capability: None,
            config: None,
            idempotency_key: None,
        }
    }

    pub fn with_external_store_code(mut self, code: impl Into<String>) -> Self {
        self.external_store_code = Some(code.into());
        self
    }

    pub fn with_api_capability(mut self, capability: serde_json::Value) -> Self {
        self.api_capability = Some(capability);
        self
    }

    pub fn with_config(mut self, config: serde_json::Value) -> Self {
        self.config = Some(config);
        self
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UpdateMarketChannelRequest {
    pub market_channel_id: String,
    pub channel_status: Option<String>,
    pub external_store_code: Option<String>,
    pub api_capability: Option<serde_json::Value>,
    pub config: Option<serde_json::Value>,
    pub idempotency_key: Option<String>,
}

impl UpdateMarketChannelRequest {
    pub fn new(market_channel_id: impl Into<String>) -> Self {
        Self {
            market_channel_id: market_channel_id.into(),
            channel_status: None,
            external_store_code: None,
            api_capability: None,
            config: None,
            idempotency_key: None,
        }
    }

    pub fn with_channel_status(mut self, status: impl Into<String>) -> Self {
        self.channel_status = Some(status.into());
        self
    }

    pub fn with_external_store_code(mut self, code: impl Into<String>) -> Self {
        self.external_store_code = Some(code.into());
        self
    }

    pub fn with_api_capability(mut self, capability: serde_json::Value) -> Self {
        self.api_capability = Some(capability);
        self
    }

    pub fn with_config(mut self, config: serde_json::Value) -> Self {
        self.config = Some(config);
        self
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListMarketReleasesRequest {
    pub release_id: Option<String>,
    pub channel_id: Option<String>,
    pub market_status: Option<String>,
    pub cursor: Option<String>,
    pub page_size: Option<i32>,
    pub idempotency_key: Option<String>,
}

impl ListMarketReleasesRequest {
    pub fn new() -> Self {
        Self {
            release_id: None,
            channel_id: None,
            market_status: None,
            cursor: None,
            page_size: None,
            idempotency_key: None,
        }
    }

    pub fn with_release_id(mut self, id: impl Into<String>) -> Self {
        self.release_id = Some(id.into());
        self
    }

    pub fn with_channel_id(mut self, id: impl Into<String>) -> Self {
        self.channel_id = Some(id.into());
        self
    }

    pub fn with_market_status(mut self, status: impl Into<String>) -> Self {
        self.market_status = Some(status.into());
        self
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
pub struct SyncMarketReleaseRequest {
    pub market_release_id: String,
    pub sync_mode: String,
    pub external_status: Option<serde_json::Value>,
    pub note: Option<String>,
    pub idempotency_key: Option<String>,
}

impl SyncMarketReleaseRequest {
    pub fn new(market_release_id: impl Into<String>, sync_mode: impl Into<String>) -> Self {
        Self {
            market_release_id: market_release_id.into(),
            sync_mode: sync_mode.into(),
            external_status: None,
            note: None,
            idempotency_key: None,
        }
    }

    pub fn with_external_status(mut self, status: serde_json::Value) -> Self {
        self.external_status = Some(status);
        self
    }

    pub fn with_note(mut self, note: impl Into<String>) -> Self {
        self.note = Some(note.into());
        self
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}
