//! Route registration descriptors for sdkwork-routes-user-store-open-api.

pub use sdkwork_appstore_routes_common::RouteDefinition;
use sdkwork_web_core::RouteAuth;

pub const ROUTES: &[RouteDefinition] = &[
    RouteDefinition {
        method: "GET",
        path: "/store/v3/api/user-stores/{shareToken}",
        operation_id: "appstore.userStores.public.retrieve",
        auth: RouteAuth::Public,
        handler: "user_stores_public_retrieve",
        service_method: "public_user_store_view",
    },
    RouteDefinition {
        method: "GET",
        path: "/store/v3/api/user-stores/{shareToken}/categories/{userCategoryId}/items",
        operation_id: "appstore.userStores.public.items.list",
        auth: RouteAuth::Public,
        handler: "user_stores_public_items_list",
        service_method: "public_category_items",
    },
];

pub fn route_definitions() -> &'static [RouteDefinition] {
    ROUTES
}
