//! Route composition for catalog app-api.

use crate::paths::{API_AUTHORITY, CAPABILITY, PREFIX, SDK_FAMILY, SURFACE};

pub use sdkwork_appstore_routes_common::RouteDefinition;
use sdkwork_web_core::RouteAuth;

pub const ROUTES: &[RouteDefinition] = &[
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/appstore/catalog/home",
        operation_id: "appstore.catalog.home.retrieve",
        auth: RouteAuth::DualToken,
        handler: "catalog_home_retrieve",
        service_method: "catalog_home_retrieve",
    },
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/appstore/catalog/categories",
        operation_id: "appstore.catalog.categories.list",
        auth: RouteAuth::DualToken,
        handler: "catalog_categories_list",
        service_method: "catalog_categories_list",
    },
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/appstore/catalog/categories/{categoryId}",
        operation_id: "appstore.catalog.categories.retrieve",
        auth: RouteAuth::DualToken,
        handler: "catalog_categories_retrieve",
        service_method: "catalog_categories_retrieve",
    },
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/appstore/catalog/collections",
        operation_id: "appstore.catalog.collections.list",
        auth: RouteAuth::DualToken,
        handler: "catalog_collections_list",
        service_method: "catalog_collections_list",
    },
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/appstore/catalog/collections/{collectionId}",
        operation_id: "appstore.catalog.collections.retrieve",
        auth: RouteAuth::DualToken,
        handler: "catalog_collections_retrieve",
        service_method: "catalog_collections_retrieve",
    },
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/appstore/catalog/featured",
        operation_id: "appstore.catalog.featured.list",
        auth: RouteAuth::DualToken,
        handler: "catalog_featured_list",
        service_method: "catalog_featured_list",
    },
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/appstore/catalog/charts/{chartCode}",
        operation_id: "appstore.catalog.charts.retrieve",
        auth: RouteAuth::DualToken,
        handler: "catalog_charts_retrieve",
        service_method: "catalog_charts_retrieve",
    },
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/appstore/catalog/listings/search",
        operation_id: "appstore.catalog.listings.list",
        auth: RouteAuth::DualToken,
        handler: "catalog_listings_search",
        service_method: "catalog_listings_search",
    },
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/appstore/catalog/recommendations",
        operation_id: "appstore.catalog.recommendations.list",
        auth: RouteAuth::DualToken,
        handler: "catalog_recommendations_list",
        service_method: "catalog_recommendations_list",
    },
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/appstore/catalog/recently_updated",
        operation_id: "appstore.catalog.recentlyUpdated.list",
        auth: RouteAuth::DualToken,
        handler: "catalog_recently_updated_list",
        service_method: "catalog_recently_updated_list",
    },
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/appstore/catalog/events",
        operation_id: "appstore.catalog.events.list",
        auth: RouteAuth::DualToken,
        handler: "catalog_events_list",
        service_method: "catalog_events_list",
    },
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/appstore/catalog/events/{eventId}",
        operation_id: "appstore.catalog.events.retrieve",
        auth: RouteAuth::DualToken,
        handler: "catalog_events_retrieve",
        service_method: "catalog_events_retrieve",
    },
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/appstore/catalog/search/suggestions",
        operation_id: "appstore.catalog.search.suggestions.list",
        auth: RouteAuth::DualToken,
        handler: "catalog_search_suggestions_list",
        service_method: "catalog_search_suggestions_list",
    },
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/appstore/catalog/search/trending",
        operation_id: "appstore.catalog.search.trending.list",
        auth: RouteAuth::DualToken,
        handler: "catalog_search_trending_list",
        service_method: "catalog_search_trending_list",
    },
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/appstore/catalog/search/history",
        operation_id: "appstore.catalog.search.history.list",
        auth: RouteAuth::DualToken,
        handler: "catalog_search_history_list",
        service_method: "catalog_search_history_list",
    },
    RouteDefinition {
        method: "PUT",
        path: "/app/v3/api/appstore/catalog/search/history",
        operation_id: "appstore.catalog.search.history.update",
        auth: RouteAuth::DualToken,
        handler: "catalog_search_history_upsert",
        service_method: "catalog_search_history_upsert",
    },
    RouteDefinition {
        method: "DELETE",
        path: "/app/v3/api/appstore/catalog/search/history",
        operation_id: "appstore.catalog.search.history.delete",
        auth: RouteAuth::DualToken,
        handler: "catalog_search_history_clear",
        service_method: "catalog_search_history_clear",
    },
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/appstore/catalog/templates",
        operation_id: "appstore.catalog.templates.list",
        auth: RouteAuth::DualToken,
        handler: "catalog_templates_list",
        service_method: "catalog_templates_list",
    },
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/appstore/catalog/templates/{templateId}",
        operation_id: "appstore.catalog.templates.retrieve",
        auth: RouteAuth::DualToken,
        handler: "catalog_template_retrieve",
        service_method: "catalog_template_retrieve",
    },
    RouteDefinition {
        method: "POST",
        path: "/app/v3/api/appstore/catalog/templates",
        operation_id: "appstore.catalog.templates.create",
        auth: RouteAuth::DualToken,
        handler: "catalog_template_create",
        service_method: "catalog_template_create",
    },
    RouteDefinition {
        method: "POST",
        path: "/app/v3/api/appstore/catalog/templates/{templateId}/usage",
        operation_id: "appstore.catalog.templates.usage.create",
        auth: RouteAuth::DualToken,
        handler: "catalog_template_usage_create",
        service_method: "catalog_template_usage_create",
    },
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/appstore/catalog/templates/{templateId}/suggestions",
        operation_id: "appstore.catalog.templates.suggestions.retrieve",
        auth: RouteAuth::DualToken,
        handler: "catalog_template_suggestions_retrieve",
        service_method: "catalog_template_suggestions_retrieve",
    },
    RouteDefinition {
        method: "POST",
        path: "/app/v3/api/appstore/catalog/feedback",
        operation_id: "appstore.catalog.feedback.create",
        auth: RouteAuth::DualToken,
        handler: "catalog_feedback_create",
        service_method: "catalog_feedback_create",
    },
];

pub fn route_definitions() -> &'static [RouteDefinition] {
    ROUTES
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RouteDescriptor {
    pub api_authority: &'static str,
    pub capability: &'static str,
    pub prefix: &'static str,
    pub sdk_family: &'static str,
    pub surface: &'static str,
}

pub fn build_routes() -> RouteDescriptor {
    RouteDescriptor {
        api_authority: API_AUTHORITY,
        capability: CAPABILITY,
        prefix: PREFIX,
        sdk_family: SDK_FAMILY,
        surface: SURFACE,
    }
}
