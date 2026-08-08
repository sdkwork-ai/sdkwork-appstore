use serde::{Deserialize, Serialize};

use super::models::{
    DownloadGrant, Release, ReleaseArtifact, ReleaseNoteLocalization, ReleaseRollout,
};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReleaseOperationResult {
    pub operation_id: &'static str,
    pub accepted: bool,
}

impl ReleaseOperationResult {
    pub fn accepted(operation_id: &'static str) -> Self {
        Self {
            operation_id,
            accepted: true,
        }
    }

    pub fn rejected(operation_id: &'static str) -> Self {
        Self {
            operation_id,
            accepted: false,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CreateReleaseResult {
    pub operation_id: &'static str,
    pub release: Release,
}

impl CreateReleaseResult {
    pub fn created(operation_id: &'static str, release: Release) -> Self {
        Self {
            operation_id,
            release,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RetrieveReleaseResult {
    pub operation_id: &'static str,
    pub release: Option<Release>,
}

impl RetrieveReleaseResult {
    pub fn found(operation_id: &'static str, release: Release) -> Self {
        Self {
            operation_id,
            release: Some(release),
        }
    }

    pub fn not_found(operation_id: &'static str) -> Self {
        Self {
            operation_id,
            release: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UpdateReleaseResult {
    pub operation_id: &'static str,
    pub release: Release,
}

impl UpdateReleaseResult {
    pub fn updated(operation_id: &'static str, release: Release) -> Self {
        Self {
            operation_id,
            release,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UpsertReleaseNotesResult {
    pub operation_id: &'static str,
    pub localization: ReleaseNoteLocalization,
}

impl UpsertReleaseNotesResult {
    pub fn upserted(operation_id: &'static str, localization: ReleaseNoteLocalization) -> Self {
        Self {
            operation_id,
            localization,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AttachArtifactResult {
    pub operation_id: &'static str,
    pub artifact: ReleaseArtifact,
}

impl AttachArtifactResult {
    pub fn attached(operation_id: &'static str, artifact: ReleaseArtifact) -> Self {
        Self {
            operation_id,
            artifact,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UpdateRolloutResult {
    pub operation_id: &'static str,
    pub rollout: ReleaseRollout,
}

impl UpdateRolloutResult {
    pub fn updated(operation_id: &'static str, rollout: ReleaseRollout) -> Self {
        Self {
            operation_id,
            rollout,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RetireReleaseResult {
    pub operation_id: &'static str,
    pub release: Release,
}

impl RetireReleaseResult {
    pub fn retired(operation_id: &'static str, release: Release) -> Self {
        Self {
            operation_id,
            release,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CheckUpdateResult {
    pub operation_id: &'static str,
    pub update_available: bool,
    pub release_id: Option<String>,
    pub version_name: Option<String>,
    pub version_code: Option<String>,
    pub artifact_id: Option<String>,
}

impl CheckUpdateResult {
    pub fn no_update(operation_id: &'static str) -> Self {
        Self {
            operation_id,
            update_available: false,
            release_id: None,
            version_name: None,
            version_code: None,
            artifact_id: None,
        }
    }

    pub fn update_available(
        operation_id: &'static str,
        release_id: impl Into<String>,
        version_name: impl Into<String>,
        version_code: impl Into<String>,
        artifact_id: impl Into<String>,
    ) -> Self {
        Self {
            operation_id,
            update_available: true,
            release_id: Some(release_id.into()),
            version_name: Some(version_name.into()),
            version_code: Some(version_code.into()),
            artifact_id: Some(artifact_id.into()),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ResolveDownloadResult {
    pub operation_id: &'static str,
    pub download_url: Option<String>,
    pub expires_at: Option<String>,
    pub checksum_sha256: Option<String>,
    pub file_size_bytes: Option<String>,
}

impl ResolveDownloadResult {
    pub fn resolved(
        operation_id: &'static str,
        download_url: impl Into<String>,
        expires_at: impl Into<String>,
        checksum_sha256: impl Into<String>,
        file_size_bytes: impl Into<String>,
    ) -> Self {
        Self {
            operation_id,
            download_url: Some(download_url.into()),
            expires_at: Some(expires_at.into()),
            checksum_sha256: Some(checksum_sha256.into()),
            file_size_bytes: Some(file_size_bytes.into()),
        }
    }

    pub fn not_available(operation_id: &'static str) -> Self {
        Self {
            operation_id,
            download_url: None,
            expires_at: None,
            checksum_sha256: None,
            file_size_bytes: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RetrievePublicReleaseResult {
    pub operation_id: &'static str,
    pub release: Option<Release>,
}

impl RetrievePublicReleaseResult {
    pub fn found(operation_id: &'static str, release: Release) -> Self {
        Self {
            operation_id,
            release: Some(release),
        }
    }

    pub fn not_found(operation_id: &'static str) -> Self {
        Self {
            operation_id,
            release: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CreateDownloadGrantResult {
    pub operation_id: &'static str,
    pub grant: DownloadGrant,
}

impl CreateDownloadGrantResult {
    pub fn created(operation_id: &'static str, grant: DownloadGrant) -> Self {
        Self {
            operation_id,
            grant,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ConsumeDownloadGrantResult {
    pub operation_id: &'static str,
    pub grant: DownloadGrant,
}

impl ConsumeDownloadGrantResult {
    pub fn consumed(operation_id: &'static str, grant: DownloadGrant) -> Self {
        Self {
            operation_id,
            grant,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AutomationSubmissionResult {
    pub operation_id: &'static str,
    pub accepted: bool,
    pub release_id: Option<String>,
}

impl AutomationSubmissionResult {
    pub fn accepted(operation_id: &'static str, release_id: impl Into<String>) -> Self {
        Self {
            operation_id,
            accepted: true,
            release_id: Some(release_id.into()),
        }
    }

    pub fn rejected(operation_id: &'static str) -> Self {
        Self {
            operation_id,
            accepted: false,
            release_id: None,
        }
    }
}
