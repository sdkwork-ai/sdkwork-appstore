//! Route manifest projection for sdkwork-routes-user-store-app-api.

use crate::paths::{API_AUTHORITY, CAPABILITY, PREFIX, SDK_FAMILY, SURFACE};
use crate::routes::{route_definitions, RouteDefinition};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct RouteManifest {
    pub kind: &'static str,
    pub package_name: &'static str,
    pub owner: &'static str,
    pub domain: &'static str,
    pub capability: &'static str,
    pub surface: &'static str,
    pub prefix: &'static str,
    pub api_authority: &'static str,
    pub sdk_family: &'static str,
    pub routes: &'static [RouteDefinition],
}

pub fn route_manifest() -> RouteManifest {
    RouteManifest {
        kind: "sdkwork.route.manifest",
        package_name: "sdkwork-routes-user-store-app-api",
        owner: "sdkwork-appstore",
        domain: "appstore",
        capability: CAPABILITY,
        surface: SURFACE,
        prefix: PREFIX,
        api_authority: API_AUTHORITY,
        sdk_family: SDK_FAMILY,
        routes: route_definitions(),
    }
}
