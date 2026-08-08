use crate::pool::AppstoreSqlxDb;

use crate::db::columns::{
    columns_csv, APPSTORE_DOWNLOAD_GRANT_COLUMNS, APPSTORE_RELEASE_ARTIFACT_COLUMNS,
    APPSTORE_RELEASE_CHANNEL_COLUMNS, APPSTORE_RELEASE_COLUMNS, APPSTORE_RELEASE_ROLLOUT_COLUMNS,
};
use crate::db::rows::{
    DownloadGrantRow, ReleaseArtifactRow, ReleaseChannelRow, ReleaseNoteLocalizationRow,
    ReleaseRolloutRow, ReleaseRow,
};
use crate::mapper::row_mapper::{
    map_artifact_domain_to_row, map_artifact_row_to_domain, map_grant_domain_to_row,
    map_grant_row_to_domain, map_release_channel_row_to_domain, map_release_domain_to_row,
    map_release_note_row_to_domain, map_release_row_to_domain, map_rollout_domain_to_row,
    map_rollout_row_to_domain,
};

use sdkwork_appstore_release_service::context::AppstoreRequestContext;
use sdkwork_appstore_release_service::domain::models::{
    ArtifactId, DownloadGrant, DownloadGrantId, Release, ReleaseArtifact, ReleaseChannel,
    ReleaseChannelId, ReleaseId, ReleaseNoteLocalization, ReleaseRollout,
};
use sdkwork_appstore_release_service::error::AppstoreServiceError;
use sdkwork_appstore_release_service::ports::repository::ReleaseRepositoryPort;

const INSERT_RELEASE_SQL: &str = r#"INSERT INTO appstore_release (
    id, tenant_id, organization_id, listing_id, release_no, channel_id,
    version_name, version_code, build_number, release_status, minimum_os_version,
    release_notes_default_locale, manifest_snapshot_json, submitted_at, approved_at,
    published_at, retired_at, version, created_at, updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#;

const INSERT_ARTIFACT_SQL: &str = r#"INSERT INTO appstore_release_artifact (
    id, tenant_id, organization_id, release_id, artifact_no, platform,
    architecture, package_format, artifact_status, drive_node_id, media_resource_id,
    file_size_bytes, content_type, checksum_sha256, signature_snapshot_json,
    sbom_ref, provenance_ref, min_os_version, created_at, updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#;

#[derive(Debug, Clone)]
pub struct SqlxReleaseRepository {
    db: AppstoreSqlxDb,
}

impl SqlxReleaseRepository {
    pub fn new(db: AppstoreSqlxDb) -> Self {
        Self { db }
    }
}

#[async_trait::async_trait]
impl ReleaseRepositoryPort for SqlxReleaseRepository {
    async fn find_channel_by_code(
        &self,
        context: &AppstoreRequestContext,
        channel_code: &str,
    ) -> Result<Option<ReleaseChannel>, AppstoreServiceError> {
        let row = self.db.query_as::< ReleaseChannelRow>(&format!(
            r#"SELECT {} FROM appstore_release_channel WHERE tenant_id = ? AND channel_code = ?"#,
            columns_csv(APPSTORE_RELEASE_CHANNEL_COLUMNS)
        ))
        .bind(&context.tenant_id)
        .bind(channel_code)
        .fetch_optional(&self.db)
        .await
        .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        row.map(map_release_channel_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn find_release_by_id(
        &self,
        context: &AppstoreRequestContext,
        release_id: &ReleaseId,
    ) -> Result<Option<Release>, AppstoreServiceError> {
        let row = self
            .db
            .query_as::<ReleaseRow>(&format!(
                r#"SELECT {} FROM appstore_release WHERE id = ? AND tenant_id = ?"#,
                columns_csv(APPSTORE_RELEASE_COLUMNS)
            ))
            .bind(release_id.as_str())
            .bind(&context.tenant_id)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        row.map(map_release_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn find_release_by_no(
        &self,
        context: &AppstoreRequestContext,
        release_no: &str,
    ) -> Result<Option<Release>, AppstoreServiceError> {
        let row = self
            .db
            .query_as::<ReleaseRow>(&format!(
                r#"SELECT {} FROM appstore_release WHERE tenant_id = ? AND release_no = ?"#,
                columns_csv(APPSTORE_RELEASE_COLUMNS)
            ))
            .bind(&context.tenant_id)
            .bind(release_no)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        row.map(map_release_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn find_latest_published_release(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
        channel_id: &ReleaseChannelId,
    ) -> Result<Option<Release>, AppstoreServiceError> {
        let row = self.db.query_as::< ReleaseRow>(&format!(
            r#"SELECT {} FROM appstore_release
            WHERE tenant_id = ? AND listing_id = ? AND channel_id = ? AND release_status = 'published'
            ORDER BY published_at DESC LIMIT 1"#,
            columns_csv(APPSTORE_RELEASE_COLUMNS)
        ))
        .bind(&context.tenant_id)
        .bind(listing_id)
        .bind(channel_id.as_str())
        .fetch_optional(&self.db)
        .await
        .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        row.map(map_release_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn find_latest_release_by_channel_code(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
        channel_code: &str,
    ) -> Result<Option<Release>, AppstoreServiceError> {
        let row = self
            .db
            .query_as::<ReleaseRow>(&format!(
                r#"SELECT {} FROM appstore_release r
            INNER JOIN appstore_release_channel c ON r.channel_id = c.id
            WHERE r.tenant_id = ? AND r.listing_id = ? AND c.channel_code = ?
            ORDER BY r.version DESC LIMIT 1"#,
                columns_csv(APPSTORE_RELEASE_COLUMNS)
            ))
            .bind(&context.tenant_id)
            .bind(listing_id)
            .bind(channel_code)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        row.map(map_release_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn find_releases_by_channel_code(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
        channel_code: &str,
    ) -> Result<Vec<Release>, AppstoreServiceError> {
        let rows = self
            .db
            .query_as::<ReleaseRow>(&format!(
                r#"SELECT {} FROM appstore_release r
            INNER JOIN appstore_release_channel c ON r.channel_id = c.id
            WHERE r.tenant_id = ? AND r.listing_id = ? AND c.channel_code = ?"#,
                columns_csv(APPSTORE_RELEASE_COLUMNS)
            ))
            .bind(&context.tenant_id)
            .bind(listing_id)
            .bind(channel_code)
            .fetch_all(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        rows.into_iter()
            .map(map_release_row_to_domain)
            .collect::<Result<Vec<_>, _>>()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn insert_release(
        &self,
        context: &AppstoreRequestContext,
        release: &Release,
    ) -> Result<(), AppstoreServiceError> {
        let (release_status, manifest_snapshot_json) = map_release_domain_to_row(release);

        self.db
            .query(INSERT_RELEASE_SQL)
            .bind(release.id.as_str())
            .bind(&context.tenant_id)
            .bind(&context.organization_id)
            .bind(&release.listing_id)
            .bind(&release.release_no)
            .bind(release.channel_id.as_str())
            .bind(&release.version_name)
            .bind(&release.version_code)
            .bind(&release.build_number)
            .bind(&release_status)
            .bind(&release.minimum_os_version)
            .bind(&release.release_notes_default_locale)
            .bind(&manifest_snapshot_json)
            .bind(release.submitted_at)
            .bind(release.approved_at)
            .bind(release.published_at)
            .bind(release.retired_at)
            .bind(release.version)
            .bind(release.created_at)
            .bind(release.updated_at)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn insert_release_with_artifacts(
        &self,
        context: &AppstoreRequestContext,
        release: &Release,
        artifacts: &[ReleaseArtifact],
    ) -> Result<(), AppstoreServiceError> {
        let mut transaction =
            self.db.begin().await.map_err(|error| {
                AppstoreServiceError::Internal(format!("Database error: {error}"))
            })?;
        let (release_status, manifest_snapshot_json) = map_release_domain_to_row(release);

        self.db
            .query(INSERT_RELEASE_SQL)
            .bind(release.id.as_str())
            .bind(&context.tenant_id)
            .bind(&context.organization_id)
            .bind(&release.listing_id)
            .bind(&release.release_no)
            .bind(release.channel_id.as_str())
            .bind(&release.version_name)
            .bind(&release.version_code)
            .bind(&release.build_number)
            .bind(&release_status)
            .bind(&release.minimum_os_version)
            .bind(&release.release_notes_default_locale)
            .bind(&manifest_snapshot_json)
            .bind(release.submitted_at)
            .bind(release.approved_at)
            .bind(release.published_at)
            .bind(release.retired_at)
            .bind(release.version)
            .bind(release.created_at)
            .bind(release.updated_at)
            .execute_tx(&mut transaction)
            .await
            .map_err(|error| AppstoreServiceError::Internal(format!("Database error: {error}")))?;

        for artifact in artifacts {
            let (artifact_status, signature_snapshot_json) = map_artifact_domain_to_row(artifact);
            self.db
                .query(INSERT_ARTIFACT_SQL)
                .bind(artifact.id.as_str())
                .bind(&context.tenant_id)
                .bind(&context.organization_id)
                .bind(artifact.release_id.as_str())
                .bind(&artifact.artifact_no)
                .bind(&artifact.platform)
                .bind(&artifact.architecture)
                .bind(&artifact.package_format)
                .bind(&artifact_status)
                .bind(&artifact.drive_node_id)
                .bind(&artifact.media_resource_id)
                .bind(&artifact.file_size_bytes)
                .bind(&artifact.content_type)
                .bind(&artifact.checksum_sha256)
                .bind(&signature_snapshot_json)
                .bind(&artifact.sbom_ref)
                .bind(&artifact.provenance_ref)
                .bind(&artifact.min_os_version)
                .bind(artifact.created_at)
                .bind(artifact.updated_at)
                .execute_tx(&mut transaction)
                .await
                .map_err(|error| {
                    AppstoreServiceError::Internal(format!("Database error: {error}"))
                })?;
        }

        transaction
            .commit()
            .await
            .map_err(|error| AppstoreServiceError::Internal(format!("Database error: {error}")))
    }

    async fn update_release(
        &self,
        context: &AppstoreRequestContext,
        release: &Release,
    ) -> Result<(), AppstoreServiceError> {
        let (release_status, manifest_snapshot_json) = map_release_domain_to_row(release);

        let result = self
            .db
            .query(
                r#"UPDATE appstore_release SET
                listing_id = ?, release_no = ?, channel_id = ?, version_name = ?,
                version_code = ?, build_number = ?, release_status = ?, minimum_os_version = ?,
                release_notes_default_locale = ?, manifest_snapshot_json = ?, submitted_at = ?,
                approved_at = ?, published_at = ?, retired_at = ?, version = ?, updated_at = ?
            WHERE id = ? AND tenant_id = ? AND version = ?"#,
            )
            .bind(&release.listing_id)
            .bind(&release.release_no)
            .bind(release.channel_id.as_str())
            .bind(&release.version_name)
            .bind(&release.version_code)
            .bind(&release.build_number)
            .bind(&release_status)
            .bind(&release.minimum_os_version)
            .bind(&release.release_notes_default_locale)
            .bind(&manifest_snapshot_json)
            .bind(release.submitted_at)
            .bind(release.approved_at)
            .bind(release.published_at)
            .bind(release.retired_at)
            .bind(release.version)
            .bind(release.updated_at)
            .bind(release.id.as_str())
            .bind(&context.tenant_id)
            .bind(release.version - 1)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        if result.rows_affected() == 0 {
            return Err(AppstoreServiceError::Conflict(
                "Release was modified by another request".to_string(),
            ));
        }

        Ok(())
    }

    async fn find_release_notes(
        &self,
        context: &AppstoreRequestContext,
        release_id: &ReleaseId,
        locale: &str,
    ) -> Result<Option<ReleaseNoteLocalization>, AppstoreServiceError> {
        let row = self
            .db
            .query_as::<ReleaseNoteLocalizationRow>(
                r#"SELECT id, tenant_id, organization_id, release_id, locale, release_notes,
                created_at, updated_at
            FROM appstore_release_note_localization
            WHERE tenant_id = ? AND release_id = ? AND locale = ?"#,
            )
            .bind(&context.tenant_id)
            .bind(release_id.as_str())
            .bind(locale)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        row.map(map_release_note_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn insert_release_notes(
        &self,
        context: &AppstoreRequestContext,
        notes: &ReleaseNoteLocalization,
    ) -> Result<(), AppstoreServiceError> {
        self.db
            .query(
                r#"INSERT INTO appstore_release_note_localization (
                id, tenant_id, organization_id, release_id, locale, release_notes,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"#,
            )
            .bind(&notes.id)
            .bind(&context.tenant_id)
            .bind(&context.organization_id)
            .bind(notes.release_id.as_str())
            .bind(&notes.locale)
            .bind(&notes.release_notes)
            .bind(notes.created_at)
            .bind(notes.updated_at)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn update_release_notes(
        &self,
        context: &AppstoreRequestContext,
        notes: &ReleaseNoteLocalization,
    ) -> Result<(), AppstoreServiceError> {
        self.db
            .query(
                r#"UPDATE appstore_release_note_localization
            SET release_notes = ?, updated_at = ?
            WHERE id = ? AND tenant_id = ?"#,
            )
            .bind(&notes.release_notes)
            .bind(notes.updated_at)
            .bind(&notes.id)
            .bind(&context.tenant_id)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn find_artifact_by_id(
        &self,
        context: &AppstoreRequestContext,
        artifact_id: &ArtifactId,
    ) -> Result<Option<ReleaseArtifact>, AppstoreServiceError> {
        let row = self
            .db
            .query_as::<ReleaseArtifactRow>(&format!(
                r#"SELECT {} FROM appstore_release_artifact WHERE id = ? AND tenant_id = ?"#,
                columns_csv(APPSTORE_RELEASE_ARTIFACT_COLUMNS)
            ))
            .bind(artifact_id.as_str())
            .bind(&context.tenant_id)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        row.map(map_artifact_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn find_artifacts_by_release(
        &self,
        context: &AppstoreRequestContext,
        release_id: &ReleaseId,
    ) -> Result<Vec<ReleaseArtifact>, AppstoreServiceError> {
        let rows = self
            .db
            .query_as::<ReleaseArtifactRow>(&format!(
                r#"SELECT {} FROM appstore_release_artifact WHERE release_id = ? AND tenant_id = ?"#,
                columns_csv(APPSTORE_RELEASE_ARTIFACT_COLUMNS)
            ))
            .bind(release_id.as_str())
            .bind(&context.tenant_id)
            .fetch_all(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        rows.into_iter()
            .map(map_artifact_row_to_domain)
            .collect::<Result<Vec<_>, _>>()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn find_artifact_by_composite(
        &self,
        context: &AppstoreRequestContext,
        release_id: &ReleaseId,
        platform: &str,
        architecture: &str,
        package_format: &str,
    ) -> Result<Option<ReleaseArtifact>, AppstoreServiceError> {
        let row = self.db.query_as::< ReleaseArtifactRow>(&format!(
            r#"SELECT {} FROM appstore_release_artifact
            WHERE tenant_id = ? AND release_id = ? AND platform = ? AND architecture = ? AND package_format = ?"#,
            columns_csv(APPSTORE_RELEASE_ARTIFACT_COLUMNS)
        ))
        .bind(&context.tenant_id)
        .bind(release_id.as_str())
        .bind(platform)
        .bind(architecture)
        .bind(package_format)
        .fetch_optional(&self.db)
        .await
        .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        row.map(map_artifact_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn insert_artifact(
        &self,
        context: &AppstoreRequestContext,
        artifact: &ReleaseArtifact,
    ) -> Result<(), AppstoreServiceError> {
        let (artifact_status, signature_snapshot_json) = map_artifact_domain_to_row(artifact);

        self.db
            .query(INSERT_ARTIFACT_SQL)
            .bind(artifact.id.as_str())
            .bind(&context.tenant_id)
            .bind(&context.organization_id)
            .bind(artifact.release_id.as_str())
            .bind(&artifact.artifact_no)
            .bind(&artifact.platform)
            .bind(&artifact.architecture)
            .bind(&artifact.package_format)
            .bind(&artifact_status)
            .bind(&artifact.drive_node_id)
            .bind(&artifact.media_resource_id)
            .bind(&artifact.file_size_bytes)
            .bind(&artifact.content_type)
            .bind(&artifact.checksum_sha256)
            .bind(&signature_snapshot_json)
            .bind(&artifact.sbom_ref)
            .bind(&artifact.provenance_ref)
            .bind(&artifact.min_os_version)
            .bind(artifact.created_at)
            .bind(artifact.updated_at)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn find_rollout_by_release(
        &self,
        context: &AppstoreRequestContext,
        release_id: &ReleaseId,
    ) -> Result<Option<ReleaseRollout>, AppstoreServiceError> {
        let row = self
            .db
            .query_as::<ReleaseRolloutRow>(&format!(
                r#"SELECT {} FROM appstore_release_rollout WHERE tenant_id = ? AND release_id = ?"#,
                columns_csv(APPSTORE_RELEASE_ROLLOUT_COLUMNS)
            ))
            .bind(&context.tenant_id)
            .bind(release_id.as_str())
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        row.map(map_rollout_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn insert_rollout(
        &self,
        context: &AppstoreRequestContext,
        rollout: &ReleaseRollout,
    ) -> Result<(), AppstoreServiceError> {
        let (rollout_strategy, rollout_status, region_filter_json, device_filter_json) =
            map_rollout_domain_to_row(rollout);

        self.db
            .query(
                r#"INSERT INTO appstore_release_rollout (
                id, tenant_id, organization_id, release_id, rollout_strategy, rollout_status,
                target_percentage, current_percentage, region_filter_json, device_filter_json,
                started_at, completed_at, paused_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
            )
            .bind(&rollout.id)
            .bind(&context.tenant_id)
            .bind(&context.organization_id)
            .bind(rollout.release_id.as_str())
            .bind(&rollout_strategy)
            .bind(&rollout_status)
            .bind(rollout.target_percentage)
            .bind(rollout.current_percentage)
            .bind(&region_filter_json)
            .bind(&device_filter_json)
            .bind(rollout.started_at)
            .bind(rollout.completed_at)
            .bind(rollout.paused_at)
            .bind(rollout.created_at)
            .bind(rollout.updated_at)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn update_rollout(
        &self,
        context: &AppstoreRequestContext,
        rollout: &ReleaseRollout,
    ) -> Result<(), AppstoreServiceError> {
        let (rollout_strategy, rollout_status, region_filter_json, device_filter_json) =
            map_rollout_domain_to_row(rollout);

        self.db
            .query(
                r#"UPDATE appstore_release_rollout SET
                rollout_strategy = ?, rollout_status = ?, target_percentage = ?,
                current_percentage = ?, region_filter_json = ?, device_filter_json = ?,
                started_at = ?, completed_at = ?, paused_at = ?, updated_at = ?
            WHERE id = ? AND tenant_id = ?"#,
            )
            .bind(&rollout_strategy)
            .bind(&rollout_status)
            .bind(rollout.target_percentage)
            .bind(rollout.current_percentage)
            .bind(&region_filter_json)
            .bind(&device_filter_json)
            .bind(rollout.started_at)
            .bind(rollout.completed_at)
            .bind(rollout.paused_at)
            .bind(rollout.updated_at)
            .bind(&rollout.id)
            .bind(&context.tenant_id)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn find_grant_by_id(
        &self,
        context: &AppstoreRequestContext,
        grant_id: &DownloadGrantId,
    ) -> Result<Option<DownloadGrant>, AppstoreServiceError> {
        let row = self
            .db
            .query_as::<DownloadGrantRow>(&format!(
                r#"SELECT {} FROM appstore_download_grant WHERE id = ? AND tenant_id = ?"#,
                columns_csv(APPSTORE_DOWNLOAD_GRANT_COLUMNS)
            ))
            .bind(grant_id.as_str())
            .bind(&context.tenant_id)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        row.map(map_grant_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn insert_grant(
        &self,
        context: &AppstoreRequestContext,
        grant: &DownloadGrant,
    ) -> Result<(), AppstoreServiceError> {
        let (grant_status, grant_reason) = map_grant_domain_to_row(grant);

        self.db
            .query(
                r#"INSERT INTO appstore_download_grant (
                id, tenant_id, organization_id, grant_no, listing_id, release_id,
                artifact_id, user_id, grant_status, grant_reason, expires_at, consumed_at,
                download_count, max_download_count, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
            )
            .bind(grant.id.as_str())
            .bind(&context.tenant_id)
            .bind(&context.organization_id)
            .bind(&grant.grant_no)
            .bind(&grant.listing_id)
            .bind(grant.release_id.as_str())
            .bind(grant.artifact_id.as_str())
            .bind(&grant.user_id)
            .bind(&grant_status)
            .bind(&grant_reason)
            .bind(grant.expires_at)
            .bind(grant.consumed_at)
            .bind(grant.download_count)
            .bind(grant.max_download_count)
            .bind(grant.created_at)
            .bind(grant.updated_at)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn update_grant(
        &self,
        context: &AppstoreRequestContext,
        grant: &DownloadGrant,
    ) -> Result<(), AppstoreServiceError> {
        let (grant_status, grant_reason) = map_grant_domain_to_row(grant);

        self.db
            .query(
                r#"UPDATE appstore_download_grant SET
                grant_status = ?, grant_reason = ?, expires_at = ?, consumed_at = ?,
                download_count = ?, max_download_count = ?, updated_at = ?
            WHERE id = ? AND tenant_id = ?"#,
            )
            .bind(&grant_status)
            .bind(&grant_reason)
            .bind(grant.expires_at)
            .bind(grant.consumed_at)
            .bind(grant.download_count)
            .bind(grant.max_download_count)
            .bind(grant.updated_at)
            .bind(grant.id.as_str())
            .bind(&context.tenant_id)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn consume_grant_atomically(
        &self,
        context: &AppstoreRequestContext,
        grant_id: &DownloadGrantId,
        user_id: &str,
    ) -> Result<Option<DownloadGrant>, AppstoreServiceError> {
        let now = chrono::Utc::now();
        let result = self
            .db
            .query(
                r#"UPDATE appstore_download_grant SET
                    download_count = download_count + 1,
                    grant_status = CASE
                        WHEN download_count + 1 >= max_download_count THEN 'consumed'
                        ELSE grant_status
                    END,
                    consumed_at = CASE
                        WHEN download_count + 1 >= max_download_count THEN ?
                        ELSE consumed_at
                    END,
                    updated_at = ?
                WHERE id = ? AND tenant_id = ?
                  AND (? = '' OR user_id = ?)
                  AND grant_status = 'active'
                  AND download_count < max_download_count
                  AND expires_at > ?"#,
            )
            .bind(now)
            .bind(now)
            .bind(grant_id.as_str())
            .bind(&context.tenant_id)
            .bind(user_id)
            .bind(user_id)
            .bind(now)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        if result.rows_affected() == 0 {
            return Ok(None);
        }

        self.find_grant_by_id(context, grant_id).await
    }

    async fn find_listing_by_app_key(
        &self,
        context: &AppstoreRequestContext,
        app_key: &str,
    ) -> Result<Option<String>, AppstoreServiceError> {
        let row: Option<(String,)> = self
            .db
            .query_as::<(String,)>(
                r#"SELECT id FROM appstore_listing WHERE tenant_id = ? AND app_key = ? AND deleted_at IS NULL"#,
            )
            .bind(&context.tenant_id)
            .bind(app_key)
            .fetch_optional(&self.db)
        .await
        .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(row.map(|(id,)| id))
    }

    async fn find_listing_publisher_id(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
    ) -> Result<Option<String>, AppstoreServiceError> {
        let row: Option<(String,)> = self
            .db
            .query_as::<(String,)>(
                r#"SELECT publisher_id FROM appstore_listing WHERE tenant_id = ? AND id = ? AND deleted_at IS NULL"#,
            )
            .bind(&context.tenant_id)
            .bind(listing_id)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(row.map(|(publisher_id,)| publisher_id))
    }

    async fn find_listing_pricing_model(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
    ) -> Result<Option<String>, AppstoreServiceError> {
        let row: Option<(String,)> = self
            .db
            .query_as::<(String,)>(
                r#"SELECT pricing_model FROM appstore_listing WHERE tenant_id = ? AND id = ? AND deleted_at IS NULL"#,
            )
            .bind(&context.tenant_id)
            .bind(listing_id)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(row.map(|(pricing_model,)| pricing_model))
    }

    async fn find_publisher_member_role(
        &self,
        context: &AppstoreRequestContext,
        publisher_id: &str,
        user_id: &str,
    ) -> Result<Option<String>, AppstoreServiceError> {
        let row: Option<(String,)> = self
            .db
            .query_as::<(String,)>(
                r#"
                SELECT role FROM (
                    SELECT 'owner' AS role
                    FROM appstore_publisher
                    WHERE tenant_id = ? AND id = ? AND owner_user_id = ? AND deleted_at IS NULL
                    UNION ALL
                    SELECT member_role
                    FROM appstore_publisher_member
                    WHERE tenant_id = ? AND publisher_id = ? AND user_id = ? AND member_status = 'active'
                ) publisher_roles
                LIMIT 1
                "#,
            )
            .bind(&context.tenant_id)
            .bind(publisher_id)
            .bind(user_id)
            .bind(&context.tenant_id)
            .bind(publisher_id)
            .bind(user_id)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(row.map(|(role,)| role))
    }
}
