use std::time::Duration;

use axum::Router;
use sdkwork_iam_web_adapter::IamWebRequestContextResolver;
use sdkwork_web_axum::{with_request_timeout, with_web_request_context, WebFrameworkLayer};
use sdkwork_web_core::{
    memory_idempotency_store, memory_rate_limit_store, SecurityPolicy, WebRequestContextProfile,
};

use crate::http_route_manifest::{
    appstore_open_api_prefixes, appstore_public_path_prefixes, appstore_route_manifest,
};

/// Production gateway assembly:
/// - security policy (rate limiting, HSTS, JSON content-type enforcement)
/// - in-process rate limit / idempotency stores (single-instance deployments;
///   swap for a shared Redis-backed store when running multiple gateway replicas)
/// - request timeout bounding slow dependency calls
/// - dual-token and API-key auth enforced by the route manifest
pub fn wrap_router_with_web_framework(
    resolver: IamWebRequestContextResolver,
    router: Router,
) -> Router {
    let route_manifest = appstore_route_manifest();
    route_manifest
        .validate_public_path_prefixes(&appstore_public_path_prefixes())
        .expect(
            "appstore standalone-gateway public prefixes must not cover protected manifest routes",
        );

    let layer = WebFrameworkLayer::new(resolver)
        .with_profile(WebRequestContextProfile {
            open_api_prefixes: appstore_open_api_prefixes(),
            public_path_prefixes: appstore_public_path_prefixes(),
            ..WebRequestContextProfile::default()
        })
        .with_security_policy(SecurityPolicy::production())
        .with_rate_limit_store(memory_rate_limit_store())
        .with_idempotency_store(memory_idempotency_store())
        .with_route_manifest(route_manifest);

    with_request_timeout(
        with_web_request_context(router, layer),
        Duration::from_secs(30),
    )
}

pub async fn wrap_router_with_web_framework_from_env(router: Router) -> Router {
    let resolver = sdkwork_iam_web_adapter::iam_web_request_context_resolver_from_env().await;
    wrap_router_with_web_framework(resolver, router)
}
