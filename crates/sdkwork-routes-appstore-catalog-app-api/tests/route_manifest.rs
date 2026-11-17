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
fn expert_catalog_reads_are_pathed_and_open_to_the_storefront() {
    // The expert page reads its own catalog store (`appstore_expert_catalog`),
    // never an application-scaffold shelf, so these two operations are the
    // contract the page calls. Both are public storefront reads: an
    // application-scoped request without a user session must still be admitted.
    for (path, operation_id) in [
        (
            "/app/v3/api/appstore/catalog/experts",
            "appstore.catalog.experts.list",
        ),
        (
            "/app/v3/api/appstore/catalog/experts/{expertRef}",
            "appstore.catalog.experts.retrieve",
        ),
    ] {
        let entry = route_definitions()
            .iter()
            .find(|entry| entry.method == "GET" && entry.path == path)
            .unwrap_or_else(|| panic!("missing GET route {path} for the expert catalog"));
        assert_eq!(entry.operation_id, operation_id, "{path}");
        assert_eq!(entry.auth, RouteAuth::DualTokenOrAnonymous, "{path}");

        let manifest = app_route_manifest();
        let matched = manifest
            .match_route("GET", path)
            .unwrap_or_else(|| panic!("missing http route manifest for GET {path}"));
        assert_eq!(matched.operation_id, operation_id, "{path}");
        assert_eq!(matched.auth, RouteAuth::DualTokenOrAnonymous, "{path}");
    }
}

#[test]
fn retired_app_template_shelf_is_not_served() {
    // Application scaffolds moved to the deploy service's
    // `/app/v3/api/app_templates` surface; the appstore template shelf is gone,
    // so no route may still expose it.
    for entry in route_definitions() {
        assert!(
            !entry.path.contains("/catalog/templates"),
            "retired app-template route still registered: {} {}",
            entry.method,
            entry.path
        );
    }
}
