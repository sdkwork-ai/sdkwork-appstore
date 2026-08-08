use crate::context::AppstoreRequestContext;
use crate::domain::models::{
    ArtifactId, DownloadGrant, DownloadGrantId, Release, ReleaseArtifact, ReleaseChannel,
    ReleaseChannelId, ReleaseId, ReleaseNoteLocalization, ReleaseRollout,
};
use crate::error::AppstoreServiceResult;

#[async_trait::async_trait]
pub trait ReleaseRepositoryPort: Send + Sync {
    async fn find_channel_by_code(
        &self,
        context: &AppstoreRequestContext,
        channel_code: &str,
    ) -> AppstoreServiceResult<Option<ReleaseChannel>>;

    async fn find_release_by_id(
        &self,
        context: &AppstoreRequestContext,
        release_id: &ReleaseId,
    ) -> AppstoreServiceResult<Option<Release>>;

    async fn find_release_by_no(
        &self,
        context: &AppstoreRequestContext,
        release_no: &str,
    ) -> AppstoreServiceResult<Option<Release>>;

    async fn find_latest_published_release(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
        channel_id: &ReleaseChannelId,
    ) -> AppstoreServiceResult<Option<Release>>;

    async fn find_latest_release_by_channel_code(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
        channel_code: &str,
    ) -> AppstoreServiceResult<Option<Release>>;

    /// All releases of a listing/channel (bounded: one row per version per
    /// channel, unique-constrained). Callers sort by release version in memory.
    async fn find_releases_by_channel_code(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
        channel_code: &str,
    ) -> AppstoreServiceResult<Vec<Release>>;

    async fn insert_release(
        &self,
        context: &AppstoreRequestContext,
        release: &Release,
    ) -> AppstoreServiceResult<()>;

    async fn update_release(
        &self,
        context: &AppstoreRequestContext,
        release: &Release,
    ) -> AppstoreServiceResult<()>;

    async fn find_release_notes(
        &self,
        context: &AppstoreRequestContext,
        release_id: &ReleaseId,
        locale: &str,
    ) -> AppstoreServiceResult<Option<ReleaseNoteLocalization>>;

    async fn insert_release_notes(
        &self,
        context: &AppstoreRequestContext,
        notes: &ReleaseNoteLocalization,
    ) -> AppstoreServiceResult<()>;

    async fn update_release_notes(
        &self,
        context: &AppstoreRequestContext,
        notes: &ReleaseNoteLocalization,
    ) -> AppstoreServiceResult<()>;

    async fn find_artifact_by_id(
        &self,
        context: &AppstoreRequestContext,
        artifact_id: &ArtifactId,
    ) -> AppstoreServiceResult<Option<ReleaseArtifact>>;

    async fn find_artifacts_by_release(
        &self,
        context: &AppstoreRequestContext,
        release_id: &ReleaseId,
    ) -> AppstoreServiceResult<Vec<ReleaseArtifact>>;

    async fn find_artifact_by_composite(
        &self,
        context: &AppstoreRequestContext,
        release_id: &ReleaseId,
        platform: &str,
        architecture: &str,
        package_format: &str,
    ) -> AppstoreServiceResult<Option<ReleaseArtifact>>;

    async fn insert_artifact(
        &self,
        context: &AppstoreRequestContext,
        artifact: &ReleaseArtifact,
    ) -> AppstoreServiceResult<()>;

    async fn insert_release_with_artifacts(
        &self,
        context: &AppstoreRequestContext,
        release: &Release,
        artifacts: &[ReleaseArtifact],
    ) -> AppstoreServiceResult<()>;

    async fn find_rollout_by_release(
        &self,
        context: &AppstoreRequestContext,
        release_id: &ReleaseId,
    ) -> AppstoreServiceResult<Option<ReleaseRollout>>;

    async fn insert_rollout(
        &self,
        context: &AppstoreRequestContext,
        rollout: &ReleaseRollout,
    ) -> AppstoreServiceResult<()>;

    async fn update_rollout(
        &self,
        context: &AppstoreRequestContext,
        rollout: &ReleaseRollout,
    ) -> AppstoreServiceResult<()>;

    async fn find_grant_by_id(
        &self,
        context: &AppstoreRequestContext,
        grant_id: &DownloadGrantId,
    ) -> AppstoreServiceResult<Option<DownloadGrant>>;

    async fn insert_grant(
        &self,
        context: &AppstoreRequestContext,
        grant: &DownloadGrant,
    ) -> AppstoreServiceResult<()>;

    async fn update_grant(
        &self,
        context: &AppstoreRequestContext,
        grant: &DownloadGrant,
    ) -> AppstoreServiceResult<()>;

    /// Atomically consumes one download of a grant owned by `user_id`.
    /// Returns `None` when the grant is missing, not owned, or not consumable.
    async fn consume_grant_atomically(
        &self,
        context: &AppstoreRequestContext,
        grant_id: &DownloadGrantId,
        user_id: &str,
    ) -> AppstoreServiceResult<Option<DownloadGrant>>;

    async fn find_listing_by_app_key(
        &self,
        context: &AppstoreRequestContext,
        app_key: &str,
    ) -> AppstoreServiceResult<Option<String>>;

    /// Resolves the owning publisher of a listing.
    async fn find_listing_publisher_id(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
    ) -> AppstoreServiceResult<Option<String>>;

    /// Resolves the pricing model of a listing (`free`, `paid`, ...).
    async fn find_listing_pricing_model(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
    ) -> AppstoreServiceResult<Option<String>>;

    /// Returns the caller's role for a publisher (owner or accepted member)
    /// when the subject has publisher access; `None` otherwise.
    async fn find_publisher_member_role(
        &self,
        context: &AppstoreRequestContext,
        publisher_id: &str,
        user_id: &str,
    ) -> AppstoreServiceResult<Option<String>>;
}
