use crate::context::AppstoreRequestContext;
use crate::domain::models::{
    CompliancePermissionDisclosure, ComplianceProfile, ComplianceProfileId,
};
use crate::error::AppstoreServiceResult;

#[async_trait::async_trait]
pub trait ComplianceRepositoryPort: Send + Sync {
    async fn find_compliance_profile_by_listing(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
    ) -> AppstoreServiceResult<Option<ComplianceProfile>>;

    async fn find_compliance_profile_by_id(
        &self,
        context: &AppstoreRequestContext,
        profile_id: &ComplianceProfileId,
    ) -> AppstoreServiceResult<Option<ComplianceProfile>>;

    async fn insert_compliance_profile(
        &self,
        context: &AppstoreRequestContext,
        profile: &ComplianceProfile,
    ) -> AppstoreServiceResult<()>;

    async fn update_compliance_profile(
        &self,
        context: &AppstoreRequestContext,
        profile: &ComplianceProfile,
    ) -> AppstoreServiceResult<()>;

    async fn find_permission_disclosures_by_listing(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
    ) -> AppstoreServiceResult<Vec<CompliancePermissionDisclosure>>;

    async fn find_permission_disclosure(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
        permission_code: &str,
    ) -> AppstoreServiceResult<Option<CompliancePermissionDisclosure>>;

    async fn insert_permission_disclosure(
        &self,
        context: &AppstoreRequestContext,
        disclosure: &CompliancePermissionDisclosure,
    ) -> AppstoreServiceResult<()>;

    async fn update_permission_disclosure(
        &self,
        context: &AppstoreRequestContext,
        disclosure: &CompliancePermissionDisclosure,
    ) -> AppstoreServiceResult<()>;

    async fn find_iap_items_by_listing(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
        cursor: Option<&str>,
        limit: i32,
    ) -> AppstoreServiceResult<Vec<crate::domain::models::ListingIapItem>>;

    /// Resolves the owning publisher of a listing.
    async fn find_listing_publisher_id(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
    ) -> AppstoreServiceResult<Option<String>>;

    /// Whether the listing is visible on the public storefront.
    async fn find_listing_visibility(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
    ) -> AppstoreServiceResult<Option<bool>>;

    /// Returns the caller's role for a publisher (owner or accepted member)
    /// when the subject has publisher access; `None` otherwise.
    async fn find_publisher_member_role(
        &self,
        context: &AppstoreRequestContext,
        publisher_id: &str,
        user_id: &str,
    ) -> AppstoreServiceResult<Option<String>>;
}
