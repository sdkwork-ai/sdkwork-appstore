use chrono::Utc;
use sdkwork_appstore_authorization::{missing_scope_message, scope_granted};
use uuid::Uuid;

use crate::context::AppstoreRequestContext;
use crate::domain::commands::{
    CreateMarketChannelRequest, ListMarketChannelsRequest, ListMarketReleasesRequest,
    SyncMarketReleaseRequest, UpdateMarketChannelRequest,
};
use crate::domain::models::{
    ChannelStatus, ChannelType, MarketChannel, MarketChannelId, MarketRelease, MarketReleaseId,
    MarketStatus,
};
use crate::domain::results::{
    CreateMarketChannelResult, ListMarketChannelsResult, ListMarketReleasesResult,
    SyncMarketReleaseResult, UpdateMarketChannelResult,
};
use crate::error::{AppstoreServiceError, AppstoreServiceResult};
use crate::ports::provider::MarketProviderPort;
use crate::ports::repository::MarketRepositoryPort;
use std::sync::Arc;

#[async_trait::async_trait]
pub trait MarketOperations {
    async fn list_channels(
        &self,
        context: &AppstoreRequestContext,
        request: ListMarketChannelsRequest,
    ) -> AppstoreServiceResult<ListMarketChannelsResult>;

    async fn create_channel(
        &self,
        context: &AppstoreRequestContext,
        request: CreateMarketChannelRequest,
    ) -> AppstoreServiceResult<CreateMarketChannelResult>;

    async fn update_channel(
        &self,
        context: &AppstoreRequestContext,
        request: UpdateMarketChannelRequest,
    ) -> AppstoreServiceResult<UpdateMarketChannelResult>;

    async fn list_releases(
        &self,
        context: &AppstoreRequestContext,
        request: ListMarketReleasesRequest,
    ) -> AppstoreServiceResult<ListMarketReleasesResult>;

    async fn sync_release(
        &self,
        context: &AppstoreRequestContext,
        request: SyncMarketReleaseRequest,
    ) -> AppstoreServiceResult<SyncMarketReleaseResult>;
}

#[derive(Clone)]
pub struct MarketService<R> {
    repository: R,
    market_provider: Option<Arc<dyn MarketProviderPort>>,
}

impl<R: std::fmt::Debug> std::fmt::Debug for MarketService<R> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("MarketService")
            .field("repository", &self.repository)
            .field("market_provider", &self.market_provider.is_some())
            .finish()
    }
}

impl<R> MarketService<R> {
    pub fn new(repository: R) -> Self {
        Self {
            repository,
            market_provider: None,
        }
    }

    pub fn with_market_provider(mut self, provider: Arc<dyn MarketProviderPort>) -> Self {
        self.market_provider = Some(provider);
        self
    }
}

fn require_scope(context: &AppstoreRequestContext, required: &str) -> AppstoreServiceResult<()> {
    if scope_granted(&context.permission_scopes, required) {
        Ok(())
    } else {
        Err(AppstoreServiceError::PermissionDenied(
            missing_scope_message(required),
        ))
    }
}

#[async_trait::async_trait]
impl<R> MarketOperations for MarketService<R>
where
    R: MarketRepositoryPort,
{
    async fn list_channels(
        &self,
        context: &AppstoreRequestContext,
        request: ListMarketChannelsRequest,
    ) -> AppstoreServiceResult<ListMarketChannelsResult> {
        require_scope(context, "appstore.market_channels.read")?;
        let limit = request.page_size.unwrap_or(20).clamp(1, 200);
        let channels = self
            .repository
            .list_channels(
                context,
                request.channel_status.as_deref(),
                request.cursor.as_deref(),
                limit + 1,
            )
            .await?;

        let has_more = channels.len() > limit as usize;
        let channels: Vec<MarketChannel> = channels.into_iter().take(limit as usize).collect();
        let next_cursor = if has_more {
            channels.last().map(|c| c.id.as_str().to_string())
        } else {
            None
        };

        Ok(ListMarketChannelsResult::new(
            "appstore.marketChannels.list",
            channels,
            next_cursor,
            has_more,
        ))
    }

    async fn create_channel(
        &self,
        context: &AppstoreRequestContext,
        request: CreateMarketChannelRequest,
    ) -> AppstoreServiceResult<CreateMarketChannelResult> {
        require_scope(context, "appstore.market_channels.write")?;
        if request.channel_code.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Channel code is required".to_string(),
            ));
        }

        if request.provider.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Provider is required".to_string(),
            ));
        }

        let channel_type = ChannelType::from_str(&request.channel_type).ok_or_else(|| {
            AppstoreServiceError::ValidationFailed(format!(
                "Invalid channel type: {}",
                request.channel_type
            ))
        })?;

        let existing = self
            .repository
            .find_channel_by_code(context, &request.channel_code)
            .await?;
        if existing.is_some() {
            return Err(AppstoreServiceError::AlreadyExists(format!(
                "Channel already exists with code: {}",
                request.channel_code
            )));
        }

        let now = Utc::now();
        let channel = MarketChannel {
            id: MarketChannelId::new(Uuid::new_v4().to_string()),
            tenant_id: context.tenant_id.clone(),
            organization_id: context.organization_id.clone(),
            channel_code: request.channel_code,
            channel_type,
            provider: request.provider,
            channel_status: ChannelStatus::Active,
            external_store_code: request.external_store_code,
            api_capability: request
                .api_capability
                .unwrap_or(serde_json::Value::Object(serde_json::Map::new())),
            config: request
                .config
                .unwrap_or(serde_json::Value::Object(serde_json::Map::new())),
            created_at: now,
            updated_at: now,
        };

        self.repository.insert_channel(context, &channel).await?;

        Ok(CreateMarketChannelResult::created(
            "appstore.marketChannels.create",
            channel,
        ))
    }

    async fn update_channel(
        &self,
        context: &AppstoreRequestContext,
        request: UpdateMarketChannelRequest,
    ) -> AppstoreServiceResult<UpdateMarketChannelResult> {
        require_scope(context, "appstore.market_channels.write")?;
        let channel_id = MarketChannelId::new(&request.market_channel_id);

        let mut channel = self
            .repository
            .find_channel_by_id(context, &channel_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Market channel not found: {}",
                    request.market_channel_id
                ))
            })?;

        let mut updated_fields = Vec::new();

        if let Some(status) = request.channel_status {
            let new_status = ChannelStatus::from_str(&status).ok_or_else(|| {
                AppstoreServiceError::ValidationFailed(format!(
                    "Invalid channel status: {}",
                    status
                ))
            })?;
            channel.channel_status = new_status;
            updated_fields.push("channel_status".to_string());
        }

        if let Some(code) = request.external_store_code {
            channel.external_store_code = Some(code);
            updated_fields.push("external_store_code".to_string());
        }

        if let Some(capability) = request.api_capability {
            channel.api_capability = capability;
            updated_fields.push("api_capability".to_string());
        }

        if let Some(config) = request.config {
            channel.config = config;
            updated_fields.push("config".to_string());
        }

        if updated_fields.is_empty() {
            return Ok(UpdateMarketChannelResult::updated(
                "appstore.marketChannels.update",
                channel,
            ));
        }

        channel.updated_at = Utc::now();

        self.repository.update_channel(context, &channel).await?;

        Ok(UpdateMarketChannelResult::updated(
            "appstore.marketChannels.update",
            channel,
        ))
    }

    async fn list_releases(
        &self,
        context: &AppstoreRequestContext,
        request: ListMarketReleasesRequest,
    ) -> AppstoreServiceResult<ListMarketReleasesResult> {
        require_scope(context, "appstore.market_releases.read")?;
        let limit = request.page_size.unwrap_or(20).clamp(1, 200);
        let releases = self
            .repository
            .list_releases(
                context,
                request.release_id.as_deref(),
                request.channel_id.as_deref(),
                request.market_status.as_deref(),
                request.cursor.as_deref(),
                limit + 1,
            )
            .await?;

        let has_more = releases.len() > limit as usize;
        let releases: Vec<MarketRelease> = releases.into_iter().take(limit as usize).collect();
        let next_cursor = if has_more {
            releases.last().map(|r| r.id.as_str().to_string())
        } else {
            None
        };

        Ok(ListMarketReleasesResult::new(
            "appstore.marketReleases.list",
            releases,
            next_cursor,
            has_more,
        ))
    }

    async fn sync_release(
        &self,
        context: &AppstoreRequestContext,
        request: SyncMarketReleaseRequest,
    ) -> AppstoreServiceResult<SyncMarketReleaseResult> {
        require_scope(context, "appstore.market_releases.sync")?;
        let release_id = MarketReleaseId::new(&request.market_release_id);

        let mut release = self
            .repository
            .find_release_by_id(context, &release_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Market release not found: {}",
                    request.market_release_id
                ))
            })?;

        if !release.can_sync() {
            return Err(AppstoreServiceError::InvalidState(format!(
                "Market release cannot be synced in state: {}",
                release.market_status.as_str()
            )));
        }

        let sync_mode = request.sync_mode.to_lowercase();
        match sync_mode.as_str() {
            "pull_status" => {
                let (Some(provider), Some(channel), Some(external_release_id)) = (
                    self.market_provider.as_ref(),
                    self.repository
                        .find_channel_by_id(context, &release.channel_id)
                        .await?,
                    release.external_release_id.as_deref(),
                ) else {
                    return Err(AppstoreServiceError::InvalidState(
                        "Market provider is not configured; client-reported status is rejected"
                            .to_string(),
                    ));
                };
                let status = provider
                    .poll_release_status(&channel.channel_code, external_release_id)
                    .await
                    .map_err(|error| AppstoreServiceError::Internal(error))?;
                release.external_status = serde_json::json!({
                    "status": status.external_status,
                    "storeUrl": status.store_url,
                    "rejectionReason": status.rejection_reason,
                });
                if let Some(store_url) = status.store_url {
                    release.store_url = Some(store_url);
                }
            }
            "push_metadata" => {
                return Err(AppstoreServiceError::InvalidState(
                    "Market provider push is not configured; metadata sync is unavailable"
                        .to_string(),
                ));
            }
            "push_release" => {
                let (Some(provider), Some(channel)) = (
                    self.market_provider.as_ref(),
                    self.repository
                        .find_channel_by_id(context, &release.channel_id)
                        .await?,
                ) else {
                    return Err(AppstoreServiceError::InvalidState(
                        "Market provider is not configured; external submission was not sent"
                            .to_string(),
                    ));
                };
                let external_app_id = release.external_app_id.clone().ok_or_else(|| {
                    AppstoreServiceError::ValidationFailed(
                        "external_app_id is required for provider push_release".to_string(),
                    )
                })?;
                let metadata = request
                    .external_status
                    .clone()
                    .unwrap_or_else(|| serde_json::json!({}));
                let artifact_url = metadata
                    .get("artifactUrl")
                    .or_else(|| metadata.get("artifact_url"))
                    .and_then(|value| value.as_str())
                    .unwrap_or_default()
                    .to_string();
                if artifact_url.trim().is_empty() {
                    return Err(AppstoreServiceError::ValidationFailed(
                        "external_status.artifactUrl is required for provider push_release"
                            .to_string(),
                    ));
                }
                let submission = provider
                    .submit_release(
                        &channel.channel_code,
                        &external_app_id,
                        &artifact_url,
                        &metadata,
                    )
                    .await
                    .map_err(|error| AppstoreServiceError::Internal(error))?;
                release.external_release_id = Some(submission.external_release_id);
                release.external_status = serde_json::json!({
                    "status": submission.external_status,
                });
                release.market_status = MarketStatus::Submitted;
                release.submitted_at = Some(Utc::now());
            }
            "reconcile" => {
                return Err(AppstoreServiceError::InvalidState(
                    "Market provider reconcile is not configured".to_string(),
                ));
            }
            _ => {
                return Err(AppstoreServiceError::ValidationFailed(format!(
                    "Invalid sync mode: {}",
                    request.sync_mode
                )));
            }
        }

        release.last_synced_at = Some(Utc::now());
        release.updated_at = Utc::now();

        self.repository.update_release(context, &release).await?;

        Ok(SyncMarketReleaseResult::accepted(
            "appstore.marketReleases.sync",
            release,
        ))
    }
}
