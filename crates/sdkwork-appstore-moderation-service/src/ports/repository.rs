use crate::context::AppstoreRequestContext;
use crate::domain::models::{
    ModerationAppeal, ModerationAppealId, ModerationDecision, ModerationDecisionId,
    ModerationReview, ModerationReviewId,
};
use crate::error::AppstoreServiceResult;

#[async_trait::async_trait]
pub trait ModerationRepositoryPort: Send + Sync {
    async fn find_review_by_id(
        &self,
        context: &AppstoreRequestContext,
        review_id: &ModerationReviewId,
    ) -> AppstoreServiceResult<Option<ModerationReview>>;

    async fn find_review_by_submission(
        &self,
        context: &AppstoreRequestContext,
        submission_id: &str,
    ) -> AppstoreServiceResult<Option<ModerationReview>>;

    async fn list_reviews(
        &self,
        context: &AppstoreRequestContext,
        review_status: Option<&str>,
        cursor: Option<&str>,
        limit: i32,
    ) -> AppstoreServiceResult<Vec<ModerationReview>>;

    async fn insert_review(
        &self,
        context: &AppstoreRequestContext,
        review: &ModerationReview,
    ) -> AppstoreServiceResult<()>;

    async fn update_review(
        &self,
        context: &AppstoreRequestContext,
        review: &ModerationReview,
    ) -> AppstoreServiceResult<()>;

    async fn find_decision_by_id(
        &self,
        context: &AppstoreRequestContext,
        decision_id: &ModerationDecisionId,
    ) -> AppstoreServiceResult<Option<ModerationDecision>>;

    async fn find_decisions_by_review(
        &self,
        context: &AppstoreRequestContext,
        review_id: &ModerationReviewId,
    ) -> AppstoreServiceResult<Vec<ModerationDecision>>;

    async fn insert_decision(
        &self,
        context: &AppstoreRequestContext,
        decision: &ModerationDecision,
    ) -> AppstoreServiceResult<()>;

    async fn find_appeal_by_id(
        &self,
        context: &AppstoreRequestContext,
        appeal_id: &ModerationAppealId,
    ) -> AppstoreServiceResult<Option<ModerationAppeal>>;

    async fn list_appeals(
        &self,
        context: &AppstoreRequestContext,
        status: Option<&str>,
        cursor: Option<&str>,
        limit: i32,
    ) -> AppstoreServiceResult<Vec<ModerationAppeal>>;

    async fn insert_appeal(
        &self,
        context: &AppstoreRequestContext,
        appeal: &ModerationAppeal,
    ) -> AppstoreServiceResult<()>;

    async fn update_appeal(
        &self,
        context: &AppstoreRequestContext,
        appeal: &ModerationAppeal,
    ) -> AppstoreServiceResult<()>;

    /// Resolves the owning listing of a submission.
    async fn find_submission_listing_id(
        &self,
        context: &AppstoreRequestContext,
        submission_id: &str,
    ) -> AppstoreServiceResult<Option<String>>;

    /// Resolves the owning publisher of a listing.
    async fn find_listing_publisher_id(
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
