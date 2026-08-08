use chrono::Utc;
use uuid::Uuid;

use crate::context::AppstoreRequestContext;
use crate::domain::commands::{
    AttachArtifactRequest, AutomationSubmissionCreateRequest, CheckUpdateRequest,
    ConsumeDownloadGrantRequest, CreateDownloadGrantRequest, CreateReleaseRequest,
    ResolveDownloadRequest, RetireReleaseRequest, RetrievePublicReleaseRequest,
    RetrieveReleaseRequest, UpdateReleaseRequest, UpdateRolloutRequest, UpsertReleaseNotesRequest,
};
use crate::domain::models::{
    ArtifactId, ArtifactStatus, ChannelStatus, DownloadGrant, DownloadGrantId, GrantReason,
    GrantStatus, Release, ReleaseArtifact, ReleaseId, ReleaseNoteLocalization, ReleaseRollout,
    ReleaseStatus, RolloutStatus, RolloutStrategy, SignatureSnapshot,
};
use crate::domain::results::{
    AttachArtifactResult, AutomationSubmissionResult, CheckUpdateResult,
    ConsumeDownloadGrantResult, CreateDownloadGrantResult, CreateReleaseResult,
    ResolveDownloadResult, RetireReleaseResult, RetrievePublicReleaseResult, RetrieveReleaseResult,
    UpdateReleaseResult, UpdateRolloutResult, UpsertReleaseNotesResult,
};
use crate::error::{AppstoreServiceError, AppstoreServiceResult};
use crate::ports::repository::ReleaseRepositoryPort;

#[async_trait::async_trait]
pub trait ReleaseOperations {
    async fn create_release(
        &self,
        context: &AppstoreRequestContext,
        request: CreateReleaseRequest,
    ) -> AppstoreServiceResult<CreateReleaseResult>;

    async fn retrieve_release(
        &self,
        context: &AppstoreRequestContext,
        request: RetrieveReleaseRequest,
    ) -> AppstoreServiceResult<RetrieveReleaseResult>;

    async fn update_release(
        &self,
        context: &AppstoreRequestContext,
        request: UpdateReleaseRequest,
    ) -> AppstoreServiceResult<UpdateReleaseResult>;

    async fn upsert_release_notes(
        &self,
        context: &AppstoreRequestContext,
        request: UpsertReleaseNotesRequest,
    ) -> AppstoreServiceResult<UpsertReleaseNotesResult>;

    async fn attach_artifact(
        &self,
        context: &AppstoreRequestContext,
        request: AttachArtifactRequest,
    ) -> AppstoreServiceResult<AttachArtifactResult>;

    async fn update_rollout(
        &self,
        context: &AppstoreRequestContext,
        request: UpdateRolloutRequest,
    ) -> AppstoreServiceResult<UpdateRolloutResult>;

    async fn retire_release(
        &self,
        context: &AppstoreRequestContext,
        request: RetireReleaseRequest,
    ) -> AppstoreServiceResult<RetireReleaseResult>;

    async fn check_update(
        &self,
        context: &AppstoreRequestContext,
        request: CheckUpdateRequest,
    ) -> AppstoreServiceResult<CheckUpdateResult>;

    async fn resolve_download(
        &self,
        context: &AppstoreRequestContext,
        request: ResolveDownloadRequest,
    ) -> AppstoreServiceResult<ResolveDownloadResult>;

    async fn retrieve_public_release(
        &self,
        context: &AppstoreRequestContext,
        request: RetrievePublicReleaseRequest,
    ) -> AppstoreServiceResult<RetrievePublicReleaseResult>;

    async fn create_download_grant(
        &self,
        context: &AppstoreRequestContext,
        request: CreateDownloadGrantRequest,
    ) -> AppstoreServiceResult<CreateDownloadGrantResult>;

    async fn consume_download_grant(
        &self,
        context: &AppstoreRequestContext,
        request: ConsumeDownloadGrantRequest,
    ) -> AppstoreServiceResult<ConsumeDownloadGrantResult>;

    async fn create_automation_submission(
        &self,
        context: &AppstoreRequestContext,
        request: AutomationSubmissionCreateRequest,
    ) -> AppstoreServiceResult<AutomationSubmissionResult>;
}

#[derive(Clone)]
pub struct ReleaseService<R> {
    repository: R,
    provider: Option<std::sync::Arc<dyn crate::ports::provider::ReleaseProviderPort>>,
}

impl<R: std::fmt::Debug> std::fmt::Debug for ReleaseService<R> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("ReleaseService")
            .field("repository", &self.repository)
            .field("provider", &self.provider.is_some())
            .finish()
    }
}

impl<R> ReleaseService<R> {
    pub fn new(repository: R) -> Self {
        Self {
            repository,
            provider: None,
        }
    }

    pub fn with_provider(
        mut self,
        provider: std::sync::Arc<dyn crate::ports::provider::ReleaseProviderPort>,
    ) -> Self {
        self.provider = Some(provider);
        self
    }

    fn generate_release_no() -> String {
        format!(
            "REL-{}",
            Uuid::new_v4()
                .to_string()
                .split('-')
                .next()
                .unwrap_or_default()
        )
    }

    fn generate_artifact_no() -> String {
        format!(
            "ART-{}",
            Uuid::new_v4()
                .to_string()
                .split('-')
                .next()
                .unwrap_or_default()
        )
    }

    fn generate_grant_no() -> String {
        format!(
            "DLG-{}",
            Uuid::new_v4()
                .to_string()
                .split('-')
                .next()
                .unwrap_or_default()
        )
    }

    fn require_scope(
        context: &AppstoreRequestContext,
        required: &str,
    ) -> AppstoreServiceResult<()> {
        if sdkwork_appstore_authorization::scope_granted(&context.permission_scopes, required) {
            Ok(())
        } else {
            Err(AppstoreServiceError::PermissionDenied(
                sdkwork_appstore_authorization::missing_scope_message(required),
            ))
        }
    }

    fn require_user_id(context: &AppstoreRequestContext) -> AppstoreServiceResult<String> {
        let user_id = context.user_id.as_deref().unwrap_or("").trim();
        if user_id.is_empty() || user_id == "system" {
            return Err(AppstoreServiceError::PermissionDenied(
                "Authenticated user is required".to_string(),
            ));
        }
        Ok(user_id.to_string())
    }
}

impl<R> ReleaseService<R>
where
    R: ReleaseRepositoryPort,
{
    /// Numeric sort key for semver-style version codes (e.g. `1.20.5`).
    /// Segments beyond the first four are ignored; non-numeric segments
    /// fall back to zero so ordering stays total and deterministic.
    fn version_sort_key(code: &str) -> u64 {
        let mut key: u64 = 0;
        let mut segments = 0u32;
        for part in code.split('.') {
            let number = part.parse::<u64>().unwrap_or(0).min(999_999);
            key = key * 1_000_000 + number;
            segments += 1;
            if segments >= 4 {
                break;
            }
        }
        key
    }

    /// Whether the release rollout grants an update to this client.
    async fn rollout_grants_update(
        &self,
        context: &AppstoreRequestContext,
        release: &Release,
        request: &CheckUpdateRequest,
    ) -> AppstoreServiceResult<bool> {
        let Some(rollout) = self
            .repository
            .find_rollout_by_release(context, &release.id)
            .await?
        else {
            return Ok(true);
        };

        match rollout.rollout_status {
            RolloutStatus::Paused | RolloutStatus::Cancelled => return Ok(false),
            RolloutStatus::Completed => return Ok(true),
            RolloutStatus::Pending | RolloutStatus::InProgress => {}
        }

        if rollout.rollout_strategy == RolloutStrategy::Full {
            return Ok(true);
        }
        if rollout.target_percentage >= 100 {
            return Ok(true);
        }
        if rollout.target_percentage <= 0 {
            return Ok(false);
        }

        // Region filter: when configured, only listed regions receive updates.
        if !rollout.region_filter.is_empty() {
            let region = request.region_code.as_deref().unwrap_or("");
            if !rollout.region_filter.iter().any(|r| r == region) {
                return Ok(false);
            }
        }

        // Deterministic percentage bucketing keyed on the client device.
        let bucket_input = request
            .device_id
            .as_deref()
            .or(Some(request.architecture.as_deref().unwrap_or("")))
            .unwrap_or_default();
        let mut hasher = std::collections::hash_map::DefaultHasher::new();
        use std::hash::{Hash, Hasher};
        (release.id.as_str(), bucket_input).hash(&mut hasher);
        let bucket = (hasher.finish() % 100) as i32;
        Ok(bucket < rollout.target_percentage)
    }

    /// Finds the download artifact for a release/platform, preferring the
    /// exact architecture and falling back to a universal artifact.
    async fn resolve_update_artifact(
        &self,
        context: &AppstoreRequestContext,
        release: &Release,
        request: &CheckUpdateRequest,
    ) -> AppstoreServiceResult<String> {
        let architecture = request.architecture.as_deref().unwrap_or("any");
        let exact = self
            .repository
            .find_artifact_by_composite(
                context,
                &release.id,
                &request.platform,
                architecture,
                "any",
            )
            .await?;
        if let Some(artifact) = exact {
            return Ok(artifact.id.as_str().to_string());
        }
        let universal = self
            .repository
            .find_artifact_by_composite(context, &release.id, &request.platform, "any", "any")
            .await?;
        Ok(universal
            .map(|artifact| artifact.id.as_str().to_string())
            .unwrap_or_default())
    }

    /// Requires the caller to own the listing's publisher or hold an admin scope.
    async fn ensure_listing_publisher_access(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
    ) -> AppstoreServiceResult<String> {
        if Self::require_scope(context, "appstore.listings.admin").is_ok() {
            return Ok(String::new());
        }
        let user_id = Self::require_user_id(context)?;
        let publisher_id = self
            .repository
            .find_listing_publisher_id(context, listing_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!("Listing not found: {}", listing_id))
            })?;
        let role = self
            .repository
            .find_publisher_member_role(context, &publisher_id, &user_id)
            .await?;
        if role.is_none() {
            return Err(AppstoreServiceError::PermissionDenied(
                "Publisher membership is required".to_string(),
            ));
        }
        Ok(publisher_id)
    }
}

#[async_trait::async_trait]
impl<R> ReleaseOperations for ReleaseService<R>
where
    R: ReleaseRepositoryPort,
{
    async fn create_release(
        &self,
        context: &AppstoreRequestContext,
        request: CreateReleaseRequest,
    ) -> AppstoreServiceResult<CreateReleaseResult> {
        Self::require_scope(context, "appstore.listings.write")?;
        self.ensure_listing_publisher_access(context, &request.listing_id)
            .await?;
        if request.version_name.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Version name is required".to_string(),
            ));
        }
        if request.version_code.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Version code is required".to_string(),
            ));
        }

        let channel = self
            .repository
            .find_channel_by_code(context, &request.channel_code)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Release channel not found: {}",
                    request.channel_code
                ))
            })?;

        if channel.channel_status != ChannelStatus::Active {
            return Err(AppstoreServiceError::InvalidState(
                "Release channel is not active".to_string(),
            ));
        }

        let listing_id = &request.listing_id;

        let existing = self
            .repository
            .find_latest_release_by_channel_code(context, listing_id, &request.channel_code)
            .await?;

        if let Some(ref release) = existing {
            if release.version_code == request.version_code {
                return Err(AppstoreServiceError::AlreadyExists(
                    "Release with this version code already exists for this channel".to_string(),
                ));
            }
        }

        let now = Utc::now();
        let release_id = ReleaseId::new(Uuid::new_v4().to_string());
        let release_no = Self::generate_release_no();

        let organization_id = context.organization_id.clone().unwrap_or_default();

        let release = Release {
            id: release_id,
            tenant_id: context.tenant_id.clone(),
            organization_id,
            listing_id: listing_id.clone(),
            release_no,
            channel_id: channel.id.clone(),
            version_name: request.version_name,
            version_code: request.version_code,
            build_number: request.build_number,
            release_status: ReleaseStatus::Draft,
            minimum_os_version: request.minimum_os_version,
            release_notes_default_locale: None,
            manifest_snapshot: serde_json::Value::Object(serde_json::Map::new()),
            submitted_at: None,
            approved_at: None,
            published_at: None,
            retired_at: None,
            version: 1,
            created_at: now,
            updated_at: now,
        };

        self.repository.insert_release(context, &release).await?;

        Ok(CreateReleaseResult::created(
            "appstore.releases.create",
            release,
        ))
    }

    async fn retrieve_release(
        &self,
        context: &AppstoreRequestContext,
        request: RetrieveReleaseRequest,
    ) -> AppstoreServiceResult<RetrieveReleaseResult> {
        let release_id = ReleaseId::new(&request.release_id);

        let release = self
            .repository
            .find_release_by_id(context, &release_id)
            .await?;

        match release {
            Some(release) => Ok(RetrieveReleaseResult::found(
                "appstore.releases.retrieve",
                release,
            )),
            None => Ok(RetrieveReleaseResult::not_found(
                "appstore.releases.retrieve",
            )),
        }
    }

    async fn update_release(
        &self,
        context: &AppstoreRequestContext,
        request: UpdateReleaseRequest,
    ) -> AppstoreServiceResult<UpdateReleaseResult> {
        Self::require_scope(context, "appstore.listings.write")?;
        let release_id = ReleaseId::new(&request.release_id);

        let mut release = self
            .repository
            .find_release_by_id(context, &release_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!("Release not found: {}", request.release_id))
            })?;
        self.ensure_listing_publisher_access(context, &release.listing_id)
            .await?;

        if release.is_retired() {
            return Err(AppstoreServiceError::InvalidState(
                "Cannot update a retired release".to_string(),
            ));
        }

        let mut updated_fields = Vec::new();

        if let Some(minimum_os_version) = request.minimum_os_version {
            release.minimum_os_version = Some(minimum_os_version);
            updated_fields.push("minimum_os_version".to_string());
        }

        if let Some(status_str) = request.release_status {
            let target_status = ReleaseStatus::from_str(&status_str).ok_or_else(|| {
                AppstoreServiceError::ValidationFailed(format!(
                    "Invalid release status: {}",
                    status_str
                ))
            })?;

            if !release.can_transition_to(&target_status) {
                return Err(AppstoreServiceError::InvalidState(format!(
                    "Cannot transition from {} to {}",
                    release.release_status.as_str(),
                    target_status.as_str()
                )));
            }

            let now = Utc::now();
            match target_status {
                ReleaseStatus::Submitted => {
                    release.submitted_at = Some(now);
                }
                ReleaseStatus::Approved => {
                    release.approved_at = Some(now);
                }
                ReleaseStatus::Published => {
                    // Publish requires at least one verified artifact.
                    let has_verified_artifact = self
                        .repository
                        .find_artifacts_by_release(context, &release.id)
                        .await?
                        .iter()
                        .any(|artifact| artifact.artifact_status == ArtifactStatus::Verified);
                    if !has_verified_artifact {
                        return Err(AppstoreServiceError::InvalidState(
                            "Release requires at least one verified artifact before publishing"
                                .to_string(),
                        ));
                    }
                    release.published_at = Some(now);
                }
                ReleaseStatus::Retired => {
                    release.retired_at = Some(now);
                }
                _ => {}
            }

            release.release_status = target_status;
            updated_fields.push("release_status".to_string());
        }

        if updated_fields.is_empty() {
            return Ok(UpdateReleaseResult::updated(
                "appstore.releases.update",
                release,
            ));
        }

        release.version += 1;
        release.updated_at = Utc::now();

        self.repository.update_release(context, &release).await?;

        Ok(UpdateReleaseResult::updated(
            "appstore.releases.update",
            release,
        ))
    }

    async fn upsert_release_notes(
        &self,
        context: &AppstoreRequestContext,
        request: UpsertReleaseNotesRequest,
    ) -> AppstoreServiceResult<UpsertReleaseNotesResult> {
        let release_id = ReleaseId::new(&request.release_id);

        let release = self
            .repository
            .find_release_by_id(context, &release_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!("Release not found: {}", request.release_id))
            })?;
        self.ensure_listing_publisher_access(context, &release.listing_id)
            .await?;

        if release.is_retired() {
            return Err(AppstoreServiceError::InvalidState(
                "Cannot update notes on a retired release".to_string(),
            ));
        }

        if request.release_notes.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Release notes cannot be empty".to_string(),
            ));
        }

        let now = Utc::now();
        let organization_id = context.organization_id.clone().unwrap_or_default();

        let existing = self
            .repository
            .find_release_notes(context, &release_id, &request.locale)
            .await?;

        let is_update = existing.is_some();
        let existing_id = existing.as_ref().map(|n| n.id.clone());
        let existing_created_at = existing.as_ref().map(|n| n.created_at);

        let notes = ReleaseNoteLocalization {
            id: existing_id.unwrap_or_else(|| Uuid::new_v4().to_string()),
            tenant_id: context.tenant_id.clone(),
            organization_id,
            release_id: release_id.clone(),
            locale: request.locale,
            release_notes: request.release_notes,
            created_at: existing_created_at.unwrap_or(now),
            updated_at: now,
        };

        if is_update {
            self.repository
                .update_release_notes(context, &notes)
                .await?;
        } else {
            self.repository
                .insert_release_notes(context, &notes)
                .await?;
        }

        Ok(UpsertReleaseNotesResult::upserted(
            "appstore.releases.notes.update",
            notes,
        ))
    }

    async fn attach_artifact(
        &self,
        context: &AppstoreRequestContext,
        request: AttachArtifactRequest,
    ) -> AppstoreServiceResult<AttachArtifactResult> {
        Self::require_scope(context, "appstore.listings.write")?;
        let release_id = ReleaseId::new(&request.release_id);

        let release = self
            .repository
            .find_release_by_id(context, &release_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!("Release not found: {}", request.release_id))
            })?;
        self.ensure_listing_publisher_access(context, &release.listing_id)
            .await?;

        if release.is_retired() {
            return Err(AppstoreServiceError::InvalidState(
                "Cannot attach artifact to a retired release".to_string(),
            ));
        }

        let existing = self
            .repository
            .find_artifact_by_composite(
                context,
                &release_id,
                &request.platform,
                &request.architecture,
                &request.package_format,
            )
            .await?;

        if existing.is_some() {
            return Err(AppstoreServiceError::AlreadyExists(
                "Artifact already exists for this platform/architecture/format combination"
                    .to_string(),
            ));
        }

        if request.drive_node_id.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "drive_node_id is required".to_string(),
            ));
        }

        if let Some(provider) = &self.provider {
            provider
                .validate_drive_node(&context.tenant_id, request.drive_node_id.trim())
                .await
                .map_err(AppstoreServiceError::ValidationFailed)?;
        }

        let now = Utc::now();
        let artifact_id = ArtifactId::new(Uuid::new_v4().to_string());
        let artifact_no = Self::generate_artifact_no();
        let organization_id = context.organization_id.clone().unwrap_or_default();

        let content_type = request
            .content_type
            .unwrap_or_else(|| "application/octet-stream".to_string());

        let artifact = ReleaseArtifact {
            id: artifact_id,
            tenant_id: context.tenant_id.clone(),
            organization_id,
            release_id,
            artifact_no,
            platform: request.platform,
            architecture: request.architecture,
            package_format: request.package_format,
            // An artifact is considered verified once the publisher attaches a
            // drive node reference with a SHA-256 checksum; integrity checks
            // (signature verification) can be layered onto the provider port.
            artifact_status: if request.drive_node_id.trim().is_empty()
                || request.checksum_sha256.trim().is_empty()
            {
                ArtifactStatus::Pending
            } else {
                ArtifactStatus::Verified
            },
            drive_node_id: request.drive_node_id,
            media_resource_id: request.media_resource_id,
            file_size_bytes: request.file_size_bytes,
            content_type,
            checksum_sha256: request.checksum_sha256,
            signature_snapshot: SignatureSnapshot {
                algorithm: None,
                public_key_ref: None,
                signature_value: None,
            },
            sbom_ref: None,
            provenance_ref: None,
            min_os_version: request.min_os_version,
            created_at: now,
            updated_at: now,
        };

        self.repository.insert_artifact(context, &artifact).await?;

        Ok(AttachArtifactResult::attached(
            "appstore.releases.artifacts.create",
            artifact,
        ))
    }

    async fn update_rollout(
        &self,
        context: &AppstoreRequestContext,
        request: UpdateRolloutRequest,
    ) -> AppstoreServiceResult<UpdateRolloutResult> {
        Self::require_scope(context, "appstore.listings.write")?;
        let release_id = ReleaseId::new(&request.release_id);

        let release = self
            .repository
            .find_release_by_id(context, &release_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!("Release not found: {}", request.release_id))
            })?;
        self.ensure_listing_publisher_access(context, &release.listing_id)
            .await?;

        if !release.is_published() {
            return Err(AppstoreServiceError::InvalidState(
                "Can only update rollout for published releases".to_string(),
            ));
        }

        if request.target_percentage < 0 || request.target_percentage > 100 {
            return Err(AppstoreServiceError::ValidationFailed(
                "Target percentage must be between 0 and 100".to_string(),
            ));
        }

        let strategy = RolloutStrategy::from_str(&request.rollout_strategy).ok_or_else(|| {
            AppstoreServiceError::ValidationFailed(format!(
                "Invalid rollout strategy: {}",
                request.rollout_strategy
            ))
        })?;

        let now = Utc::now();
        let organization_id = context.organization_id.clone().unwrap_or_default();

        let existing = self
            .repository
            .find_rollout_by_release(context, &release_id)
            .await?;

        let is_update = existing.is_some();
        let existing_id = existing.as_ref().map(|r| r.id.clone());
        let existing_created_at = existing.as_ref().map(|r| r.created_at);

        let (rollout_status, started_at, paused_at, completed_at) = match &strategy {
            RolloutStrategy::Pause => {
                if let Some(ref existing_rollout) = existing {
                    if existing_rollout.rollout_status == RolloutStatus::InProgress {
                        (
                            RolloutStatus::Paused,
                            existing_rollout.started_at,
                            Some(now),
                            None,
                        )
                    } else {
                        return Err(AppstoreServiceError::InvalidState(
                            "Can only pause an in-progress rollout".to_string(),
                        ));
                    }
                } else {
                    return Err(AppstoreServiceError::NotFound(
                        "No rollout found to pause".to_string(),
                    ));
                }
            }
            RolloutStrategy::Full => (
                RolloutStatus::InProgress,
                existing.as_ref().and_then(|r| r.started_at).or(Some(now)),
                None,
                if request.target_percentage == 100 {
                    Some(now)
                } else {
                    None
                },
            ),
            RolloutStrategy::Staged => (
                RolloutStatus::InProgress,
                existing.as_ref().and_then(|r| r.started_at).or(Some(now)),
                None,
                None,
            ),
        };

        let is_full_and_in_progress =
            request.target_percentage == 100 && rollout_status == RolloutStatus::InProgress;

        let rollout = ReleaseRollout {
            id: existing_id.unwrap_or_else(|| Uuid::new_v4().to_string()),
            tenant_id: context.tenant_id.clone(),
            organization_id,
            release_id,
            rollout_strategy: strategy,
            rollout_status,
            target_percentage: request.target_percentage,
            current_percentage: if is_full_and_in_progress {
                100
            } else {
                existing.as_ref().map(|r| r.current_percentage).unwrap_or(0)
            },
            region_filter: request.region_filter.unwrap_or_default(),
            device_filter: request
                .device_filter
                .unwrap_or(serde_json::Value::Object(serde_json::Map::new())),
            started_at,
            completed_at,
            paused_at,
            created_at: existing_created_at.unwrap_or(now),
            updated_at: now,
        };

        if is_update {
            self.repository.update_rollout(context, &rollout).await?;
        } else {
            self.repository.insert_rollout(context, &rollout).await?;
        }

        Ok(UpdateRolloutResult::updated(
            "appstore.releases.rollout.update",
            rollout,
        ))
    }

    async fn retire_release(
        &self,
        context: &AppstoreRequestContext,
        request: RetireReleaseRequest,
    ) -> AppstoreServiceResult<RetireReleaseResult> {
        Self::require_scope(context, "appstore.listings.write")?;
        let release_id = ReleaseId::new(&request.release_id);

        let mut release = self
            .repository
            .find_release_by_id(context, &release_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!("Release not found: {}", request.release_id))
            })?;
        self.ensure_listing_publisher_access(context, &release.listing_id)
            .await?;

        if release.is_retired() {
            return Err(AppstoreServiceError::InvalidState(
                "Release is already retired".to_string(),
            ));
        }

        if !release.is_published() {
            return Err(AppstoreServiceError::InvalidState(
                "Can only retire published releases".to_string(),
            ));
        }

        let now = Utc::now();
        release.release_status = ReleaseStatus::Retired;
        release.retired_at = Some(now);
        release.version += 1;
        release.updated_at = now;

        self.repository.update_release(context, &release).await?;

        Ok(RetireReleaseResult::retired(
            "appstore.releases.retire",
            release,
        ))
    }

    async fn check_update(
        &self,
        context: &AppstoreRequestContext,
        request: CheckUpdateRequest,
    ) -> AppstoreServiceResult<CheckUpdateResult> {
        let listing_id = self
            .repository
            .find_listing_by_app_key(context, &request.app_key)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Listing not found for app key: {}",
                    request.app_key
                ))
            })?;

        let mut releases = self
            .repository
            .find_releases_by_channel_code(context, &listing_id, &request.channel_code)
            .await?;

        // Newest release first, ordered by semantic version (not row version).
        releases.sort_by(|a, b| {
            Self::version_sort_key(&b.version_code)
                .cmp(&Self::version_sort_key(&a.version_code))
                .then_with(|| b.id.as_str().cmp(a.id.as_str()))
        });

        let installed_key = Self::version_sort_key(&request.installed_version_code);

        for release in releases {
            if !release.is_published() {
                continue;
            }
            if Self::version_sort_key(&release.version_code) <= installed_key {
                continue;
            }
            if !self
                .rollout_grants_update(context, &release, &request)
                .await?
            {
                continue;
            }

            let artifact_id = self
                .resolve_update_artifact(context, &release, &request)
                .await?;

            return Ok(CheckUpdateResult::update_available(
                "appstore.releases.checkUpdate",
                release.id.as_str(),
                &release.version_name,
                &release.version_code,
                &artifact_id,
            ));
        }

        Ok(CheckUpdateResult::no_update(
            "appstore.releases.checkUpdate",
        ))
    }

    async fn resolve_download(
        &self,
        context: &AppstoreRequestContext,
        request: ResolveDownloadRequest,
    ) -> AppstoreServiceResult<ResolveDownloadResult> {
        let artifact_id = ArtifactId::new(&request.artifact_id);

        let artifact = self
            .repository
            .find_artifact_by_id(context, &artifact_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Artifact not found: {}",
                    request.artifact_id
                ))
            })?;

        if artifact.artifact_status != ArtifactStatus::Verified {
            return Err(AppstoreServiceError::InvalidState(
                "Artifact is not verified".to_string(),
            ));
        }

        let release = self
            .repository
            .find_release_by_id(context, &artifact.release_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Release not found: {}",
                    artifact.release_id.as_str()
                ))
            })?;

        let pricing_model = self
            .repository
            .find_listing_pricing_model(context, &release.listing_id)
            .await?
            .unwrap_or_default();
        let is_free = pricing_model.eq_ignore_ascii_case("free");

        match &request.grant_id {
            Some(grant_id_str) => {
                let grant_id = DownloadGrantId::new(grant_id_str);
                let grant = self
                    .repository
                    .find_grant_by_id(context, &grant_id)
                    .await?
                    .ok_or_else(|| {
                        AppstoreServiceError::NotFound(format!(
                            "Download grant not found: {}",
                            grant_id_str
                        ))
                    })?;

                if grant.artifact_id != artifact.id {
                    return Err(AppstoreServiceError::InvalidState(
                        "Download grant does not cover this artifact".to_string(),
                    ));
                }
                if !grant.is_consumable() {
                    return Err(AppstoreServiceError::InvalidState(
                        "Download grant is not consumable".to_string(),
                    ));
                }

                // Atomically consume the grant so a shared grant cannot be
                // replayed after its single download allowance is spent.
                self.repository
                    .consume_grant_atomically(
                        context,
                        &grant_id,
                        context.user_id.as_deref().unwrap_or(""),
                    )
                    .await?
                    .ok_or_else(|| {
                        AppstoreServiceError::InvalidState(
                            "Download grant could not be consumed".to_string(),
                        )
                    })?;
            }
            None => {
                if !is_free {
                    return Err(AppstoreServiceError::InvalidState(
                        "Download grant is required for paid content".to_string(),
                    ));
                }
            }
        }

        let download_url = if !artifact.drive_node_id.is_empty() {
            if let Some(provider) = &self.provider {
                provider
                    .generate_download_url(&context.tenant_id, &artifact.drive_node_id, 300)
                    .await
                    .map_err(AppstoreServiceError::Internal)?
            } else {
                format!("drive://{}", artifact.drive_node_id)
            }
        } else {
            return Err(AppstoreServiceError::InvalidState(
                "Artifact has no drive node reference".to_string(),
            ));
        };

        Ok(ResolveDownloadResult::resolved(
            "appstore.artifacts.resolveDownload",
            download_url,
            Utc::now().to_rfc3339(),
            &artifact.checksum_sha256,
            &artifact.file_size_bytes,
        ))
    }

    async fn retrieve_public_release(
        &self,
        context: &AppstoreRequestContext,
        request: RetrievePublicReleaseRequest,
    ) -> AppstoreServiceResult<RetrievePublicReleaseResult> {
        let release_id = ReleaseId::new(&request.release_id);

        let release = self
            .repository
            .find_release_by_id(context, &release_id)
            .await?;

        match release {
            Some(ref r) if r.is_published() => Ok(RetrievePublicReleaseResult::found(
                "appstore.releases.public.retrieve",
                r.clone(),
            )),
            _ => Ok(RetrievePublicReleaseResult::not_found(
                "appstore.releases.public.retrieve",
            )),
        }
    }

    async fn create_download_grant(
        &self,
        context: &AppstoreRequestContext,
        request: CreateDownloadGrantRequest,
    ) -> AppstoreServiceResult<CreateDownloadGrantResult> {
        let user_id = Self::require_user_id(context)?;
        let release_id = ReleaseId::new(&request.release_id);
        let artifact_id = ArtifactId::new(&request.artifact_id);

        let release = self
            .repository
            .find_release_by_id(context, &release_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!("Release not found: {}", request.release_id))
            })?;

        if !release.is_published() {
            return Err(AppstoreServiceError::InvalidState(
                "Can only create grants for published releases".to_string(),
            ));
        }

        let artifact = self
            .repository
            .find_artifact_by_id(context, &artifact_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Artifact not found: {}",
                    request.artifact_id
                ))
            })?;

        if artifact.artifact_status != ArtifactStatus::Verified {
            return Err(AppstoreServiceError::InvalidState(
                "Artifact is not verified".to_string(),
            ));
        }
        if artifact.release_id != release_id {
            return Err(AppstoreServiceError::ValidationFailed(
                "Artifact does not belong to this release".to_string(),
            ));
        }

        let now = Utc::now();
        let grant_id = DownloadGrantId::new(Uuid::new_v4().to_string());
        let grant_no = Self::generate_grant_no();
        let organization_id = context.organization_id.clone().unwrap_or_default();

        let grant_reason = request
            .grant_reason
            .and_then(|r| GrantReason::from_str(&r))
            .unwrap_or(GrantReason::Entitlement);

        let grant = DownloadGrant {
            id: grant_id,
            tenant_id: context.tenant_id.clone(),
            organization_id,
            grant_no,
            listing_id: release.listing_id.clone(),
            release_id,
            artifact_id,
            user_id: Some(user_id),
            grant_status: GrantStatus::Active,
            grant_reason,
            expires_at: now + chrono::Duration::hours(24),
            consumed_at: None,
            download_count: 0,
            max_download_count: 1,
            created_at: now,
            updated_at: now,
        };

        self.repository.insert_grant(context, &grant).await?;

        Ok(CreateDownloadGrantResult::created(
            "appstore.downloadGrants.create",
            grant,
        ))
    }

    async fn consume_download_grant(
        &self,
        context: &AppstoreRequestContext,
        request: ConsumeDownloadGrantRequest,
    ) -> AppstoreServiceResult<ConsumeDownloadGrantResult> {
        let user_id = Self::require_user_id(context)?;
        let grant_id = DownloadGrantId::new(&request.grant_id);

        let grant = self
            .repository
            .consume_grant_atomically(context, &grant_id, &user_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Download grant not found: {}",
                    request.grant_id
                ))
            })?;

        Ok(ConsumeDownloadGrantResult::consumed(
            "appstore.downloadGrants.consume",
            grant,
        ))
    }

    async fn create_automation_submission(
        &self,
        context: &AppstoreRequestContext,
        request: AutomationSubmissionCreateRequest,
    ) -> AppstoreServiceResult<AutomationSubmissionResult> {
        if request.version_name.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Version name is required".to_string(),
            ));
        }
        if request.version_code.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Version code is required".to_string(),
            ));
        }
        if request.artifacts.is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "At least one artifact is required".to_string(),
            ));
        }

        let listing_id = self
            .repository
            .find_listing_by_app_key(context, &request.app_key)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Listing not found for app key: {}",
                    request.app_key
                ))
            })?;

        let channel = self
            .repository
            .find_channel_by_code(context, &request.channel_code)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Release channel not found: {}",
                    request.channel_code
                ))
            })?;

        let now = Utc::now();
        let release_id = ReleaseId::new(Uuid::new_v4().to_string());
        let release_no = Self::generate_release_no();
        let organization_id = context.organization_id.clone().unwrap_or_default();

        let release = Release {
            id: release_id.clone(),
            tenant_id: context.tenant_id.clone(),
            organization_id: organization_id.clone(),
            listing_id,
            release_no,
            channel_id: channel.id.clone(),
            version_name: request.version_name,
            version_code: request.version_code,
            build_number: None,
            release_status: ReleaseStatus::Submitted,
            minimum_os_version: None,
            release_notes_default_locale: None,
            manifest_snapshot: serde_json::Value::Object(serde_json::Map::new()),
            submitted_at: Some(now),
            approved_at: None,
            published_at: None,
            retired_at: None,
            version: 1,
            created_at: now,
            updated_at: now,
        };

        let mut artifacts = Vec::with_capacity(request.artifacts.len());
        for spec in &request.artifacts {
            if spec.drive_node_id.trim().is_empty() {
                return Err(AppstoreServiceError::ValidationFailed(
                    "Each automation artifact requires a drive_node_id".to_string(),
                ));
            }
            if let Some(provider) = &self.provider {
                provider
                    .validate_drive_node(&context.tenant_id, spec.drive_node_id.trim())
                    .await
                    .map_err(AppstoreServiceError::ValidationFailed)?;
            }

            let artifact_id = ArtifactId::new(Uuid::new_v4().to_string());
            let artifact_no = Self::generate_artifact_no();

            let artifact = ReleaseArtifact {
                id: artifact_id,
                tenant_id: context.tenant_id.clone(),
                organization_id: organization_id.clone(),
                release_id: release_id.clone(),
                artifact_no,
                platform: spec.platform.clone(),
                architecture: spec.architecture.clone(),
                package_format: spec.package_format.clone(),
                artifact_status: if spec.checksum_sha256.trim().is_empty() {
                    ArtifactStatus::Pending
                } else {
                    ArtifactStatus::Verified
                },
                drive_node_id: spec.drive_node_id.clone(),
                media_resource_id: None,
                file_size_bytes: spec
                    .file_size_bytes
                    .clone()
                    .unwrap_or_else(|| "0".to_string()),
                content_type: "application/octet-stream".to_string(),
                checksum_sha256: spec.checksum_sha256.clone(),
                signature_snapshot: SignatureSnapshot {
                    algorithm: None,
                    public_key_ref: None,
                    signature_value: None,
                },
                sbom_ref: None,
                provenance_ref: None,
                min_os_version: None,
                created_at: now,
                updated_at: now,
            };

            artifacts.push(artifact);
        }

        self.repository
            .insert_release_with_artifacts(context, &release, &artifacts)
            .await?;

        Ok(AutomationSubmissionResult::accepted(
            "appstore.publish.automation.submissions.create",
            release_id.as_str(),
        ))
    }
}
