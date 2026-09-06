//! Route registration descriptors for sdkwork-routes-user-store-app-api.

pub use sdkwork_appstore_routes_common::RouteDefinition;
use sdkwork_web_core::RouteAuth;

pub const ROUTES: &[RouteDefinition] = &[
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/user-store/categories",
        operation_id: "appstore.userStore.category.list",
        auth: RouteAuth::DualToken,
        handler: "user_store_categories_list",
        service_method: "categories_list",
    },
    RouteDefinition {
        method: "POST",
        path: "/app/v3/api/user-store/categories",
        operation_id: "appstore.userStore.category.create",
        auth: RouteAuth::DualToken,
        handler: "user_store_category_create",
        service_method: "category_create",
    },
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/user-store/categories/{userCategoryId}",
        operation_id: "appstore.userStore.category.retrieve",
        auth: RouteAuth::DualToken,
        handler: "user_store_category_retrieve",
        service_method: "category_retrieve",
    },
    RouteDefinition {
        method: "PATCH",
        path: "/app/v3/api/user-store/categories/{userCategoryId}",
        operation_id: "appstore.userStore.category.update",
        auth: RouteAuth::DualToken,
        handler: "user_store_category_update",
        service_method: "category_update",
    },
    RouteDefinition {
        method: "DELETE",
        path: "/app/v3/api/user-store/categories/{userCategoryId}",
        operation_id: "appstore.userStore.category.delete",
        auth: RouteAuth::DualToken,
        handler: "user_store_category_delete",
        service_method: "category_delete",
    },
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/user-store/categories/{userCategoryId}/items",
        operation_id: "appstore.userStore.item.list",
        auth: RouteAuth::DualToken,
        handler: "user_store_items_list",
        service_method: "items_list",
    },
    RouteDefinition {
        method: "POST",
        path: "/app/v3/api/user-store/categories/{userCategoryId}/items",
        operation_id: "appstore.userStore.item.create",
        auth: RouteAuth::DualToken,
        handler: "user_store_item_create",
        service_method: "item_create",
    },
    RouteDefinition {
        method: "PATCH",
        path: "/app/v3/api/user-store/categories/{userCategoryId}/items",
        operation_id: "appstore.userStore.item.update",
        auth: RouteAuth::DualToken,
        handler: "user_store_items_update",
        service_method: "items_update",
    },
    RouteDefinition {
        method: "DELETE",
        path: "/app/v3/api/user-store/categories/{userCategoryId}/items/{itemId}",
        operation_id: "appstore.userStore.item.delete",
        auth: RouteAuth::DualToken,
        handler: "user_store_item_delete",
        service_method: "item_delete",
    },
    RouteDefinition {
        method: "GET",
        path: "/app/v3/api/user-store/shares",
        operation_id: "appstore.userStore.share.list",
        auth: RouteAuth::DualToken,
        handler: "user_store_shares_list",
        service_method: "shares_list",
    },
    RouteDefinition {
        method: "POST",
        path: "/app/v3/api/user-store/shares",
        operation_id: "appstore.userStore.share.create",
        auth: RouteAuth::DualToken,
        handler: "user_store_share_create",
        service_method: "share_create",
    },
    RouteDefinition {
        method: "PATCH",
        path: "/app/v3/api/user-store/shares/{shareId}",
        operation_id: "appstore.userStore.share.update",
        auth: RouteAuth::DualToken,
        handler: "user_store_share_update",
        service_method: "share_update",
    },
    RouteDefinition {
        method: "DELETE",
        path: "/app/v3/api/user-store/shares/{shareId}",
        operation_id: "appstore.userStore.share.delete",
        auth: RouteAuth::DualToken,
        handler: "user_store_share_delete",
        service_method: "share_delete",
    },
    RouteDefinition {
        method: "POST",
        path: "/app/v3/api/user-store/shares/{shareId}/refresh",
        operation_id: "appstore.userStore.share.refresh",
        auth: RouteAuth::DualToken,
        handler: "user_store_share_refresh",
        service_method: "share_refresh",
    },
];

pub fn route_definitions() -> &'static [RouteDefinition] {
    ROUTES
}
