//! Route crate skeleton for sdkwork-routes-user-store-open-api.

mod runtime;

pub mod error;
pub mod handlers;
pub mod http_route_manifest;
pub mod manifest;
pub mod mapper;
pub mod paths;
pub mod routes;
pub mod web_bootstrap;

pub use handlers::{route_handler_plans, RouteHandlerPlan};
pub use http_route_manifest::open_route_manifest;
pub use manifest::{route_manifest, RouteManifest};
pub use routes::{route_definitions, RouteDefinition};
pub use web_bootstrap::{
    appstore_open_api_prefixes, appstore_open_api_public_path_prefixes,
    wrap_router_with_web_framework, wrap_router_with_web_framework_from_env,
};

pub fn gateway_route_manifest() -> RouteManifest {
    route_manifest()
}

pub fn gateway_mount(state: sdkwork_appstore_routes_common::AppState) -> axum::Router {
    runtime::routes().with_state(state)
}
