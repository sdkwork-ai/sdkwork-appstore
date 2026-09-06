//! Row to domain model mapping.

use serde_json;

use crate::db::rows::{
    AppTemplateRow, AppTemplateUsageRow, CatalogChartSnapshotRow, CatalogCollectionItemRow,
    CatalogCollectionLocalizationRow, CatalogCollectionRow, CatalogFeaturedSlotRow,
    CatalogSearchHistoryRow, CatalogTrendingTermRow, CategoryLocalizationRow, CategoryRow,
    CompliancePermissionDisclosureRow, ComplianceProfileRow, DownloadGrantRow, FeedbackRow,
    InstallEventRow, ListingCategoryBindingRow, ListingLocalizationRow, ListingMediaRow,
    ListingMetricSnapshotRow, ListingRatingRow, ListingRow, ListingSearchRow, ListingSubmissionRow,
    MarketChannelRow, MarketReleaseRow, ModerationDecisionRow, ModerationReviewRow,
    PublisherMemberRow, PublisherRow, PublisherVerificationRow, RegionalAvailabilityRow,
    ReleaseArtifactRow, ReleaseChannelRow, ReleaseNoteLocalizationRow, ReleaseRolloutRow,
    ReleaseRow, UserCategoryItemRow, UserCategoryRow, UserLibraryItemRow, UserStoreShareRow,
    UserWishlistItemRow,
};
use sdkwork_appstore_catalog_service::domain::models::{
    AppTemplate, AppTemplateUsage, AppTemplateUsageKind, AudienceScope as CatalogAudienceScope,
    CatalogChartSnapshot, CatalogCollection, CatalogCollectionItem, CatalogCollectionLocalization,
    CatalogFeaturedSlot, Category, CategoryId, CategoryLocalization, CategoryStatus, CollectionId,
    CollectionStatus, CollectionType, FeaturedSlotId, FeaturedSlotStatus, Feedback,
    ListingMetricSnapshot, ListingSummary, PlatformScope, SearchHistoryEntry, TrendingTerm,
};
use sdkwork_appstore_compliance_service::domain::models::{
    CompliancePermissionDisclosure, ComplianceProfile, ComplianceProfileId, ComplianceStatus,
    DisclosureStatus,
};
use sdkwork_appstore_library_service::domain::models::{
    DownloadGrant as LibraryDownloadGrant, DownloadGrantReason, DownloadGrantStatus, InstallEvent,
    InstallEventStatus, InstallEventType, InstallSource, LibraryItemId, LibraryStatus,
    UserLibraryItem, UserWishlistItem, WishlistStatus,
};
use sdkwork_appstore_listing_service::domain::models::{
    Listing, ListingCategoryBinding, ListingId, ListingLocalization, ListingMedia, ListingRating,
    ListingStatus, ListingSubmission, ListingType, MediaRole, PricingModel, RegionalAvailability,
    ReviewStatus, StorefrontVisibility, SubmissionStatus, SubmissionType,
};
use sdkwork_appstore_market_service::domain::models::{
    MarketChannel, MarketChannelId, MarketRelease, MarketReleaseId,
};
use sdkwork_appstore_moderation_service::domain::models::{
    DecisionStatus, DecisionType, ModerationDecision, ModerationDecisionId, ModerationReview,
    ModerationReviewId, Priority, QueueCode, ReasonCode,
};
use sdkwork_appstore_publisher_service::domain::models::{
    ContactSnapshot, MemberRole, MemberStatus, Publisher, PublisherId, PublisherMember,
    PublisherStatus, PublisherType, PublisherVerification, VerificationStatus, VerificationType,
};
use sdkwork_appstore_release_service::domain::models::{
    ArtifactId, ArtifactStatus, AudienceScope, ChannelStatus, ChannelType, DownloadGrant,
    DownloadGrantId, GrantReason, GrantStatus, Release, ReleaseArtifact, ReleaseChannel,
    ReleaseChannelId, ReleaseId, ReleaseNoteLocalization, ReleaseRollout, ReleaseStatus,
    RolloutStatus, RolloutStrategy, SignatureSnapshot,
};
use sdkwork_appstore_user_store_service::domain::models::{
    ShareScope, ShareStatus, ShareVisibility, UserCategory as UserStoreCategory,
    UserCategoryItem as UserStoreCategoryItem, UserCategoryStatus, UserStoreShare,
};

pub fn map_publisher_row_to_domain(row: PublisherRow) -> Result<Publisher, String> {
    let contact_snapshot: ContactSnapshot =
        serde_json::from_str(&row.contact_snapshot_json).unwrap_or_default();

    let profile_snapshot: sdkwork_appstore_publisher_service::domain::models::ProfileSnapshot =
        serde_json::from_str(&row.profile_snapshot_json).unwrap_or_default();

    let publisher_type = PublisherType::from_str(&row.publisher_type)
        .ok_or_else(|| format!("Invalid publisher type: {}", row.publisher_type))?;

    let status = PublisherStatus::from_str(&row.publisher_status)
        .ok_or_else(|| format!("Invalid publisher status: {}", row.publisher_status))?;

    let verification_status = VerificationStatus::from_str(&row.verification_status)
        .ok_or_else(|| format!("Invalid verification status: {}", row.verification_status))?;

    Ok(Publisher {
        id: PublisherId::new(row.id),
        tenant_id: row.tenant_id,
        organization_id: row.organization_id,
        publisher_no: row.publisher_no,
        publisher_type,
        display_name: row.display_name,
        legal_name: row.legal_name,
        status,
        verification_status,
        contact_snapshot,
        profile_snapshot,
        website_url: row.website_url,
        support_email: row.support_email,
        logo_media_resource_id: row.logo_media_resource_id,
        owner_user_id: row.owner_user_id,
        version: row.version,
        verified_at: row.verified_at,
        suspended_at: row.suspended_at,
        deleted_at: row.deleted_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_publisher_domain_to_row(
    publisher: &Publisher,
) -> (String, String, String, String, String) {
    let contact_snapshot_json =
        serde_json::to_string(&publisher.contact_snapshot).unwrap_or_default();

    let profile_snapshot_json =
        serde_json::to_string(&publisher.profile_snapshot).unwrap_or_default();

    (
        publisher.publisher_type.as_str().to_string(),
        publisher.status.as_str().to_string(),
        publisher.verification_status.as_str().to_string(),
        contact_snapshot_json,
        profile_snapshot_json,
    )
}

pub fn map_member_row_to_domain(row: PublisherMemberRow) -> Result<PublisherMember, String> {
    let member_role = MemberRole::from_str(&row.member_role)
        .ok_or_else(|| format!("Invalid member role: {}", row.member_role))?;

    let member_status = MemberStatus::from_str(&row.member_status)
        .ok_or_else(|| format!("Invalid member status: {}", row.member_status))?;

    Ok(PublisherMember {
        id: row.id,
        tenant_id: row.tenant_id,
        organization_id: row.organization_id,
        publisher_id: PublisherId::new(row.publisher_id),
        user_id: row.user_id,
        member_role,
        member_status,
        invited_by: row.invited_by,
        joined_at: row.joined_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_member_domain_to_row(member: &PublisherMember) -> (String, String) {
    (
        member.member_role.as_str().to_string(),
        member.member_status.as_str().to_string(),
    )
}

pub fn map_verification_row_to_domain(
    row: PublisherVerificationRow,
) -> Result<PublisherVerification, String> {
    let verification_type = VerificationType::from_str(&row.verification_type)
        .ok_or_else(|| format!("Invalid verification type: {}", row.verification_type))?;

    let verification_status = VerificationStatus::from_str(&row.verification_status)
        .ok_or_else(|| format!("Invalid verification status: {}", row.verification_status))?;

    let credential_snapshot: serde_json::Value =
        serde_json::from_str(&row.credential_snapshot_json).unwrap_or_default();

    Ok(PublisherVerification {
        id: row.id,
        tenant_id: row.tenant_id,
        organization_id: row.organization_id,
        publisher_id: PublisherId::new(row.publisher_id),
        verification_type,
        verification_status,
        credential_snapshot,
        evidence_media_resource_id: row.evidence_media_resource_id,
        reviewed_by: row.reviewed_by,
        reviewed_at: row.reviewed_at,
        expires_at: row.expires_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_verification_domain_to_row(
    verification: &PublisherVerification,
) -> (String, String, String) {
    let credential_snapshot_json =
        serde_json::to_string(&verification.credential_snapshot).unwrap_or_default();

    (
        verification.verification_type.as_str().to_string(),
        verification.verification_status.as_str().to_string(),
        credential_snapshot_json,
    )
}

pub fn map_listing_row_to_domain(row: ListingRow) -> Result<Listing, String> {
    let listing_type = ListingType::from_str(&row.listing_type)
        .ok_or_else(|| format!("Invalid listing type: {}", row.listing_type))?;
    let pricing_model = PricingModel::from_str(&row.pricing_model)
        .ok_or_else(|| format!("Invalid pricing model: {}", row.pricing_model))?;
    let listing_status = ListingStatus::from_str(&row.listing_status)
        .ok_or_else(|| format!("Invalid listing status: {}", row.listing_status))?;
    let storefront_visibility = StorefrontVisibility::from_str(&row.storefront_visibility)
        .ok_or_else(|| {
            format!(
                "Invalid storefront visibility: {}",
                row.storefront_visibility
            )
        })?;
    let review_status = ReviewStatus::from_str(&row.review_status)
        .ok_or_else(|| format!("Invalid review status: {}", row.review_status))?;
    let content_rating_json: serde_json::Value =
        serde_json::from_str(&row.content_rating_json).unwrap_or_default();

    Ok(Listing {
        id: ListingId::new(row.id),
        tenant_id: row.tenant_id,
        organization_id: row.organization_id,
        publisher_id: row.publisher_id,
        listing_no: row.listing_no,
        app_id: row.app_id,
        app_key: row.app_key,
        listing_slug: row.listing_slug,
        listing_type,
        pricing_model,
        listing_status,
        storefront_visibility,
        review_status,
        primary_category_id: row.primary_category_id,
        default_locale: row.default_locale,
        age_rating_code: row.age_rating_code,
        content_rating_json,
        official_website_url: row.official_website_url,
        support_url: row.support_url,
        privacy_policy_url: row.privacy_policy_url,
        comments_thread_id: row.comments_thread_id,
        commerce_product_id: row.commerce_product_id,
        current_release_id: row.current_release_id,
        featured_score: row.featured_score,
        download_count: row.download_count,
        average_rating: row.average_rating,
        rating_count: row.rating_count,
        version: row.version,
        submitted_at: row.submitted_at,
        published_at: row.published_at,
        delisted_at: row.delisted_at,
        deleted_at: row.deleted_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_listing_domain_to_row(
    listing: &Listing,
) -> (String, String, String, String, String, String) {
    let content_rating_json =
        serde_json::to_string(&listing.content_rating_json).unwrap_or_default();

    (
        listing.listing_type.as_str().to_string(),
        listing.pricing_model.as_str().to_string(),
        listing.listing_status.as_str().to_string(),
        listing.storefront_visibility.as_str().to_string(),
        listing.review_status.as_str().to_string(),
        content_rating_json,
    )
}

pub fn map_localization_row_to_domain(
    row: ListingLocalizationRow,
) -> Result<ListingLocalization, String> {
    let keywords_json: serde_json::Value =
        serde_json::from_str(&row.keywords_json).unwrap_or_default();

    Ok(ListingLocalization {
        id: row.id,
        tenant_id: row.tenant_id,
        organization_id: row.organization_id,
        listing_id: ListingId::new(row.listing_id),
        locale: row.locale,
        display_name: row.display_name,
        subtitle: row.subtitle,
        short_description: row.short_description,
        full_description: row.full_description,
        whats_new_summary: row.whats_new_summary,
        keywords_json,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_localization_domain_to_row(localization: &ListingLocalization) -> String {
    serde_json::to_string(&localization.keywords_json).unwrap_or_default()
}

pub fn map_media_row_to_domain(row: ListingMediaRow) -> Result<ListingMedia, String> {
    let media_role = MediaRole::from_str(&row.media_role)
        .ok_or_else(|| format!("Invalid media role: {}", row.media_role))?;

    Ok(ListingMedia {
        id: row.id,
        tenant_id: row.tenant_id,
        organization_id: row.organization_id,
        listing_id: ListingId::new(row.listing_id),
        media_role,
        media_resource_id: row.media_resource_id,
        drive_node_id: row.drive_node_id,
        platform_scope: row.platform_scope,
        sort_order: row.sort_order,
        locale: row.locale,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_media_domain_to_row(media: &ListingMedia) -> String {
    media.media_role.as_str().to_string()
}

pub fn map_category_binding_row_to_domain(
    row: ListingCategoryBindingRow,
) -> Result<ListingCategoryBinding, String> {
    Ok(ListingCategoryBinding {
        id: row.id,
        tenant_id: row.tenant_id,
        listing_id: ListingId::new(row.listing_id),
        category_id: row.category_id,
        is_primary: row.is_primary != 0,
        created_at: row.created_at,
    })
}

pub fn map_regional_row_to_domain(
    row: RegionalAvailabilityRow,
) -> Result<RegionalAvailability, String> {
    Ok(RegionalAvailability {
        id: row.id,
        tenant_id: row.tenant_id,
        organization_id: row.organization_id,
        listing_id: ListingId::new(row.listing_id),
        region_code: row.region_code,
        availability_status: row.availability_status,
        effective_at: row.effective_at,
        expires_at: row.expires_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_submission_row_to_domain(
    row: ListingSubmissionRow,
) -> Result<ListingSubmission, String> {
    let submission_type = SubmissionType::from_str(&row.submission_type)
        .ok_or_else(|| format!("Invalid submission type: {}", row.submission_type))?;
    let submission_status = SubmissionStatus::from_str(&row.submission_status)
        .ok_or_else(|| format!("Invalid submission status: {}", row.submission_status))?;
    let payload_snapshot_json: serde_json::Value =
        serde_json::from_str(&row.payload_snapshot_json).unwrap_or_default();

    Ok(ListingSubmission {
        id: row.id,
        tenant_id: row.tenant_id,
        organization_id: row.organization_id,
        listing_id: ListingId::new(row.listing_id),
        release_id: row.release_id,
        submission_no: row.submission_no,
        submission_type,
        submission_status,
        submitted_by: row.submitted_by,
        submitted_at: row.submitted_at,
        payload_snapshot_json,
        idempotency_key: row.idempotency_key,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_submission_domain_to_row(submission: &ListingSubmission) -> (String, String, String) {
    let payload_snapshot_json =
        serde_json::to_string(&submission.payload_snapshot_json).unwrap_or_default();

    (
        submission.submission_type.as_str().to_string(),
        submission.submission_status.as_str().to_string(),
        payload_snapshot_json,
    )
}

pub fn map_release_channel_row_to_domain(row: ReleaseChannelRow) -> Result<ReleaseChannel, String> {
    let channel_type = ChannelType::from_str(&row.channel_type)
        .ok_or_else(|| format!("Invalid channel type: {}", row.channel_type))?;
    let channel_status = ChannelStatus::from_str(&row.channel_status)
        .ok_or_else(|| format!("Invalid channel status: {}", row.channel_status))?;
    let audience_scope = AudienceScope::from_str(&row.audience_scope)
        .ok_or_else(|| format!("Invalid audience scope: {}", row.audience_scope))?;

    Ok(ReleaseChannel {
        id: ReleaseChannelId::new(row.id),
        tenant_id: row.tenant_id,
        channel_code: row.channel_code,
        channel_type,
        channel_status,
        audience_scope,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_release_row_to_domain(row: ReleaseRow) -> Result<Release, String> {
    let release_status = ReleaseStatus::from_str(&row.release_status)
        .ok_or_else(|| format!("Invalid release status: {}", row.release_status))?;
    let manifest_snapshot: serde_json::Value =
        serde_json::from_str(&row.manifest_snapshot_json).unwrap_or_default();

    Ok(Release {
        id: ReleaseId::new(row.id),
        tenant_id: row.tenant_id,
        organization_id: row.organization_id,
        listing_id: row.listing_id,
        release_no: row.release_no,
        channel_id: ReleaseChannelId::new(row.channel_id),
        version_name: row.version_name,
        version_code: row.version_code,
        build_number: row.build_number,
        release_status,
        minimum_os_version: row.minimum_os_version,
        release_notes_default_locale: row.release_notes_default_locale,
        manifest_snapshot,
        submitted_at: row.submitted_at,
        approved_at: row.approved_at,
        published_at: row.published_at,
        retired_at: row.retired_at,
        version: row.version,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_release_domain_to_row(release: &Release) -> (String, String) {
    let manifest_snapshot_json =
        serde_json::to_string(&release.manifest_snapshot).unwrap_or_default();

    (
        release.release_status.as_str().to_string(),
        manifest_snapshot_json,
    )
}

pub fn map_release_note_row_to_domain(
    row: ReleaseNoteLocalizationRow,
) -> Result<ReleaseNoteLocalization, String> {
    Ok(ReleaseNoteLocalization {
        id: row.id,
        tenant_id: row.tenant_id,
        organization_id: row.organization_id,
        release_id: ReleaseId::new(row.release_id),
        locale: row.locale,
        release_notes: row.release_notes,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_artifact_row_to_domain(row: ReleaseArtifactRow) -> Result<ReleaseArtifact, String> {
    let artifact_status = ArtifactStatus::from_str(&row.artifact_status)
        .ok_or_else(|| format!("Invalid artifact status: {}", row.artifact_status))?;
    let signature_snapshot: SignatureSnapshot = serde_json::from_str(&row.signature_snapshot_json)
        .unwrap_or(SignatureSnapshot {
            algorithm: None,
            public_key_ref: None,
            signature_value: None,
        });

    Ok(ReleaseArtifact {
        id: ArtifactId::new(row.id),
        tenant_id: row.tenant_id,
        organization_id: row.organization_id,
        release_id: ReleaseId::new(row.release_id),
        artifact_no: row.artifact_no,
        platform: row.platform,
        architecture: row.architecture,
        package_format: row.package_format,
        artifact_status,
        drive_node_id: row.drive_node_id,
        media_resource_id: row.media_resource_id,
        file_size_bytes: row.file_size_bytes,
        content_type: row.content_type,
        checksum_sha256: row.checksum_sha256,
        signature_snapshot,
        sbom_ref: row.sbom_ref,
        provenance_ref: row.provenance_ref,
        min_os_version: row.min_os_version,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_artifact_domain_to_row(artifact: &ReleaseArtifact) -> (String, String) {
    let signature_snapshot_json =
        serde_json::to_string(&artifact.signature_snapshot).unwrap_or_default();

    (
        artifact.artifact_status.as_str().to_string(),
        signature_snapshot_json,
    )
}

pub fn map_rollout_row_to_domain(row: ReleaseRolloutRow) -> Result<ReleaseRollout, String> {
    let rollout_strategy = RolloutStrategy::from_str(&row.rollout_strategy)
        .ok_or_else(|| format!("Invalid rollout strategy: {}", row.rollout_strategy))?;
    let rollout_status = RolloutStatus::from_str(&row.rollout_status)
        .ok_or_else(|| format!("Invalid rollout status: {}", row.rollout_status))?;
    let region_filter: Vec<String> =
        serde_json::from_str(&row.region_filter_json).unwrap_or_default();
    let device_filter: serde_json::Value =
        serde_json::from_str(&row.device_filter_json).unwrap_or_default();

    Ok(ReleaseRollout {
        id: row.id,
        tenant_id: row.tenant_id,
        organization_id: row.organization_id,
        release_id: ReleaseId::new(row.release_id),
        rollout_strategy,
        rollout_status,
        target_percentage: row.target_percentage,
        current_percentage: row.current_percentage,
        region_filter,
        device_filter,
        started_at: row.started_at,
        completed_at: row.completed_at,
        paused_at: row.paused_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_rollout_domain_to_row(rollout: &ReleaseRollout) -> (String, String, String, String) {
    let region_filter_json = serde_json::to_string(&rollout.region_filter).unwrap_or_default();
    let device_filter_json = serde_json::to_string(&rollout.device_filter).unwrap_or_default();

    (
        rollout.rollout_strategy.as_str().to_string(),
        rollout.rollout_status.as_str().to_string(),
        region_filter_json,
        device_filter_json,
    )
}

pub fn map_grant_row_to_domain(row: DownloadGrantRow) -> Result<DownloadGrant, String> {
    let grant_status = GrantStatus::from_str(&row.grant_status)
        .ok_or_else(|| format!("Invalid grant status: {}", row.grant_status))?;
    let grant_reason = GrantReason::from_str(&row.grant_reason)
        .ok_or_else(|| format!("Invalid grant reason: {}", row.grant_reason))?;

    Ok(DownloadGrant {
        id: DownloadGrantId::new(row.id),
        tenant_id: row.tenant_id,
        organization_id: row.organization_id,
        grant_no: row.grant_no,
        listing_id: row.listing_id,
        release_id: ReleaseId::new(row.release_id),
        artifact_id: ArtifactId::new(row.artifact_id),
        user_id: row.user_id,
        grant_status,
        grant_reason,
        expires_at: row.expires_at,
        consumed_at: row.consumed_at,
        download_count: row.download_count,
        max_download_count: row.max_download_count,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_grant_domain_to_row(grant: &DownloadGrant) -> (String, String) {
    (
        grant.grant_status.as_str().to_string(),
        grant.grant_reason.as_str().to_string(),
    )
}

pub fn map_category_row_to_domain(row: CategoryRow) -> Result<Category, String> {
    let status = CategoryStatus::from_str(&row.category_status)
        .ok_or_else(|| format!("Invalid category status: {}", row.category_status))?;

    Ok(Category {
        id: CategoryId::new(row.id),
        tenant_id: row.tenant_id,
        category_code: row.category_code,
        parent_category_id: row.parent_category_id,
        category_level: row.category_level,
        status,
        sort_order: row.sort_order,
        icon_media_resource_id: row.icon_media_resource_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_category_domain_to_row(category: &Category) -> String {
    category.status.as_str().to_string()
}

pub fn map_category_localization_row_to_domain(
    row: CategoryLocalizationRow,
) -> Result<CategoryLocalization, String> {
    Ok(CategoryLocalization {
        id: row.id,
        tenant_id: row.tenant_id,
        category_id: CategoryId::new(row.category_id),
        locale: row.locale,
        display_name: row.display_name,
        description: row.description,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_collection_row_to_domain(
    row: CatalogCollectionRow,
) -> Result<CatalogCollection, String> {
    let collection_type = CollectionType::from_str(&row.collection_type)
        .ok_or_else(|| format!("Invalid collection type: {}", row.collection_type))?;
    let status = CollectionStatus::from_str(&row.collection_status)
        .ok_or_else(|| format!("Invalid collection status: {}", row.collection_status))?;
    let audience_scope = CatalogAudienceScope::from_str(&row.audience_scope)
        .ok_or_else(|| format!("Invalid audience scope: {}", row.audience_scope))?;

    Ok(CatalogCollection {
        id: CollectionId::new(row.id),
        tenant_id: row.tenant_id,
        collection_code: row.collection_code,
        collection_type,
        status,
        audience_scope,
        sort_order: row.sort_order,
        cover_media_resource_id: row.cover_media_resource_id,
        starts_at: row.starts_at,
        ends_at: row.ends_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_collection_domain_to_row(collection: &CatalogCollection) -> (String, String, String) {
    (
        collection.collection_type.as_str().to_string(),
        collection.status.as_str().to_string(),
        collection.audience_scope.as_str().to_string(),
    )
}

pub fn map_collection_localization_row_to_domain(
    row: CatalogCollectionLocalizationRow,
) -> Result<CatalogCollectionLocalization, String> {
    Ok(CatalogCollectionLocalization {
        id: row.id,
        tenant_id: row.tenant_id,
        collection_id: CollectionId::new(row.collection_id),
        locale: row.locale,
        display_name: row.display_name,
        description: row.description,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_collection_item_row_to_domain(
    row: CatalogCollectionItemRow,
) -> Result<CatalogCollectionItem, String> {
    let highlight: serde_json::Value =
        serde_json::from_str(&row.highlight_json).unwrap_or_default();

    Ok(CatalogCollectionItem {
        id: row.id,
        tenant_id: row.tenant_id,
        collection_id: CollectionId::new(row.collection_id),
        listing_id: row.listing_id,
        sort_order: row.sort_order,
        highlight,
        starts_at: row.starts_at,
        ends_at: row.ends_at,
        created_at: row.created_at,
    })
}

pub fn map_collection_item_domain_to_row(item: &CatalogCollectionItem) -> String {
    serde_json::to_string(&item.highlight).unwrap_or_default()
}

pub fn map_featured_slot_row_to_domain(
    row: CatalogFeaturedSlotRow,
) -> Result<CatalogFeaturedSlot, String> {
    let status = FeaturedSlotStatus::from_str(&row.slot_status)
        .ok_or_else(|| format!("Invalid featured slot status: {}", row.slot_status))?;
    let audience_scope = CatalogAudienceScope::from_str(&row.audience_scope)
        .ok_or_else(|| format!("Invalid audience scope: {}", row.audience_scope))?;
    let platform_scope = PlatformScope::from_str(&row.platform_scope)
        .ok_or_else(|| format!("Invalid platform scope: {}", row.platform_scope))?;
    let region_scope: Vec<String> =
        serde_json::from_str(&row.region_scope_json).unwrap_or_default();

    Ok(CatalogFeaturedSlot {
        id: FeaturedSlotId::new(row.id),
        tenant_id: row.tenant_id,
        slot_code: row.slot_code,
        listing_id: row.listing_id,
        status,
        audience_scope,
        platform_scope,
        region_scope,
        starts_at: row.starts_at,
        ends_at: row.ends_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_featured_slot_domain_to_row(
    slot: &CatalogFeaturedSlot,
) -> (String, String, String, String) {
    let region_scope_json = serde_json::to_string(&slot.region_scope).unwrap_or_default();

    (
        slot.status.as_str().to_string(),
        slot.audience_scope.as_str().to_string(),
        slot.platform_scope.as_str().to_string(),
        region_scope_json,
    )
}

pub fn map_chart_snapshot_row_to_domain(
    row: CatalogChartSnapshotRow,
) -> Result<CatalogChartSnapshot, String> {
    let platform_scope = PlatformScope::from_str(&row.platform_scope)
        .ok_or_else(|| format!("Invalid platform scope: {}", row.platform_scope))?;
    let ranking: serde_json::Value = serde_json::from_str(&row.ranking_json).unwrap_or_default();

    Ok(CatalogChartSnapshot {
        id: row.id,
        tenant_id: row.tenant_id,
        chart_code: row.chart_code,
        snapshot_date: row.snapshot_date,
        locale: row.locale,
        platform_scope,
        ranking,
        generated_at: row.generated_at,
        created_at: row.created_at,
    })
}

pub fn map_metric_snapshot_row_to_domain(
    row: ListingMetricSnapshotRow,
) -> Result<ListingMetricSnapshot, String> {
    Ok(ListingMetricSnapshot {
        id: row.id,
        tenant_id: row.tenant_id,
        listing_id: row.listing_id,
        snapshot_date: row.snapshot_date,
        impression_count: row.impression_count,
        detail_view_count: row.detail_view_count,
        install_count: row.install_count,
        uninstall_count: row.uninstall_count,
        update_count: row.update_count,
        conversion_rate: row.conversion_rate,
        created_at: row.created_at,
    })
}

pub fn map_listing_search_row_to_domain(row: ListingSearchRow) -> ListingSummary {
    ListingSummary {
        id: row.id,
        app_id: row.app_id,
        app_key: row.app_key,
        display_name: row.display_name,
        subtitle: row.subtitle,
        listing_slug: row.listing_slug,
        pricing_model: row.pricing_model,
        icon_media_resource_id: row.icon_media_resource_id,
        developer_name: row.developer_name,
        description: row.description,
        current_version: row.current_version,
        file_size_bytes: row.file_size_bytes,
        whats_new_summary: row.whats_new_summary,
        released_at: row.released_at.map(|timestamp| timestamp.to_rfc3339()),
        average_rating: row.average_rating,
        rating_count: row.rating_count,
    }
}

pub fn map_library_item_row_to_domain(row: UserLibraryItemRow) -> Result<UserLibraryItem, String> {
    let library_status = LibraryStatus::from_str(&row.library_status)
        .ok_or_else(|| format!("Invalid library status: {}", row.library_status))?;
    let install_source = InstallSource::from_str(&row.install_source)
        .ok_or_else(|| format!("Invalid install source: {}", row.install_source))?;

    Ok(UserLibraryItem {
        id: LibraryItemId::new(row.id),
        tenant_id: row.tenant_id,
        user_id: row.user_id,
        listing_id: row.listing_id,
        app_key: row.app_key,
        library_status,
        installed_release_id: row.installed_release_id,
        installed_version_code: row.installed_version_code,
        install_source,
        platform: row.platform,
        architecture: row.architecture,
        device_id: row.device_id,
        last_checked_at: row.last_checked_at,
        installed_at: row.installed_at,
        updated_at: row.updated_at,
        removed_at: row.removed_at,
        created_at: row.created_at,
    })
}

pub fn map_library_item_domain_to_row(item: &UserLibraryItem) -> (String, String) {
    (
        item.library_status.as_str().to_string(),
        item.install_source.as_str().to_string(),
    )
}

pub fn map_wishlist_item_row_to_domain(
    row: UserWishlistItemRow,
) -> Result<UserWishlistItem, String> {
    let wishlist_status = WishlistStatus::from_str(&row.wishlist_status)
        .ok_or_else(|| format!("Invalid wishlist status: {}", row.wishlist_status))?;

    Ok(UserWishlistItem {
        id: row.id,
        tenant_id: row.tenant_id,
        user_id: row.user_id,
        listing_id: row.listing_id,
        wishlist_status,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_wishlist_item_domain_to_row(item: &UserWishlistItem) -> String {
    item.wishlist_status.as_str().to_string()
}

pub fn map_install_event_row_to_domain(row: InstallEventRow) -> Result<InstallEvent, String> {
    let event_type = InstallEventType::from_str(&row.event_type)
        .ok_or_else(|| format!("Invalid install event type: {}", row.event_type))?;
    let event_status = InstallEventStatus::from_str(&row.event_status)
        .ok_or_else(|| format!("Invalid install event status: {}", row.event_status))?;
    let payload_snapshot: serde_json::Value =
        serde_json::from_str(&row.payload_snapshot_json).unwrap_or_default();

    Ok(InstallEvent {
        id: row.id,
        tenant_id: row.tenant_id,
        organization_id: row.organization_id,
        event_no: row.event_no,
        listing_id: row.listing_id,
        release_id: row.release_id,
        artifact_id: row.artifact_id,
        user_id: row.user_id,
        device_id: row.device_id,
        event_type,
        platform: row.platform,
        architecture: row.architecture,
        event_status,
        source_channel: row.source_channel,
        client_version: row.client_version,
        region_code: row.region_code,
        payload_snapshot,
        occurred_at: row.occurred_at,
        created_at: row.created_at,
    })
}

pub fn map_install_event_domain_to_row(event: &InstallEvent) -> (String, String, String) {
    let payload_snapshot_json = serde_json::to_string(&event.payload_snapshot).unwrap_or_default();

    (
        event.event_type.as_str().to_string(),
        event.event_status.as_str().to_string(),
        payload_snapshot_json,
    )
}

pub fn map_library_download_grant_row_to_domain(
    row: DownloadGrantRow,
) -> Result<LibraryDownloadGrant, String> {
    let grant_status = DownloadGrantStatus::from_str(&row.grant_status)
        .ok_or_else(|| format!("Invalid download grant status: {}", row.grant_status))?;
    let grant_reason = DownloadGrantReason::from_str(&row.grant_reason)
        .ok_or_else(|| format!("Invalid download grant reason: {}", row.grant_reason))?;

    Ok(LibraryDownloadGrant {
        id: row.id,
        tenant_id: row.tenant_id,
        organization_id: row.organization_id,
        grant_no: row.grant_no,
        listing_id: row.listing_id,
        release_id: row.release_id,
        artifact_id: row.artifact_id,
        user_id: row.user_id,
        grant_status,
        grant_reason,
        expires_at: row.expires_at,
        consumed_at: row.consumed_at,
        download_count: row.download_count,
        max_download_count: row.max_download_count,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_library_download_grant_domain_to_row(grant: &LibraryDownloadGrant) -> (String, String) {
    (
        grant.grant_status.as_str().to_string(),
        grant.grant_reason.as_str().to_string(),
    )
}

pub fn map_moderation_review_row_to_domain(
    row: ModerationReviewRow,
) -> Result<ModerationReview, String> {
    let review_status =
        sdkwork_appstore_moderation_service::domain::models::ReviewStatus::from_str(
            &row.review_status,
        )
        .ok_or_else(|| format!("Invalid review status: {}", row.review_status))?;
    let priority = Priority::from_str(&row.priority)
        .ok_or_else(|| format!("Invalid priority: {}", row.priority))?;
    let queue_code = QueueCode::from_str(&row.queue_code);

    Ok(ModerationReview {
        id: ModerationReviewId::new(row.id),
        tenant_id: row.tenant_id,
        organization_id: row.organization_id,
        submission_id: row.submission_id,
        review_no: row.review_no,
        review_status,
        priority,
        assigned_to: row.assigned_to,
        queue_code,
        sla_due_at: row.sla_due_at,
        started_at: row.started_at,
        completed_at: row.completed_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_moderation_review_domain_to_row(review: &ModerationReview) -> (String, String, String) {
    (
        review.review_status.as_str().to_string(),
        review.priority.as_str().to_string(),
        review.queue_code.as_str().to_string(),
    )
}

pub fn map_moderation_decision_row_to_domain(
    row: ModerationDecisionRow,
) -> Result<ModerationDecision, String> {
    let decision_type = DecisionType::from_str(&row.decision_type)
        .ok_or_else(|| format!("Invalid decision type: {}", row.decision_type))?;
    let decision_status = DecisionStatus::from_str(&row.decision_status)
        .ok_or_else(|| format!("Invalid decision status: {}", row.decision_status))?;
    let reason_code = row.reason_code.as_deref().map(ReasonCode::from_str);
    let payload_snapshot: serde_json::Value =
        serde_json::from_str(&row.payload_snapshot_json).unwrap_or_default();

    Ok(ModerationDecision {
        id: ModerationDecisionId::new(row.id),
        tenant_id: row.tenant_id,
        organization_id: row.organization_id,
        review_id: ModerationReviewId::new(row.review_id),
        decision_no: row.decision_no,
        decision_type,
        decision_status,
        reason_code,
        reason_detail: row.reason_detail,
        policy_reference: row.policy_reference,
        decided_by: row.decided_by,
        decided_at: row.decided_at,
        payload_snapshot,
        created_at: row.created_at,
    })
}

pub fn map_moderation_decision_domain_to_row(
    decision: &ModerationDecision,
) -> (String, String, Option<String>, String) {
    let payload_snapshot_json =
        serde_json::to_string(&decision.payload_snapshot).unwrap_or_default();

    (
        decision.decision_type.as_str().to_string(),
        decision.decision_status.as_str().to_string(),
        decision
            .reason_code
            .as_ref()
            .map(|rc| rc.as_str().to_string()),
        payload_snapshot_json,
    )
}

pub fn map_compliance_profile_row_to_domain(
    row: ComplianceProfileRow,
) -> Result<ComplianceProfile, String> {
    let compliance_status = ComplianceStatus::from_str(&row.compliance_status)
        .ok_or_else(|| format!("Invalid compliance status: {}", row.compliance_status))?;
    let privacy_nutrition_json: serde_json::Value =
        serde_json::from_str(&row.privacy_nutrition_json).unwrap_or_default();
    let content_rating_questionnaire_json: serde_json::Value =
        serde_json::from_str(&row.content_rating_questionnaire_json).unwrap_or_default();
    let data_safety_json: serde_json::Value =
        serde_json::from_str(&row.data_safety_json).unwrap_or_default();
    let target_audience_json: serde_json::Value =
        serde_json::from_str(&row.target_audience_json).unwrap_or_default();

    Ok(ComplianceProfile {
        id: ComplianceProfileId::new(row.id),
        tenant_id: row.tenant_id,
        organization_id: row.organization_id,
        listing_id: row.listing_id,
        compliance_version: row.compliance_version,
        privacy_nutrition_json,
        content_rating_questionnaire_json,
        data_safety_json,
        target_audience_json,
        compliance_status,
        reviewed_by: row.reviewed_by,
        reviewed_at: row.reviewed_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_compliance_profile_domain_to_row(
    profile: &ComplianceProfile,
) -> (String, String, String, String, String) {
    let privacy_nutrition_json =
        serde_json::to_string(&profile.privacy_nutrition_json).unwrap_or_default();
    let content_rating_questionnaire_json =
        serde_json::to_string(&profile.content_rating_questionnaire_json).unwrap_or_default();
    let data_safety_json = serde_json::to_string(&profile.data_safety_json).unwrap_or_default();
    let target_audience_json =
        serde_json::to_string(&profile.target_audience_json).unwrap_or_default();

    (
        privacy_nutrition_json,
        content_rating_questionnaire_json,
        data_safety_json,
        target_audience_json,
        profile.compliance_status.as_str().to_string(),
    )
}

pub fn map_permission_disclosure_row_to_domain(
    row: CompliancePermissionDisclosureRow,
) -> Result<CompliancePermissionDisclosure, String> {
    let disclosure_status = DisclosureStatus::from_str(&row.disclosure_status)
        .ok_or_else(|| format!("Invalid disclosure status: {}", row.disclosure_status))?;

    Ok(CompliancePermissionDisclosure {
        id: row.id,
        tenant_id: row.tenant_id,
        organization_id: row.organization_id,
        listing_id: row.listing_id,
        permission_code: row.permission_code,
        usage_purpose: row.usage_purpose,
        is_required: row.is_required != 0,
        disclosure_status,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_permission_disclosure_domain_to_row(
    disclosure: &CompliancePermissionDisclosure,
) -> (i32, String) {
    (
        if disclosure.is_required { 1 } else { 0 },
        disclosure.disclosure_status.as_str().to_string(),
    )
}

pub fn map_market_channel_row_to_domain(row: MarketChannelRow) -> Result<MarketChannel, String> {
    let channel_type =
        sdkwork_appstore_market_service::domain::models::ChannelType::from_str(&row.channel_type)
            .ok_or_else(|| format!("Invalid channel type: {}", row.channel_type))?;
    let channel_status = sdkwork_appstore_market_service::domain::models::ChannelStatus::from_str(
        &row.channel_status,
    )
    .ok_or_else(|| format!("Invalid channel status: {}", row.channel_status))?;
    let api_capability: serde_json::Value =
        serde_json::from_str(&row.api_capability_json).unwrap_or_default();
    let config: serde_json::Value = serde_json::from_str(&row.config_json).unwrap_or_default();

    Ok(MarketChannel {
        id: MarketChannelId::new(row.id),
        tenant_id: row.tenant_id,
        organization_id: row.organization_id,
        channel_code: row.channel_code,
        channel_type,
        provider: row.provider,
        channel_status,
        external_store_code: row.external_store_code,
        api_capability,
        config,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_market_channel_domain_to_row(
    channel: &MarketChannel,
) -> (String, String, String, String) {
    let api_capability_json = serde_json::to_string(&channel.api_capability).unwrap_or_default();
    let config_json = serde_json::to_string(&channel.config).unwrap_or_default();

    (
        channel.channel_type.as_str().to_string(),
        channel.channel_status.as_str().to_string(),
        api_capability_json,
        config_json,
    )
}

pub fn map_market_release_row_to_domain(row: MarketReleaseRow) -> Result<MarketRelease, String> {
    let market_status =
        sdkwork_appstore_market_service::domain::models::MarketStatus::from_str(&row.market_status)
            .ok_or_else(|| format!("Invalid market status: {}", row.market_status))?;
    let countries: Vec<String> = serde_json::from_str(&row.countries_json).unwrap_or_default();
    let external_status: serde_json::Value =
        serde_json::from_str(&row.external_status_json).unwrap_or_default();

    Ok(MarketRelease {
        id: MarketReleaseId::new(row.id),
        tenant_id: row.tenant_id,
        organization_id: row.organization_id,
        app_id: row.app_id,
        listing_id: row.listing_id,
        release_id: row.release_id,
        channel_id: MarketChannelId::new(row.channel_id),
        market_release_no: row.market_release_no,
        external_app_id: row.external_app_id,
        external_release_id: row.external_release_id,
        external_track: row.external_track,
        market_status,
        rollout_percent: row.rollout_percent,
        countries,
        store_url: row.store_url,
        external_status,
        submitted_at: row.submitted_at,
        approved_at: row.approved_at,
        released_at: row.released_at,
        rejected_at: row.rejected_at,
        last_synced_at: row.last_synced_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_market_release_domain_to_row(release: &MarketRelease) -> (String, String, String) {
    let countries_json = serde_json::to_string(&release.countries).unwrap_or_default();
    let external_status_json = serde_json::to_string(&release.external_status).unwrap_or_default();

    (
        release.market_status.as_str().to_string(),
        countries_json,
        external_status_json,
    )
}

pub fn map_search_history_row_to_domain(row: CatalogSearchHistoryRow) -> SearchHistoryEntry {
    SearchHistoryEntry {
        id: row.id,
        tenant_id: row.tenant_id,
        user_id: row.user_id,
        query_text: row.query_text,
        filters_json: row.filters_json,
        result_count: row.result_count,
        created_at: row.created_at,
    }
}

pub fn map_trending_term_row_to_domain(row: CatalogTrendingTermRow) -> TrendingTerm {
    TrendingTerm {
        id: row.id,
        tenant_id: row.tenant_id,
        term: row.term,
        locale: row.locale,
        rank: row.rank,
        score: row.score,
        snapshot_date: row.snapshot_date,
        created_at: row.created_at,
        updated_at: row.updated_at,
    }
}

pub fn map_app_template_row_to_domain(row: AppTemplateRow) -> Result<AppTemplate, String> {
    let capability_manifest = serde_json::from_str(&row.capability_manifest)
        .unwrap_or_else(|_| serde_json::Value::Object(Default::default()));
    let metadata = serde_json::from_str(&row.metadata)
        .unwrap_or_else(|_| serde_json::Value::Object(Default::default()));
    let author_name = metadata
        .get("authorName")
        .and_then(|value| value.as_str())
        .map(ToOwned::to_owned);
    Ok(AppTemplate {
        id: row.id.to_string(),
        tenant_id: row.tenant_id,
        organization_id: row.organization_id,
        template_code: row.template_code,
        template_name: row.template_name,
        description: row.description,
        template_type: row.template_type,
        category_code: row.category_code,
        framework: row.framework,
        language: row.language,
        icon_media_resource_id: row.icon_media_resource_id,
        git_repo_url: row.git_repo_url,
        author_name,
        capability_manifest,
        metadata,
        star_count: row.star_count,
        fork_count: row.fork_count,
        clone_count: row.clone_count,
        is_enabled: row.is_enabled,
        published_at: row.published_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_app_template_usage_row_to_domain(
    row: AppTemplateUsageRow,
) -> Result<AppTemplateUsage, String> {
    let usage_kind = AppTemplateUsageKind::from_i32(row.usage_type)
        .ok_or_else(|| format!("unknown template usage type {}", row.usage_type))?;
    let metadata = serde_json::from_str(&row.metadata)
        .unwrap_or_else(|_| serde_json::Value::Object(Default::default()));
    Ok(AppTemplateUsage {
        id: row.id.to_string(),
        tenant_id: row.tenant_id,
        organization_id: row.organization_id,
        template_id: row.template_id.to_string(),
        user_id: row.user_id.map(|value| value.to_string()),
        usage_kind,
        metadata,
        created_at: row.created_at,
    })
}

pub fn map_feedback_row_to_domain(row: FeedbackRow) -> Result<Feedback, String> {
    Ok(Feedback {
        id: row.id,
        tenant_id: row.tenant_id,
        user_id: row.user_id,
        feedback_type: row.feedback_type,
        content: row.content,
        contact: row.contact,
        listing_id: row.listing_id,
        app_key: row.app_key,
        status: row.status,
        created_at: row.created_at,
    })
}

pub fn map_listing_rating_row_to_domain(row: ListingRatingRow) -> Result<ListingRating, String> {
    Ok(ListingRating {
        id: row.id,
        tenant_id: row.tenant_id,
        organization_id: row.organization_id,
        listing_id: ListingId(row.listing_id),
        user_id: row.user_id,
        rating: row.rating,
        title: row.title,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_user_category_row_to_domain(row: UserCategoryRow) -> Result<UserStoreCategory, String> {
    let status = UserCategoryStatus::from_str(&row.category_status)
        .ok_or_else(|| format!("Invalid user category status: {}", row.category_status))?;

    Ok(UserStoreCategory {
        id: row.id,
        tenant_id: row.tenant_id,
        owner_user_id: row.owner_user_id,
        name: row.name,
        description: row.description,
        icon_media_resource_id: row.icon_media_resource_id,
        sort_order: row.sort_order,
        status,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_user_category_status_to_row(category: &UserStoreCategory) -> String {
    category.status.as_str().to_string()
}

pub fn map_user_category_item_row_to_domain(
    row: UserCategoryItemRow,
) -> Result<UserStoreCategoryItem, String> {
    Ok(UserStoreCategoryItem {
        id: row.id,
        tenant_id: row.tenant_id,
        user_category_id: row.user_category_id,
        listing_id: row.listing_id,
        note: row.note,
        sort_order: row.sort_order,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_user_store_share_row_to_domain(
    row: UserStoreShareRow,
) -> Result<UserStoreShare, String> {
    let scope = ShareScope::from_str(&row.share_scope)
        .ok_or_else(|| format!("Invalid share scope: {}", row.share_scope))?;
    let visibility = ShareVisibility::from_str(&row.share_visibility)
        .ok_or_else(|| format!("Invalid share visibility: {}", row.share_visibility))?;
    let status = ShareStatus::from_str(&row.share_status)
        .ok_or_else(|| format!("Invalid share status: {}", row.share_status))?;
    let selected_category_ids: Vec<String> = serde_json::from_str(&row.selected_category_ids_json)
        .map_err(|e| format!("Invalid selected_category_ids_json: {}", e))?;

    Ok(UserStoreShare {
        id: row.id,
        tenant_id: row.tenant_id,
        owner_user_id: row.owner_user_id,
        share_token: row.share_token,
        title: row.title,
        description: row.description,
        scope,
        selected_category_ids,
        visibility,
        status,
        expires_at: row.expires_at,
        view_count: row.view_count,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub fn map_user_store_share_domain_to_share_columns(
    share: &UserStoreShare,
) -> Result<
    (
        String,
        String,
        String,
        String,
        Option<chrono::DateTime<chrono::Utc>>,
    ),
    String,
> {
    let selected_category_ids_json = serde_json::to_string(&share.selected_category_ids)
        .map_err(|e| format!("Serialize selected_category_ids failed: {}", e))?;
    Ok((
        share.scope.as_str().to_string(),
        selected_category_ids_json,
        share.visibility.as_str().to_string(),
        share.status.as_str().to_string(),
        share.expires_at,
    ))
}
