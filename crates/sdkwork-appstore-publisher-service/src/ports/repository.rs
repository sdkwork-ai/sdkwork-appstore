use crate::context::AppstoreRequestContext;
use crate::domain::models::{
    Publisher, PublisherId, PublisherMember, PublisherVerification, VerificationType,
};
use crate::error::AppstoreServiceResult;

#[async_trait::async_trait]
pub trait PublisherRepositoryPort: Send + Sync {
    async fn find_publisher_by_id(
        &self,
        context: &AppstoreRequestContext,
        publisher_id: &PublisherId,
    ) -> AppstoreServiceResult<Option<Publisher>>;

    async fn find_publisher_by_owner(
        &self,
        context: &AppstoreRequestContext,
        owner_user_id: &str,
    ) -> AppstoreServiceResult<Option<Publisher>>;

    async fn find_publisher_by_organization(
        &self,
        context: &AppstoreRequestContext,
        organization_id: &str,
    ) -> AppstoreServiceResult<Option<Publisher>>;

    /// Lists every non-deleted publisher of the tenant ordered by id, cursor paginated.
    async fn list_publishers(
        &self,
        context: &AppstoreRequestContext,
        cursor: Option<&str>,
        limit: i32,
    ) -> AppstoreServiceResult<Vec<Publisher>>;

    async fn insert_publisher(
        &self,
        context: &AppstoreRequestContext,
        publisher: &Publisher,
    ) -> AppstoreServiceResult<()>;

    async fn update_publisher(
        &self,
        context: &AppstoreRequestContext,
        publisher: &Publisher,
    ) -> AppstoreServiceResult<()>;

    async fn find_members_by_publisher(
        &self,
        context: &AppstoreRequestContext,
        publisher_id: &PublisherId,
        cursor: Option<&str>,
        limit: i32,
    ) -> AppstoreServiceResult<Vec<PublisherMember>>;

    async fn find_member_by_user(
        &self,
        context: &AppstoreRequestContext,
        publisher_id: &PublisherId,
        user_id: &str,
    ) -> AppstoreServiceResult<Option<PublisherMember>>;

    async fn insert_member(
        &self,
        context: &AppstoreRequestContext,
        member: &PublisherMember,
    ) -> AppstoreServiceResult<()>;

    async fn update_member(
        &self,
        context: &AppstoreRequestContext,
        member: &PublisherMember,
    ) -> AppstoreServiceResult<()>;

    async fn find_verification(
        &self,
        context: &AppstoreRequestContext,
        publisher_id: &PublisherId,
        verification_type: &VerificationType,
    ) -> AppstoreServiceResult<Option<PublisherVerification>>;

    async fn insert_verification(
        &self,
        context: &AppstoreRequestContext,
        verification: &PublisherVerification,
    ) -> AppstoreServiceResult<()>;

    async fn update_verification(
        &self,
        context: &AppstoreRequestContext,
        verification: &PublisherVerification,
    ) -> AppstoreServiceResult<()>;
}
