//! Ensures mounted route-crate `.route()` registrations match the combined HTTP route manifest.

use std::collections::BTreeSet;
use std::fs;
use std::path::PathBuf;

fn manifest_path() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../sdkwork-api-appstore-assembly/src/http_route_manifest.rs")
}

fn crates_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../..")
        .join("crates")
}

fn route_runtime_sources() -> Vec<(String, String)> {
    let crates = fs::read_dir(crates_dir()).expect("read crates dir");
    let mut sources = Vec::new();
    for entry in crates {
        let entry = entry.expect("crate dir entry");
        let crate_name = entry.file_name().to_string_lossy().to_string();
        if !crate_name.starts_with("sdkwork-routes-") {
            continue;
        }
        let runtime_path = entry.path().join("src/runtime.rs");
        if runtime_path.exists() {
            sources.push((
                crate_name,
                fs::read_to_string(&runtime_path).expect("read runtime.rs"),
            ));
        }
    }
    sources
}

fn extract_manifest_routes(source: &str) -> BTreeSet<(String, String)> {
    let mut routes = BTreeSet::new();
    let mut method = String::new();
    for line in source.lines() {
        if line.contains("HttpMethod::Get") {
            method = "GET".to_string();
        } else if line.contains("HttpMethod::Post") {
            method = "POST".to_string();
        } else if line.contains("HttpMethod::Put") {
            method = "PUT".to_string();
        } else if line.contains("HttpMethod::Patch") {
            method = "PATCH".to_string();
        } else if line.contains("HttpMethod::Delete") {
            method = "DELETE".to_string();
        } else if let Some(path) = line
            .split('"')
            .nth(1)
            .filter(|value| value.starts_with('/'))
        {
            if !method.is_empty() {
                routes.insert((method.clone(), path.to_string()));
                method.clear();
            }
        }
    }
    routes
}

fn registers_method_call(segment: &str, needle: &str) -> bool {
    // Word-boundary match: `category_delete(` must not count as a `delete(`
    // route method, so the character before the needle must not be part of an
    // identifier.
    let bytes = segment.as_bytes();
    let mut search = 0;
    while let Some(pos) = segment[search..].find(needle) {
        let absolute = search + pos;
        let boundary_ok = absolute == 0
            || !bytes[absolute - 1].is_ascii_alphanumeric() && bytes[absolute - 1] != b'_';
        if boundary_ok {
            return true;
        }
        search = absolute + 1;
    }
    false
}

fn extract_route_crate_routes(source: &str) -> BTreeSet<(String, String)> {
    let mut routes = BTreeSet::new();

    for segment in source.split(".route(").skip(1) {
        let Some(path) = segment
            .split('"')
            .nth(1)
            .filter(|value| value.starts_with('/'))
        else {
            continue;
        };

        for (needle, method) in [
            ("get(", "GET"),
            ("post(", "POST"),
            ("put(", "PUT"),
            ("patch(", "PATCH"),
            ("delete(", "DELETE"),
        ] {
            if registers_method_call(segment, needle) {
                routes.insert((method.to_string(), path.to_string()));
            }
        }
    }

    routes
}

#[test]
fn gateway_routes_match_http_route_manifest() {
    let manifest_source = fs::read_to_string(manifest_path()).expect("read http_route_manifest.rs");
    let expected = extract_manifest_routes(&manifest_source);

    let mut actual = BTreeSet::new();
    let runtime_sources = route_runtime_sources();
    assert!(
        !runtime_sources.is_empty(),
        "no sdkwork-routes-* crates with runtime.rs found"
    );
    for (_crate_name, source) in &runtime_sources {
        actual.extend(extract_route_crate_routes(source));
    }

    let missing: Vec<_> = expected.difference(&actual).cloned().collect();
    let extra: Vec<_> = actual.difference(&expected).cloned().collect();

    assert!(
        missing.is_empty() && extra.is_empty(),
        "gateway/manifest drift\nmissing: {missing:?}\nextra: {extra:?}"
    );
    assert_eq!(
        expected.len(),
        actual.len(),
        "gateway route count mismatch (expected {})",
        expected.len()
    );
}
