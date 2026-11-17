//! sdkwork-deploy remix adapter (cross-module HTTP).
//!
//! `MODULE_SPEC.md` 搂4.2 makes an in-process port the default for a sibling
//! module. Deploy exposes source readiness and remix coordinates only through
//! its app API, and this repository consumes no deploy service crate, so remix
//! is an explicit cross-module HTTP read. The deliberate exception is recorded
//! in `specs/backend-module-call-boundary.allow.json`.
//!
//! The endpoint is resolved per request, not at boot: an App Store deployment
//! that does not offer remix has no reason to configure
//! `APPSTORE_DEPLOY_BASE_URL`, and the remix endpoint must answer `503` naming
//! that variable rather than failing startup or inventing coordinates.
//!
//! Readiness is cached for [`READINESS_CACHE_TTL`] per deploy application: a
//! catalog page asks "is this listing remixable" for every row, and deploy
//! re-derives readiness on every read (repository validation included). The
//! short TTL keeps a page from turning one upstream read per row into a burst
//! while a source that just became unusable degrades within the TTL.

use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{Duration, Instant};

use serde::Deserialize;

use sdkwork_appstore_remix_service::domain::models::{
    RemixArchiveCoordinates, RemixDownload, RemixGitCoordinates, RemixState, DEPLOY_BASE_URL_ENV,
};
use sdkwork_appstore_remix_service::ports::deploy::{DeployRemixPort, RemixPortError};

use super::http_client::{IntegrationHttpClient, IntegrationHttpError};

/// How long one deploy readiness verdict is reused across requests.
pub const READINESS_CACHE_TTL: Duration = Duration::from_secs(30);

/// Timeout of one deploy app API read.
const DEPLOY_READ_TIMEOUT_SECONDS: u64 = 15;

/// Deploy app API adapter for the remix port.
#[derive(Debug)]
pub struct DeployRemixAdapter {
    http: Option<IntegrationHttpClient>,
    cache: Mutex<HashMap<String, CachedRemixState>>,
}

#[derive(Debug, Clone)]
struct CachedRemixState {
    fetched_at: Instant,
    state: RemixState,
}

impl DeployRemixAdapter {
    /// Build the adapter from the documented environment contract.
    ///
    /// A missing `APPSTORE_DEPLOY_BASE_URL` is *not* an error here: the adapter
    /// is built unconditionally so the remix endpoint can answer `503` naming
    /// the variable at request time.
    #[must_use]
    pub fn from_env() -> Self {
        let base_url = std::env::var(DEPLOY_BASE_URL_ENV)
            .ok()
            .map(|value| value.trim().to_string())
            .filter(|value| !value.is_empty());
        let http = base_url.and_then(|base_url| {
            let auth_token = std::env::var("APPSTORE_DEPLOY_SERVICE_AUTH_TOKEN")
                .ok()
                .or_else(|| std::env::var("APPSTORE_DEPLOY_API_KEY").ok());
            let access_token = std::env::var("APPSTORE_DEPLOY_SERVICE_ACCESS_TOKEN")
                .ok()
                .or_else(|| std::env::var("APPSTORE_DEPLOY_ACCESS_TOKEN").ok());
            IntegrationHttpClient::with_access_token(
                base_url,
                auth_token,
                access_token,
                DEPLOY_READ_TIMEOUT_SECONDS,
            )
            .ok()
        });
        Self {
            http,
            cache: Mutex::new(HashMap::new()),
        }
    }

    /// Build the adapter for tests with a caller-provided client.
    #[must_use]
    pub fn with_client(http: IntegrationHttpClient) -> Self {
        Self {
            http: Some(http),
            cache: Mutex::new(HashMap::new()),
        }
    }

    fn cache_key(tenant_id: &str, deploy_app_uuid: &str) -> String {
        format!("{tenant_id}:{deploy_app_uuid}")
    }

    fn cached(&self, key: &str) -> Option<RemixState> {
        let cache = self.cache.lock().ok()?;
        let entry = cache.get(key)?;
        (entry.fetched_at.elapsed() < READINESS_CACHE_TTL).then(|| entry.state.clone())
    }

    fn remember(&self, key: String, state: &RemixState) {
        if let Ok(mut cache) = self.cache.lock() {
            // Bound the map: a process serving many tenants must not grow it
            // without limit. Dropping everything is cheap enough at this TTL.
            if cache.len() >= 1024 {
                cache.clear();
            }
            cache.insert(
                key,
                CachedRemixState {
                    fetched_at: Instant::now(),
                    state: state.clone(),
                },
            );
        }
    }
}

impl Default for DeployRemixAdapter {
    fn default() -> Self {
        Self::from_env()
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AppRemixWire {
    #[serde(default)]
    remix_enabled: bool,
    #[serde(default)]
    readiness: Option<String>,
    #[serde(default)]
    download: Option<AppRemixDownloadWire>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AppRemixDownloadWire {
    #[serde(default)]
    mode: Option<String>,
    #[serde(default)]
    git: Option<RemixGitWire>,
    #[serde(default)]
    archive: Option<RemixArchiveWire>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RemixGitWire {
    repo_url: String,
    repo_ref: String,
    #[serde(default)]
    sub_path: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RemixArchiveWire {
    artifact_id: String,
    drive_node_id: String,
    file_name: String,
    #[serde(default)]
    content_length: Option<String>,
    #[serde(default)]
    checksum_sha256: Option<String>,
}

impl AppRemixWire {
    fn into_state(self) -> RemixState {
        let source_ready = self
            .readiness
            .as_deref()
            .is_some_and(|readiness| readiness.eq_ignore_ascii_case("READY"));
        let download = self.download.and_then(AppRemixDownloadWire::into_download);
        RemixState {
            remix_enabled: self.remix_enabled,
            source_ready,
            download,
        }
    }
}

impl AppRemixDownloadWire {
    fn into_download(self) -> Option<RemixDownload> {
        match self.mode.as_deref() {
            Some(mode) if mode.eq_ignore_ascii_case("GIT") => self.git.map(|git| {
                RemixDownload::git(RemixGitCoordinates {
                    repo_url: git.repo_url,
                    repo_ref: git.repo_ref,
                    sub_path: git.sub_path.filter(|value| !value.trim().is_empty()),
                })
            }),
            Some(mode) if mode.eq_ignore_ascii_case("ARCHIVE") => self.archive.map(|archive| {
                RemixDownload::archive(RemixArchiveCoordinates {
                    artifact_id: archive.artifact_id,
                    drive_node_id: archive.drive_node_id,
                    file_name: archive.file_name,
                    content_length: archive.content_length,
                    checksum_sha256: archive.checksum_sha256,
                })
            }),
            _ => None,
        }
    }
}

#[async_trait::async_trait]
impl DeployRemixPort for DeployRemixAdapter {
    async fn remix_state(
        &self,
        tenant_id: &str,
        deploy_app_uuid: &str,
    ) -> Result<RemixState, RemixPortError> {
        let deploy_app_uuid = deploy_app_uuid.trim();
        if deploy_app_uuid.is_empty() {
            return Err(RemixPortError::UnknownApplication);
        }
        let key = Self::cache_key(tenant_id, deploy_app_uuid);
        if let Some(cached) = self.cached(&key) {
            return Ok(cached);
        }

        let Some(http) = self.http.as_ref() else {
            return Err(RemixPortError::Unconfigured(DEPLOY_BASE_URL_ENV));
        };

        let path = format!("/app/v3/api/apps/{deploy_app_uuid}/remix");
        let wire: AppRemixWire =
            http.get_envelope_item_detailed(&path, &[])
                .await
                .map_err(|error| match error {
                    IntegrationHttpError::NotFound => RemixPortError::UnknownApplication,
                    other => RemixPortError::Unavailable(other.to_string()),
                })?;
        let state = wire.into_state();
        self.remember(key, &state);
        Ok(state)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn archive_payload_maps_to_archive_download() {
        let payload: AppRemixWire = serde_json::from_value(serde_json::json!({
            "appId": "11111111-1111-1111-1111-111111111111",
            "remixEnabled": true,
            "sourceKind": "ARCHIVE",
            "readiness": "READY",
            "download": {
                "mode": "ARCHIVE",
                "archive": {
                    "artifactId": "22222222-2222-2222-2222-222222222222",
                    "uploadSessionId": "33333333-3333-3333-3333-333333333333",
                    "packageType": 1,
                    "fileName": "source.zip",
                    "contentType": "application/zip",
                    "contentLength": "4096",
                    "checksumSha256": "abc",
                    "driveNodeId": "node-1",
                    "createdAt": "2026-11-17T00:00:00Z"
                }
            }
        }))
        .expect("archive wire");

        let state = payload.into_state();
        assert!(state.is_ready());
        let download = state.download.expect("download");
        assert_eq!(download.mode.as_str(), "ARCHIVE");
        let archive = download.archive.expect("archive");
        assert_eq!(archive.drive_node_id, "node-1");
        assert_eq!(archive.content_length.as_deref(), Some("4096"));
    }

    #[test]
    fn git_payload_maps_to_git_download() {
        let payload: AppRemixWire = serde_json::from_value(serde_json::json!({
            "remixEnabled": true,
            "readiness": "READY",
            "download": {
                "mode": "GIT",
                "git": {
                    "repoProvider": "github",
                    "repoUrl": "https://git.example.test/acme/app.git",
                    "repoRef": "refs/heads/main",
                    "subPath": "apps/desktop",
                    "cloneMode": "https",
                    "repoStatus": "VALIDATED"
                }
            }
        }))
        .expect("git wire");

        let state = payload.into_state();
        assert!(state.is_ready());
        let download = state.download.expect("download");
        assert_eq!(download.mode.as_str(), "GIT");
        let git = download.git.expect("git");
        assert_eq!(git.sub_path.as_deref(), Some("apps/desktop"));
    }

    #[test]
    fn not_ready_payload_has_no_download() {
        let payload: AppRemixWire = serde_json::from_value(serde_json::json!({
            "remixEnabled": true,
            "readiness": "MISSING",
            "readinessReason": "ARCHIVE_UNAVAILABLE"
        }))
        .expect("missing wire");

        let state = payload.into_state();
        assert!(!state.is_ready());
        assert!(state.download.is_none());
    }

    #[test]
    fn a_download_without_matching_coordinates_is_not_ready() {
        let payload: AppRemixWire = serde_json::from_value(serde_json::json!({
            "remixEnabled": true,
            "readiness": "READY",
            "download": { "mode": "ARCHIVE" }
        }))
        .expect("half wire");

        let state = payload.into_state();
        assert!(state.download.is_none());
        assert!(!state.is_ready());
    }

    #[test]
    fn an_unconfigured_adapter_reports_the_missing_variable() {
        let adapter = DeployRemixAdapter {
            http: None,
            cache: Mutex::new(HashMap::new()),
        };
        let runtime = tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
            .expect("runtime");
        let error = runtime
            .block_on(adapter.remix_state("tenant-1", "uuid-1"))
            .expect_err("unconfigured adapter must not resolve");
        assert_eq!(error, RemixPortError::Unconfigured(DEPLOY_BASE_URL_ENV));
    }
}
