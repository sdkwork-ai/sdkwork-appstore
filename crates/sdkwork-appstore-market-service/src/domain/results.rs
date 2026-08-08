use serde::{Deserialize, Serialize};

use super::models::{MarketChannel, MarketRelease};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListMarketChannelsResult {
    pub operation_id: &'static str,
    pub channels: Vec<MarketChannel>,
    pub next_cursor: Option<String>,
    pub has_more: bool,
}

impl ListMarketChannelsResult {
    pub fn new(
        operation_id: &'static str,
        channels: Vec<MarketChannel>,
        next_cursor: Option<String>,
        has_more: bool,
    ) -> Self {
        Self {
            operation_id,
            channels,
            next_cursor,
            has_more,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CreateMarketChannelResult {
    pub operation_id: &'static str,
    pub channel: MarketChannel,
}

impl CreateMarketChannelResult {
    pub fn created(operation_id: &'static str, channel: MarketChannel) -> Self {
        Self {
            operation_id,
            channel,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UpdateMarketChannelResult {
    pub operation_id: &'static str,
    pub channel: MarketChannel,
}

impl UpdateMarketChannelResult {
    pub fn updated(operation_id: &'static str, channel: MarketChannel) -> Self {
        Self {
            operation_id,
            channel,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListMarketReleasesResult {
    pub operation_id: &'static str,
    pub releases: Vec<MarketRelease>,
    pub next_cursor: Option<String>,
    pub has_more: bool,
}

impl ListMarketReleasesResult {
    pub fn new(
        operation_id: &'static str,
        releases: Vec<MarketRelease>,
        next_cursor: Option<String>,
        has_more: bool,
    ) -> Self {
        Self {
            operation_id,
            releases,
            next_cursor,
            has_more,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SyncMarketReleaseResult {
    pub operation_id: &'static str,
    pub accepted: bool,
    pub release: MarketRelease,
}

impl SyncMarketReleaseResult {
    pub fn accepted(operation_id: &'static str, release: MarketRelease) -> Self {
        Self {
            operation_id,
            accepted: true,
            release,
        }
    }
}
