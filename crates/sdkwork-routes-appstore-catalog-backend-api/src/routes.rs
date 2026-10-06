//! Route registration descriptors for sdkwork-routes-appstore-catalog-backend-api.

pub use sdkwork_appstore_routes_common::RouteDefinition;
use sdkwork_web_core::RouteAuth;

pub const ROUTES: &[RouteDefinition] = &[
    RouteDefinition {
        method: "GET",
        path: "/backend/v3/api/appstore/catalog/categories",
        operation_id: "appstore.catalog.admin.categories.list",
        auth: RouteAuth::DualToken,
        handler: "catalog_admin_categories_list",
        service_method: "catalog_admin_categories_list",
    },
    RouteDefinition {
        method: "GET",
        path: "/backend/v3/api/appstore/catalog/collections",
        operation_id: "appstore.catalog.admin.collections.list",
        auth: RouteAuth::DualToken,
        handler: "catalog_admin_collections_list",
        service_method: "catalog_admin_collections_list",
    },
    RouteDefinition {
        method: "GET",
        path: "/backend/v3/api/appstore/catalog/featured",
        operation_id: "appstore.catalog.admin.featured.list",
        auth: RouteAuth::DualToken,
        handler: "catalog_admin_featured_list",
        service_method: "catalog_admin_featured_list",
    },
    RouteDefinition {
        method: "POST",
        path: "/backend/v3/api/appstore/catalog/collections",
        operation_id: "appstore.catalog.collections.create",
        auth: RouteAuth::DualToken,
        handler: "catalog_collections_create",
        service_method: "catalog_collections_create",
    },
    RouteDefinition {
        method: "PATCH",
        path: "/backend/v3/api/appstore/catalog/collections/{collectionId}",
        operation_id: "appstore.catalog.collections.update",
        auth: RouteAuth::DualToken,
        handler: "catalog_collections_update",
        service_method: "catalog_collections_update",
    },
    RouteDefinition {
        method: "PUT",
        path: "/backend/v3/api/appstore/catalog/collections/{collectionId}/items",
        operation_id: "appstore.catalog.collections.items.update",
        auth: RouteAuth::DualToken,
        handler: "catalog_collections_items_upsert",
        service_method: "catalog_collections_items_upsert",
    },
    RouteDefinition {
        method: "PUT",
        path: "/backend/v3/api/appstore/catalog/featured/{slotCode}",
        operation_id: "appstore.catalog.featured.update",
        auth: RouteAuth::DualToken,
        handler: "catalog_featured_upsert",
        service_method: "catalog_featured_upsert",
    },
    RouteDefinition {
        method: "POST",
        path: "/backend/v3/api/appstore/catalog/categories",
        operation_id: "appstore.catalog.categories.create",
        auth: RouteAuth::DualToken,
        handler: "catalog_categories_create",
        service_method: "catalog_categories_create",
    },
    RouteDefinition {
        method: "PATCH",
        path: "/backend/v3/api/appstore/catalog/categories/{categoryId}",
        operation_id: "appstore.catalog.categories.update",
        auth: RouteAuth::DualToken,
        handler: "catalog_categories_update",
        service_method: "catalog_categories_update",
    },
];

pub fn route_definitions() -> &'static [RouteDefinition] {
    ROUTES
}
