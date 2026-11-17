//! Route registration descriptors for sdkwork-routes-listing-app-api.

pub use sdkwork_appstore_routes_common::RouteDefinition;
use sdkwork_web_core::RouteAuth;

pub const ROUTES: &[RouteDefinition] = &[
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/listings/{listingId}",
        operation_id: "appstore.listings.retrieve",
        auth: RouteAuth::DualToken,
        handler: "listings_retrieve",
        service_method: "listings_retrieve",
    },
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/listings/{listingId}/media",
        operation_id: "appstore.listings.media.list",
        auth: RouteAuth::DualToken,
        handler: "listings_media_list",
        service_method: "listings_media_list",
    },
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/listings/{listingId}/releases",
        operation_id: "appstore.listings.releases.list",
        auth: RouteAuth::DualToken,
        handler: "listings_releases_list",
        service_method: "listings_releases_list",
    },
    RouteDefinition {
        method: "POST",
        path: "/app/v3/api/listings",
        operation_id: "appstore.listings.create",
        auth: RouteAuth::DualToken,
        handler: "listings_create",
        service_method: "listings_create",
    },
    RouteDefinition {
        method: "PATCH",
        path: "/app/v3/api/listings/{listingId}",
        operation_id: "appstore.listings.update",
        auth: RouteAuth::DualToken,
        handler: "listings_update",
        service_method: "listings_update",
    },
    RouteDefinition {
        method: "PUT",
        path: "/app/v3/api/listings/{listingId}/localizations/{locale}",
        operation_id: "appstore.listings.localization.update",
        auth: RouteAuth::DualToken,
        handler: "listings_localization_upsert",
        service_method: "listings_localization_upsert",
    },
    RouteDefinition {
        method: "POST",
        path: "/app/v3/api/listings/{listingId}/media",
        operation_id: "appstore.listings.media.create",
        auth: RouteAuth::DualToken,
        handler: "listings_media_attach",
        service_method: "listings_media_attach",
    },
    RouteDefinition {
        method: "DELETE",
        path: "/app/v3/api/listings/{listingId}/media/{mediaId}",
        operation_id: "appstore.listings.media.delete",
        auth: RouteAuth::DualToken,
        handler: "listings_media_remove",
        service_method: "listings_media_remove",
    },
    RouteDefinition {
        method: "PUT",
        path: "/app/v3/api/listings/{listingId}/categories",
        operation_id: "appstore.listings.categories.update",
        auth: RouteAuth::DualToken,
        handler: "listings_categories_bind",
        service_method: "listings_categories_bind",
    },
    RouteDefinition {
        method: "PUT",
        path: "/app/v3/api/listings/{listingId}/regions",
        operation_id: "appstore.listings.regions.update",
        auth: RouteAuth::DualToken,
        handler: "listings_regions_update",
        service_method: "listings_regions_update",
    },
    RouteDefinition {
        method: "POST",
        path: "/app/v3/api/listings/{listingId}/submissions",
        operation_id: "appstore.listings.submissions.create",
        auth: RouteAuth::DualToken,
        handler: "listings_submissions_create",
        service_method: "listings_submissions_create",
    },
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/listings/{listingId}/releases/history",
        operation_id: "appstore.listings.releases.history.list",
        auth: RouteAuth::DualToken,
        handler: "listings_releases_history_list",
        service_method: "listings_releases_history_list",
    },
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/listings/{listingId}/similar",
        operation_id: "appstore.listings.similar.list",
        auth: RouteAuth::DualToken,
        handler: "listings_similar_list",
        service_method: "listings_similar_list",
    },
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/listings/{listingId}/developer_other",
        operation_id: "appstore.listings.developerOther.list",
        auth: RouteAuth::DualToken,
        handler: "listings_developer_other_list",
        service_method: "listings_developer_other_list",
    },
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/listings/{listingId}/editorial",
        operation_id: "appstore.listings.editorial.retrieve",
        auth: RouteAuth::DualToken,
        handler: "listings_editorial_retrieve",
        service_method: "listings_editorial_retrieve",
    },
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/listings/{listingId}/ratings",
        operation_id: "appstore.listings.ratings.list",
        auth: RouteAuth::DualToken,
        handler: "listings_ratings_list",
        service_method: "listings_ratings_list",
    },
    RouteDefinition {
        method: "PUT",
        path: "/app/v3/api/listings/{listingId}/ratings/me",
        operation_id: "appstore.listings.ratings.update",
        auth: RouteAuth::DualToken,
        handler: "listings_rating_update",
        service_method: "listings_rating_update",
    },
    // Remix reads live under the `appstore` path namespace, next to the catalog
    // reads a storefront product page already uses, because the projection is
    // deploy-owned and is not a listing mutation.
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/appstore/listings/{listingId}/remix",
        operation_id: "appstore.listings.remix.retrieve",
        auth: RouteAuth::DualToken,
        handler: "listings_remix_retrieve",
        service_method: "resolve_listing_remix",
    },
];

pub fn route_definitions() -> &'static [RouteDefinition] {
    ROUTES
}
