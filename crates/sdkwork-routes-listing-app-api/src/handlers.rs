use crate::mapper;
use sdkwork_appstore_listing_service::context::AppstoreRequestContext;
use sdkwork_appstore_listing_service::domain::commands::RegionEntry;
use sdkwork_appstore_listing_service::domain::results::{
    AttachListingMediaResult, BindListingCategoriesResult, CreateListingResult,
    CreateListingSubmissionResult, ListDeveloperOtherListingsResult, ListListingMediaResult,
    ListListingReleaseHistoryResult, ListListingReleasesResult, ListPublisherListingsResult,
    ListSimilarListingsResult, RatingUpdateResult, RatingsListResult, RemoveListingMediaResult,
    RetrieveListingEditorialResult, RetrieveListingResult, UpdateListingResult,
    UpdateRegionalAvailabilityResult, UpsertListingLocalizationResult,
};
use sdkwork_appstore_listing_service::error::AppstoreServiceError;
use sdkwork_appstore_listing_service::ListingOperations;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct RouteHandlerPlan {
    pub operation_id: &'static str,
    pub handler_name: &'static str,
    pub service_method: &'static str,
}

pub const ROUTE_HANDLER_PLANS: &[RouteHandlerPlan] = &[
    RouteHandlerPlan {
        operation_id: "appstore.listings.retrieve",
        handler_name: "listings_retrieve",
        service_method: "retrieve_listing",
    },
    RouteHandlerPlan {
        operation_id: "appstore.listings.media.list",
        handler_name: "listings_media_list",
        service_method: "list_listing_media",
    },
    RouteHandlerPlan {
        operation_id: "appstore.listings.releases.list",
        handler_name: "listings_releases_list",
        service_method: "list_listing_releases",
    },
    RouteHandlerPlan {
        operation_id: "appstore.listings.create",
        handler_name: "listings_create",
        service_method: "create_listing",
    },
    RouteHandlerPlan {
        operation_id: "appstore.listings.update",
        handler_name: "listings_update",
        service_method: "update_listing",
    },
    RouteHandlerPlan {
        operation_id: "appstore.listings.localization.update",
        handler_name: "listings_localization_upsert",
        service_method: "upsert_listing_localization",
    },
    RouteHandlerPlan {
        operation_id: "appstore.listings.media.create",
        handler_name: "listings_media_attach",
        service_method: "attach_listing_media",
    },
    RouteHandlerPlan {
        operation_id: "appstore.listings.media.delete",
        handler_name: "listings_media_remove",
        service_method: "remove_listing_media",
    },
    RouteHandlerPlan {
        operation_id: "appstore.listings.categories.update",
        handler_name: "listings_categories_bind",
        service_method: "bind_listing_categories",
    },
    RouteHandlerPlan {
        operation_id: "appstore.listings.regions.update",
        handler_name: "listings_regions_update",
        service_method: "update_regional_availability",
    },
    RouteHandlerPlan {
        operation_id: "appstore.listings.submissions.create",
        handler_name: "listings_submissions_create",
        service_method: "create_listing_submission",
    },
    RouteHandlerPlan {
        operation_id: "appstore.listings.releases.history.list",
        handler_name: "listings_releases_history_list",
        service_method: "list_release_history",
    },
    RouteHandlerPlan {
        operation_id: "appstore.listings.similar.list",
        handler_name: "listings_similar_list",
        service_method: "list_similar_listings",
    },
    RouteHandlerPlan {
        operation_id: "appstore.listings.developerOther.list",
        handler_name: "listings_developer_other_list",
        service_method: "list_developer_other_listings",
    },
    RouteHandlerPlan {
        operation_id: "appstore.listings.editorial.retrieve",
        handler_name: "listings_editorial_retrieve",
        service_method: "retrieve_listing_editorial",
    },
    RouteHandlerPlan {
        operation_id: "appstore.listings.remix.retrieve",
        handler_name: "listings_remix_retrieve",
        service_method: "resolve_listing_remix",
    },
];

pub fn route_handler_plans() -> &'static [RouteHandlerPlan] {
    ROUTE_HANDLER_PLANS
}

pub async fn listings_publisher_list<S: ListingOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    publisher_id: String,
    cursor: Option<String>,
    page_size: Option<i32>,
) -> Result<ListPublisherListingsResult, AppstoreServiceError> {
    let cmd = mapper::request::map_list_publisher_listings(publisher_id, cursor, page_size);
    service.list_publisher_listings(context, cmd).await
}

pub async fn listings_retrieve<S: ListingOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    listing_id: String,
) -> Result<RetrieveListingResult, AppstoreServiceError> {
    let cmd = mapper::request::map_retrieve_listing(listing_id);
    service.retrieve_listing(context, cmd).await
}

pub async fn listings_media_list<S: ListingOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    listing_id: String,
) -> Result<ListListingMediaResult, AppstoreServiceError> {
    let cmd = mapper::request::map_list_listing_media(listing_id);
    service.list_media(context, cmd).await
}

pub async fn listings_releases_list<S: ListingOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    listing_id: String,
    cursor: Option<String>,
    page_size: Option<i32>,
) -> Result<ListListingReleasesResult, AppstoreServiceError> {
    let cmd = mapper::request::map_list_listing_releases(listing_id, cursor, page_size);
    service.list_releases(context, cmd).await
}

pub async fn listings_create<S: ListingOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    app_id: String,
    app_key: String,
    publisher_id: String,
    default_locale: String,
    listing_slug: Option<String>,
    pricing_model: Option<String>,
) -> Result<CreateListingResult, AppstoreServiceError> {
    let cmd = mapper::request::map_create_listing(
        app_id,
        app_key,
        publisher_id,
        default_locale,
        listing_slug,
        pricing_model,
    );
    service.create_listing(context, cmd).await
}

pub async fn listings_update<S: ListingOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    listing_id: String,
    pricing_model: Option<String>,
    official_website_url: Option<String>,
    support_url: Option<String>,
    privacy_policy_url: Option<String>,
) -> Result<UpdateListingResult, AppstoreServiceError> {
    let cmd = mapper::request::map_update_listing(
        listing_id,
        pricing_model,
        official_website_url,
        support_url,
        privacy_policy_url,
    );
    service.update_listing(context, cmd).await
}

pub async fn listings_localization_upsert<S: ListingOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    listing_id: String,
    locale: String,
    display_name: String,
    short_description: String,
    full_description: String,
    subtitle: Option<String>,
    whats_new_summary: Option<String>,
    keywords: Option<Vec<String>>,
) -> Result<UpsertListingLocalizationResult, AppstoreServiceError> {
    let cmd = mapper::request::map_upsert_listing_localization(
        listing_id,
        locale,
        display_name,
        short_description,
        full_description,
        subtitle,
        whats_new_summary,
        keywords,
    );
    service.upsert_localization(context, cmd).await
}

pub async fn listings_media_attach<S: ListingOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    listing_id: String,
    media_role: String,
    media_resource_id: String,
    platform_scope: Option<String>,
    locale: Option<String>,
) -> Result<AttachListingMediaResult, AppstoreServiceError> {
    let cmd = mapper::request::map_attach_listing_media(
        listing_id,
        media_role,
        media_resource_id,
        platform_scope,
        locale,
    );
    service.attach_media(context, cmd).await
}

pub async fn listings_media_remove<S: ListingOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    listing_id: String,
    media_id: String,
) -> Result<RemoveListingMediaResult, AppstoreServiceError> {
    let cmd = mapper::request::map_remove_listing_media(listing_id, media_id);
    service.remove_media(context, cmd).await
}

pub async fn listings_categories_bind<S: ListingOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    listing_id: String,
    category_ids: Vec<String>,
    primary_category_id: Option<String>,
) -> Result<BindListingCategoriesResult, AppstoreServiceError> {
    let cmd =
        mapper::request::map_bind_listing_categories(listing_id, category_ids, primary_category_id);
    service.bind_categories(context, cmd).await
}

pub async fn listings_regions_update<S: ListingOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    listing_id: String,
    regions: Vec<RegionEntry>,
) -> Result<UpdateRegionalAvailabilityResult, AppstoreServiceError> {
    let cmd = mapper::request::map_update_regional_availability(listing_id, regions);
    service.update_regional_availability(context, cmd).await
}

pub async fn listings_submissions_create<S: ListingOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    listing_id: String,
    submission_type: String,
    release_id: Option<String>,
) -> Result<CreateListingSubmissionResult, AppstoreServiceError> {
    let cmd =
        mapper::request::map_create_listing_submission(listing_id, submission_type, release_id);
    service.create_submission(context, cmd).await
}

pub async fn listings_releases_history_list<S: ListingOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    listing_id: String,
    cursor: Option<String>,
    page_size: Option<i32>,
) -> Result<ListListingReleaseHistoryResult, AppstoreServiceError> {
    let cmd = mapper::request::map_list_listing_release_history(listing_id, cursor, page_size);
    service.list_release_history(context, cmd).await
}

pub async fn listings_similar_list<S: ListingOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    listing_id: String,
    cursor: Option<String>,
    page_size: Option<i32>,
) -> Result<ListSimilarListingsResult, AppstoreServiceError> {
    let cmd = mapper::request::map_list_similar_listings(listing_id, cursor, page_size);
    service.list_similar_listings(context, cmd).await
}

pub async fn listings_developer_other_list<S: ListingOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    listing_id: String,
    cursor: Option<String>,
    page_size: Option<i32>,
) -> Result<ListDeveloperOtherListingsResult, AppstoreServiceError> {
    let cmd = mapper::request::map_list_developer_other_listings(listing_id, cursor, page_size);
    service.list_developer_other_listings(context, cmd).await
}

pub async fn listings_editorial_retrieve<S: ListingOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    listing_id: String,
) -> Result<RetrieveListingEditorialResult, AppstoreServiceError> {
    let cmd = mapper::request::map_retrieve_listing_editorial(listing_id);
    service.retrieve_listing_editorial(context, cmd).await
}

pub async fn publishers_me_apps_bootstrap<S: ListingOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    publisher_id: String,
    app_key: String,
    display_name: String,
    default_locale: String,
    app_type: Option<String>,
    listing_slug: Option<String>,
    pricing_model: Option<String>,
) -> Result<
    sdkwork_appstore_listing_service::domain::results::BootstrapPublisherAppResult,
    AppstoreServiceError,
> {
    let mut cmd =
        sdkwork_appstore_listing_service::domain::commands::BootstrapPublisherAppRequest::new(
            publisher_id,
            app_key,
            display_name,
            default_locale,
        );
    cmd.app_type = app_type;
    cmd.listing_slug = listing_slug;
    cmd.pricing_model = pricing_model;
    service.bootstrap_publisher_app(context, cmd).await
}

pub async fn listings_ratings_list<S: ListingOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    listing_id: String,
    cursor: Option<String>,
    page_size: Option<i32>,
) -> Result<RatingsListResult, AppstoreServiceError> {
    let cmd = mapper::request::map_ratings_list(listing_id, cursor, page_size);
    service.ratings_list(context, cmd).await
}

pub async fn listings_rating_update<S: ListingOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    listing_id: String,
    rating: i32,
    title: Option<String>,
) -> Result<RatingUpdateResult, AppstoreServiceError> {
    let cmd = mapper::request::map_rating_update(listing_id, rating, title);
    service.rating_update(context, cmd).await
}
