use crate::pool::AppstoreSqlxDb;

use crate::db::columns::{
    columns_csv, APPSTORE_COMPLIANCE_PERMISSION_DISCLOSURE_COLUMNS,
    APPSTORE_COMPLIANCE_PROFILE_COLUMNS,
};
use crate::db::rows::{CompliancePermissionDisclosureRow, ComplianceProfileRow};
use crate::mapper::row_mapper::{
    map_compliance_profile_domain_to_row, map_compliance_profile_row_to_domain,
    map_permission_disclosure_domain_to_row, map_permission_disclosure_row_to_domain,
};

use sdkwork_appstore_compliance_service::context::AppstoreRequestContext;
use sdkwork_appstore_compliance_service::domain::models::{
    CompliancePermissionDisclosure, ComplianceProfile, ComplianceProfileId,
};
use sdkwork_appstore_compliance_service::error::AppstoreServiceError;

#[derive(Debug, Clone)]
pub struct SqlxComplianceRepository {
    db: AppstoreSqlxDb,
}

impl SqlxComplianceRepository {
    pub fn new(db: AppstoreSqlxDb) -> Self {
        Self { db }
    }
}

#[async_trait::async_trait]
impl sdkwork_appstore_compliance_service::ports::repository::ComplianceRepositoryPort
    for SqlxComplianceRepository
{
    async fn find_compliance_profile_by_listing(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
    ) -> Result<
        Option<ComplianceProfile>,
        sdkwork_appstore_compliance_service::error::AppstoreServiceError,
    > {
        let row = self
            .db
            .query_as::<ComplianceProfileRow>(&format!(
                r#"
            SELECT {}
            FROM appstore_compliance_profile
            WHERE listing_id = ? AND tenant_id = ?
            ORDER BY compliance_version DESC
            LIMIT 1
            "#,
                columns_csv(APPSTORE_COMPLIANCE_PROFILE_COLUMNS)
            ))
            .bind(listing_id)
            .bind(&context.tenant_id)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        row.map(map_compliance_profile_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn find_compliance_profile_by_id(
        &self,
        context: &AppstoreRequestContext,
        profile_id: &ComplianceProfileId,
    ) -> Result<
        Option<ComplianceProfile>,
        sdkwork_appstore_compliance_service::error::AppstoreServiceError,
    > {
        let row = self
            .db
            .query_as::<ComplianceProfileRow>(&format!(
                r#"
            SELECT {}
            FROM appstore_compliance_profile
            WHERE id = ? AND tenant_id = ?
            "#,
                columns_csv(APPSTORE_COMPLIANCE_PROFILE_COLUMNS)
            ))
            .bind(profile_id.as_str())
            .bind(&context.tenant_id)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        row.map(map_compliance_profile_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn insert_compliance_profile(
        &self,
        context: &AppstoreRequestContext,
        profile: &ComplianceProfile,
    ) -> Result<(), sdkwork_appstore_compliance_service::error::AppstoreServiceError> {
        let (
            privacy_nutrition_json,
            content_rating_questionnaire_json,
            data_safety_json,
            target_audience_json,
            compliance_status,
        ) = map_compliance_profile_domain_to_row(profile);

        self.db
            .query(
                r#"
            INSERT INTO appstore_compliance_profile (
                id, tenant_id, organization_id, listing_id, compliance_version,
                privacy_nutrition_json, content_rating_questionnaire_json, data_safety_json,
                target_audience_json, compliance_status, reviewed_by, reviewed_at,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
            )
            .bind(profile.id.as_str())
            .bind(&context.tenant_id)
            .bind(&context.organization_id)
            .bind(&profile.listing_id)
            .bind(profile.compliance_version)
            .bind(&privacy_nutrition_json)
            .bind(&content_rating_questionnaire_json)
            .bind(&data_safety_json)
            .bind(&target_audience_json)
            .bind(&compliance_status)
            .bind(&profile.reviewed_by)
            .bind(profile.reviewed_at)
            .bind(profile.created_at)
            .bind(profile.updated_at)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn update_compliance_profile(
        &self,
        context: &AppstoreRequestContext,
        profile: &ComplianceProfile,
    ) -> Result<(), sdkwork_appstore_compliance_service::error::AppstoreServiceError> {
        let (
            privacy_nutrition_json,
            content_rating_questionnaire_json,
            data_safety_json,
            target_audience_json,
            compliance_status,
        ) = map_compliance_profile_domain_to_row(profile);

        self.db
            .query(
                r#"
            UPDATE appstore_compliance_profile
            SET privacy_nutrition_json = ?, content_rating_questionnaire_json = ?,
                data_safety_json = ?, target_audience_json = ?, compliance_status = ?,
                reviewed_by = ?, reviewed_at = ?, updated_at = ?
            WHERE id = ? AND tenant_id = ?
            "#,
            )
            .bind(&privacy_nutrition_json)
            .bind(&content_rating_questionnaire_json)
            .bind(&data_safety_json)
            .bind(&target_audience_json)
            .bind(&compliance_status)
            .bind(&profile.reviewed_by)
            .bind(profile.reviewed_at)
            .bind(profile.updated_at)
            .bind(profile.id.as_str())
            .bind(&context.tenant_id)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn find_permission_disclosures_by_listing(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
    ) -> Result<
        Vec<CompliancePermissionDisclosure>,
        sdkwork_appstore_compliance_service::error::AppstoreServiceError,
    > {
        let rows = self
            .db
            .query_as::<CompliancePermissionDisclosureRow>(&format!(
                r#"
            SELECT {}
            FROM appstore_compliance_permission_disclosure
            WHERE listing_id = ? AND tenant_id = ?
            ORDER BY permission_code ASC
            "#,
                columns_csv(APPSTORE_COMPLIANCE_PERMISSION_DISCLOSURE_COLUMNS)
            ))
            .bind(listing_id)
            .bind(&context.tenant_id)
            .fetch_all(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        rows.into_iter()
            .map(map_permission_disclosure_row_to_domain)
            .collect::<Result<Vec<_>, _>>()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn find_permission_disclosure(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
        permission_code: &str,
    ) -> Result<
        Option<CompliancePermissionDisclosure>,
        sdkwork_appstore_compliance_service::error::AppstoreServiceError,
    > {
        let row = self
            .db
            .query_as::<CompliancePermissionDisclosureRow>(&format!(
                r#"
            SELECT {}
            FROM appstore_compliance_permission_disclosure
            WHERE listing_id = ? AND permission_code = ? AND tenant_id = ?
            "#,
                columns_csv(APPSTORE_COMPLIANCE_PERMISSION_DISCLOSURE_COLUMNS)
            ))
            .bind(listing_id)
            .bind(permission_code)
            .bind(&context.tenant_id)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        row.map(map_permission_disclosure_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn insert_permission_disclosure(
        &self,
        context: &AppstoreRequestContext,
        disclosure: &CompliancePermissionDisclosure,
    ) -> Result<(), sdkwork_appstore_compliance_service::error::AppstoreServiceError> {
        let (is_required, disclosure_status) = map_permission_disclosure_domain_to_row(disclosure);

        self.db
            .query(
                r#"
            INSERT INTO appstore_compliance_permission_disclosure (
                id, tenant_id, organization_id, listing_id, permission_code, usage_purpose,
                is_required, disclosure_status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
            )
            .bind(&disclosure.id)
            .bind(&context.tenant_id)
            .bind(&context.organization_id)
            .bind(&disclosure.listing_id)
            .bind(&disclosure.permission_code)
            .bind(&disclosure.usage_purpose)
            .bind(is_required)
            .bind(&disclosure_status)
            .bind(disclosure.created_at)
            .bind(disclosure.updated_at)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn update_permission_disclosure(
        &self,
        context: &AppstoreRequestContext,
        disclosure: &CompliancePermissionDisclosure,
    ) -> Result<(), sdkwork_appstore_compliance_service::error::AppstoreServiceError> {
        let (is_required, disclosure_status) = map_permission_disclosure_domain_to_row(disclosure);

        self.db
            .query(
                r#"
            UPDATE appstore_compliance_permission_disclosure
            SET usage_purpose = ?, is_required = ?, disclosure_status = ?, updated_at = ?
            WHERE id = ? AND tenant_id = ?
            "#,
            )
            .bind(&disclosure.usage_purpose)
            .bind(is_required)
            .bind(&disclosure_status)
            .bind(disclosure.updated_at)
            .bind(&disclosure.id)
            .bind(&context.tenant_id)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn find_iap_items_by_listing(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
        cursor: Option<&str>,
        limit: i32,
    ) -> Result<
        Vec<sdkwork_appstore_compliance_service::domain::models::ListingIapItem>,
        sdkwork_appstore_compliance_service::error::AppstoreServiceError,
    > {
        use crate::db::columns::APPSTORE_LISTING_IAP_ITEM_COLUMNS;
        use crate::db::rows::ListingIapItemRow;

        let rows = if let Some(cursor_id) = cursor {
            self.db
                .query_as::<ListingIapItemRow>(&format!(
                    r#"
                SELECT {}
                FROM appstore_listing_iap_item
                WHERE listing_id = ? AND tenant_id = ? AND id > ?
                ORDER BY id ASC
                LIMIT ?
                "#,
                    columns_csv(APPSTORE_LISTING_IAP_ITEM_COLUMNS)
                ))
                .bind(listing_id)
                .bind(&context.tenant_id)
                .bind(cursor_id)
                .bind(limit)
                .fetch_all(&self.db)
                .await
        } else {
            self.db
                .query_as::<ListingIapItemRow>(&format!(
                    r#"
                SELECT {}
                FROM appstore_listing_iap_item
                WHERE listing_id = ? AND tenant_id = ?
                ORDER BY id ASC
                LIMIT ?
                "#,
                    columns_csv(APPSTORE_LISTING_IAP_ITEM_COLUMNS)
                ))
                .bind(listing_id)
                .bind(&context.tenant_id)
                .bind(limit)
                .fetch_all(&self.db)
                .await
        }
        .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {e}")))?;

        Ok(rows
            .into_iter()
            .map(
                |row| sdkwork_appstore_compliance_service::domain::models::ListingIapItem {
                    id: row.id,
                    tenant_id: row.tenant_id,
                    organization_id: row.organization_id,
                    listing_id: row.listing_id,
                    iap_no: row.iap_no,
                    iap_type: row.iap_type,
                    sku: row.sku,
                    display_name: row.display_name,
                    price_cents: row.price_cents,
                    currency_code: row.currency_code,
                    subscription_period: row.subscription_period,
                    status: row.status,
                    created_at: row.created_at,
                    updated_at: row.updated_at,
                },
            )
            .collect())
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
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {e}")))?;

        Ok(row.map(|(publisher_id,)| publisher_id))
    }

    async fn find_listing_visibility(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
    ) -> Result<Option<bool>, AppstoreServiceError> {
        let row: Option<(String, String)> = self
            .db
            .query_as::<(String, String)>(
                r#"SELECT listing_status, storefront_visibility FROM appstore_listing WHERE tenant_id = ? AND id = ? AND deleted_at IS NULL"#,
            )
            .bind(&context.tenant_id)
            .bind(listing_id)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {e}")))?;

        Ok(row.map(|(status, visibility)| status == "active" && visibility != "hidden"))
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
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {e}")))?;

        Ok(row.map(|(role,)| role))
    }
}
