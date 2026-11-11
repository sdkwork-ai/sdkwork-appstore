use sdkwork_routes_appstore_catalog_app_api::{app_route_manifest, route_definitions};
use sdkwork_web_core::RouteAuth;

#[test]
fn app_route_manifest_matches_route_definitions() {
    let manifest = app_route_manifest();
    for entry in route_definitions() {
        let matched = manifest
            .match_route(entry.method, entry.path)
            .unwrap_or_else(|| {
                panic!(
                    "missing http route manifest for {} {}",
                    entry.method, entry.path
                )
            });
        assert_eq!(matched.auth, entry.auth);
        assert_eq!(matched.operation_id, entry.operation_id);
    }
}

#[test]
fn template_shelf_reads_admit_anonymous_visitors() {
    // The expert roster (and the plugin/skill/connector shelves built on the
    // same templates) must open for an application-scoped request with no user
    // session. Writes on the same shelf keep the dual-token requirement.
    for path in [
        "/app/v3/api/appstore/catalog/templates",
        "/app/v3/api/appstore/catalog/templates/{templateId}",
        "/app/v3/api/appstore/catalog/templates/{templateId}/suggestions",
    ] {
        let entry = route_definitions()
            .iter()
            .find(|entry| entry.method == "GET" && entry.path == path)
            .unwrap_or_else(|| panic!("missing GET route {path}"));
        assert_eq!(entry.auth, RouteAuth::DualTokenOrAnonymous, "{path}");
    }

    let usage = route_definitions()
        .iter()
        .find(|entry| entry.path == "/app/v3/api/appstore/catalog/templates/{templateId}/usage")
        .expect("missing template usage route");
    assert_eq!(usage.auth, RouteAuth::DualToken);
}
