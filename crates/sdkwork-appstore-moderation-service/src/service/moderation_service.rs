use chrono::Utc;
use sdkwork_appstore_authorization::{missing_scope_message, scope_granted};
use uuid::Uuid;

use crate::context::AppstoreRequestContext;
use crate::domain::commands::{
    AssignModerationReviewRequest, CreateModerationAppealRequest, CreateModerationDecisionRequest,
    DecideModerationAppealRequest, EnqueueSubmissionReviewRequest, ListModerationAppealsRequest,
    ListModerationQueueRequest, RetrieveModerationAppealRequest, RetrieveModerationReviewRequest,
};
use crate::domain::models::{
    AppealStatus, DecisionStatus, DecisionType, ModerationAppeal, ModerationAppealId,
    ModerationDecision, ModerationDecisionId, ModerationReview, ModerationReviewId, Priority,
    QueueCode, ReasonCode, ReviewStatus,
};
use crate::domain::results::{
    AssignModerationReviewResult, CreateModerationAppealResult, CreateModerationDecisionResult,
    DecideModerationAppealResult, EnqueueSubmissionReviewResult, ListModerationAppealsResult,
    ListModerationQueueResult, RetrieveModerationAppealResult, RetrieveModerationReviewResult,
};
use crate::error::{AppstoreServiceError, AppstoreServiceResult};
use crate::ports::listing_projection::ModerationListingProjectionPort;
use crate::ports::repository::ModerationRepositoryPort;

#[async_trait::async_trait]
pub trait ModerationOperations {
    async fn list_queue(
        &self,
        context: &AppstoreRequestContext,
        request: ListModerationQueueRequest,
    ) -> AppstoreServiceResult<ListModerationQueueResult>;

    async fn retrieve_review(
        &self,
        context: &AppstoreRequestContext,
        request: RetrieveModerationReviewRequest,
    ) -> AppstoreServiceResult<RetrieveModerationReviewResult>;

    async fn assign_review(
        &self,
        context: &AppstoreRequestContext,
        request: AssignModerationReviewRequest,
    ) -> AppstoreServiceResult<AssignModerationReviewResult>;

    async fn create_decision(
        &self,
        context: &AppstoreRequestContext,
        request: CreateModerationDecisionRequest,
    ) -> AppstoreServiceResult<CreateModerationDecisionResult>;

    async fn enqueue_submission_review(
        &self,
        context: &AppstoreRequestContext,
        request: EnqueueSubmissionReviewRequest,
    ) -> AppstoreServiceResult<EnqueueSubmissionReviewResult>;

    async fn create_appeal(
        &self,
        context: &AppstoreRequestContext,
        request: CreateModerationAppealRequest,
    ) -> AppstoreServiceResult<CreateModerationAppealResult>;

    async fn list_appeals(
        &self,
        context: &AppstoreRequestContext,
        request: ListModerationAppealsRequest,
    ) -> AppstoreServiceResult<ListModerationAppealsResult>;

    async fn retrieve_appeal(
        &self,
        context: &AppstoreRequestContext,
        request: RetrieveModerationAppealRequest,
    ) -> AppstoreServiceResult<RetrieveModerationAppealResult>;

    async fn decide_appeal(
        &self,
        context: &AppstoreRequestContext,
        request: DecideModerationAppealRequest,
    ) -> AppstoreServiceResult<DecideModerationAppealResult>;
}

#[derive(Clone)]
pub struct ModerationService<R> {
    repository: R,
    listing_projection_port: Option<std::sync::Arc<dyn ModerationListingProjectionPort>>,
}

impl<R> ModerationService<R> {
    pub fn new(repository: R) -> Self {
        Self {
            repository,
            listing_projection_port: None,
        }
    }

    pub fn with_listing_projection(
        mut self,
        port: std::sync::Arc<dyn ModerationListingProjectionPort>,
    ) -> Self {
        self.listing_projection_port = Some(port);
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
impl<R> ModerationOperations for ModerationService<R>
where
    R: ModerationRepositoryPort,
{
    async fn list_queue(
        &self,
        context: &AppstoreRequestContext,
        request: ListModerationQueueRequest,
    ) -> AppstoreServiceResult<ListModerationQueueResult> {
        require_scope(context, "appstore.moderation.read")?;
        let limit = request.page_size.unwrap_or(20).clamp(1, 200);
        let reviews = self
            .repository
            .list_reviews(
                context,
                request.review_status.as_deref(),
                request.cursor.as_deref(),
                limit + 1,
            )
            .await?;

        let has_more = reviews.len() > limit as usize;
        let reviews: Vec<ModerationReview> = reviews.into_iter().take(limit as usize).collect();
        let next_cursor = if has_more {
            reviews.last().map(|r| r.id.as_str().to_string())
        } else {
            None
        };

        Ok(ListModerationQueueResult::new(
            "appstore.moderation.queue.list",
            reviews,
            next_cursor,
            has_more,
        ))
    }

    async fn retrieve_review(
        &self,
        context: &AppstoreRequestContext,
        request: RetrieveModerationReviewRequest,
    ) -> AppstoreServiceResult<RetrieveModerationReviewResult> {
        require_scope(context, "appstore.moderation.read")?;
        let review_id = ModerationReviewId::new(&request.review_id);

        let review = self
            .repository
            .find_review_by_id(context, &review_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Moderation review not found: {}",
                    request.review_id
                ))
            })?;

        Ok(RetrieveModerationReviewResult::found(
            "appstore.moderation.reviews.retrieve",
            review,
        ))
    }

    async fn assign_review(
        &self,
        context: &AppstoreRequestContext,
        request: AssignModerationReviewRequest,
    ) -> AppstoreServiceResult<AssignModerationReviewResult> {
        require_scope(context, "appstore.moderation.assign")?;
        if request.assigned_to.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "assignedTo is required".to_string(),
            ));
        }

        let review_id = ModerationReviewId::new(&request.review_id);

        let mut review = self
            .repository
            .find_review_by_id(context, &review_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Moderation review not found: {}",
                    request.review_id
                ))
            })?;

        if !review.can_assign() {
            return Err(AppstoreServiceError::InvalidState(format!(
                "Review cannot be assigned in state: {}",
                review.review_status.as_str()
            )));
        }

        let now = Utc::now();
        review.assigned_to = Some(request.assigned_to);
        review.review_status = ReviewStatus::InReview;
        review.started_at = Some(review.started_at.unwrap_or(now));
        review.updated_at = now;

        self.repository.update_review(context, &review).await?;

        Ok(AssignModerationReviewResult::assigned(
            "appstore.moderation.reviews.assign",
            review,
        ))
    }

    async fn create_decision(
        &self,
        context: &AppstoreRequestContext,
        request: CreateModerationDecisionRequest,
    ) -> AppstoreServiceResult<CreateModerationDecisionResult> {
        require_scope(context, "appstore.moderation.decide")?;
        let review_id = ModerationReviewId::new(&request.review_id);

        let mut review = self
            .repository
            .find_review_by_id(context, &review_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Moderation review not found: {}",
                    request.review_id
                ))
            })?;

        if !review.can_decide() {
            return Err(AppstoreServiceError::InvalidState(format!(
                "Review cannot receive decisions in state: {}",
                review.review_status.as_str()
            )));
        }

        let decision_type = DecisionType::from_str(&request.decision_type).ok_or_else(|| {
            AppstoreServiceError::ValidationFailed(format!(
                "Invalid decision type: {}",
                request.decision_type
            ))
        })?;

        let decision_status =
            DecisionStatus::from_str(&request.decision_status).ok_or_else(|| {
                AppstoreServiceError::ValidationFailed(format!(
                    "Invalid decision status: {}",
                    request.decision_status
                ))
            })?;

        let reason_code = request.reason_code.map(|rc| ReasonCode::from_str(&rc));

        let decided_by = context
            .user_id
            .clone()
            .unwrap_or_else(|| "system".to_string());

        let now = Utc::now();
        let decision_id = ModerationDecisionId::new(Uuid::new_v4().to_string());
        let decision_no = format!(
            "MOD-DEC-{}",
            Uuid::new_v4()
                .to_string()
                .split('-')
                .next()
                .unwrap_or_default()
        );

        let decision = ModerationDecision {
            id: decision_id,
            tenant_id: context.tenant_id.clone(),
            organization_id: context.organization_id.clone().unwrap_or_default(),
            review_id: review_id.clone(),
            decision_no,
            decision_type: decision_type.clone(),
            decision_status: decision_status.clone(),
            reason_code,
            reason_detail: request.reason_detail,
            policy_reference: request.policy_reference,
            decided_by,
            decided_at: now,
            payload_snapshot: serde_json::Value::Object(serde_json::Map::new()),
            created_at: now,
        };

        self.repository.insert_decision(context, &decision).await?;

        let decision_type_for_listing = decision_type.clone();
        match decision_type {
            DecisionType::Approve => {
                review.review_status = ReviewStatus::Approved;
            }
            DecisionType::Reject => {
                review.review_status = ReviewStatus::Rejected;
            }
            DecisionType::RequestChanges => {
                review.review_status = ReviewStatus::ChangesRequested;
            }
        }
        review.completed_at = Some(now);
        review.updated_at = now;

        self.repository.update_review(context, &review).await?;

        if let Some(port) = &self.listing_projection_port {
            port.apply_decision_outcome(
                context,
                &review.submission_id,
                decision_type_for_listing,
                &review.organization_id,
            )
            .await?;
        }

        Ok(CreateModerationDecisionResult::created(
            "appstore.moderation.decisions.create",
            decision,
            review,
        ))
    }

    async fn enqueue_submission_review(
        &self,
        context: &AppstoreRequestContext,
        request: EnqueueSubmissionReviewRequest,
    ) -> AppstoreServiceResult<EnqueueSubmissionReviewResult> {
        if let Some(existing) = self
            .repository
            .find_review_by_submission(context, &request.submission_id)
            .await?
        {
            return Ok(EnqueueSubmissionReviewResult::existing(
                "appstore.moderation.submissions.enqueue",
                existing,
            ));
        }

        let now = Utc::now();
        let review_id = ModerationReviewId::new(Uuid::new_v4().to_string());
        let review_no = format!(
            "MOD-REV-{}",
            Uuid::new_v4()
                .to_string()
                .split('-')
                .next()
                .unwrap_or_default()
        );

        let review = ModerationReview {
            id: review_id,
            tenant_id: context.tenant_id.clone(),
            organization_id: request.organization_id,
            submission_id: request.submission_id,
            review_no,
            review_status: ReviewStatus::Pending,
            priority: Priority::Normal,
            assigned_to: None,
            queue_code: QueueCode::ContentReview,
            sla_due_at: None,
            started_at: None,
            completed_at: None,
            created_at: now,
            updated_at: now,
        };

        self.repository.insert_review(context, &review).await?;

        Ok(EnqueueSubmissionReviewResult::created(
            "appstore.moderation.submissions.enqueue",
            review,
        ))
    }

    async fn create_appeal(
        &self,
        context: &AppstoreRequestContext,
        request: CreateModerationAppealRequest,
    ) -> AppstoreServiceResult<CreateModerationAppealResult> {
        require_scope(context, "appstore.moderation.appeal")?;
        if request.decision_id.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "decision_id is required".to_string(),
            ));
        }
        if request.appeal_reason.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "appeal_reason is required".to_string(),
            ));
        }

        let decision_id = ModerationDecisionId::new(&request.decision_id);
        let decision = self
            .repository
            .find_decision_by_id(context, &decision_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Moderation decision not found: {}",
                    request.decision_id
                ))
            })?;

        let appellant_user_id = context
            .user_id
            .clone()
            .filter(|id| !id.trim().is_empty())
            .ok_or_else(|| {
                AppstoreServiceError::PermissionDenied("Authenticated user is required".to_string())
            })?;

        // Only the owning publisher (owner or accepted member) may appeal.
        let review = self
            .repository
            .find_review_by_id(context, &decision.review_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Review not found: {}",
                    decision.review_id.as_str()
                ))
            })?;
        if !review.submission_id.trim().is_empty() {
            let listing_id = self
                .repository
                .find_submission_listing_id(context, &review.submission_id)
                .await?
                .ok_or_else(|| {
                    AppstoreServiceError::NotFound(format!(
                        "Submission not found: {}",
                        review.submission_id
                    ))
                })?;
            let publisher_id = self
                .repository
                .find_listing_publisher_id(context, &listing_id)
                .await?
                .ok_or_else(|| {
                    AppstoreServiceError::NotFound(format!("Listing not found: {}", listing_id))
                })?;
            let role = self
                .repository
                .find_publisher_member_role(context, &publisher_id, &appellant_user_id)
                .await?;
            if role.is_none() {
                return Err(AppstoreServiceError::PermissionDenied(
                    "Only the listing publisher may appeal a moderation decision".to_string(),
                ));
            }
        }

        let now = Utc::now();
        let appeal = ModerationAppeal {
            id: ModerationAppealId::new(Uuid::new_v4().to_string()),
            tenant_id: context.tenant_id.clone(),
            organization_id: context.organization_id.clone().unwrap_or_default(),
            decision_id: decision.id.as_str().to_string(),
            review_id: decision.review_id.as_str().to_string(),
            appeal_no: format!(
                "APL-{}",
                Uuid::new_v4()
                    .to_string()
                    .split('-')
                    .next()
                    .unwrap_or_default()
            ),
            appellant_user_id,
            appeal_reason: request.appeal_reason.trim().to_string(),
            appeal_status: AppealStatus::Pending,
            decided_by: None,
            decision_note: None,
            submitted_at: now,
            decided_at: None,
            created_at: now,
            updated_at: now,
        };

        self.repository.insert_appeal(context, &appeal).await?;

        Ok(CreateModerationAppealResult::created(
            "appstore.moderation.appeals.create",
            appeal,
        ))
    }

    async fn list_appeals(
        &self,
        context: &AppstoreRequestContext,
        request: ListModerationAppealsRequest,
    ) -> AppstoreServiceResult<ListModerationAppealsResult> {
        require_scope(context, "appstore.moderation.read")?;
        let limit = request.page_size.unwrap_or(20).clamp(1, 200);
        let appeals = self
            .repository
            .list_appeals(
                context,
                request.status.as_deref(),
                request.cursor.as_deref(),
                limit + 1,
            )
            .await?;

        let has_more = appeals.len() > limit as usize;
        let appeals: Vec<ModerationAppeal> = appeals.into_iter().take(limit as usize).collect();
        let next_cursor = if has_more {
            appeals.last().map(|a| a.id.as_str().to_string())
        } else {
            None
        };

        Ok(ListModerationAppealsResult::new(
            "appstore.moderation.appeals.list",
            appeals,
            next_cursor,
            has_more,
        ))
    }

    async fn retrieve_appeal(
        &self,
        context: &AppstoreRequestContext,
        request: RetrieveModerationAppealRequest,
    ) -> AppstoreServiceResult<RetrieveModerationAppealResult> {
        require_scope(context, "appstore.moderation.read")?;
        let appeal_id = ModerationAppealId::new(&request.appeal_id);

        let appeal = self
            .repository
            .find_appeal_by_id(context, &appeal_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Moderation appeal not found: {}",
                    request.appeal_id
                ))
            })?;

        Ok(RetrieveModerationAppealResult::found(
            "appstore.moderation.appeals.retrieve",
            appeal,
        ))
    }

    async fn decide_appeal(
        &self,
        context: &AppstoreRequestContext,
        request: DecideModerationAppealRequest,
    ) -> AppstoreServiceResult<DecideModerationAppealResult> {
        require_scope(context, "appstore.moderation.decide")?;
        if request.note.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "note is required".to_string(),
            ));
        }

        let appeal_status = match request.decision.to_ascii_lowercase().as_str() {
            "approved" | "approve" => AppealStatus::Approved,
            "rejected" | "reject" => AppealStatus::Rejected,
            other => {
                return Err(AppstoreServiceError::ValidationFailed(format!(
                    "Invalid appeal decision: {other}"
                )));
            }
        };

        let appeal_id = ModerationAppealId::new(&request.appeal_id);
        let mut appeal = self
            .repository
            .find_appeal_by_id(context, &appeal_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Moderation appeal not found: {}",
                    request.appeal_id
                ))
            })?;

        if !appeal.is_pending() {
            return Err(AppstoreServiceError::InvalidState(
                "Appeal is not pending".to_string(),
            ));
        }

        let now = Utc::now();
        appeal.appeal_status = appeal_status.clone();
        appeal.decided_by = context
            .user_id
            .clone()
            .or_else(|| Some("system".to_string()));
        appeal.decision_note = Some(request.note.trim().to_string());
        appeal.decided_at = Some(now);
        appeal.updated_at = now;

        // An approved appeal reverses the rejected decision: re-apply an
        // approve outcome onto the original submission so listing/release
        // states converge with the appeal verdict.
        if appeal_status == AppealStatus::Approved {
            if let Some(port) = &self.listing_projection_port {
                let review_id = ModerationReviewId::new(&appeal.review_id);
                let review = self
                    .repository
                    .find_review_by_id(context, &review_id)
                    .await?
                    .ok_or_else(|| {
                        AppstoreServiceError::NotFound(format!(
                            "Review not found for appeal: {}",
                            appeal.review_id
                        ))
                    })?;
                if !review.submission_id.trim().is_empty() {
                    port.apply_decision_outcome(
                        context,
                        &review.submission_id,
                        DecisionType::Approve,
                        &appeal.organization_id,
                    )
                    .await
                    .map_err(|error| AppstoreServiceError::Internal(error.to_string()))?;
                }
            }
        }

        self.repository.update_appeal(context, &appeal).await?;

        Ok(DecideModerationAppealResult::decided(
            "appstore.moderation.appeals.decide",
            appeal,
        ))
    }
}
