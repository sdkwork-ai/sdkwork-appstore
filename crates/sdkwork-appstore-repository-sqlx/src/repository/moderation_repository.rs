use crate::pool::AppstoreSqlxDb;

use crate::db::columns::{
    columns_csv, APPSTORE_MODERATION_APPEAL_COLUMNS, APPSTORE_MODERATION_DECISION_COLUMNS,
    APPSTORE_MODERATION_REVIEW_COLUMNS,
};
use crate::db::rows::{ModerationAppealRow, ModerationDecisionRow, ModerationReviewRow};
use crate::mapper::row_mapper::{
    map_moderation_decision_domain_to_row, map_moderation_decision_row_to_domain,
    map_moderation_review_domain_to_row, map_moderation_review_row_to_domain,
};

use sdkwork_appstore_moderation_service::context::AppstoreRequestContext;
use sdkwork_appstore_moderation_service::domain::models::{
    AppealStatus, ModerationAppeal, ModerationAppealId, ModerationDecision, ModerationDecisionId,
    ModerationReview, ModerationReviewId,
};
use sdkwork_appstore_moderation_service::error::AppstoreServiceError;

#[derive(Debug, Clone)]
pub struct SqlxModerationRepository {
    db: AppstoreSqlxDb,
}

impl SqlxModerationRepository {
    pub fn new(db: AppstoreSqlxDb) -> Self {
        Self { db }
    }
}

fn map_appeal_row_to_domain(row: ModerationAppealRow) -> Result<ModerationAppeal, String> {
    let appeal_status = AppealStatus::from_str(&row.appeal_status)
        .ok_or_else(|| format!("Invalid appeal status: {}", row.appeal_status))?;

    Ok(ModerationAppeal {
        id: ModerationAppealId::new(row.id),
        tenant_id: row.tenant_id,
        organization_id: row.organization_id,
        decision_id: row.decision_id,
        review_id: row.review_id,
        appeal_no: row.appeal_no,
        appellant_user_id: row.appellant_user_id,
        appeal_reason: row.appeal_reason,
        appeal_status,
        decided_by: row.decided_by,
        decision_note: row.decision_note,
        submitted_at: row.submitted_at,
        decided_at: row.decided_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

#[async_trait::async_trait]
impl sdkwork_appstore_moderation_service::ports::repository::ModerationRepositoryPort
    for SqlxModerationRepository
{
    async fn find_review_by_id(
        &self,
        context: &AppstoreRequestContext,
        review_id: &ModerationReviewId,
    ) -> Result<
        Option<ModerationReview>,
        sdkwork_appstore_moderation_service::error::AppstoreServiceError,
    > {
        let row = self
            .db
            .query_as::<ModerationReviewRow>(&format!(
                r#"
            SELECT {}
            FROM appstore_moderation_review
            WHERE id = ? AND tenant_id = ?
            "#,
                columns_csv(APPSTORE_MODERATION_REVIEW_COLUMNS)
            ))
            .bind(review_id.as_str())
            .bind(&context.tenant_id)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        row.map(map_moderation_review_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn find_review_by_submission(
        &self,
        context: &AppstoreRequestContext,
        submission_id: &str,
    ) -> Result<
        Option<ModerationReview>,
        sdkwork_appstore_moderation_service::error::AppstoreServiceError,
    > {
        let row = self
            .db
            .query_as::<ModerationReviewRow>(&format!(
                r#"
            SELECT {}
            FROM appstore_moderation_review
            WHERE submission_id = ? AND tenant_id = ?
            "#,
                columns_csv(APPSTORE_MODERATION_REVIEW_COLUMNS)
            ))
            .bind(submission_id)
            .bind(&context.tenant_id)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        row.map(map_moderation_review_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn list_reviews(
        &self,
        context: &AppstoreRequestContext,
        review_status: Option<&str>,
        cursor: Option<&str>,
        limit: i32,
    ) -> Result<
        Vec<ModerationReview>,
        sdkwork_appstore_moderation_service::error::AppstoreServiceError,
    > {
        let rows = if let Some(cursor_id) = cursor {
            if let Some(status) = review_status {
                self.db
                    .query_as::<ModerationReviewRow>(&format!(
                        r#"
                    SELECT {}
                    FROM appstore_moderation_review
                    WHERE tenant_id = ? AND review_status = ? AND id > ?
                    ORDER BY id ASC
                    LIMIT ?
                    "#,
                        columns_csv(APPSTORE_MODERATION_REVIEW_COLUMNS)
                    ))
                    .bind(&context.tenant_id)
                    .bind(status)
                    .bind(cursor_id)
                    .bind(limit)
                    .fetch_all(&self.db)
                    .await
            } else {
                self.db
                    .query_as::<ModerationReviewRow>(&format!(
                        r#"
                    SELECT {}
                    FROM appstore_moderation_review
                    WHERE tenant_id = ? AND id > ?
                    ORDER BY id ASC
                    LIMIT ?
                    "#,
                        columns_csv(APPSTORE_MODERATION_REVIEW_COLUMNS)
                    ))
                    .bind(&context.tenant_id)
                    .bind(cursor_id)
                    .bind(limit)
                    .fetch_all(&self.db)
                    .await
            }
        } else if let Some(status) = review_status {
            self.db
                .query_as::<ModerationReviewRow>(&format!(
                    r#"
                SELECT {}
                FROM appstore_moderation_review
                WHERE tenant_id = ? AND review_status = ?
                ORDER BY id ASC
                LIMIT ?
                "#,
                    columns_csv(APPSTORE_MODERATION_REVIEW_COLUMNS)
                ))
                .bind(&context.tenant_id)
                .bind(status)
                .bind(limit)
                .fetch_all(&self.db)
                .await
        } else {
            self.db
                .query_as::<ModerationReviewRow>(&format!(
                    r#"
                SELECT {}
                FROM appstore_moderation_review
                WHERE tenant_id = ?
                ORDER BY id ASC
                LIMIT ?
                "#,
                    columns_csv(APPSTORE_MODERATION_REVIEW_COLUMNS)
                ))
                .bind(&context.tenant_id)
                .bind(limit)
                .fetch_all(&self.db)
                .await
        }
        .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        rows.into_iter()
            .map(map_moderation_review_row_to_domain)
            .collect::<Result<Vec<_>, _>>()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn insert_review(
        &self,
        context: &AppstoreRequestContext,
        review: &ModerationReview,
    ) -> Result<(), sdkwork_appstore_moderation_service::error::AppstoreServiceError> {
        let (review_status, priority, queue_code) = map_moderation_review_domain_to_row(review);

        self.db
            .query(
                r#"
            INSERT INTO appstore_moderation_review (
                id, tenant_id, organization_id, submission_id, review_no, review_status,
                priority, assigned_to, queue_code, sla_due_at, started_at, completed_at,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
            )
            .bind(review.id.as_str())
            .bind(&context.tenant_id)
            .bind(&context.organization_id)
            .bind(&review.submission_id)
            .bind(&review.review_no)
            .bind(&review_status)
            .bind(&priority)
            .bind(&review.assigned_to)
            .bind(&queue_code)
            .bind(review.sla_due_at)
            .bind(review.started_at)
            .bind(review.completed_at)
            .bind(review.created_at)
            .bind(review.updated_at)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn update_review(
        &self,
        context: &AppstoreRequestContext,
        review: &ModerationReview,
    ) -> Result<(), sdkwork_appstore_moderation_service::error::AppstoreServiceError> {
        let (review_status, priority, queue_code) = map_moderation_review_domain_to_row(review);

        self.db
            .query(
                r#"
            UPDATE appstore_moderation_review
            SET review_status = ?, priority = ?, assigned_to = ?, queue_code = ?,
                sla_due_at = ?, started_at = ?, completed_at = ?, updated_at = ?
            WHERE id = ? AND tenant_id = ?
            "#,
            )
            .bind(&review_status)
            .bind(&priority)
            .bind(&review.assigned_to)
            .bind(&queue_code)
            .bind(review.sla_due_at)
            .bind(review.started_at)
            .bind(review.completed_at)
            .bind(review.updated_at)
            .bind(review.id.as_str())
            .bind(&context.tenant_id)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn find_decision_by_id(
        &self,
        context: &AppstoreRequestContext,
        decision_id: &ModerationDecisionId,
    ) -> Result<
        Option<ModerationDecision>,
        sdkwork_appstore_moderation_service::error::AppstoreServiceError,
    > {
        let row = self
            .db
            .query_as::<ModerationDecisionRow>(&format!(
                r#"
            SELECT {}
            FROM appstore_moderation_decision
            WHERE id = ? AND tenant_id = ?
            "#,
                columns_csv(APPSTORE_MODERATION_DECISION_COLUMNS)
            ))
            .bind(decision_id.as_str())
            .bind(&context.tenant_id)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        row.map(map_moderation_decision_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn find_decisions_by_review(
        &self,
        context: &AppstoreRequestContext,
        review_id: &ModerationReviewId,
    ) -> Result<
        Vec<ModerationDecision>,
        sdkwork_appstore_moderation_service::error::AppstoreServiceError,
    > {
        let rows = self
            .db
            .query_as::<ModerationDecisionRow>(&format!(
                r#"
            SELECT {}
            FROM appstore_moderation_decision
            WHERE review_id = ? AND tenant_id = ?
            ORDER BY created_at ASC
            "#,
                columns_csv(APPSTORE_MODERATION_DECISION_COLUMNS)
            ))
            .bind(review_id.as_str())
            .bind(&context.tenant_id)
            .fetch_all(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        rows.into_iter()
            .map(map_moderation_decision_row_to_domain)
            .collect::<Result<Vec<_>, _>>()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn insert_decision(
        &self,
        context: &AppstoreRequestContext,
        decision: &ModerationDecision,
    ) -> Result<(), sdkwork_appstore_moderation_service::error::AppstoreServiceError> {
        let (decision_type, decision_status, reason_code, payload_snapshot_json) =
            map_moderation_decision_domain_to_row(decision);

        self.db
            .query(
                r#"
            INSERT INTO appstore_moderation_decision (
                id, tenant_id, organization_id, review_id, decision_no, decision_type,
                decision_status, reason_code, reason_detail, policy_reference, decided_by,
                decided_at, payload_snapshot_json, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
            )
            .bind(decision.id.as_str())
            .bind(&context.tenant_id)
            .bind(&context.organization_id)
            .bind(decision.review_id.as_str())
            .bind(&decision.decision_no)
            .bind(&decision_type)
            .bind(&decision_status)
            .bind(&reason_code)
            .bind(&decision.reason_detail)
            .bind(&decision.policy_reference)
            .bind(&decision.decided_by)
            .bind(decision.decided_at)
            .bind(&payload_snapshot_json)
            .bind(decision.created_at)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn find_appeal_by_id(
        &self,
        context: &AppstoreRequestContext,
        appeal_id: &ModerationAppealId,
    ) -> Result<
        Option<ModerationAppeal>,
        sdkwork_appstore_moderation_service::error::AppstoreServiceError,
    > {
        let row = self
            .db
            .query_as::<ModerationAppealRow>(&format!(
                r#"
            SELECT {}
            FROM appstore_moderation_appeal
            WHERE id = ? AND tenant_id = ?
            "#,
                columns_csv(APPSTORE_MODERATION_APPEAL_COLUMNS)
            ))
            .bind(appeal_id.as_str())
            .bind(&context.tenant_id)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {e}")))?;

        row.map(map_appeal_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn list_appeals(
        &self,
        context: &AppstoreRequestContext,
        status: Option<&str>,
        cursor: Option<&str>,
        limit: i32,
    ) -> Result<
        Vec<ModerationAppeal>,
        sdkwork_appstore_moderation_service::error::AppstoreServiceError,
    > {
        let rows = if let Some(cursor_id) = cursor {
            if let Some(status) = status {
                self.db
                    .query_as::<ModerationAppealRow>(&format!(
                        r#"
                    SELECT {}
                    FROM appstore_moderation_appeal
                    WHERE tenant_id = ? AND appeal_status = ? AND id > ?
                    ORDER BY id ASC
                    LIMIT ?
                    "#,
                        columns_csv(APPSTORE_MODERATION_APPEAL_COLUMNS)
                    ))
                    .bind(&context.tenant_id)
                    .bind(status)
                    .bind(cursor_id)
                    .bind(limit)
                    .fetch_all(&self.db)
                    .await
            } else {
                self.db
                    .query_as::<ModerationAppealRow>(&format!(
                        r#"
                    SELECT {}
                    FROM appstore_moderation_appeal
                    WHERE tenant_id = ? AND id > ?
                    ORDER BY id ASC
                    LIMIT ?
                    "#,
                        columns_csv(APPSTORE_MODERATION_APPEAL_COLUMNS)
                    ))
                    .bind(&context.tenant_id)
                    .bind(cursor_id)
                    .bind(limit)
                    .fetch_all(&self.db)
                    .await
            }
        } else if let Some(status) = status {
            self.db
                .query_as::<ModerationAppealRow>(&format!(
                    r#"
                SELECT {}
                FROM appstore_moderation_appeal
                WHERE tenant_id = ? AND appeal_status = ?
                ORDER BY submitted_at DESC, id ASC
                LIMIT ?
                "#,
                    columns_csv(APPSTORE_MODERATION_APPEAL_COLUMNS)
                ))
                .bind(&context.tenant_id)
                .bind(status)
                .bind(limit)
                .fetch_all(&self.db)
                .await
        } else {
            self.db
                .query_as::<ModerationAppealRow>(&format!(
                    r#"
                SELECT {}
                FROM appstore_moderation_appeal
                WHERE tenant_id = ?
                ORDER BY submitted_at DESC, id ASC
                LIMIT ?
                "#,
                    columns_csv(APPSTORE_MODERATION_APPEAL_COLUMNS)
                ))
                .bind(&context.tenant_id)
                .bind(limit)
                .fetch_all(&self.db)
                .await
        }
        .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {e}")))?;

        rows.into_iter()
            .map(map_appeal_row_to_domain)
            .collect::<Result<Vec<_>, _>>()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn insert_appeal(
        &self,
        context: &AppstoreRequestContext,
        appeal: &ModerationAppeal,
    ) -> Result<(), sdkwork_appstore_moderation_service::error::AppstoreServiceError> {
        self.db
            .query(
                r#"
            INSERT INTO appstore_moderation_appeal (
                id, tenant_id, organization_id, decision_id, review_id, appeal_no,
                appellant_user_id, appeal_reason, appeal_status, decided_by, decision_note,
                submitted_at, decided_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
            )
            .bind(appeal.id.as_str())
            .bind(&context.tenant_id)
            .bind(&context.organization_id)
            .bind(&appeal.decision_id)
            .bind(&appeal.review_id)
            .bind(&appeal.appeal_no)
            .bind(&appeal.appellant_user_id)
            .bind(&appeal.appeal_reason)
            .bind(appeal.appeal_status.as_str())
            .bind(&appeal.decided_by)
            .bind(&appeal.decision_note)
            .bind(appeal.submitted_at)
            .bind(appeal.decided_at)
            .bind(appeal.created_at)
            .bind(appeal.updated_at)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {e}")))?;

        Ok(())
    }

    async fn update_appeal(
        &self,
        context: &AppstoreRequestContext,
        appeal: &ModerationAppeal,
    ) -> Result<(), sdkwork_appstore_moderation_service::error::AppstoreServiceError> {
        self.db
            .query(
                r#"
            UPDATE appstore_moderation_appeal
            SET appeal_status = ?, decided_by = ?, decision_note = ?,
                decided_at = ?, updated_at = ?
            WHERE id = ? AND tenant_id = ?
            "#,
            )
            .bind(appeal.appeal_status.as_str())
            .bind(&appeal.decided_by)
            .bind(&appeal.decision_note)
            .bind(appeal.decided_at)
            .bind(appeal.updated_at)
            .bind(appeal.id.as_str())
            .bind(&context.tenant_id)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {e}")))?;

        Ok(())
    }

    async fn find_submission_listing_id(
        &self,
        context: &AppstoreRequestContext,
        submission_id: &str,
    ) -> Result<Option<String>, AppstoreServiceError> {
        let row: Option<(String,)> = self
            .db
            .query_as::<(String,)>(
                r#"SELECT listing_id FROM appstore_listing_submission WHERE tenant_id = ? AND id = ?"#,
            )
            .bind(&context.tenant_id)
            .bind(submission_id)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(row.map(|(listing_id,)| listing_id))
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
