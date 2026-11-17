//! App Store remix domain models.
//!
//! A *remix* is a customer taking a store listing's application source into a
//! local project. The store never stores that source: sdkwork-deploy owns the
//! application, its source pointer, and the readiness verdict, and this module
//! only projects the deploy-owned download coordinates for a listing the
//! storefront has published.
//!
//! Two transports exist, matching deploy's `AppRemixDownloadResponse`:
//!
//! - `GIT` hands the client a repository URL, ref, and optional sub path. A web
//!   page cannot run `git`, so the client shows the command instead.
//! - `ARCHIVE` hands the client a Drive node identity plus the archive's
//!   checksum, and the client fetches the bytes through the Drive app API.
//!
//! Availability is derived, never stored: a listing is remixable only when a
//! deployment binding resolves to a deploy application whose remix switch is on
//! *and* whose source is currently ready. Deploy re-derives readiness on every
//! read, so a retired archive or an unvalidated repository degrades here
//! immediately instead of advertising a download that no longer exists.

use serde::{Deserialize, Serialize};

/// Environment variable naming the sdkwork-deploy app API base URL.
///
/// Read per request rather than at boot: an App Store deployment that never
/// enables remix has no reason to configure it, and the remix endpoint must
/// answer with a `503` that names this variable instead of failing during
/// startup or fabricating a download.
pub const DEPLOY_BASE_URL_ENV: &str = "APPSTORE_DEPLOY_BASE_URL";

/// Deployment binding row projected onto the remix workflow.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RemixBinding {
    /// App Store application id (`appstore_application.id`), the value the
    /// deployment binding joins on.
    pub app_id: String,
    /// Deploy-owned application identity, as stored in
    /// `appstore_application_deployment_binding.deploy_app_id`.
    pub deploy_app_id: String,
    /// Deploy application UUID; the deploy app API addresses applications by
    /// this value.
    pub deploy_app_uuid: String,
}

/// Transport a remix download uses.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum RemixMode {
    /// Clone the application's repository.
    Git,
    /// Fetch the application's source archive bytes.
    Archive,
}

impl RemixMode {
    /// Wire code (`GIT` / `ARCHIVE`).
    #[must_use]
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Git => "GIT",
            Self::Archive => "ARCHIVE",
        }
    }
}

/// Git coordinates a client turns into a `git clone` command.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RemixGitCoordinates {
    /// Clone URL of the application repository.
    pub repo_url: String,
    /// Effective ref to check out.
    pub repo_ref: String,
    /// Directory inside the repository that holds the application, when the
    /// repository carries more than the application.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sub_path: Option<String>,
}

/// Drive archive coordinates a client fetches bytes for.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RemixArchiveCoordinates {
    /// Deploy artifact identity the archive was uploaded as.
    pub artifact_id: String,
    /// Drive node that holds the archive bytes.
    pub drive_node_id: String,
    /// Original file name, used as the local archive name and extension probe.
    pub file_name: String,
    /// Archive size in bytes, as a decimal string (`int64` wire contract).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content_length: Option<String>,
    /// Published SHA-256 digest of the archive, when deploy recorded one.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub checksum_sha256: Option<String>,
}

/// One resolved remix download: the mode plus its coordinates.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RemixDownload {
    /// Selected transport.
    pub mode: RemixMode,
    /// Git coordinates; present when `mode` is `GIT`.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub git: Option<RemixGitCoordinates>,
    /// Archive coordinates; present when `mode` is `ARCHIVE`.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub archive: Option<RemixArchiveCoordinates>,
}

impl RemixDownload {
    /// Git download.
    #[must_use]
    pub fn git(coordinates: RemixGitCoordinates) -> Self {
        Self {
            mode: RemixMode::Git,
            git: Some(coordinates),
            archive: None,
        }
    }

    /// Archive download.
    #[must_use]
    pub fn archive(coordinates: RemixArchiveCoordinates) -> Self {
        Self {
            mode: RemixMode::Archive,
            git: None,
            archive: Some(coordinates),
        }
    }

    /// Coordinates that actually match the selected mode.
    ///
    /// Deploy never emits a half-filled download, but the projection is
    /// defended here so a malformed upstream payload can only produce
    /// "not remixable" instead of a client pointed at a missing coordinate.
    #[must_use]
    pub fn is_complete(&self) -> bool {
        match self.mode {
            RemixMode::Git => self
                .git
                .as_ref()
                .is_some_and(|git| !git.repo_url.trim().is_empty()),
            RemixMode::Archive => self
                .archive
                .as_ref()
                .is_some_and(|archive| !archive.drive_node_id.trim().is_empty()),
        }
    }
}

/// Deploy-side remix state for one application.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RemixState {
    /// Whether the operator switched remix on for the application.
    pub remix_enabled: bool,
    /// Whether the application source is currently downloadable.
    pub source_ready: bool,
    /// Download coordinates; deploy omits them unless remix is enabled and the
    /// source is ready.
    pub download: Option<RemixDownload>,
}

impl RemixState {
    /// Not usable: remix off, source not ready, or no coordinates.
    #[must_use]
    pub fn is_ready(&self) -> bool {
        self.remix_enabled
            && self.source_ready
            && self
                .download
                .as_ref()
                .is_some_and(RemixDownload::is_complete)
    }
}
