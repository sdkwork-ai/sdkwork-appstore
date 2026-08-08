use crate::pool::AppstoreSqlxDb;
use chrono::Utc;

use crate::db::columns::columns_csv;
use crate::db::columns::APPSTORE_LISTING_COLUMNS;
use crate::db::rows::{
    ListingCategoryBindingRow, ListingLocalizationRow, ListingMediaRow, ListingRatingRow,
    ListingRow, ListingSubmissionRow, RegionalAvailabilityRow, ReleaseRow,
};
use crate::mapper::row_mapper::{
    map_category_binding_row_to_domain, map_listing_domain_to_row,
    map_listing_rating_row_to_domain, map_listing_row_to_domain, map_localization_domain_to_row,
    map_localization_row_to_domain, map_media_domain_to_row, map_media_row_to_domain,
    map_regional_row_to_domain, map_submission_domain_to_row, map_submission_row_to_domain,
};

use sdkwork_appstore_listing_service::context::AppstoreRequestContext;
use sdkwork_appstore_listing_service::domain::models::{
    Listing, ListingCategoryBinding, ListingId, ListingLocalization, ListingMedia, ListingRating,
    ListingSubmission, RegionalAvailability, StoreApp,
};
use sdkwork_appstore_listing_service::error::AppstoreServiceError;
use sdkwork_appstore_listing_service::ports::repository::ListingRepositoryPort;

#[derive(Debug, Clone)]
pub struct SqlxListingRepository {
    db: AppstoreSqlxDb,
}

impl SqlxListingRepository {
    pub fn new(db: AppstoreSqlxDb) -> Self {
        Self { db }
    }
}

#[async_trait::async_trait]
impl ListingRepositoryPort for SqlxListingRepository {
    async fn find_listing_by_id(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &ListingId,
    ) -> Result<Option<Listing>, AppstoreServiceError> {
        let row = self.db.query_as::< ListingRow>(&format!(
            r#"SELECT {} FROM appstore_listing WHERE id = ? AND tenant_id = ? AND deleted_at IS NULL"#,
            columns_csv(APPSTORE_LISTING_COLUMNS)
        ))
        .bind(listing_id.as_str())
        .bind(&context.tenant_id)
        .fetch_optional(&self.db)
        .await
        .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        row.map(map_listing_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn find_listing_by_slug(
        &self,
        _context: &AppstoreRequestContext,
        tenant_id: &str,
        listing_slug: &str,
    ) -> Result<Option<Listing>, AppstoreServiceError> {
        let row = self.db.query_as::< ListingRow>(&format!(
            r#"SELECT {} FROM appstore_listing WHERE tenant_id = ? AND listing_slug = ? AND deleted_at IS NULL"#,
            columns_csv(APPSTORE_LISTING_COLUMNS)
        ))
        .bind(tenant_id)
        .bind(listing_slug)
        .fetch_optional(&self.db)
        .await
        .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        row.map(map_listing_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn find_listing_by_app_id(
        &self,
        context: &AppstoreRequestContext,
        app_id: &str,
    ) -> Result<Option<Listing>, AppstoreServiceError> {
        let row = self.db.query_as::< ListingRow>(&format!(
            r#"SELECT {} FROM appstore_listing WHERE tenant_id = ? AND app_id = ? AND deleted_at IS NULL"#,
            columns_csv(APPSTORE_LISTING_COLUMNS)
        ))
        .bind(&context.tenant_id)
        .bind(app_id)
        .fetch_optional(&self.db)
        .await
        .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        row.map(map_listing_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn find_listings_by_publisher(
        &self,
        context: &AppstoreRequestContext,
        publisher_id: &str,
        cursor: Option<&str>,
        limit: i32,
    ) -> Result<Vec<Listing>, AppstoreServiceError> {
        let rows = if let Some(cursor_id) = cursor {
            self.db
                .query_as::<ListingRow>(&format!(
                    r#"SELECT {} FROM appstore_listing
                WHERE tenant_id = ? AND publisher_id = ? AND deleted_at IS NULL AND id > ?
                ORDER BY id ASC LIMIT ?"#,
                    columns_csv(APPSTORE_LISTING_COLUMNS)
                ))
                .bind(&context.tenant_id)
                .bind(publisher_id)
                .bind(cursor_id)
                .bind(limit)
                .fetch_all(&self.db)
                .await
                .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?
        } else {
            self.db
                .query_as::<ListingRow>(&format!(
                    r#"SELECT {} FROM appstore_listing
                WHERE tenant_id = ? AND publisher_id = ? AND deleted_at IS NULL
                ORDER BY id ASC LIMIT ?"#,
                    columns_csv(APPSTORE_LISTING_COLUMNS)
                ))
                .bind(&context.tenant_id)
                .bind(publisher_id)
                .bind(limit)
                .fetch_all(&self.db)
                .await
                .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?
        };

        rows.into_iter()
            .map(map_listing_row_to_domain)
            .collect::<Result<Vec<_>, _>>()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn insert_listing(
        &self,
        context: &AppstoreRequestContext,
        listing: &Listing,
    ) -> Result<(), AppstoreServiceError> {
        let (
            listing_type,
            pricing_model,
            listing_status,
            storefront_visibility,
            review_status,
            content_rating_json,
        ) = map_listing_domain_to_row(listing);

        self.db.query(
            r#"INSERT INTO appstore_listing (
                id, tenant_id, organization_id, app_id, publisher_id, listing_no,
                app_key, listing_slug, listing_type, pricing_model,
                listing_status, storefront_visibility, review_status, primary_category_id,
                default_locale, age_rating_code, content_rating_json, official_website_url,
                support_url, privacy_policy_url, comments_thread_id, commerce_product_id,
                current_release_id, featured_score, download_count, average_rating,
                rating_count, version, submitted_at, published_at, delisted_at, deleted_at,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
        )
        .bind(listing.id.as_str())
        .bind(&context.tenant_id)
        .bind(&context.organization_id)
        .bind(&listing.app_id)
        .bind(&listing.publisher_id)
        .bind(&listing.listing_no)
        .bind(&listing.app_key)
        .bind(&listing.listing_slug)
        .bind(&listing_type)
        .bind(&pricing_model)
        .bind(&listing_status)
        .bind(&storefront_visibility)
        .bind(&review_status)
        .bind(&listing.primary_category_id)
        .bind(&listing.default_locale)
        .bind(&listing.age_rating_code)
        .bind(&content_rating_json)
        .bind(&listing.official_website_url)
        .bind(&listing.support_url)
        .bind(&listing.privacy_policy_url)
        .bind(&listing.comments_thread_id)
        .bind(&listing.commerce_product_id)
        .bind(&listing.current_release_id)
        .bind(listing.featured_score)
        .bind(listing.download_count)
        .bind(&listing.average_rating)
        .bind(listing.rating_count)
        .bind(listing.version)
        .bind(listing.submitted_at)
        .bind(listing.published_at)
        .bind(listing.delisted_at)
        .bind(listing.deleted_at)
        .bind(listing.created_at)
        .bind(listing.updated_at)
        .execute_unified(&self.db)
        .await
        .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn update_listing(
        &self,
        context: &AppstoreRequestContext,
        listing: &Listing,
    ) -> Result<(), AppstoreServiceError> {
        let (
            _listing_type,
            pricing_model,
            listing_status,
            storefront_visibility,
            review_status,
            content_rating_json,
        ) = map_listing_domain_to_row(listing);

        let result = self
            .db
            .query(
                r#"UPDATE appstore_listing SET
                listing_no = ?, app_id = ?, app_key = ?,
                listing_slug = ?, pricing_model = ?, listing_status = ?,
                storefront_visibility = ?, review_status = ?, primary_category_id = ?,
                default_locale = ?, age_rating_code = ?, content_rating_json = ?,
                official_website_url = ?, support_url = ?, privacy_policy_url = ?,
                comments_thread_id = ?, commerce_product_id = ?, current_release_id = ?,
                featured_score = ?, download_count = ?, average_rating = ?,
                rating_count = ?, version = ?, submitted_at = ?, published_at = ?,
                delisted_at = ?, deleted_at = ?, updated_at = ?
            WHERE id = ? AND tenant_id = ? AND version = ?"#,
            )
            .bind(&listing.listing_no)
            .bind(&listing.app_id)
            .bind(&listing.app_key)
            .bind(&listing.listing_slug)
            .bind(&pricing_model)
            .bind(&listing_status)
            .bind(&storefront_visibility)
            .bind(&review_status)
            .bind(&listing.primary_category_id)
            .bind(&listing.default_locale)
            .bind(&listing.age_rating_code)
            .bind(&content_rating_json)
            .bind(&listing.official_website_url)
            .bind(&listing.support_url)
            .bind(&listing.privacy_policy_url)
            .bind(&listing.comments_thread_id)
            .bind(&listing.commerce_product_id)
            .bind(&listing.current_release_id)
            .bind(listing.featured_score)
            .bind(listing.download_count)
            .bind(&listing.average_rating)
            .bind(listing.rating_count)
            .bind(listing.version)
            .bind(listing.submitted_at)
            .bind(listing.published_at)
            .bind(listing.delisted_at)
            .bind(listing.deleted_at)
            .bind(listing.updated_at)
            .bind(listing.id.as_str())
            .bind(&context.tenant_id)
            .bind(listing.version - 1)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        if result.rows_affected() == 0 {
            return Err(AppstoreServiceError::Conflict(
                "Listing was modified by another request".to_string(),
            ));
        }

        Ok(())
    }

    async fn find_localization(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &ListingId,
        locale: &str,
    ) -> Result<Option<ListingLocalization>, AppstoreServiceError> {
        let row = self
            .db
            .query_as::<ListingLocalizationRow>(
                r#"SELECT id, tenant_id, organization_id, listing_id, locale, display_name,
                subtitle, short_description, full_description, whats_new_summary,
                keywords_json, created_at, updated_at
            FROM appstore_listing_localization
            WHERE tenant_id = ? AND listing_id = ? AND locale = ?"#,
            )
            .bind(&context.tenant_id)
            .bind(listing_id.as_str())
            .bind(locale)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        row.map(map_localization_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn upsert_localization(
        &self,
        context: &AppstoreRequestContext,
        localization: &ListingLocalization,
    ) -> Result<(), AppstoreServiceError> {
        let keywords_json = map_localization_domain_to_row(localization);

        self.db
            .query(
                r#"INSERT INTO appstore_listing_localization (
                id, tenant_id, organization_id, listing_id, locale, display_name,
                subtitle, short_description, full_description, whats_new_summary,
                keywords_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (tenant_id, listing_id, locale) DO UPDATE SET
                display_name = excluded.display_name,
                subtitle = excluded.subtitle,
                short_description = excluded.short_description,
                full_description = excluded.full_description,
                whats_new_summary = excluded.whats_new_summary,
                keywords_json = excluded.keywords_json,
                updated_at = excluded.updated_at"#,
            )
            .bind(&localization.id)
            .bind(&context.tenant_id)
            .bind(&context.organization_id)
            .bind(localization.listing_id.as_str())
            .bind(&localization.locale)
            .bind(&localization.display_name)
            .bind(&localization.subtitle)
            .bind(&localization.short_description)
            .bind(&localization.full_description)
            .bind(&localization.whats_new_summary)
            .bind(&keywords_json)
            .bind(localization.created_at)
            .bind(localization.updated_at)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn find_media_by_listing(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &ListingId,
    ) -> Result<Vec<ListingMedia>, AppstoreServiceError> {
        let rows = self
            .db
            .query_as::<ListingMediaRow>(
                r#"SELECT id, tenant_id, organization_id, listing_id, media_role, media_resource_id,
                drive_node_id, platform_scope, sort_order, locale, created_at, updated_at
            FROM appstore_listing_media
            WHERE tenant_id = ? AND listing_id = ?
            ORDER BY sort_order ASC"#,
            )
            .bind(&context.tenant_id)
            .bind(listing_id.as_str())
            .fetch_all(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        rows.into_iter()
            .map(map_media_row_to_domain)
            .collect::<Result<Vec<_>, _>>()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn find_media_by_id(
        &self,
        context: &AppstoreRequestContext,
        media_id: &str,
    ) -> Result<Option<ListingMedia>, AppstoreServiceError> {
        let row = self
            .db
            .query_as::<ListingMediaRow>(
                r#"SELECT id, tenant_id, organization_id, listing_id, media_role, media_resource_id,
                drive_node_id, platform_scope, sort_order, locale, created_at, updated_at
            FROM appstore_listing_media
            WHERE tenant_id = ? AND id = ?"#,
            )
            .bind(&context.tenant_id)
            .bind(media_id)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        row.map(map_media_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn insert_media(
        &self,
        context: &AppstoreRequestContext,
        media: &ListingMedia,
    ) -> Result<(), AppstoreServiceError> {
        let media_role = map_media_domain_to_row(media);

        self.db
            .query(
                r#"INSERT INTO appstore_listing_media (
                id, tenant_id, organization_id, listing_id, media_role, media_resource_id,
                drive_node_id, platform_scope, sort_order, locale, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
            )
            .bind(&media.id)
            .bind(&context.tenant_id)
            .bind(&context.organization_id)
            .bind(media.listing_id.as_str())
            .bind(&media_role)
            .bind(&media.media_resource_id)
            .bind(&media.drive_node_id)
            .bind(&media.platform_scope)
            .bind(media.sort_order)
            .bind(&media.locale)
            .bind(media.created_at)
            .bind(media.updated_at)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn delete_media(
        &self,
        context: &AppstoreRequestContext,
        media_id: &str,
    ) -> Result<(), AppstoreServiceError> {
        self.db
            .query(r#"DELETE FROM appstore_listing_media WHERE tenant_id = ? AND id = ?"#)
            .bind(&context.tenant_id)
            .bind(media_id)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn find_category_bindings(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &ListingId,
    ) -> Result<Vec<ListingCategoryBinding>, AppstoreServiceError> {
        let rows = self
            .db
            .query_as::<ListingCategoryBindingRow>(
                r#"SELECT id, tenant_id, listing_id, category_id, is_primary, created_at
            FROM appstore_listing_category_binding
            WHERE tenant_id = ? AND listing_id = ?"#,
            )
            .bind(&context.tenant_id)
            .bind(listing_id.as_str())
            .fetch_all(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        rows.into_iter()
            .map(map_category_binding_row_to_domain)
            .collect::<Result<Vec<_>, _>>()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn replace_category_bindings(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &ListingId,
        bindings: &[ListingCategoryBinding],
    ) -> Result<(), AppstoreServiceError> {
        let mut tx = self
            .db
            .begin()
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        self.db.query(
            r#"DELETE FROM appstore_listing_category_binding WHERE tenant_id = ? AND listing_id = ?"#,
        )
        .bind(&context.tenant_id)
        .bind(listing_id.as_str())
        .execute_tx(&mut tx)
        .await
        .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        for binding in bindings {
            self.db
                .query(
                    r#"INSERT INTO appstore_listing_category_binding
                (id, tenant_id, listing_id, category_id, is_primary, created_at)
                VALUES (?, ?, ?, ?, ?, ?)"#,
                )
                .bind(&binding.id)
                .bind(&context.tenant_id)
                .bind(binding.listing_id.as_str())
                .bind(&binding.category_id)
                .bind(if binding.is_primary { 1 } else { 0 })
                .bind(binding.created_at)
                .execute_tx(&mut tx)
                .await
                .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;
        }

        tx.commit()
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn find_regional_availability(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &ListingId,
    ) -> Result<Vec<RegionalAvailability>, AppstoreServiceError> {
        let rows = self
            .db
            .query_as::<RegionalAvailabilityRow>(
                r#"SELECT id, tenant_id, organization_id, listing_id, region_code,
                availability_status, effective_at, expires_at, created_at, updated_at
            FROM appstore_regional_availability
            WHERE tenant_id = ? AND listing_id = ?"#,
            )
            .bind(&context.tenant_id)
            .bind(listing_id.as_str())
            .fetch_all(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        rows.into_iter()
            .map(map_regional_row_to_domain)
            .collect::<Result<Vec<_>, _>>()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn replace_regional_availability(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &ListingId,
        availabilities: &[RegionalAvailability],
    ) -> Result<(), AppstoreServiceError> {
        let mut tx = self
            .db
            .begin()
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        self.db.query(
            r#"DELETE FROM appstore_regional_availability WHERE tenant_id = ? AND listing_id = ?"#,
        )
        .bind(&context.tenant_id)
        .bind(listing_id.as_str())
        .execute_tx(&mut tx)
        .await
        .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        for avail in availabilities {
            self.db
                .query(
                    r#"INSERT INTO appstore_regional_availability
                (id, tenant_id, organization_id, listing_id, region_code,
                 availability_status, effective_at, expires_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
                )
                .bind(&avail.id)
                .bind(&context.tenant_id)
                .bind(&context.organization_id)
                .bind(avail.listing_id.as_str())
                .bind(&avail.region_code)
                .bind(&avail.availability_status)
                .bind(avail.effective_at)
                .bind(avail.expires_at)
                .bind(avail.created_at)
                .bind(avail.updated_at)
                .execute_tx(&mut tx)
                .await
                .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;
        }

        tx.commit()
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn find_releases_by_listing(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &ListingId,
        cursor: Option<&str>,
        limit: i32,
    ) -> Result<Vec<serde_json::Value>, AppstoreServiceError> {
        let release_cols = r#"id, tenant_id, organization_id, listing_id, release_no, channel_id,
            version_name, version_code, build_number, release_status, minimum_os_version,
            release_notes_default_locale, manifest_snapshot_json, submitted_at, approved_at,
            published_at, retired_at, version, created_at, updated_at"#;

        let rows = if let Some(cursor_id) = cursor {
            self.db
                .query_as::<ReleaseRow>(&format!(
                    r#"SELECT {} FROM appstore_release
                WHERE tenant_id = ? AND listing_id = ? AND id > ?
                ORDER BY id ASC LIMIT ?"#,
                    release_cols
                ))
                .bind(&context.tenant_id)
                .bind(listing_id.as_str())
                .bind(cursor_id)
                .bind(limit)
                .fetch_all(&self.db)
                .await
                .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?
        } else {
            self.db
                .query_as::<ReleaseRow>(&format!(
                    r#"SELECT {} FROM appstore_release
                WHERE tenant_id = ? AND listing_id = ?
                ORDER BY id ASC LIMIT ?"#,
                    release_cols
                ))
                .bind(&context.tenant_id)
                .bind(listing_id.as_str())
                .bind(limit)
                .fetch_all(&self.db)
                .await
                .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?
        };

        let values: Vec<serde_json::Value> = rows
            .into_iter()
            .map(|r| {
                serde_json::json!({
                    "id": r.id,
                    "tenant_id": r.tenant_id,
                    "organization_id": r.organization_id,
                    "listing_id": r.listing_id,
                    "release_no": r.release_no,
                    "channel_id": r.channel_id,
                    "version_name": r.version_name,
                    "version_code": r.version_code,
                    "build_number": r.build_number,
                    "release_status": r.release_status,
                    "minimum_os_version": r.minimum_os_version,
                    "release_notes_default_locale": r.release_notes_default_locale,
                    "manifest_snapshot_json": r.manifest_snapshot_json,
                    "submitted_at": r.submitted_at,
                    "approved_at": r.approved_at,
                    "published_at": r.published_at,
                    "retired_at": r.retired_at,
                    "version": r.version,
                    "created_at": r.created_at,
                    "updated_at": r.updated_at,
                })
            })
            .collect();

        Ok(values)
    }

    async fn insert_submission(
        &self,
        context: &AppstoreRequestContext,
        submission: &ListingSubmission,
    ) -> Result<(), AppstoreServiceError> {
        let (submission_type, submission_status, payload_snapshot_json) =
            map_submission_domain_to_row(submission);

        self.db
            .query(
                r#"INSERT INTO appstore_listing_submission (
                id, tenant_id, organization_id, listing_id, release_id, submission_no,
                submission_type, submission_status, submitted_by, submitted_at,
                payload_snapshot_json, idempotency_key, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
            )
            .bind(&submission.id)
            .bind(&context.tenant_id)
            .bind(&context.organization_id)
            .bind(submission.listing_id.as_str())
            .bind(&submission.release_id)
            .bind(&submission.submission_no)
            .bind(&submission_type)
            .bind(&submission_status)
            .bind(&submission.submitted_by)
            .bind(submission.submitted_at)
            .bind(&payload_snapshot_json)
            .bind(&submission.idempotency_key)
            .bind(submission.created_at)
            .bind(submission.updated_at)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn find_submission_by_id(
        &self,
        context: &AppstoreRequestContext,
        submission_id: &str,
    ) -> Result<Option<ListingSubmission>, AppstoreServiceError> {
        let row = self
            .db
            .query_as::<ListingSubmissionRow>(
                r#"SELECT id, tenant_id, organization_id, listing_id, release_id, submission_no,
                submission_type, submission_status, submitted_by, submitted_at,
                payload_snapshot_json, idempotency_key, created_at, updated_at
            FROM appstore_listing_submission
            WHERE tenant_id = ? AND id = ?"#,
            )
            .bind(&context.tenant_id)
            .bind(submission_id)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        row.map(map_submission_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn update_submission(
        &self,
        context: &AppstoreRequestContext,
        submission: &ListingSubmission,
    ) -> Result<(), AppstoreServiceError> {
        let (submission_type, submission_status, payload_snapshot_json) =
            map_submission_domain_to_row(submission);

        self.db
            .query(
                r#"UPDATE appstore_listing_submission
            SET release_id = ?, submission_type = ?, submission_status = ?, submitted_by = ?,
                submitted_at = ?, payload_snapshot_json = ?, idempotency_key = ?, updated_at = ?
            WHERE tenant_id = ? AND id = ?"#,
            )
            .bind(&submission.release_id)
            .bind(&submission_type)
            .bind(&submission_status)
            .bind(&submission.submitted_by)
            .bind(submission.submitted_at)
            .bind(&payload_snapshot_json)
            .bind(&submission.idempotency_key)
            .bind(submission.updated_at)
            .bind(&context.tenant_id)
            .bind(&submission.id)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn find_submissions_by_listing(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &ListingId,
    ) -> Result<Vec<ListingSubmission>, AppstoreServiceError> {
        let rows = self
            .db
            .query_as::<ListingSubmissionRow>(
                r#"SELECT id, tenant_id, organization_id, listing_id, release_id, submission_no,
                submission_type, submission_status, submitted_by, submitted_at,
                payload_snapshot_json, idempotency_key, created_at, updated_at
            FROM appstore_listing_submission
            WHERE tenant_id = ? AND listing_id = ?
            ORDER BY created_at DESC"#,
            )
            .bind(&context.tenant_id)
            .bind(listing_id.as_str())
            .fetch_all(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        rows.into_iter()
            .map(map_submission_row_to_domain)
            .collect::<Result<Vec<_>, _>>()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn admin_list_listings(
        &self,
        context: &AppstoreRequestContext,
        status_filter: Option<&str>,
        review_status_filter: Option<&str>,
        publisher_id: Option<&str>,
        cursor: Option<&str>,
        limit: i32,
    ) -> Result<Vec<Listing>, AppstoreServiceError> {
        let mut sql = format!(
            r#"SELECT {} FROM appstore_listing WHERE tenant_id = ? AND deleted_at IS NULL"#,
            columns_csv(APPSTORE_LISTING_COLUMNS)
        );

        if status_filter.is_some() {
            sql.push_str(&format!(" AND listing_status = ?"));
        }
        if review_status_filter.is_some() {
            sql.push_str(&format!(" AND review_status = ?"));
        }
        if publisher_id.is_some() {
            sql.push_str(&format!(" AND publisher_id = ?"));
        }
        if cursor.is_some() {
            sql.push_str(&format!(" AND id > ?"));
        }
        sql.push_str(" ORDER BY id ASC LIMIT ?");

        let mut query = self.db.query_as::<ListingRow>(&sql);
        query = query.bind(&context.tenant_id);
        if let Some(s) = status_filter {
            query = query.bind(s);
        }
        if let Some(s) = review_status_filter {
            query = query.bind(s);
        }
        if let Some(s) = publisher_id {
            query = query.bind(s);
        }
        if let Some(c) = cursor {
            query = query.bind(c);
        }
        query = query.bind(limit);

        let rows = query
            .fetch_all(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        rows.into_iter()
            .map(map_listing_row_to_domain)
            .collect::<Result<Vec<_>, _>>()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn find_app_by_key(
        &self,
        context: &AppstoreRequestContext,
        app_key: &str,
    ) -> Result<Option<StoreApp>, AppstoreServiceError> {
        let row = self
            .db
            .query_as::<(
                String,
                String,
                String,
                String,
                String,
                String,
                String,
                String,
                String,
                String,
                String,
                String,
                String,
                Option<String>,
                String,
                String,
            )>(
                r#"SELECT id, tenant_id, organization_id, publisher_id, app_no, app_key, app_slug,
                display_name, default_locale, app_type, app_status, distribution_status,
                review_status, current_listing_id, created_at, updated_at
            FROM appstore_app
            WHERE tenant_id = ? AND app_key = ? AND deleted_at IS NULL
            LIMIT 1"#,
            )
            .bind(&context.tenant_id)
            .bind(app_key)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {e}")))?;

        Ok(row.map(
            |(
                id,
                tenant_id,
                organization_id,
                publisher_id,
                app_no,
                app_key,
                app_slug,
                display_name,
                default_locale,
                app_type,
                app_status,
                distribution_status,
                review_status,
                current_listing_id,
                created_at,
                updated_at,
            )| {
                StoreApp {
                    id,
                    tenant_id,
                    organization_id,
                    publisher_id,
                    app_no,
                    app_key,
                    app_slug,
                    display_name,
                    default_locale,
                    app_type,
                    app_status,
                    distribution_status,
                    review_status,
                    current_listing_id,
                    created_at: created_at.parse().unwrap_or_else(|_| Utc::now()),
                    updated_at: updated_at.parse().unwrap_or_else(|_| Utc::now()),
                }
            },
        ))
    }

    async fn bootstrap_app_and_listing(
        &self,
        context: &AppstoreRequestContext,
        app: &StoreApp,
        listing: &Listing,
    ) -> Result<(), AppstoreServiceError> {
        let (
            listing_type,
            pricing_model,
            listing_status,
            storefront_visibility,
            review_status,
            content_rating_json,
        ) = map_listing_domain_to_row(listing);

        let mut tx = self
            .db
            .begin()
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {e}")))?;

        self.db
            .query(
                r#"INSERT INTO appstore_app (
                id, tenant_id, organization_id, publisher_id, app_no, app_key, app_slug,
                display_name, default_locale, app_type, runtime_family, runtime_framework,
                app_status, distribution_status, review_status, monetization_mode,
                content_rating_json, icon, icon_resource_snapshot, resource_list, config,
                runtime_status, install_skill, install_config, install_platforms, platforms,
                release_notes, artifact_resource_snapshot, rating_avg, manifest_snapshot_json,
                version, current_listing_id, owner_user_id, created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'WEB', 'REACT', ?, ?, ?, 'free',
                '{}', '{}', '', '[]', '{}', 1, '{}', '{}', '[]', '[]', '[]', '', '0', '{}',
                1, ?, ?, ?, ?
            )"#,
            )
            .bind(&app.id)
            .bind(&context.tenant_id)
            .bind(&context.organization_id)
            .bind(&app.publisher_id)
            .bind(&app.app_no)
            .bind(&app.app_key)
            .bind(&app.app_slug)
            .bind(&app.display_name)
            .bind(&app.default_locale)
            .bind(&app.app_type)
            .bind(&app.app_status)
            .bind(&app.distribution_status)
            .bind(&app.review_status)
            .bind(listing.id.as_str())
            .bind(if context.user_id.trim().is_empty() {
                None::<String>
            } else {
                Some(context.user_id.clone())
            })
            .bind(app.created_at)
            .bind(app.updated_at)
            .execute_tx(&mut tx)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {e}")))?;

        self.db.query(
            r#"INSERT INTO appstore_listing (
                id, tenant_id, organization_id, app_id, publisher_id, listing_no,
                app_key, listing_slug, listing_type, pricing_model,
                listing_status, storefront_visibility, review_status, primary_category_id,
                default_locale, age_rating_code, content_rating_json, official_website_url,
                support_url, privacy_policy_url, comments_thread_id, commerce_product_id,
                current_release_id, featured_score, download_count, average_rating,
                rating_count, version, submitted_at, published_at, delisted_at, deleted_at,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
        )
        .bind(listing.id.as_str())
        .bind(&context.tenant_id)
        .bind(&context.organization_id)
        .bind(&listing.app_id)
        .bind(&listing.publisher_id)
        .bind(&listing.listing_no)
        .bind(&listing.app_key)
        .bind(&listing.listing_slug)
        .bind(&listing_type)
        .bind(&pricing_model)
        .bind(&listing_status)
        .bind(&storefront_visibility)
        .bind(&review_status)
        .bind(&listing.primary_category_id)
        .bind(&listing.default_locale)
        .bind(&listing.age_rating_code)
        .bind(&content_rating_json)
        .bind(&listing.official_website_url)
        .bind(&listing.support_url)
        .bind(&listing.privacy_policy_url)
        .bind(&listing.comments_thread_id)
        .bind(&listing.commerce_product_id)
        .bind(&listing.current_release_id)
        .bind(listing.featured_score)
        .bind(listing.download_count)
        .bind(&listing.average_rating)
        .bind(listing.rating_count)
        .bind(listing.version)
        .bind(listing.submitted_at)
        .bind(listing.published_at)
        .bind(listing.delisted_at)
        .bind(listing.deleted_at)
        .bind(listing.created_at)
        .bind(listing.updated_at)
        .execute_tx(&mut tx)
        .await
        .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {e}")))?;

        tx.commit()
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {e}")))?;

        Ok(())
    }

    async fn find_release_history_by_listing(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &ListingId,
        cursor: Option<&str>,
        limit: i32,
    ) -> Result<Vec<serde_json::Value>, AppstoreServiceError> {
        let release_cols = r#"id, tenant_id, organization_id, listing_id, release_no, channel_id,
            version_name, version_code, build_number, release_status, minimum_os_version,
            release_notes_default_locale, manifest_snapshot_json, submitted_at, approved_at,
            published_at, retired_at, version, created_at, updated_at"#;

        let rows = if let Some(cursor_id) = cursor {
            self.db.query_as::< ReleaseRow>(&format!(
                r#"SELECT {release_cols} FROM appstore_release r
                WHERE r.tenant_id = ? AND r.listing_id = ?
                  AND (
                    CAST(r.version_code AS INTEGER) < (
                        SELECT CAST(version_code AS INTEGER) FROM appstore_release WHERE id = ? AND tenant_id = ?
                    )
                    OR (
                        CAST(r.version_code AS INTEGER) = (
                            SELECT CAST(version_code AS INTEGER) FROM appstore_release WHERE id = ? AND tenant_id = ?
                        )
                        AND r.id < ?
                    )
                  )
                ORDER BY CAST(r.version_code AS INTEGER) DESC, r.id DESC
                LIMIT ?"#
            ))
            .bind(&context.tenant_id)
            .bind(listing_id.as_str())
            .bind(cursor_id)
            .bind(&context.tenant_id)
            .bind(cursor_id)
            .bind(&context.tenant_id)
            .bind(cursor_id)
            .bind(limit)
            .fetch_all(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {e}")))?
        } else {
            self.db
                .query_as::<ReleaseRow>(&format!(
                    r#"SELECT {release_cols} FROM appstore_release
                WHERE tenant_id = ? AND listing_id = ?
                ORDER BY CAST(version_code AS INTEGER) DESC, id DESC
                LIMIT ?"#
                ))
                .bind(&context.tenant_id)
                .bind(listing_id.as_str())
                .bind(limit)
                .fetch_all(&self.db)
                .await
                .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {e}")))?
        };

        Ok(rows
            .into_iter()
            .map(|r| {
                serde_json::json!({
                    "id": r.id,
                    "tenant_id": r.tenant_id,
                    "organization_id": r.organization_id,
                    "listing_id": r.listing_id,
                    "release_no": r.release_no,
                    "channel_id": r.channel_id,
                    "version_name": r.version_name,
                    "version_code": r.version_code,
                    "build_number": r.build_number,
                    "release_status": r.release_status,
                    "minimum_os_version": r.minimum_os_version,
                    "release_notes_default_locale": r.release_notes_default_locale,
                    "manifest_snapshot_json": r.manifest_snapshot_json,
                    "submitted_at": r.submitted_at,
                    "approved_at": r.approved_at,
                    "published_at": r.published_at,
                    "retired_at": r.retired_at,
                    "version": r.version,
                    "created_at": r.created_at,
                    "updated_at": r.updated_at,
                })
            })
            .collect())
    }

    async fn find_similar_listings(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &ListingId,
        primary_category_id: &str,
        cursor: Option<&str>,
        limit: i32,
    ) -> Result<Vec<Listing>, AppstoreServiceError> {
        let visible_filter = r#"listing_status = 'active'
            AND storefront_visibility IN ('visible', 'featured')
            AND deleted_at IS NULL"#;

        let rows = if let Some(cursor_id) = cursor {
            self.db
                .query_as::<ListingRow>(&format!(
                    r#"SELECT {} FROM appstore_listing
                WHERE tenant_id = ? AND primary_category_id = ? AND id != ?
                  AND {visible_filter} AND id > ?
                ORDER BY id ASC
                LIMIT ?"#,
                    columns_csv(APPSTORE_LISTING_COLUMNS)
                ))
                .bind(&context.tenant_id)
                .bind(primary_category_id)
                .bind(listing_id.as_str())
                .bind(cursor_id)
                .bind(limit)
                .fetch_all(&self.db)
                .await
                .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {e}")))?
        } else {
            self.db
                .query_as::<ListingRow>(&format!(
                    r#"SELECT {} FROM appstore_listing
                WHERE tenant_id = ? AND primary_category_id = ? AND id != ?
                  AND {visible_filter}
                ORDER BY id ASC
                LIMIT ?"#,
                    columns_csv(APPSTORE_LISTING_COLUMNS)
                ))
                .bind(&context.tenant_id)
                .bind(primary_category_id)
                .bind(listing_id.as_str())
                .bind(limit)
                .fetch_all(&self.db)
                .await
                .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {e}")))?
        };

        rows.into_iter()
            .map(map_listing_row_to_domain)
            .collect::<Result<Vec<_>, _>>()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn find_developer_other_listings(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &ListingId,
        publisher_id: &str,
        cursor: Option<&str>,
        limit: i32,
    ) -> Result<Vec<Listing>, AppstoreServiceError> {
        let visible_filter = r#"listing_status = 'active'
            AND storefront_visibility IN ('visible', 'featured')
            AND deleted_at IS NULL"#;

        let rows = if let Some(cursor_id) = cursor {
            self.db
                .query_as::<ListingRow>(&format!(
                    r#"SELECT {} FROM appstore_listing
                WHERE tenant_id = ? AND publisher_id = ? AND id != ?
                  AND {visible_filter} AND id > ?
                ORDER BY id ASC
                LIMIT ?"#,
                    columns_csv(APPSTORE_LISTING_COLUMNS)
                ))
                .bind(&context.tenant_id)
                .bind(publisher_id)
                .bind(listing_id.as_str())
                .bind(cursor_id)
                .bind(limit)
                .fetch_all(&self.db)
                .await
                .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {e}")))?
        } else {
            self.db
                .query_as::<ListingRow>(&format!(
                    r#"SELECT {} FROM appstore_listing
                WHERE tenant_id = ? AND publisher_id = ? AND id != ?
                  AND {visible_filter}
                ORDER BY id ASC
                LIMIT ?"#,
                    columns_csv(APPSTORE_LISTING_COLUMNS)
                ))
                .bind(&context.tenant_id)
                .bind(publisher_id)
                .bind(listing_id.as_str())
                .bind(limit)
                .fetch_all(&self.db)
                .await
                .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {e}")))?
        };

        rows.into_iter()
            .map(map_listing_row_to_domain)
            .collect::<Result<Vec<_>, _>>()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn find_listing_editorial(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &ListingId,
        default_locale: &str,
    ) -> Result<(Option<String>, Option<String>), AppstoreServiceError> {
        let highlight_row: Option<(String,)> = self
            .db
            .query_as::<(String,)>(
                r#"SELECT ci.highlight_json FROM appstore_catalog_collection_item ci
               INNER JOIN appstore_catalog_collection c
                 ON c.id = ci.collection_id AND c.tenant_id = ci.tenant_id
               WHERE ci.tenant_id = ? AND ci.listing_id = ?
                 AND c.collection_type = 'editorial'
               ORDER BY ci.sort_order ASC
               LIMIT 1"#,
            )
            .bind(&context.tenant_id)
            .bind(listing_id.as_str())
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {e}")))?;

        let editorial_highlight = highlight_row.and_then(|(highlight_json,)| {
            serde_json::from_str::<serde_json::Value>(&highlight_json)
                .ok()
                .and_then(|value| {
                    value
                        .get("editorial_highlight")
                        .or_else(|| value.get("editorialHighlight"))
                        .and_then(|v| v.as_str())
                        .map(str::to_owned)
                })
        });

        let note_row: Option<(Option<String>,)> = self
            .db
            .query_as::<(Option<String>,)>(
                r#"SELECT cl.description FROM appstore_catalog_collection_item ci
               INNER JOIN appstore_catalog_collection c
                 ON c.id = ci.collection_id AND c.tenant_id = ci.tenant_id
               LEFT JOIN appstore_catalog_collection_localization cl
                 ON cl.collection_id = ci.collection_id
                AND cl.tenant_id = ci.tenant_id
                AND cl.locale = ?
               WHERE ci.tenant_id = ? AND ci.listing_id = ?
                 AND c.collection_type = 'editorial'
               ORDER BY ci.sort_order ASC
               LIMIT 1"#,
            )
            .bind(default_locale)
            .bind(&context.tenant_id)
            .bind(listing_id.as_str())
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {e}")))?;

        let collection_editorial_note = note_row.and_then(|(description,)| description);

        Ok((editorial_highlight, collection_editorial_note))
    }

    async fn find_ratings(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &ListingId,
        cursor: Option<&str>,
        limit: i32,
    ) -> Result<Vec<ListingRating>, AppstoreServiceError> {
        let mut sql = String::from(
            r#"
            SELECT id, tenant_id, organization_id, listing_id, user_id, rating, title,
                   created_at, updated_at
            FROM appstore_listing_rating
            WHERE tenant_id = ? AND listing_id = ?
            "#,
        );
        if cursor.is_some() {
            sql.push_str(
                "  AND (created_at, id) < (SELECT created_at, id FROM appstore_listing_rating WHERE id = ? AND tenant_id = ?)
",
            );
        }
        sql.push_str(
            "ORDER BY created_at DESC, id DESC
",
        );
        sql.push_str(
            "LIMIT ?
",
        );

        let adapted = self.db.adapt_sql(&sql);
        let mut q = self
            .db
            .query_as::<ListingRatingRow>(&adapted)
            .bind(&context.tenant_id)
            .bind(listing_id.as_str());
        if let Some(cursor_id) = cursor {
            q = q.bind(cursor_id).bind(&context.tenant_id);
        }
        q = q.bind(limit);

        let rows = q
            .fetch_all(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {e}")))?;
        rows.into_iter()
            .map(map_listing_rating_row_to_domain)
            .collect::<Result<Vec<_>, _>>()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn upsert_rating(
        &self,
        context: &AppstoreRequestContext,
        rating: &ListingRating,
    ) -> Result<(), AppstoreServiceError> {
        self.db
            .query(&self.db.adapt_sql(
                r#"
                INSERT INTO appstore_listing_rating (
                    id, tenant_id, organization_id, listing_id, user_id, rating, title,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (tenant_id, listing_id, user_id) DO UPDATE SET
                    rating = EXCLUDED.rating,
                    title = EXCLUDED.title,
                    updated_at = EXCLUDED.updated_at
                "#,
            ))
            .bind(&rating.id)
            .bind(&context.tenant_id)
            .bind(&context.organization_id)
            .bind(rating.listing_id.as_str())
            .bind(&rating.user_id)
            .bind(rating.rating)
            .bind(rating.title.as_deref().unwrap_or(""))
            .bind(rating.created_at)
            .bind(rating.updated_at)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {e}")))?;
        Ok(())
    }

    async fn recompute_listing_rating_stats(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &ListingId,
    ) -> Result<(), AppstoreServiceError> {
        self.db
            .query(&self.db.adapt_sql(
                r#"
                UPDATE appstore_listing
                SET average_rating = (
                        SELECT ROUND(AVG(rating)::numeric, 1)::text
                        FROM appstore_listing_rating
                        WHERE tenant_id = ? AND listing_id = ?
                    ),
                    rating_count = (
                        SELECT COUNT(*)
                        FROM appstore_listing_rating
                        WHERE tenant_id = ? AND listing_id = ?
                    ),
                    updated_at = ?
                WHERE tenant_id = ? AND id = ?
                "#,
            ))
            .bind(&context.tenant_id)
            .bind(listing_id.as_str())
            .bind(&context.tenant_id)
            .bind(listing_id.as_str())
            .bind(chrono::Utc::now())
            .bind(&context.tenant_id)
            .bind(listing_id.as_str())
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {e}")))?;
        Ok(())
    }

    async fn find_publisher_member_role(
        &self,
        context: &AppstoreRequestContext,
        publisher_id: &str,
        user_id: &str,
    ) -> Result<Option<String>, AppstoreServiceError> {
        let row = self
            .db
            .query_as::<(String,)>(&self.db.adapt_sql(
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
            ))
            .bind(&context.tenant_id)
            .bind(publisher_id)
            .bind(user_id)
            .bind(&context.tenant_id)
            .bind(publisher_id)
            .bind(user_id)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {e}")))?;

        Ok(row.map(|(role,)| role))
    }
}
