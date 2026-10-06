use crate::pool::AppstoreSqlxDb;

use crate::db::columns::{
    columns_csv, APPSTORE_PUBLISHER_COLUMNS, APPSTORE_PUBLISHER_MEMBER_COLUMNS,
    APPSTORE_PUBLISHER_VERIFICATION_COLUMNS,
};
use crate::db::rows::{PublisherMemberRow, PublisherRow, PublisherVerificationRow};
use crate::mapper::row_mapper::{
    map_member_domain_to_row, map_member_row_to_domain, map_publisher_domain_to_row,
    map_publisher_row_to_domain, map_verification_domain_to_row, map_verification_row_to_domain,
};

use sdkwork_appstore_publisher_service::domain::models::{
    Publisher, PublisherId, PublisherMember, PublisherVerification, VerificationType,
};
use sdkwork_appstore_publisher_service::ports::repository::PublisherRepositoryPort;

#[derive(Debug, Clone)]
pub struct SqlxPublisherRepository {
    db: AppstoreSqlxDb,
}

impl SqlxPublisherRepository {
    pub fn new(db: AppstoreSqlxDb) -> Self {
        Self { db }
    }
}

#[async_trait::async_trait]
impl PublisherRepositoryPort for SqlxPublisherRepository {
    async fn find_publisher_by_id(
        &self,
        context: &sdkwork_appstore_publisher_service::context::AppstoreRequestContext,
        publisher_id: &PublisherId,
    ) -> Result<Option<Publisher>, sdkwork_appstore_publisher_service::error::AppstoreServiceError>
    {
        let row =
            self.db
                .query_as::<PublisherRow>(&format!(
                    r#"
            SELECT {}
            FROM appstore_publisher
            WHERE id = ? AND tenant_id = ? AND deleted_at IS NULL
            "#,
                    columns_csv(APPSTORE_PUBLISHER_COLUMNS)
                ))
                .bind(publisher_id.as_str())
                .bind(&context.tenant_id)
                .fetch_optional(&self.db)
                .await
                .map_err(|e| {
                    sdkwork_appstore_publisher_service::error::AppstoreServiceError::Internal(
                        format!("Database error: {}", e),
                    )
                })?;

        row.map(map_publisher_row_to_domain)
            .transpose()
            .map_err(|e| {
                sdkwork_appstore_publisher_service::error::AppstoreServiceError::Internal(e)
            })
    }

    async fn list_publishers(
        &self,
        context: &sdkwork_appstore_publisher_service::context::AppstoreRequestContext,
        cursor: Option<&str>,
        limit: i32,
    ) -> Result<Vec<Publisher>, sdkwork_appstore_publisher_service::error::AppstoreServiceError>
    {
        let rows = if let Some(cursor_id) = cursor {
            self.db
                .query_as::<PublisherRow>(&format!(
                    r#"
            SELECT {}
            FROM appstore_publisher
            WHERE tenant_id = ? AND deleted_at IS NULL AND id > ?
            ORDER BY id ASC
            LIMIT ?
            "#,
                    columns_csv(APPSTORE_PUBLISHER_COLUMNS)
                ))
                .bind(&context.tenant_id)
                .bind(cursor_id)
                .bind(limit)
                .fetch_all(&self.db)
                .await
                .map_err(|e| {
                    sdkwork_appstore_publisher_service::error::AppstoreServiceError::Internal(
                        format!("Database error: {}", e),
                    )
                })?
        } else {
            self.db
                .query_as::<PublisherRow>(&format!(
                    r#"
            SELECT {}
            FROM appstore_publisher
            WHERE tenant_id = ? AND deleted_at IS NULL
            ORDER BY id ASC
            LIMIT ?
            "#,
                    columns_csv(APPSTORE_PUBLISHER_COLUMNS)
                ))
                .bind(&context.tenant_id)
                .bind(limit)
                .fetch_all(&self.db)
                .await
                .map_err(|e| {
                    sdkwork_appstore_publisher_service::error::AppstoreServiceError::Internal(
                        format!("Database error: {}", e),
                    )
                })?
        };

        rows.into_iter()
            .map(map_publisher_row_to_domain)
            .collect::<Result<Vec<_>, _>>()
            .map_err(|e| {
                sdkwork_appstore_publisher_service::error::AppstoreServiceError::Internal(e)
            })
    }

    async fn find_publisher_by_owner(
        &self,
        context: &sdkwork_appstore_publisher_service::context::AppstoreRequestContext,
        owner_user_id: &str,
    ) -> Result<Option<Publisher>, sdkwork_appstore_publisher_service::error::AppstoreServiceError>
    {
        let row =
            self.db
                .query_as::<PublisherRow>(&format!(
                    r#"
            SELECT {}
            FROM appstore_publisher
            WHERE owner_user_id = ? AND tenant_id = ? AND deleted_at IS NULL
            "#,
                    columns_csv(APPSTORE_PUBLISHER_COLUMNS)
                ))
                .bind(owner_user_id)
                .bind(&context.tenant_id)
                .fetch_optional(&self.db)
                .await
                .map_err(|e| {
                    sdkwork_appstore_publisher_service::error::AppstoreServiceError::Internal(
                        format!("Database error: {}", e),
                    )
                })?;

        row.map(map_publisher_row_to_domain)
            .transpose()
            .map_err(|e| {
                sdkwork_appstore_publisher_service::error::AppstoreServiceError::Internal(e)
            })
    }

    async fn find_publisher_by_organization(
        &self,
        context: &sdkwork_appstore_publisher_service::context::AppstoreRequestContext,
        organization_id: &str,
    ) -> Result<Option<Publisher>, sdkwork_appstore_publisher_service::error::AppstoreServiceError>
    {
        let row =
            self.db
                .query_as::<PublisherRow>(&format!(
                    r#"
            SELECT {}
            FROM appstore_publisher
            WHERE organization_id = ? AND tenant_id = ? AND deleted_at IS NULL
            "#,
                    columns_csv(APPSTORE_PUBLISHER_COLUMNS)
                ))
                .bind(organization_id)
                .bind(&context.tenant_id)
                .fetch_optional(&self.db)
                .await
                .map_err(|e| {
                    sdkwork_appstore_publisher_service::error::AppstoreServiceError::Internal(
                        format!("Database error: {}", e),
                    )
                })?;

        row.map(map_publisher_row_to_domain)
            .transpose()
            .map_err(|e| {
                sdkwork_appstore_publisher_service::error::AppstoreServiceError::Internal(e)
            })
    }

    async fn insert_publisher(
        &self,
        context: &sdkwork_appstore_publisher_service::context::AppstoreRequestContext,
        publisher: &Publisher,
    ) -> Result<(), sdkwork_appstore_publisher_service::error::AppstoreServiceError> {
        let (
            publisher_type,
            status,
            verification_status,
            contact_snapshot_json,
            profile_snapshot_json,
        ) = map_publisher_domain_to_row(publisher);

        self.db.query(
            r#"
            INSERT INTO appstore_publisher (
                id, tenant_id, organization_id, publisher_no, publisher_type, display_name,
                legal_name, publisher_status, verification_status, contact_snapshot_json,
                profile_snapshot_json, website_url, support_email, logo_media_resource_id,
                owner_user_id, version, verified_at, suspended_at, deleted_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(publisher.id.as_str())
        .bind(&context.tenant_id)
        .bind(&context.organization_id)
        .bind(&publisher.publisher_no)
        .bind(&publisher_type)
        .bind(&publisher.display_name)
        .bind(&publisher.legal_name)
        .bind(&status)
        .bind(&verification_status)
        .bind(&contact_snapshot_json)
        .bind(&profile_snapshot_json)
        .bind(&publisher.website_url)
        .bind(&publisher.support_email)
        .bind(&publisher.logo_media_resource_id)
        .bind(&publisher.owner_user_id)
        .bind(publisher.version)
        .bind(publisher.verified_at)
        .bind(publisher.suspended_at)
        .bind(publisher.deleted_at)
        .bind(publisher.created_at)
        .bind(publisher.updated_at)
        .execute_unified(&self.db)
        .await
        .map_err(|e| {
            sdkwork_appstore_publisher_service::error::AppstoreServiceError::Internal(format!(
                "Database error: {}",
                e
            ))
        })?;

        Ok(())
    }

    async fn update_publisher(
        &self,
        context: &sdkwork_appstore_publisher_service::context::AppstoreRequestContext,
        publisher: &Publisher,
    ) -> Result<(), sdkwork_appstore_publisher_service::error::AppstoreServiceError> {
        let (
            _publisher_type,
            status,
            verification_status,
            contact_snapshot_json,
            profile_snapshot_json,
        ) = map_publisher_domain_to_row(publisher);

        let result =
            self.db
                .query(
                    r#"
            UPDATE appstore_publisher
            SET display_name = ?, legal_name = ?, publisher_status = ?, verification_status = ?,
                contact_snapshot_json = ?, profile_snapshot_json = ?, website_url = ?,
                support_email = ?, logo_media_resource_id = ?, version = ?, verified_at = ?,
                suspended_at = ?, deleted_at = ?, updated_at = ?
            WHERE id = ? AND tenant_id = ? AND version = ?
            "#,
                )
                .bind(&publisher.display_name)
                .bind(&publisher.legal_name)
                .bind(&status)
                .bind(&verification_status)
                .bind(&contact_snapshot_json)
                .bind(&profile_snapshot_json)
                .bind(&publisher.website_url)
                .bind(&publisher.support_email)
                .bind(&publisher.logo_media_resource_id)
                .bind(publisher.version)
                .bind(publisher.verified_at)
                .bind(publisher.suspended_at)
                .bind(publisher.deleted_at)
                .bind(publisher.updated_at)
                .bind(publisher.id.as_str())
                .bind(&context.tenant_id)
                .bind(publisher.version - 1)
                .execute_unified(&self.db)
                .await
                .map_err(|e| {
                    sdkwork_appstore_publisher_service::error::AppstoreServiceError::Internal(
                        format!("Database error: {}", e),
                    )
                })?;

        if result.rows_affected() == 0 {
            return Err(
                sdkwork_appstore_publisher_service::error::AppstoreServiceError::Conflict(
                    "Publisher was modified by another request".to_string(),
                ),
            );
        }

        Ok(())
    }

    async fn find_members_by_publisher(
        &self,
        context: &sdkwork_appstore_publisher_service::context::AppstoreRequestContext,
        publisher_id: &PublisherId,
        cursor: Option<&str>,
        limit: i32,
    ) -> Result<Vec<PublisherMember>, sdkwork_appstore_publisher_service::error::AppstoreServiceError>
    {
        let rows = if let Some(cursor_user_id) = cursor {
            self.db
                .query_as::<PublisherMemberRow>(&format!(
                    r#"
                SELECT {}
                FROM appstore_publisher_member
                WHERE publisher_id = ? AND tenant_id = ? AND user_id > ?
                ORDER BY user_id ASC
                LIMIT ?
                "#,
                    columns_csv(APPSTORE_PUBLISHER_MEMBER_COLUMNS)
                ))
                .bind(publisher_id.as_str())
                .bind(&context.tenant_id)
                .bind(cursor_user_id)
                .bind(limit)
                .fetch_all(&self.db)
                .await
                .map_err(|e| {
                    sdkwork_appstore_publisher_service::error::AppstoreServiceError::Internal(
                        format!("Database error: {}", e),
                    )
                })?
        } else {
            self.db
                .query_as::<PublisherMemberRow>(&format!(
                    r#"
                SELECT {}
                FROM appstore_publisher_member
                WHERE publisher_id = ? AND tenant_id = ?
                ORDER BY user_id ASC
                LIMIT ?
                "#,
                    columns_csv(APPSTORE_PUBLISHER_MEMBER_COLUMNS)
                ))
                .bind(publisher_id.as_str())
                .bind(&context.tenant_id)
                .bind(limit)
                .fetch_all(&self.db)
                .await
                .map_err(|e| {
                    sdkwork_appstore_publisher_service::error::AppstoreServiceError::Internal(
                        format!("Database error: {}", e),
                    )
                })?
        };

        rows.into_iter()
            .map(map_member_row_to_domain)
            .collect::<Result<Vec<_>, _>>()
            .map_err(|e| {
                sdkwork_appstore_publisher_service::error::AppstoreServiceError::Internal(e)
            })
    }

    async fn find_member_by_user(
        &self,
        context: &sdkwork_appstore_publisher_service::context::AppstoreRequestContext,
        publisher_id: &PublisherId,
        user_id: &str,
    ) -> Result<
        Option<PublisherMember>,
        sdkwork_appstore_publisher_service::error::AppstoreServiceError,
    > {
        let row =
            self.db
                .query_as::<PublisherMemberRow>(&format!(
                    r#"
            SELECT {}
            FROM appstore_publisher_member
            WHERE publisher_id = ? AND tenant_id = ? AND user_id = ?
            "#,
                    columns_csv(APPSTORE_PUBLISHER_MEMBER_COLUMNS)
                ))
                .bind(publisher_id.as_str())
                .bind(&context.tenant_id)
                .bind(user_id)
                .fetch_optional(&self.db)
                .await
                .map_err(|e| {
                    sdkwork_appstore_publisher_service::error::AppstoreServiceError::Internal(
                        format!("Database error: {}", e),
                    )
                })?;

        row.map(map_member_row_to_domain).transpose().map_err(|e| {
            sdkwork_appstore_publisher_service::error::AppstoreServiceError::Internal(e)
        })
    }

    async fn insert_member(
        &self,
        context: &sdkwork_appstore_publisher_service::context::AppstoreRequestContext,
        member: &PublisherMember,
    ) -> Result<(), sdkwork_appstore_publisher_service::error::AppstoreServiceError> {
        let (member_role, member_status) = map_member_domain_to_row(member);

        self.db
            .query(
                r#"
            INSERT INTO appstore_publisher_member (
                id, tenant_id, organization_id, publisher_id, user_id, member_role,
                member_status, invited_by, joined_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
            )
            .bind(&member.id)
            .bind(&context.tenant_id)
            .bind(&context.organization_id)
            .bind(member.publisher_id.as_str())
            .bind(&member.user_id)
            .bind(&member_role)
            .bind(&member_status)
            .bind(&member.invited_by)
            .bind(member.joined_at)
            .bind(member.created_at)
            .bind(member.updated_at)
            .execute_unified(&self.db)
            .await
            .map_err(|e| {
                sdkwork_appstore_publisher_service::error::AppstoreServiceError::Internal(format!(
                    "Database error: {}",
                    e
                ))
            })?;

        Ok(())
    }

    async fn update_member(
        &self,
        context: &sdkwork_appstore_publisher_service::context::AppstoreRequestContext,
        member: &PublisherMember,
    ) -> Result<(), sdkwork_appstore_publisher_service::error::AppstoreServiceError> {
        let (member_role, member_status) = map_member_domain_to_row(member);

        self.db
            .query(
                r#"
            UPDATE appstore_publisher_member
            SET member_role = ?, member_status = ?, joined_at = ?, updated_at = ?
            WHERE id = ? AND tenant_id = ?
            "#,
            )
            .bind(&member_role)
            .bind(&member_status)
            .bind(member.joined_at)
            .bind(member.updated_at)
            .bind(&member.id)
            .bind(&context.tenant_id)
            .execute_unified(&self.db)
            .await
            .map_err(|e| {
                sdkwork_appstore_publisher_service::error::AppstoreServiceError::Internal(format!(
                    "Database error: {}",
                    e
                ))
            })?;

        Ok(())
    }

    async fn find_verification(
        &self,
        context: &sdkwork_appstore_publisher_service::context::AppstoreRequestContext,
        publisher_id: &PublisherId,
        verification_type: &VerificationType,
    ) -> Result<
        Option<PublisherVerification>,
        sdkwork_appstore_publisher_service::error::AppstoreServiceError,
    > {
        let row =
            self.db
                .query_as::<PublisherVerificationRow>(&format!(
                    r#"
            SELECT {}
            FROM appstore_publisher_verification
            WHERE publisher_id = ? AND tenant_id = ? AND verification_type = ?
            "#,
                    columns_csv(APPSTORE_PUBLISHER_VERIFICATION_COLUMNS)
                ))
                .bind(publisher_id.as_str())
                .bind(&context.tenant_id)
                .bind(verification_type.as_str())
                .fetch_optional(&self.db)
                .await
                .map_err(|e| {
                    sdkwork_appstore_publisher_service::error::AppstoreServiceError::Internal(
                        format!("Database error: {}", e),
                    )
                })?;

        row.map(map_verification_row_to_domain)
            .transpose()
            .map_err(|e| {
                sdkwork_appstore_publisher_service::error::AppstoreServiceError::Internal(e)
            })
    }

    async fn insert_verification(
        &self,
        context: &sdkwork_appstore_publisher_service::context::AppstoreRequestContext,
        verification: &PublisherVerification,
    ) -> Result<(), sdkwork_appstore_publisher_service::error::AppstoreServiceError> {
        let (verification_type, verification_status, credential_snapshot_json) =
            map_verification_domain_to_row(verification);

        self.db
            .query(
                r#"
            INSERT INTO appstore_publisher_verification (
                id, tenant_id, organization_id, publisher_id, verification_type,
                verification_status, credential_snapshot_json, evidence_media_resource_id,
                reviewed_by, reviewed_at, expires_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
            )
            .bind(&verification.id)
            .bind(&context.tenant_id)
            .bind(&context.organization_id)
            .bind(verification.publisher_id.as_str())
            .bind(&verification_type)
            .bind(&verification_status)
            .bind(&credential_snapshot_json)
            .bind(&verification.evidence_media_resource_id)
            .bind(&verification.reviewed_by)
            .bind(&verification.reviewed_at)
            .bind(&verification.expires_at)
            .bind(&verification.created_at)
            .bind(&verification.updated_at)
            .execute_unified(&self.db)
            .await
            .map_err(|e| {
                sdkwork_appstore_publisher_service::error::AppstoreServiceError::Internal(format!(
                    "Database error: {}",
                    e
                ))
            })?;

        Ok(())
    }

    async fn update_verification(
        &self,
        context: &sdkwork_appstore_publisher_service::context::AppstoreRequestContext,
        verification: &PublisherVerification,
    ) -> Result<(), sdkwork_appstore_publisher_service::error::AppstoreServiceError> {
        let (_verification_type, verification_status, credential_snapshot_json) =
            map_verification_domain_to_row(verification);

        self.db.query(
            r#"
            UPDATE appstore_publisher_verification
            SET verification_status = ?, credential_snapshot_json = ?, evidence_media_resource_id = ?,
                reviewed_by = ?, reviewed_at = ?, expires_at = ?, updated_at = ?
            WHERE id = ? AND tenant_id = ?
            "#,
        )
        .bind(&verification_status)
        .bind(&credential_snapshot_json)
        .bind(&verification.evidence_media_resource_id)
        .bind(&verification.reviewed_by)
        .bind(verification.reviewed_at)
        .bind(verification.expires_at)
        .bind(&verification.updated_at)
        .bind(&verification.id)
        .bind(&context.tenant_id)
        .execute_unified(&self.db)
        .await
        .map_err(|e| {
            sdkwork_appstore_publisher_service::error::AppstoreServiceError::Internal(format!(
                "Database error: {}",
                e
            ))
        })?;

        Ok(())
    }
}
