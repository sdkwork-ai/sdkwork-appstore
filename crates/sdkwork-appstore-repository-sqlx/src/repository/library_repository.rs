use crate::pool::AppstoreSqlxDb;

use crate::db::columns::{
    columns_csv, APPSTORE_DOWNLOAD_GRANT_COLUMNS, APPSTORE_USER_LIBRARY_ITEM_COLUMNS,
    APPSTORE_USER_WISHLIST_ITEM_COLUMNS,
};
use crate::db::rows::{
    DownloadGrantRow, ReleaseArtifactRow, ReleaseRow, UserLibraryItemRow, UserWishlistItemRow,
};
use crate::mapper::row_mapper::{
    map_install_event_domain_to_row, map_library_download_grant_domain_to_row,
    map_library_download_grant_row_to_domain, map_library_item_domain_to_row,
    map_library_item_row_to_domain, map_wishlist_item_domain_to_row,
    map_wishlist_item_row_to_domain,
};

use sdkwork_appstore_library_service::context::AppstoreRequestContext;
use sdkwork_appstore_library_service::domain::models::{
    DownloadGrant, InstallEvent, LibraryItemId, UserLibraryItem, UserWishlistItem,
};
use sdkwork_appstore_library_service::error::AppstoreServiceError;
use sdkwork_appstore_library_service::ports::repository::LibraryRepositoryPort;

#[derive(Debug, Clone)]
pub struct SqlxLibraryRepository {
    db: AppstoreSqlxDb,
}

impl SqlxLibraryRepository {
    pub fn new(db: AppstoreSqlxDb) -> Self {
        Self { db }
    }
}

#[async_trait::async_trait]
impl LibraryRepositoryPort for SqlxLibraryRepository {
    async fn find_library_items_by_user(
        &self,
        context: &AppstoreRequestContext,
        cursor: Option<&str>,
        limit: i32,
    ) -> Result<Vec<UserLibraryItem>, AppstoreServiceError> {
        let rows = if let Some(cursor_id) = cursor {
            self.db
                .query_as::<UserLibraryItemRow>(&format!(
                    r#"SELECT {} FROM appstore_user_library_item
                WHERE tenant_id = ? AND user_id = ? AND id > ?
                ORDER BY id ASC LIMIT ?"#,
                    columns_csv(APPSTORE_USER_LIBRARY_ITEM_COLUMNS)
                ))
                .bind(&context.tenant_id)
                .bind(&context.user_id)
                .bind(cursor_id)
                .bind(limit)
                .fetch_all(&self.db)
                .await
                .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?
        } else {
            self.db
                .query_as::<UserLibraryItemRow>(&format!(
                    r#"SELECT {} FROM appstore_user_library_item
                WHERE tenant_id = ? AND user_id = ?
                ORDER BY id ASC LIMIT ?"#,
                    columns_csv(APPSTORE_USER_LIBRARY_ITEM_COLUMNS)
                ))
                .bind(&context.tenant_id)
                .bind(&context.user_id)
                .bind(limit)
                .fetch_all(&self.db)
                .await
                .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?
        };

        rows.into_iter()
            .map(map_library_item_row_to_domain)
            .collect::<Result<Vec<_>, _>>()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn find_library_item_by_id(
        &self,
        context: &AppstoreRequestContext,
        library_item_id: &LibraryItemId,
    ) -> Result<Option<UserLibraryItem>, AppstoreServiceError> {
        let row = self.db.query_as::< UserLibraryItemRow>(&format!(
            r#"SELECT {} FROM appstore_user_library_item WHERE id = ? AND tenant_id = ? AND user_id = ?"#,
            columns_csv(APPSTORE_USER_LIBRARY_ITEM_COLUMNS)
        ))
        .bind(library_item_id.as_str())
        .bind(&context.tenant_id)
        .bind(&context.user_id)
        .fetch_optional(&self.db)
        .await
        .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        row.map(map_library_item_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn find_library_item_by_listing(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
    ) -> Result<Option<UserLibraryItem>, AppstoreServiceError> {
        let row = self
            .db
            .query_as::<UserLibraryItemRow>(&format!(
                r#"SELECT {} FROM appstore_user_library_item
            WHERE tenant_id = ? AND user_id = ? AND listing_id = ?"#,
                columns_csv(APPSTORE_USER_LIBRARY_ITEM_COLUMNS)
            ))
            .bind(&context.tenant_id)
            .bind(&context.user_id)
            .bind(listing_id)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        row.map(map_library_item_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn find_library_item_by_app_key_and_platform(
        &self,
        context: &AppstoreRequestContext,
        app_key: &str,
        platform: &str,
    ) -> Result<Option<UserLibraryItem>, AppstoreServiceError> {
        let row = self
            .db
            .query_as::<UserLibraryItemRow>(&format!(
                r#"SELECT {} FROM appstore_user_library_item
            WHERE tenant_id = ? AND user_id = ? AND app_key = ? AND platform = ?"#,
                columns_csv(APPSTORE_USER_LIBRARY_ITEM_COLUMNS)
            ))
            .bind(&context.tenant_id)
            .bind(&context.user_id)
            .bind(app_key)
            .bind(platform)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        row.map(map_library_item_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn insert_library_item(
        &self,
        context: &AppstoreRequestContext,
        item: &UserLibraryItem,
    ) -> Result<(), AppstoreServiceError> {
        let (library_status, install_source) = map_library_item_domain_to_row(item);

        self.db
            .query(
                r#"INSERT INTO appstore_user_library_item (
                id, tenant_id, user_id, listing_id, app_key,
                library_status, installed_release_id, installed_version_code, install_source,
                platform, architecture, device_id, last_checked_at, installed_at, updated_at,
                removed_at, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
            )
            .bind(item.id.as_str())
            .bind(&context.tenant_id)
            .bind(&context.user_id)
            .bind(&item.listing_id)
            .bind(&item.app_key)
            .bind(&library_status)
            .bind(&item.installed_release_id)
            .bind(&item.installed_version_code)
            .bind(&install_source)
            .bind(&item.platform)
            .bind(&item.architecture)
            .bind(&item.device_id)
            .bind(item.last_checked_at)
            .bind(item.installed_at)
            .bind(item.updated_at)
            .bind(item.removed_at)
            .bind(item.created_at)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn update_library_item(
        &self,
        context: &AppstoreRequestContext,
        item: &UserLibraryItem,
    ) -> Result<(), AppstoreServiceError> {
        let (library_status, install_source) = map_library_item_domain_to_row(item);

        self.db
            .query(
                r#"UPDATE appstore_user_library_item SET
                listing_id = ?, app_key = ?, library_status = ?,
                installed_release_id = ?, installed_version_code = ?, install_source = ?,
                platform = ?, architecture = ?, device_id = ?, last_checked_at = ?,
                installed_at = ?, updated_at = ?, removed_at = ?
            WHERE id = ? AND tenant_id = ?"#,
            )
            .bind(&item.listing_id)
            .bind(&item.app_key)
            .bind(&library_status)
            .bind(&item.installed_release_id)
            .bind(&item.installed_version_code)
            .bind(&install_source)
            .bind(&item.platform)
            .bind(&item.architecture)
            .bind(&item.device_id)
            .bind(item.last_checked_at)
            .bind(item.installed_at)
            .bind(item.updated_at)
            .bind(item.removed_at)
            .bind(item.id.as_str())
            .bind(&context.tenant_id)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn find_wishlist_items_by_user(
        &self,
        context: &AppstoreRequestContext,
        cursor: Option<&str>,
        limit: i32,
    ) -> Result<Vec<UserWishlistItem>, AppstoreServiceError> {
        let rows = if let Some(cursor_id) = cursor {
            self.db
                .query_as::<UserWishlistItemRow>(&format!(
                    r#"SELECT {} FROM appstore_user_wishlist_item
                WHERE tenant_id = ? AND user_id = ? AND id > ?
                ORDER BY id ASC LIMIT ?"#,
                    columns_csv(APPSTORE_USER_WISHLIST_ITEM_COLUMNS)
                ))
                .bind(&context.tenant_id)
                .bind(&context.user_id)
                .bind(cursor_id)
                .bind(limit)
                .fetch_all(&self.db)
                .await
                .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?
        } else {
            self.db
                .query_as::<UserWishlistItemRow>(&format!(
                    r#"SELECT {} FROM appstore_user_wishlist_item
                WHERE tenant_id = ? AND user_id = ?
                ORDER BY id ASC LIMIT ?"#,
                    columns_csv(APPSTORE_USER_WISHLIST_ITEM_COLUMNS)
                ))
                .bind(&context.tenant_id)
                .bind(&context.user_id)
                .bind(limit)
                .fetch_all(&self.db)
                .await
                .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?
        };

        rows.into_iter()
            .map(map_wishlist_item_row_to_domain)
            .collect::<Result<Vec<_>, _>>()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn find_wishlist_item_by_listing(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
    ) -> Result<Option<UserWishlistItem>, AppstoreServiceError> {
        let row = self
            .db
            .query_as::<UserWishlistItemRow>(&format!(
                r#"SELECT {} FROM appstore_user_wishlist_item
            WHERE tenant_id = ? AND user_id = ? AND listing_id = ?"#,
                columns_csv(APPSTORE_USER_WISHLIST_ITEM_COLUMNS)
            ))
            .bind(&context.tenant_id)
            .bind(&context.user_id)
            .bind(listing_id)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        row.map(map_wishlist_item_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn insert_wishlist_item(
        &self,
        context: &AppstoreRequestContext,
        item: &UserWishlistItem,
    ) -> Result<(), AppstoreServiceError> {
        let wishlist_status = map_wishlist_item_domain_to_row(item);

        self.db
            .query(
                r#"INSERT INTO appstore_user_wishlist_item (
                id, tenant_id, user_id, listing_id, wishlist_status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)"#,
            )
            .bind(&item.id)
            .bind(&context.tenant_id)
            .bind(&context.user_id)
            .bind(&item.listing_id)
            .bind(&wishlist_status)
            .bind(item.created_at)
            .bind(item.updated_at)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn update_wishlist_item(
        &self,
        context: &AppstoreRequestContext,
        item: &UserWishlistItem,
    ) -> Result<(), AppstoreServiceError> {
        let wishlist_status = map_wishlist_item_domain_to_row(item);

        self.db
            .query(
                r#"UPDATE appstore_user_wishlist_item
            SET wishlist_status = ?, updated_at = ?
            WHERE id = ? AND tenant_id = ?"#,
            )
            .bind(&wishlist_status)
            .bind(item.updated_at)
            .bind(&item.id)
            .bind(&context.tenant_id)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn insert_install_event(
        &self,
        context: &AppstoreRequestContext,
        event: &InstallEvent,
    ) -> Result<(), AppstoreServiceError> {
        let (event_type, event_status, payload_snapshot_json) =
            map_install_event_domain_to_row(event);

        self.db
            .query(
                r#"INSERT INTO appstore_install_event (
                id, tenant_id, organization_id, event_no, listing_id, release_id, artifact_id,
                user_id, device_id, event_type, platform, architecture, event_status,
                source_channel, client_version, region_code, payload_snapshot_json, occurred_at,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
            )
            .bind(&event.id)
            .bind(&context.tenant_id)
            .bind(&context.organization_id)
            .bind(&event.event_no)
            .bind(&event.listing_id)
            .bind(&event.release_id)
            .bind(&event.artifact_id)
            .bind(&event.user_id)
            .bind(&event.device_id)
            .bind(&event_type)
            .bind(&event.platform)
            .bind(&event.architecture)
            .bind(&event_status)
            .bind(&event.source_channel)
            .bind(&event.client_version)
            .bind(&event.region_code)
            .bind(&payload_snapshot_json)
            .bind(event.occurred_at)
            .bind(event.created_at)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn find_download_grant_by_id(
        &self,
        context: &AppstoreRequestContext,
        grant_id: &str,
    ) -> Result<Option<DownloadGrant>, AppstoreServiceError> {
        let row = self
            .db
            .query_as::<DownloadGrantRow>(&format!(
                r#"SELECT {} FROM appstore_download_grant WHERE id = ? AND tenant_id = ?"#,
                columns_csv(APPSTORE_DOWNLOAD_GRANT_COLUMNS)
            ))
            .bind(grant_id)
            .bind(&context.tenant_id)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        row.map(map_library_download_grant_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn insert_download_grant(
        &self,
        context: &AppstoreRequestContext,
        grant: &DownloadGrant,
    ) -> Result<(), AppstoreServiceError> {
        let (grant_status, grant_reason) = map_library_download_grant_domain_to_row(grant);

        self.db
            .query(
                r#"INSERT INTO appstore_download_grant (
                id, tenant_id, organization_id, grant_no, listing_id, release_id,
                artifact_id, user_id, grant_status, grant_reason, expires_at, consumed_at,
                download_count, max_download_count, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
            )
            .bind(&grant.id)
            .bind(&context.tenant_id)
            .bind(&context.organization_id)
            .bind(&grant.grant_no)
            .bind(&grant.listing_id)
            .bind(&grant.release_id)
            .bind(&grant.artifact_id)
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

    async fn update_download_grant(
        &self,
        context: &AppstoreRequestContext,
        grant: &DownloadGrant,
    ) -> Result<(), AppstoreServiceError> {
        let (grant_status, grant_reason) = map_library_download_grant_domain_to_row(grant);

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
            .bind(&grant.id)
            .bind(&context.tenant_id)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn find_latest_release_for_listing(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
    ) -> Result<Option<(String, String, String, Option<String>)>, AppstoreServiceError> {
        let row: Option<ReleaseRow> = self
            .db
            .query_as::<ReleaseRow>(&format!(
                r#"SELECT id, tenant_id, organization_id, listing_id, release_no, channel_id,
                version_name, version_code, build_number, release_status, minimum_os_version,
                release_notes_default_locale, manifest_snapshot_json, submitted_at, approved_at,
                published_at, retired_at, version, created_at, updated_at
            FROM appstore_release
            WHERE tenant_id = ? AND listing_id = ? AND release_status = 'published'
            ORDER BY published_at DESC LIMIT 1"#
            ))
            .bind(&context.tenant_id)
            .bind(listing_id)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        match row {
            Some(r) => Ok(Some((
                r.id,
                r.version_code,
                r.version_name,
                r.published_at.map(|value| value.to_rfc3339()),
            ))),
            None => Ok(None),
        }
    }

    async fn find_release_notes(
        &self,
        context: &AppstoreRequestContext,
        release_id: &str,
        locale: Option<&str>,
    ) -> Result<Option<String>, AppstoreServiceError> {
        let row: Option<(String,)> = self
            .db
            .query_as(&self.db.adapt_sql(
                r#"
                SELECT release_notes
                FROM appstore_release_note_localization
                WHERE tenant_id = ? AND release_id = ? AND locale = ?
                ORDER BY created_at DESC
                LIMIT 1
                "#,
            ))
            .bind(&context.tenant_id)
            .bind(release_id)
            .bind(locale.unwrap_or("zh-CN"))
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;
        Ok(row.map(|(notes,)| notes))
    }

    async fn find_latest_artifact_for_release(
        &self,
        context: &AppstoreRequestContext,
        release_id: &str,
        platform: &str,
        architecture: Option<&str>,
    ) -> Result<Option<(String, String)>, AppstoreServiceError> {
        let row: Option<ReleaseArtifactRow> = if let Some(arch) = architecture {
            self.db
                .query_as::<ReleaseArtifactRow>(&format!(
                    r#"SELECT id, tenant_id, organization_id, release_id, artifact_no,
                    platform, architecture, package_format, artifact_status, drive_node_id,
                    media_resource_id, file_size_bytes, content_type, checksum_sha256,
                    signature_snapshot_json, sbom_ref, provenance_ref, min_os_version,
                    created_at, updated_at
                FROM appstore_release_artifact
                WHERE tenant_id = ? AND release_id = ? AND platform = ? AND architecture = ?
                    AND artifact_status = 'verified'
                ORDER BY created_at DESC LIMIT 1"#
                ))
                .bind(&context.tenant_id)
                .bind(release_id)
                .bind(platform)
                .bind(arch)
                .fetch_optional(&self.db)
                .await
                .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?
        } else {
            self.db
                .query_as::<ReleaseArtifactRow>(&format!(
                    r#"SELECT id, tenant_id, organization_id, release_id, artifact_no,
                    platform, architecture, package_format, artifact_status, drive_node_id,
                    media_resource_id, file_size_bytes, content_type, checksum_sha256,
                    signature_snapshot_json, sbom_ref, provenance_ref, min_os_version,
                    created_at, updated_at
                FROM appstore_release_artifact
                WHERE tenant_id = ? AND release_id = ? AND platform = ?
                    AND artifact_status = 'verified'
                ORDER BY created_at DESC LIMIT 1"#
                ))
                .bind(&context.tenant_id)
                .bind(release_id)
                .bind(platform)
                .fetch_optional(&self.db)
                .await
                .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?
        };

        match row {
            Some(r) => Ok(Some((r.id, r.file_size_bytes))),
            None => Ok(None),
        }
    }

    async fn find_listing_info(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
    ) -> Result<Option<String>, AppstoreServiceError> {
        let row: Option<(String,)> = self
            .db
            .query_as::<(String,)>(
                "SELECT app_key FROM appstore_listing WHERE tenant_id = ? AND id = ? AND deleted_at IS NULL",
            )
            .bind(&context.tenant_id)
            .bind(listing_id)
            .fetch_optional(&self.db)
        .await
        .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(row.map(|(app_key,)| app_key))
    }
}
