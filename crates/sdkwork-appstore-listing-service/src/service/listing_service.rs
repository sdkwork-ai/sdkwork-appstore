//! Listing service entrypoint.

use chrono::Utc;
use uuid::Uuid;

use crate::context::AppstoreRequestContext;
use crate::domain::commands::{
    AdminListListingsRequest, AdminRetrieveListingRequest, AdminUpdateListingVisibilityRequest,
    ApplyModerationDecisionRequest, AttachListingMediaRequest, BindListingCategoriesRequest,
    BootstrapPublisherAppRequest, CreateListingRequest, CreateListingSubmissionRequest,
    ListDeveloperOtherListingsRequest, ListListingMediaRequest, ListListingReleaseHistoryRequest,
    ListListingReleasesRequest, ListPublisherListingsRequest, ListSimilarListingsRequest,
    PublicRetrieveListingRequest, RatingUpdateRequest, RatingsListRequest,
    RemoveListingMediaRequest, RetrieveListingEditorialRequest, RetrieveListingRequest,
    UpdateListingRequest, UpdateRegionalAvailabilityRequest, UpsertListingLocalizationRequest,
};
use crate::domain::models::{
    Listing, ListingCategoryBinding, ListingId, ListingLocalization, ListingMedia, ListingRating,
    ListingStatus, ListingSubmission, ListingType, MediaRole, PricingModel, RegionalAvailability,
    ReviewStatus, StoreApp, StorefrontVisibility, SubmissionStatus, SubmissionType,
};
use crate::domain::results::{
    AdminListListingsResult, AdminRetrieveListingResult, AdminUpdateListingVisibilityResult,
    ApplyModerationDecisionResult, AttachListingMediaResult, BindListingCategoriesResult,
    BootstrapPublisherAppResult, CreateListingResult, CreateListingSubmissionResult,
    ListDeveloperOtherListingsResult, ListListingMediaResult, ListListingReleaseHistoryResult,
    ListListingReleasesResult, ListPublisherListingsResult, ListSimilarListingsResult,
    ListingEditorialContent, PublicRetrieveListingResult, RatingUpdateResult, RatingsListResult,
    RemoveListingMediaResult, RetrieveListingEditorialResult, RetrieveListingResult,
    UpdateListingResult, UpdateRegionalAvailabilityResult, UpsertListingLocalizationResult,
};
use crate::error::{AppstoreServiceError, AppstoreServiceResult};
use crate::ports::provider::AppReference;
use crate::ports::repository::ListingRepositoryPort;

fn validate_app_binding(
    reference: &AppReference,
    app_id: &str,
    app_key: &str,
) -> AppstoreServiceResult<()> {
    if reference.app_id != app_id {
        return Err(AppstoreServiceError::ValidationFailed(
            "app_id does not match platform record".to_string(),
        ));
    }
    if reference.app_key != app_key {
        return Err(AppstoreServiceError::ValidationFailed(
            "app_key does not match platform record".to_string(),
        ));
    }
    Ok(())
}
fn is_valid_app_key(app_key: &str) -> bool {
    let trimmed = app_key.trim();
    if trimmed.is_empty() || trimmed.len() > 64 {
        return false;
    }
    let mut previous_hyphen = false;
    for ch in trimmed.chars() {
        if ch == '-' {
            if previous_hyphen {
                return false;
            }
            previous_hyphen = true;
            continue;
        }
        previous_hyphen = false;
        if !ch.is_ascii_lowercase() && !ch.is_ascii_digit() {
            return false;
        }
    }
    !trimmed.starts_with('-') && !trimmed.ends_with('-')
}

#[async_trait::async_trait]
pub trait ListingOperations {
    async fn retrieve_listing(
        &self,
        context: &AppstoreRequestContext,
        request: RetrieveListingRequest,
    ) -> AppstoreServiceResult<RetrieveListingResult>;

    async fn create_listing(
        &self,
        context: &AppstoreRequestContext,
        request: CreateListingRequest,
    ) -> AppstoreServiceResult<CreateListingResult>;

    async fn bootstrap_publisher_app(
        &self,
        context: &AppstoreRequestContext,
        request: BootstrapPublisherAppRequest,
    ) -> AppstoreServiceResult<BootstrapPublisherAppResult>;

    async fn update_listing(
        &self,
        context: &AppstoreRequestContext,
        request: UpdateListingRequest,
    ) -> AppstoreServiceResult<UpdateListingResult>;

    async fn upsert_localization(
        &self,
        context: &AppstoreRequestContext,
        request: UpsertListingLocalizationRequest,
    ) -> AppstoreServiceResult<UpsertListingLocalizationResult>;

    async fn list_media(
        &self,
        context: &AppstoreRequestContext,
        request: ListListingMediaRequest,
    ) -> AppstoreServiceResult<ListListingMediaResult>;

    async fn attach_media(
        &self,
        context: &AppstoreRequestContext,
        request: AttachListingMediaRequest,
    ) -> AppstoreServiceResult<AttachListingMediaResult>;

    async fn remove_media(
        &self,
        context: &AppstoreRequestContext,
        request: RemoveListingMediaRequest,
    ) -> AppstoreServiceResult<RemoveListingMediaResult>;

    async fn bind_categories(
        &self,
        context: &AppstoreRequestContext,
        request: BindListingCategoriesRequest,
    ) -> AppstoreServiceResult<BindListingCategoriesResult>;

    async fn update_regional_availability(
        &self,
        context: &AppstoreRequestContext,
        request: UpdateRegionalAvailabilityRequest,
    ) -> AppstoreServiceResult<UpdateRegionalAvailabilityResult>;

    async fn list_releases(
        &self,
        context: &AppstoreRequestContext,
        request: ListListingReleasesRequest,
    ) -> AppstoreServiceResult<ListListingReleasesResult>;

    async fn list_publisher_listings(
        &self,
        context: &AppstoreRequestContext,
        request: ListPublisherListingsRequest,
    ) -> AppstoreServiceResult<ListPublisherListingsResult>;

    async fn create_submission(
        &self,
        context: &AppstoreRequestContext,
        request: CreateListingSubmissionRequest,
    ) -> AppstoreServiceResult<CreateListingSubmissionResult>;

    async fn apply_moderation_decision(
        &self,
        context: &AppstoreRequestContext,
        request: ApplyModerationDecisionRequest,
    ) -> AppstoreServiceResult<ApplyModerationDecisionResult>;

    async fn admin_list_listings(
        &self,
        context: &AppstoreRequestContext,
        request: AdminListListingsRequest,
    ) -> AppstoreServiceResult<AdminListListingsResult>;

    async fn admin_retrieve_listing(
        &self,
        context: &AppstoreRequestContext,
        request: AdminRetrieveListingRequest,
    ) -> AppstoreServiceResult<AdminRetrieveListingResult>;

    async fn admin_update_visibility(
        &self,
        context: &AppstoreRequestContext,
        request: AdminUpdateListingVisibilityRequest,
    ) -> AppstoreServiceResult<AdminUpdateListingVisibilityResult>;

    async fn public_retrieve_listing(
        &self,
        context: &AppstoreRequestContext,
        request: PublicRetrieveListingRequest,
    ) -> AppstoreServiceResult<PublicRetrieveListingResult>;

    async fn list_release_history(
        &self,
        context: &AppstoreRequestContext,
        request: ListListingReleaseHistoryRequest,
    ) -> AppstoreServiceResult<ListListingReleaseHistoryResult>;

    async fn list_similar_listings(
        &self,
        context: &AppstoreRequestContext,
        request: ListSimilarListingsRequest,
    ) -> AppstoreServiceResult<ListSimilarListingsResult>;

    async fn list_developer_other_listings(
        &self,
        context: &AppstoreRequestContext,
        request: ListDeveloperOtherListingsRequest,
    ) -> AppstoreServiceResult<ListDeveloperOtherListingsResult>;

    async fn retrieve_listing_editorial(
        &self,
        context: &AppstoreRequestContext,
        request: RetrieveListingEditorialRequest,
    ) -> AppstoreServiceResult<RetrieveListingEditorialResult>;

    async fn ratings_list(
        &self,
        context: &AppstoreRequestContext,
        request: RatingsListRequest,
    ) -> AppstoreServiceResult<RatingsListResult>;

    async fn rating_update(
        &self,
        context: &AppstoreRequestContext,
        request: RatingUpdateRequest,
    ) -> AppstoreServiceResult<RatingUpdateResult>;
}

#[derive(Clone)]
pub struct ListingService<R> {
    repository: R,
    platform_provider: Option<std::sync::Arc<dyn crate::ports::provider::ListingProviderPort>>,
    media_provider: Option<std::sync::Arc<dyn crate::ports::provider::ListingProviderPort>>,
    moderation_port: Option<std::sync::Arc<dyn crate::ports::moderation::SubmissionModerationPort>>,
    search_projection:
        Option<std::sync::Arc<dyn crate::ports::search_projection::ListingSearchProjectionPort>>,
}

impl<R: std::fmt::Debug> std::fmt::Debug for ListingService<R> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("ListingService")
            .field("repository", &self.repository)
            .field("platform_provider", &self.platform_provider.is_some())
            .field("media_provider", &self.media_provider.is_some())
            .field("moderation_port", &self.moderation_port.is_some())
            .field("search_projection", &self.search_projection.is_some())
            .finish()
    }
}

impl<R> ListingService<R> {
    pub fn new(repository: R) -> Self {
        Self {
            repository,
            platform_provider: None,
            media_provider: None,
            moderation_port: None,
            search_projection: None,
        }
    }

    pub fn with_platform_provider(
        mut self,
        provider: std::sync::Arc<dyn crate::ports::provider::ListingProviderPort>,
    ) -> Self {
        self.platform_provider = Some(provider);
        self
    }

    pub fn with_media_provider(
        mut self,
        provider: std::sync::Arc<dyn crate::ports::provider::ListingProviderPort>,
    ) -> Self {
        self.media_provider = Some(provider);
        self
    }

    pub fn with_moderation_port(
        mut self,
        port: std::sync::Arc<dyn crate::ports::moderation::SubmissionModerationPort>,
    ) -> Self {
        self.moderation_port = Some(port);
        self
    }

    pub fn with_search_projection(
        mut self,
        port: std::sync::Arc<dyn crate::ports::search_projection::ListingSearchProjectionPort>,
    ) -> Self {
        self.search_projection = Some(port);
        self
    }
}

impl<R> ListingService<R>
where
    R: ListingRepositoryPort,
{
    async fn project_search_upsert(&self, context: &AppstoreRequestContext, listing: &Listing) {
        let Some(projection) = &self.search_projection else {
            return;
        };
        let localization = match self
            .repository
            .find_localization(context, &listing.id, &listing.default_locale)
            .await
        {
            Ok(value) => value,
            Err(error) => {
                tracing::warn!(
                    listing_id = %listing.id.as_str(),
                    "search index projection localization lookup failed: {error}"
                );
                return;
            }
        };
        let title = localization
            .as_ref()
            .map(|value| value.display_name.clone())
            .filter(|value| !value.trim().is_empty())
            .unwrap_or_else(|| listing.listing_slug.clone());
        let description = localization
            .as_ref()
            .map(|value| value.short_description.clone())
            .unwrap_or_default();
        let document =
            crate::ports::search_projection::PublishedListingSearchDocument::from_listing(
                listing,
                title,
                description,
            );
        if let Err(error) = projection.upsert_published_listing(&document).await {
            tracing::warn!(
                listing_id = %listing.id.as_str(),
                "search index projection failed: {error}"
            );
        }
    }

    async fn project_search_remove(&self, listing: &Listing) {
        let Some(projection) = &self.search_projection else {
            return;
        };
        if let Err(error) = projection
            .remove_listing(&listing.tenant_id, listing.id.as_str())
            .await
        {
            tracing::warn!(
                listing_id = %listing.id.as_str(),
                "search index removal failed: {error}"
            );
        }
    }

    fn listing_is_search_indexed(listing: &Listing) -> bool {
        listing.listing_status == ListingStatus::Active
            && listing.published_at.is_some()
            && listing.storefront_visibility != StorefrontVisibility::Hidden
    }

    fn require_scope(
        context: &AppstoreRequestContext,
        required: &str,
    ) -> AppstoreServiceResult<()> {
        if sdkwork_appstore_authorization::scope_granted(&context.permission_scopes, required) {
            Ok(())
        } else {
            Err(AppstoreServiceError::PermissionDenied(
                sdkwork_appstore_authorization::missing_scope_message(required),
            ))
        }
    }

    fn require_user_id(context: &AppstoreRequestContext) -> AppstoreServiceResult<String> {
        let user_id = context.user_id.trim();
        if user_id.is_empty() || user_id == "system" {
            return Err(AppstoreServiceError::PermissionDenied(
                "Authenticated user is required".to_string(),
            ));
        }
        Ok(user_id.to_string())
    }

    fn listing_is_visible_to_public(listing: &Listing) -> bool {
        listing.is_visible()
    }

    /// Requires the caller to be the publisher owner or an accepted member.
    async fn ensure_publisher_access(
        &self,
        context: &AppstoreRequestContext,
        publisher_id: &str,
    ) -> AppstoreServiceResult<()> {
        let user_id = Self::require_user_id(context)?;
        let role = self
            .repository
            .find_publisher_member_role(context, publisher_id, &user_id)
            .await?;
        if role.is_none() {
            return Err(AppstoreServiceError::PermissionDenied(
                "Publisher membership is required".to_string(),
            ));
        }
        Ok(())
    }

    /// Requires the caller to own the listing's publisher or hold an admin scope.
    async fn ensure_listing_publisher_access(
        &self,
        context: &AppstoreRequestContext,
        listing: &Listing,
    ) -> AppstoreServiceResult<()> {
        if Self::require_scope(context, "appstore.listings.admin").is_ok() {
            return Ok(());
        }
        self.ensure_publisher_access(context, &listing.publisher_id)
            .await
    }

    /// Listing detail read gate: public listings are readable by everyone;
    /// non-public listings only by the owning publisher or admins.
    async fn ensure_listing_read_access(
        &self,
        context: &AppstoreRequestContext,
        listing: &Listing,
    ) -> AppstoreServiceResult<()> {
        if Self::listing_is_visible_to_public(listing) {
            return Ok(());
        }
        self.ensure_listing_publisher_access(context, listing).await
    }
}

#[async_trait::async_trait]
impl<R> ListingOperations for ListingService<R>
where
    R: ListingRepositoryPort,
{
    async fn retrieve_listing(
        &self,
        context: &AppstoreRequestContext,
        request: RetrieveListingRequest,
    ) -> AppstoreServiceResult<RetrieveListingResult> {
        let listing_id = ListingId::new(&request.listing_id);

        let listing = self
            .repository
            .find_listing_by_id(context, &listing_id)
            .await?;

        match listing {
            Some(listing) => {
                self.ensure_listing_read_access(context, &listing).await?;
                Ok(RetrieveListingResult::found(
                    "appstore.listings.retrieve",
                    listing,
                ))
            }
            None => Ok(RetrieveListingResult::not_found(
                "appstore.listings.retrieve",
            )),
        }
    }

    async fn create_listing(
        &self,
        context: &AppstoreRequestContext,
        request: CreateListingRequest,
    ) -> AppstoreServiceResult<CreateListingResult> {
        Self::require_scope(context, "appstore.listings.write")?;
        if request.publisher_id.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "publisher_id is required".to_string(),
            ));
        }
        self.ensure_publisher_access(context, &request.publisher_id)
            .await?;
        if request.app_id.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "app_id is required".to_string(),
            ));
        }
        if request.app_key.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "app_key is required".to_string(),
            ));
        }
        if request.default_locale.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "default_locale is required".to_string(),
            ));
        }

        let app_id = request.app_id.trim();
        let app_key = request.app_key.trim();

        if let Some(provider) = &self.platform_provider {
            let reference = provider
                .resolve_app(&context.tenant_id, app_id)
                .await
                .map_err(AppstoreServiceError::ValidationFailed)?;
            validate_app_binding(&reference, app_id, app_key)?;
        }

        let existing = self
            .repository
            .find_listing_by_app_id(context, &request.app_id)
            .await?;
        if existing.is_some() {
            return Err(AppstoreServiceError::AlreadyExists(
                "Listing already exists for this app_id".to_string(),
            ));
        }

        let now = Utc::now();
        let listing_id = ListingId::new(Uuid::new_v4().to_string());
        let listing_no = format!(
            "LST-{}",
            Uuid::new_v4()
                .to_string()
                .split('-')
                .next()
                .unwrap_or_default()
        );

        let listing_slug = request
            .listing_slug
            .unwrap_or_else(|| format!("listing-{}", &listing_id.as_str()[..8]));

        let pricing_model = request
            .pricing_model
            .and_then(|p| PricingModel::from_str(&p))
            .unwrap_or(PricingModel::Free);

        let listing = Listing {
            id: listing_id,
            tenant_id: context.tenant_id.clone(),
            organization_id: context.organization_id.clone(),
            publisher_id: request.publisher_id,
            listing_no,
            app_id: request.app_id,
            app_key: request.app_key,
            listing_slug,
            listing_type: ListingType::App,
            pricing_model,
            listing_status: ListingStatus::Draft,
            storefront_visibility: StorefrontVisibility::Hidden,
            review_status: ReviewStatus::NotSubmitted,
            primary_category_id: None,
            default_locale: request.default_locale,
            age_rating_code: None,
            content_rating_json: serde_json::Value::Object(serde_json::Map::new()),
            official_website_url: None,
            support_url: None,
            privacy_policy_url: None,
            comments_thread_id: None,
            commerce_product_id: None,
            current_release_id: None,
            featured_score: 0,
            download_count: 0,
            average_rating: None,
            rating_count: 0,
            version: 1,
            submitted_at: None,
            published_at: None,
            delisted_at: None,
            deleted_at: None,
            created_at: now,
            updated_at: now,
        };

        self.repository.insert_listing(context, &listing).await?;

        Ok(CreateListingResult::created(
            "appstore.listings.create",
            listing,
        ))
    }

    async fn bootstrap_publisher_app(
        &self,
        context: &AppstoreRequestContext,
        request: BootstrapPublisherAppRequest,
    ) -> AppstoreServiceResult<BootstrapPublisherAppResult> {
        Self::require_scope(context, "appstore.listings.write")?;
        let app_key = request.app_key.trim();
        let display_name = request.display_name.trim();
        let default_locale = request.default_locale.trim();
        let publisher_id = request.publisher_id.trim();

        if publisher_id.is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "publisher_id is required".to_string(),
            ));
        }
        self.ensure_publisher_access(context, publisher_id).await?;
        if !is_valid_app_key(app_key) {
            return Err(AppstoreServiceError::ValidationFailed(
                "app_key must be lower-kebab-case".to_string(),
            ));
        }
        if display_name.is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "display_name is required".to_string(),
            ));
        }
        if default_locale.is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "default_locale is required".to_string(),
            ));
        }

        if self
            .repository
            .find_app_by_key(context, app_key)
            .await?
            .is_some()
        {
            return Err(AppstoreServiceError::AlreadyExists(
                "app_key already exists".to_string(),
            ));
        }

        let now = Utc::now();
        let app_id = Uuid::new_v4().to_string();
        let listing_id = ListingId::new(Uuid::new_v4().to_string());
        let app_no = format!(
            "APP-{}",
            Uuid::new_v4()
                .to_string()
                .split('-')
                .next()
                .unwrap_or_default()
        );
        let listing_no = format!(
            "LST-{}",
            Uuid::new_v4()
                .to_string()
                .split('-')
                .next()
                .unwrap_or_default()
        );
        let listing_slug = request.listing_slug.unwrap_or_else(|| app_key.to_string());
        let app_type = request.app_type.unwrap_or_else(|| "APP_REACT".to_string());
        let pricing_model = request
            .pricing_model
            .and_then(|p| PricingModel::from_str(&p))
            .unwrap_or(PricingModel::Free);

        let app = StoreApp {
            id: app_id.clone(),
            tenant_id: context.tenant_id.clone(),
            organization_id: context.organization_id.clone(),
            publisher_id: publisher_id.to_string(),
            app_no,
            app_key: app_key.to_string(),
            app_slug: app_key.to_string(),
            display_name: display_name.to_string(),
            default_locale: default_locale.to_string(),
            app_type,
            app_status: "draft".to_string(),
            distribution_status: "internal".to_string(),
            review_status: "not_submitted".to_string(),
            current_listing_id: Some(listing_id.as_str().to_string()),
            created_at: now,
            updated_at: now,
        };

        let listing = Listing {
            id: listing_id,
            tenant_id: context.tenant_id.clone(),
            organization_id: context.organization_id.clone(),
            publisher_id: publisher_id.to_string(),
            listing_no,
            app_id,
            app_key: app_key.to_string(),
            listing_slug,
            listing_type: ListingType::App,
            pricing_model,
            listing_status: ListingStatus::Draft,
            storefront_visibility: StorefrontVisibility::Hidden,
            review_status: ReviewStatus::NotSubmitted,
            primary_category_id: None,
            default_locale: default_locale.to_string(),
            age_rating_code: None,
            content_rating_json: serde_json::Value::Object(serde_json::Map::new()),
            official_website_url: None,
            support_url: None,
            privacy_policy_url: None,
            comments_thread_id: None,
            commerce_product_id: None,
            current_release_id: None,
            featured_score: 0,
            download_count: 0,
            average_rating: None,
            rating_count: 0,
            version: 1,
            submitted_at: None,
            published_at: None,
            delisted_at: None,
            deleted_at: None,
            created_at: now,
            updated_at: now,
        };

        self.repository
            .bootstrap_app_and_listing(context, &app, &listing)
            .await?;

        Ok(BootstrapPublisherAppResult::created(
            "appstore.publishers.me.apps.create",
            app,
            listing,
        ))
    }

    async fn update_listing(
        &self,
        context: &AppstoreRequestContext,
        request: UpdateListingRequest,
    ) -> AppstoreServiceResult<UpdateListingResult> {
        Self::require_scope(context, "appstore.listings.write")?;
        let listing_id = ListingId::new(&request.listing_id);

        let mut listing = self
            .repository
            .find_listing_by_id(context, &listing_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!("Listing not found: {}", request.listing_id))
            })?;
        self.ensure_listing_publisher_access(context, &listing)
            .await?;

        if !listing.can_update() {
            return Err(AppstoreServiceError::InvalidState(
                "Listing cannot be updated in current state".to_string(),
            ));
        }

        let mut updated_fields = Vec::new();

        if let Some(pricing_model) = request.pricing_model {
            let model = PricingModel::from_str(&pricing_model).ok_or_else(|| {
                AppstoreServiceError::ValidationFailed(format!(
                    "Invalid pricing model: {}",
                    pricing_model
                ))
            })?;
            listing.pricing_model = model;
            updated_fields.push("pricing_model".to_string());
        }

        if let Some(url) = request.official_website_url {
            listing.official_website_url = Some(url);
            updated_fields.push("official_website_url".to_string());
        }

        if let Some(url) = request.support_url {
            listing.support_url = Some(url);
            updated_fields.push("support_url".to_string());
        }

        if let Some(url) = request.privacy_policy_url {
            listing.privacy_policy_url = Some(url);
            updated_fields.push("privacy_policy_url".to_string());
        }

        if updated_fields.is_empty() {
            return Ok(UpdateListingResult::updated(
                "appstore.listings.update",
                listing,
            ));
        }

        listing.version += 1;
        listing.updated_at = Utc::now();

        self.repository.update_listing(context, &listing).await?;

        Ok(UpdateListingResult::updated(
            "appstore.listings.update",
            listing,
        ))
    }

    async fn upsert_localization(
        &self,
        context: &AppstoreRequestContext,
        request: UpsertListingLocalizationRequest,
    ) -> AppstoreServiceResult<UpsertListingLocalizationResult> {
        Self::require_scope(context, "appstore.listings.write")?;
        let listing_id = ListingId::new(&request.listing_id);

        let listing = self
            .repository
            .find_listing_by_id(context, &listing_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!("Listing not found: {}", request.listing_id))
            })?;
        self.ensure_listing_publisher_access(context, &listing)
            .await?;

        if !listing.can_update() {
            return Err(AppstoreServiceError::InvalidState(
                "Listing cannot be updated in current state".to_string(),
            ));
        }

        if request.display_name.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "display_name is required".to_string(),
            ));
        }
        if request.short_description.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "short_description is required".to_string(),
            ));
        }
        if request.full_description.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "full_description is required".to_string(),
            ));
        }

        let now = Utc::now();
        let existing = self
            .repository
            .find_localization(context, &listing_id, &request.locale)
            .await?;

        let keywords_json = match request.keywords {
            Some(keywords) => serde_json::to_value(keywords).unwrap_or_default(),
            None => serde_json::Value::Array(vec![]),
        };

        let localization = ListingLocalization {
            id: existing
                .as_ref()
                .map(|l| l.id.clone())
                .unwrap_or_else(|| Uuid::new_v4().to_string()),
            tenant_id: context.tenant_id.clone(),
            organization_id: context.organization_id.clone(),
            listing_id: listing_id.clone(),
            locale: request.locale,
            display_name: request.display_name,
            subtitle: request.subtitle,
            short_description: request.short_description,
            full_description: request.full_description,
            whats_new_summary: request.whats_new_summary,
            keywords_json,
            created_at: existing.as_ref().map(|l| l.created_at).unwrap_or(now),
            updated_at: now,
        };

        self.repository
            .upsert_localization(context, &localization)
            .await?;

        Ok(UpsertListingLocalizationResult::upserted(
            "appstore.listings.localization.update",
            localization,
        ))
    }

    async fn list_media(
        &self,
        context: &AppstoreRequestContext,
        request: ListListingMediaRequest,
    ) -> AppstoreServiceResult<ListListingMediaResult> {
        let listing_id = ListingId::new(&request.listing_id);

        let listing = self
            .repository
            .find_listing_by_id(context, &listing_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!("Listing not found: {}", request.listing_id))
            })?;
        self.ensure_listing_read_access(context, &listing).await?;

        let media = self
            .repository
            .find_media_by_listing(context, &listing_id)
            .await?;

        Ok(ListListingMediaResult::new(
            "appstore.listings.media.list",
            media,
        ))
    }

    async fn attach_media(
        &self,
        context: &AppstoreRequestContext,
        request: AttachListingMediaRequest,
    ) -> AppstoreServiceResult<AttachListingMediaResult> {
        Self::require_scope(context, "appstore.listings.write")?;
        let listing_id = ListingId::new(&request.listing_id);

        let listing = self
            .repository
            .find_listing_by_id(context, &listing_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!("Listing not found: {}", request.listing_id))
            })?;
        self.ensure_listing_publisher_access(context, &listing)
            .await?;

        if !listing.can_update() {
            return Err(AppstoreServiceError::InvalidState(
                "Listing cannot be updated in current state".to_string(),
            ));
        }

        let media_role = MediaRole::from_str(&request.media_role).ok_or_else(|| {
            AppstoreServiceError::ValidationFailed(format!(
                "Invalid media role: {}",
                request.media_role
            ))
        })?;

        if request.media_resource_id.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "media_resource_id is required".to_string(),
            ));
        }

        let media_resource_id = request.media_resource_id.trim().to_string();
        let drive_node_id = if let Some(provider) = &self.media_provider {
            Some(
                provider
                    .resolve_media_resource(&context.tenant_id, &media_resource_id)
                    .await
                    .map_err(AppstoreServiceError::ValidationFailed)?
                    .drive_node_id,
            )
        } else {
            None
        };

        let now = Utc::now();
        let media = ListingMedia {
            id: Uuid::new_v4().to_string(),
            tenant_id: context.tenant_id.clone(),
            organization_id: context.organization_id.clone(),
            listing_id,
            media_role,
            media_resource_id,
            drive_node_id,
            platform_scope: request.platform_scope.unwrap_or_else(|| "ALL".to_string()),
            sort_order: 0,
            locale: request.locale,
            created_at: now,
            updated_at: now,
        };

        self.repository.insert_media(context, &media).await?;

        Ok(AttachListingMediaResult::attached(
            "appstore.listings.media.create",
            media,
        ))
    }

    async fn remove_media(
        &self,
        context: &AppstoreRequestContext,
        request: RemoveListingMediaRequest,
    ) -> AppstoreServiceResult<RemoveListingMediaResult> {
        Self::require_scope(context, "appstore.listings.write")?;
        let listing_id = ListingId::new(&request.listing_id);

        let listing = self
            .repository
            .find_listing_by_id(context, &listing_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!("Listing not found: {}", request.listing_id))
            })?;
        self.ensure_listing_publisher_access(context, &listing)
            .await?;

        if !listing.can_update() {
            return Err(AppstoreServiceError::InvalidState(
                "Listing cannot be updated in current state".to_string(),
            ));
        }

        let media = self
            .repository
            .find_media_by_id(context, &request.media_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!("Media not found: {}", request.media_id))
            })?;

        if media.listing_id != listing_id {
            return Err(AppstoreServiceError::PermissionDenied(
                "Media does not belong to this listing".to_string(),
            ));
        }

        self.repository
            .delete_media(context, &request.media_id)
            .await?;

        Ok(RemoveListingMediaResult::removed(
            "appstore.listings.media.delete",
        ))
    }

    async fn bind_categories(
        &self,
        context: &AppstoreRequestContext,
        request: BindListingCategoriesRequest,
    ) -> AppstoreServiceResult<BindListingCategoriesResult> {
        Self::require_scope(context, "appstore.listings.write")?;
        let listing_id = ListingId::new(&request.listing_id);

        let mut listing = self
            .repository
            .find_listing_by_id(context, &listing_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!("Listing not found: {}", request.listing_id))
            })?;
        self.ensure_listing_publisher_access(context, &listing)
            .await?;

        if !listing.can_update() {
            return Err(AppstoreServiceError::InvalidState(
                "Listing cannot be updated in current state".to_string(),
            ));
        }

        if request.category_ids.is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "At least one category is required".to_string(),
            ));
        }

        let primary_id = request
            .primary_category_id
            .or_else(|| request.category_ids.first().cloned());

        let bindings: Vec<ListingCategoryBinding> = request
            .category_ids
            .iter()
            .map(|cat_id| ListingCategoryBinding {
                id: Uuid::new_v4().to_string(),
                tenant_id: context.tenant_id.clone(),
                listing_id: listing_id.clone(),
                category_id: cat_id.clone(),
                is_primary: Some(cat_id.as_str()) == primary_id.as_deref(),
                created_at: Utc::now(),
            })
            .collect();

        self.repository
            .replace_category_bindings(context, &listing_id, &bindings)
            .await?;

        listing.primary_category_id = primary_id;
        listing.version += 1;
        listing.updated_at = Utc::now();
        self.repository.update_listing(context, &listing).await?;

        Ok(BindListingCategoriesResult::bound(
            "appstore.listings.categories.update",
            listing,
            bindings,
        ))
    }

    async fn update_regional_availability(
        &self,
        context: &AppstoreRequestContext,
        request: UpdateRegionalAvailabilityRequest,
    ) -> AppstoreServiceResult<UpdateRegionalAvailabilityResult> {
        Self::require_scope(context, "appstore.listings.write")?;
        let listing_id = ListingId::new(&request.listing_id);

        let listing = self
            .repository
            .find_listing_by_id(context, &listing_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!("Listing not found: {}", request.listing_id))
            })?;
        self.ensure_listing_publisher_access(context, &listing)
            .await?;

        if request.regions.is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "At least one region is required".to_string(),
            ));
        }

        let now = Utc::now();
        let availabilities: Vec<RegionalAvailability> = request
            .regions
            .iter()
            .map(|region| RegionalAvailability {
                id: Uuid::new_v4().to_string(),
                tenant_id: context.tenant_id.clone(),
                organization_id: context.organization_id.clone(),
                listing_id: listing_id.clone(),
                region_code: region.region_code.clone(),
                availability_status: region.availability_status.clone(),
                effective_at: now,
                expires_at: None,
                created_at: now,
                updated_at: now,
            })
            .collect();

        self.repository
            .replace_regional_availability(context, &listing_id, &availabilities)
            .await?;

        Ok(UpdateRegionalAvailabilityResult::updated(
            "appstore.listings.regions.update",
            availabilities,
        ))
    }

    async fn list_releases(
        &self,
        context: &AppstoreRequestContext,
        request: ListListingReleasesRequest,
    ) -> AppstoreServiceResult<ListListingReleasesResult> {
        let listing_id = ListingId::new(&request.listing_id);

        let listing = self
            .repository
            .find_listing_by_id(context, &listing_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!("Listing not found: {}", request.listing_id))
            })?;
        self.ensure_listing_read_access(context, &listing).await?;

        let limit = request.page_size.unwrap_or(20).clamp(1, 200);
        let releases = self
            .repository
            .find_releases_by_listing(context, &listing_id, request.cursor.as_deref(), limit + 1)
            .await?;

        let has_more = releases.len() > limit as usize;
        let releases: Vec<serde_json::Value> = releases.into_iter().take(limit as usize).collect();
        let next_cursor = if has_more {
            releases
                .last()
                .and_then(|r| r.get("id").and_then(|v| v.as_str()).map(|s| s.to_string()))
        } else {
            None
        };

        Ok(ListListingReleasesResult::new(
            "appstore.listings.releases.list",
            releases,
            next_cursor,
            has_more,
        ))
    }

    async fn list_publisher_listings(
        &self,
        context: &AppstoreRequestContext,
        request: ListPublisherListingsRequest,
    ) -> AppstoreServiceResult<ListPublisherListingsResult> {
        if request.publisher_id.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "publisher_id is required".to_string(),
            ));
        }
        if Self::require_scope(context, "appstore.listings.admin").is_err() {
            self.ensure_publisher_access(context, request.publisher_id.trim())
                .await?;
        }

        let limit = request.page_size.unwrap_or(20).clamp(1, 200);
        let listings = self
            .repository
            .find_listings_by_publisher(
                context,
                request.publisher_id.trim(),
                request.cursor.as_deref(),
                limit + 1,
            )
            .await?;

        let has_more = listings.len() > limit as usize;
        let listings: Vec<Listing> = listings.into_iter().take(limit as usize).collect();
        let next_cursor = if has_more {
            listings
                .last()
                .map(|listing| listing.id.as_str().to_string())
        } else {
            None
        };

        Ok(ListPublisherListingsResult::new(
            "appstore.publishers.me.listings.list",
            listings,
            next_cursor,
            has_more,
        ))
    }

    async fn create_submission(
        &self,
        context: &AppstoreRequestContext,
        request: CreateListingSubmissionRequest,
    ) -> AppstoreServiceResult<CreateListingSubmissionResult> {
        Self::require_scope(context, "appstore.listings.write")?;
        let listing_id = ListingId::new(&request.listing_id);

        let listing = self
            .repository
            .find_listing_by_id(context, &listing_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!("Listing not found: {}", request.listing_id))
            })?;
        self.ensure_listing_publisher_access(context, &listing)
            .await?;

        if !listing.can_submit() {
            return Err(AppstoreServiceError::InvalidState(
                "Listing cannot be submitted in current state".to_string(),
            ));
        }

        let submission_type =
            SubmissionType::from_str(&request.submission_type).ok_or_else(|| {
                AppstoreServiceError::ValidationFailed(format!(
                    "Invalid submission type: {}",
                    request.submission_type
                ))
            })?;

        let existing_submissions = self
            .repository
            .find_submissions_by_listing(context, &listing_id)
            .await?;

        let has_pending = existing_submissions.iter().any(|s| {
            matches!(
                s.submission_status,
                SubmissionStatus::Submitted | SubmissionStatus::UnderReview
            )
        });
        if has_pending {
            return Err(AppstoreServiceError::Conflict(
                "A submission is already pending for this listing".to_string(),
            ));
        }

        let now = Utc::now();
        let submission_id = Uuid::new_v4().to_string();
        let submission_no = format!(
            "SUB-{}",
            Uuid::new_v4()
                .to_string()
                .split('-')
                .next()
                .unwrap_or_default()
        );

        let idempotency_key = request
            .idempotency_key
            .unwrap_or_else(|| Uuid::new_v4().to_string());

        let submission = ListingSubmission {
            id: submission_id,
            tenant_id: context.tenant_id.clone(),
            organization_id: context.organization_id.clone(),
            listing_id: listing_id.clone(),
            release_id: request.release_id,
            submission_no,
            submission_type,
            submission_status: SubmissionStatus::Submitted,
            submitted_by: context.user_id.clone(),
            submitted_at: now,
            payload_snapshot_json: serde_json::Value::Object(serde_json::Map::new()),
            idempotency_key,
            created_at: now,
            updated_at: now,
        };

        self.repository
            .insert_submission(context, &submission)
            .await?;

        let mut updated_listing = listing;
        updated_listing.review_status = ReviewStatus::Pending;
        updated_listing.updated_at = now;
        self.repository
            .update_listing(context, &updated_listing)
            .await?;

        if let Some(port) = &self.moderation_port {
            port.enqueue_submission_review(context, &submission).await?;
        }

        Ok(CreateListingSubmissionResult::created(
            "appstore.listings.submissions.create",
            submission,
        ))
    }

    async fn apply_moderation_decision(
        &self,
        context: &AppstoreRequestContext,
        request: ApplyModerationDecisionRequest,
    ) -> AppstoreServiceResult<ApplyModerationDecisionResult> {
        // Internal decision projection: only moderation-decide scopes or the
        // trusted system caller may apply a decision onto the listing aggregate.
        if context.user_id != "system"
            && Self::require_scope(context, "appstore.moderation.decide").is_err()
            && Self::require_scope(context, "appstore.listings.admin").is_err()
        {
            return Err(AppstoreServiceError::PermissionDenied(
                "Moderation decision scope is required".to_string(),
            ));
        }
        let mut submission = self
            .repository
            .find_submission_by_id(context, &request.submission_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Submission not found: {}",
                    request.submission_id
                ))
            })?;

        let listing_id = submission.listing_id.clone();
        let mut listing = self
            .repository
            .find_listing_by_id(context, &listing_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Listing not found: {}",
                    listing_id.as_str()
                ))
            })?;

        let now = Utc::now();
        match request.decision_type.to_ascii_uppercase().as_str() {
            "APPROVE" => {
                submission.submission_status = SubmissionStatus::Approved;
                listing.review_status = ReviewStatus::Approved;
                listing.listing_status = ListingStatus::Active;
                if listing.storefront_visibility == StorefrontVisibility::Hidden {
                    listing.storefront_visibility = StorefrontVisibility::Visible;
                }
                listing.published_at = Some(now);
                if let Some(release_id) = submission.release_id.clone() {
                    listing.current_release_id = Some(release_id);
                }
            }
            "REJECT" => {
                submission.submission_status = SubmissionStatus::Rejected;
                listing.review_status = ReviewStatus::Rejected;
            }
            "REQUEST_CHANGES" => {
                submission.submission_status = SubmissionStatus::Rejected;
                listing.review_status = ReviewStatus::NotSubmitted;
            }
            other => {
                return Err(AppstoreServiceError::ValidationFailed(format!(
                    "Invalid moderation decision type: {other}"
                )));
            }
        }

        submission.updated_at = now;
        listing.updated_at = now;

        self.repository
            .update_submission(context, &submission)
            .await?;
        self.repository.update_listing(context, &listing).await?;

        if request.decision_type.eq_ignore_ascii_case("APPROVE") {
            self.project_search_upsert(context, &listing).await;
        }

        Ok(ApplyModerationDecisionResult::applied(
            "appstore.listings.moderation.apply",
            listing,
            submission,
        ))
    }

    async fn admin_list_listings(
        &self,
        context: &AppstoreRequestContext,
        request: AdminListListingsRequest,
    ) -> AppstoreServiceResult<AdminListListingsResult> {
        Self::require_scope(context, "appstore.listings.admin")?;
        let limit = request.page_size.unwrap_or(20).clamp(1, 200);
        let listings = self
            .repository
            .admin_list_listings(
                context,
                request.status_filter.as_deref(),
                request.review_status_filter.as_deref(),
                request.publisher_id.as_deref(),
                request.cursor.as_deref(),
                limit + 1,
            )
            .await?;

        let has_more = listings.len() > limit as usize;
        let listings: Vec<Listing> = listings.into_iter().take(limit as usize).collect();
        let next_cursor = if has_more {
            listings.last().map(|l| l.id.0.clone())
        } else {
            None
        };

        Ok(AdminListListingsResult::new(
            "appstore.listings.admin.list",
            listings,
            next_cursor,
            has_more,
        ))
    }

    async fn admin_retrieve_listing(
        &self,
        context: &AppstoreRequestContext,
        request: AdminRetrieveListingRequest,
    ) -> AppstoreServiceResult<AdminRetrieveListingResult> {
        Self::require_scope(context, "appstore.listings.admin")?;
        let listing_id = ListingId::new(&request.listing_id);

        let listing = self
            .repository
            .find_listing_by_id(context, &listing_id)
            .await?;

        match listing {
            Some(listing) => Ok(AdminRetrieveListingResult::found(
                "appstore.listings.admin.retrieve",
                listing,
            )),
            None => Ok(AdminRetrieveListingResult::not_found(
                "appstore.listings.admin.retrieve",
            )),
        }
    }

    async fn admin_update_visibility(
        &self,
        context: &AppstoreRequestContext,
        request: AdminUpdateListingVisibilityRequest,
    ) -> AppstoreServiceResult<AdminUpdateListingVisibilityResult> {
        Self::require_scope(context, "appstore.listings.admin")?;
        let listing_id = ListingId::new(&request.listing_id);

        let mut listing = self
            .repository
            .find_listing_by_id(context, &listing_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!("Listing not found: {}", request.listing_id))
            })?;

        if listing.deleted_at.is_some() {
            return Err(AppstoreServiceError::InvalidState(
                "Cannot update visibility of a deleted listing".to_string(),
            ));
        }

        let new_visibility = StorefrontVisibility::from_str(&request.storefront_visibility)
            .ok_or_else(|| {
                AppstoreServiceError::ValidationFailed(format!(
                    "Invalid storefront visibility: {}",
                    request.storefront_visibility
                ))
            })?;

        let was_indexed = Self::listing_is_search_indexed(&listing);
        listing.storefront_visibility = new_visibility;
        listing.version += 1;
        listing.updated_at = Utc::now();

        self.repository.update_listing(context, &listing).await?;

        if was_indexed && listing.storefront_visibility == StorefrontVisibility::Hidden {
            self.project_search_remove(&listing).await;
        }

        Ok(AdminUpdateListingVisibilityResult::updated(
            "appstore.listings.admin.visibility.update",
            listing,
        ))
    }

    async fn public_retrieve_listing(
        &self,
        context: &AppstoreRequestContext,
        request: PublicRetrieveListingRequest,
    ) -> AppstoreServiceResult<PublicRetrieveListingResult> {
        let listing = self
            .repository
            .find_listing_by_slug(context, &context.tenant_id, &request.listing_slug)
            .await?;

        match listing {
            Some(listing) if listing.is_visible() => Ok(PublicRetrieveListingResult::found(
                "appstore.listings.public.retrieve",
                listing,
            )),
            _ => Ok(PublicRetrieveListingResult::not_found(
                "appstore.listings.public.retrieve",
            )),
        }
    }

    async fn list_release_history(
        &self,
        context: &AppstoreRequestContext,
        request: ListListingReleaseHistoryRequest,
    ) -> AppstoreServiceResult<ListListingReleaseHistoryResult> {
        let listing_id = ListingId::new(&request.listing_id);

        let listing = self
            .repository
            .find_listing_by_id(context, &listing_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!("Listing not found: {}", request.listing_id))
            })?;
        self.ensure_listing_read_access(context, &listing).await?;

        let limit = request.page_size.unwrap_or(20).clamp(1, 200);
        let releases = self
            .repository
            .find_release_history_by_listing(
                context,
                &listing_id,
                request.cursor.as_deref(),
                limit + 1,
            )
            .await?;

        let has_more = releases.len() > limit as usize;
        let releases: Vec<serde_json::Value> = releases.into_iter().take(limit as usize).collect();
        let next_cursor = if has_more {
            releases
                .last()
                .and_then(|r| r.get("id").and_then(|v| v.as_str()).map(|s| s.to_string()))
        } else {
            None
        };

        Ok(ListListingReleaseHistoryResult::new(
            "appstore.listings.releases.history.list",
            releases,
            next_cursor,
            has_more,
        ))
    }

    async fn list_similar_listings(
        &self,
        context: &AppstoreRequestContext,
        request: ListSimilarListingsRequest,
    ) -> AppstoreServiceResult<ListSimilarListingsResult> {
        let listing_id = ListingId::new(&request.listing_id);

        let listing = self
            .repository
            .find_listing_by_id(context, &listing_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!("Listing not found: {}", request.listing_id))
            })?;

        let primary_category_id = listing.primary_category_id.as_deref().ok_or_else(|| {
            AppstoreServiceError::ValidationFailed(
                "Listing has no primary category for similarity lookup".to_string(),
            )
        })?;

        let limit = request.page_size.unwrap_or(20).clamp(1, 200);
        let listings = self
            .repository
            .find_similar_listings(
                context,
                &listing_id,
                primary_category_id,
                request.cursor.as_deref(),
                limit + 1,
            )
            .await?;

        let has_more = listings.len() > limit as usize;
        let listings: Vec<Listing> = listings.into_iter().take(limit as usize).collect();
        let next_cursor = if has_more {
            listings.last().map(|l| l.id.as_str().to_string())
        } else {
            None
        };

        Ok(ListSimilarListingsResult::new(
            "appstore.listings.similar.list",
            listings,
            next_cursor,
            has_more,
        ))
    }

    async fn list_developer_other_listings(
        &self,
        context: &AppstoreRequestContext,
        request: ListDeveloperOtherListingsRequest,
    ) -> AppstoreServiceResult<ListDeveloperOtherListingsResult> {
        let listing_id = ListingId::new(&request.listing_id);

        let listing = self
            .repository
            .find_listing_by_id(context, &listing_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!("Listing not found: {}", request.listing_id))
            })?;

        let limit = request.page_size.unwrap_or(20).clamp(1, 200);
        let listings = self
            .repository
            .find_developer_other_listings(
                context,
                &listing_id,
                listing.publisher_id.as_str(),
                request.cursor.as_deref(),
                limit + 1,
            )
            .await?;

        let has_more = listings.len() > limit as usize;
        let listings: Vec<Listing> = listings.into_iter().take(limit as usize).collect();
        let next_cursor = if has_more {
            listings.last().map(|l| l.id.as_str().to_string())
        } else {
            None
        };

        Ok(ListDeveloperOtherListingsResult::new(
            "appstore.listings.developerOther.list",
            listings,
            next_cursor,
            has_more,
        ))
    }

    async fn retrieve_listing_editorial(
        &self,
        context: &AppstoreRequestContext,
        request: RetrieveListingEditorialRequest,
    ) -> AppstoreServiceResult<RetrieveListingEditorialResult> {
        let listing_id = ListingId::new(&request.listing_id);

        let listing = self
            .repository
            .find_listing_by_id(context, &listing_id)
            .await?;

        match listing {
            Some(listing) => {
                let (editorial_highlight, collection_editorial_note) = self
                    .repository
                    .find_listing_editorial(context, &listing_id, &listing.default_locale)
                    .await?;

                Ok(RetrieveListingEditorialResult::found(
                    "appstore.listings.editorial.retrieve",
                    ListingEditorialContent {
                        editorial_highlight,
                        collection_editorial_note,
                    },
                ))
            }
            None => Ok(RetrieveListingEditorialResult::not_found(
                "appstore.listings.editorial.retrieve",
            )),
        }
    }

    async fn ratings_list(
        &self,
        context: &AppstoreRequestContext,
        request: RatingsListRequest,
    ) -> AppstoreServiceResult<RatingsListResult> {
        let listing_id = ListingId::new(&request.listing_id);
        let limit = request.page_size.unwrap_or(20).clamp(1, 200);
        let ratings = self
            .repository
            .find_ratings(context, &listing_id, request.cursor.as_deref(), limit + 1)
            .await?;

        let has_more = ratings.len() > limit as usize;
        let ratings: Vec<ListingRating> = ratings.into_iter().take(limit as usize).collect();
        let next_cursor = if has_more {
            ratings.last().map(|rating| rating.id.clone())
        } else {
            None
        };

        Ok(RatingsListResult::new(
            "appstore.listings.ratings.list",
            ratings,
            next_cursor,
            has_more,
        ))
    }

    async fn rating_update(
        &self,
        context: &AppstoreRequestContext,
        request: RatingUpdateRequest,
    ) -> AppstoreServiceResult<RatingUpdateResult> {
        if !(1..=5).contains(&request.rating) {
            return Err(AppstoreServiceError::ValidationFailed(
                "Rating must be between 1 and 5".to_string(),
            ));
        }
        let listing_id = ListingId::new(&request.listing_id);
        if context.user_id.trim().is_empty() {
            return Err(AppstoreServiceError::PermissionDenied(
                "Authenticated user is required to rate a listing".to_string(),
            ));
        }
        let user_id = context.user_id.clone();

        let listing = self
            .repository
            .find_listing_by_id(context, &listing_id)
            .await?;
        if listing.is_none() {
            return Err(AppstoreServiceError::NotFound(format!(
                "Listing {} not found",
                request.listing_id
            )));
        }

        let now = chrono::Utc::now();
        let rating = ListingRating {
            id: uuid::Uuid::new_v4().to_string(),
            tenant_id: context.tenant_id.clone(),
            organization_id: context.organization_id.clone(),
            listing_id: listing_id.clone(),
            user_id,
            rating: request.rating,
            title: request.title.clone(),
            created_at: now,
            updated_at: now,
        };
        self.repository.upsert_rating(context, &rating).await?;
        self.repository
            .recompute_listing_rating_stats(context, &listing_id)
            .await?;

        Ok(RatingUpdateResult::new(
            "appstore.listings.ratings.update",
            rating,
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ports::provider::AppReference;

    fn sample_reference() -> AppReference {
        AppReference {
            app_id: "app-1".to_string(),
            app_key: "key-1".to_string(),
            display_name: "Sample App".to_string(),
            manifest_snapshot: serde_json::Value::Null,
        }
    }

    #[test]
    fn validate_app_binding_accepts_matching_ids() {
        validate_app_binding(&sample_reference(), "app-1", "key-1").expect("binding ok");
    }

    #[test]
    fn validate_app_binding_rejects_mismatched_key() {
        let error =
            validate_app_binding(&sample_reference(), "app-1", "wrong-key").expect_err("mismatch");
        assert!(matches!(error, AppstoreServiceError::ValidationFailed(_)));
    }
}
