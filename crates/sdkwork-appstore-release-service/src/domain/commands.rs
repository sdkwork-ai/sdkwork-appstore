use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ReleaseOperationRequest {
    pub operation_id: &'static str,
    pub idempotency_key: Option<String>,
}

impl ReleaseOperationRequest {
    pub fn new(operation_id: &'static str) -> Self {
        Self {
            operation_id,
            idempotency_key: None,
        }
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CreateReleaseRequest {
    pub listing_id: String,
    pub channel_code: String,
    pub version_name: String,
    pub version_code: String,
    pub build_number: Option<String>,
    pub minimum_os_version: Option<String>,
    pub idempotency_key: Option<String>,
}

impl CreateReleaseRequest {
    pub fn new(
        listing_id: impl Into<String>,
        channel_code: impl Into<String>,
        version_name: impl Into<String>,
        version_code: impl Into<String>,
    ) -> Self {
        Self {
            listing_id: listing_id.into(),
            channel_code: channel_code.into(),
            version_name: version_name.into(),
            version_code: version_code.into(),
            build_number: None,
            minimum_os_version: None,
            idempotency_key: None,
        }
    }

    pub fn with_build_number(mut self, build_number: impl Into<String>) -> Self {
        self.build_number = Some(build_number.into());
        self
    }

    pub fn with_minimum_os_version(mut self, version: impl Into<String>) -> Self {
        self.minimum_os_version = Some(version.into());
        self
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RetrieveReleaseRequest {
    pub release_id: String,
}

impl RetrieveReleaseRequest {
    pub fn new(release_id: impl Into<String>) -> Self {
        Self {
            release_id: release_id.into(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UpdateReleaseRequest {
    pub release_id: String,
    pub minimum_os_version: Option<String>,
    pub release_status: Option<String>,
    pub idempotency_key: Option<String>,
}

impl UpdateReleaseRequest {
    pub fn new(release_id: impl Into<String>) -> Self {
        Self {
            release_id: release_id.into(),
            minimum_os_version: None,
            release_status: None,
            idempotency_key: None,
        }
    }

    pub fn with_minimum_os_version(mut self, version: impl Into<String>) -> Self {
        self.minimum_os_version = Some(version.into());
        self
    }

    pub fn with_release_status(mut self, status: impl Into<String>) -> Self {
        self.release_status = Some(status.into());
        self
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UpsertReleaseNotesRequest {
    pub release_id: String,
    pub locale: String,
    pub release_notes: String,
    pub idempotency_key: Option<String>,
}

impl UpsertReleaseNotesRequest {
    pub fn new(
        release_id: impl Into<String>,
        locale: impl Into<String>,
        release_notes: impl Into<String>,
    ) -> Self {
        Self {
            release_id: release_id.into(),
            locale: locale.into(),
            release_notes: release_notes.into(),
            idempotency_key: None,
        }
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AttachArtifactRequest {
    pub release_id: String,
    pub platform: String,
    pub architecture: String,
    pub package_format: String,
    pub drive_node_id: String,
    pub checksum_sha256: String,
    pub file_size_bytes: String,
    pub content_type: Option<String>,
    pub media_resource_id: Option<String>,
    pub min_os_version: Option<String>,
    pub idempotency_key: Option<String>,
}

impl AttachArtifactRequest {
    pub fn new(
        release_id: impl Into<String>,
        platform: impl Into<String>,
        architecture: impl Into<String>,
        package_format: impl Into<String>,
        drive_node_id: impl Into<String>,
        checksum_sha256: impl Into<String>,
        file_size_bytes: impl Into<String>,
    ) -> Self {
        Self {
            release_id: release_id.into(),
            platform: platform.into(),
            architecture: architecture.into(),
            package_format: package_format.into(),
            drive_node_id: drive_node_id.into(),
            checksum_sha256: checksum_sha256.into(),
            file_size_bytes: file_size_bytes.into(),
            content_type: None,
            media_resource_id: None,
            min_os_version: None,
            idempotency_key: None,
        }
    }

    pub fn with_content_type(mut self, content_type: impl Into<String>) -> Self {
        self.content_type = Some(content_type.into());
        self
    }

    pub fn with_media_resource_id(mut self, id: impl Into<String>) -> Self {
        self.media_resource_id = Some(id.into());
        self
    }

    pub fn with_min_os_version(mut self, version: impl Into<String>) -> Self {
        self.min_os_version = Some(version.into());
        self
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UpdateRolloutRequest {
    pub release_id: String,
    pub rollout_strategy: String,
    pub target_percentage: i32,
    pub region_filter: Option<Vec<String>>,
    pub device_filter: Option<serde_json::Value>,
    pub idempotency_key: Option<String>,
}

impl UpdateRolloutRequest {
    pub fn new(
        release_id: impl Into<String>,
        rollout_strategy: impl Into<String>,
        target_percentage: i32,
    ) -> Self {
        Self {
            release_id: release_id.into(),
            rollout_strategy: rollout_strategy.into(),
            target_percentage,
            region_filter: None,
            device_filter: None,
            idempotency_key: None,
        }
    }

    pub fn with_region_filter(mut self, regions: Vec<String>) -> Self {
        self.region_filter = Some(regions);
        self
    }

    pub fn with_device_filter(mut self, filter: serde_json::Value) -> Self {
        self.device_filter = Some(filter);
        self
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RetireReleaseRequest {
    pub release_id: String,
    pub idempotency_key: Option<String>,
}

impl RetireReleaseRequest {
    pub fn new(release_id: impl Into<String>) -> Self {
        Self {
            release_id: release_id.into(),
            idempotency_key: None,
        }
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CheckUpdateRequest {
    pub app_key: String,
    pub platform: String,
    pub installed_version_code: String,
    pub channel_code: String,
    pub architecture: Option<String>,
    pub device_id: Option<String>,
    pub region_code: Option<String>,
}

impl CheckUpdateRequest {
    pub fn new(
        app_key: impl Into<String>,
        platform: impl Into<String>,
        installed_version_code: impl Into<String>,
        channel_code: impl Into<String>,
    ) -> Self {
        Self {
            app_key: app_key.into(),
            platform: platform.into(),
            installed_version_code: installed_version_code.into(),
            channel_code: channel_code.into(),
            architecture: None,
            device_id: None,
            region_code: None,
        }
    }

    pub fn with_architecture(mut self, architecture: impl Into<String>) -> Self {
        self.architecture = Some(architecture.into());
        self
    }

    pub fn with_device_id(mut self, device_id: impl Into<String>) -> Self {
        self.device_id = Some(device_id.into());
        self
    }

    pub fn with_region_code(mut self, region_code: impl Into<String>) -> Self {
        self.region_code = Some(region_code.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ResolveDownloadRequest {
    pub artifact_id: String,
    pub grant_id: Option<String>,
    pub app_key: Option<String>,
}

impl ResolveDownloadRequest {
    pub fn new(artifact_id: impl Into<String>) -> Self {
        Self {
            artifact_id: artifact_id.into(),
            grant_id: None,
            app_key: None,
        }
    }

    pub fn with_grant_id(mut self, grant_id: impl Into<String>) -> Self {
        self.grant_id = Some(grant_id.into());
        self
    }

    pub fn with_app_key(mut self, key: impl Into<String>) -> Self {
        self.app_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RetrievePublicReleaseRequest {
    pub release_id: String,
}

impl RetrievePublicReleaseRequest {
    pub fn new(release_id: impl Into<String>) -> Self {
        Self {
            release_id: release_id.into(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CreateDownloadGrantRequest {
    pub listing_id: String,
    pub release_id: String,
    pub artifact_id: String,
    pub grant_reason: Option<String>,
    pub idempotency_key: Option<String>,
}

impl CreateDownloadGrantRequest {
    pub fn new(
        listing_id: impl Into<String>,
        release_id: impl Into<String>,
        artifact_id: impl Into<String>,
    ) -> Self {
        Self {
            listing_id: listing_id.into(),
            release_id: release_id.into(),
            artifact_id: artifact_id.into(),
            grant_reason: None,
            idempotency_key: None,
        }
    }

    pub fn with_grant_reason(mut self, reason: impl Into<String>) -> Self {
        self.grant_reason = Some(reason.into());
        self
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ConsumeDownloadGrantRequest {
    pub grant_id: String,
}

impl ConsumeDownloadGrantRequest {
    pub fn new(grant_id: impl Into<String>) -> Self {
        Self {
            grant_id: grant_id.into(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AutomationSubmissionCreateRequest {
    pub app_key: String,
    pub submission_type: String,
    pub channel_code: String,
    pub version_name: String,
    pub version_code: String,
    pub artifacts: Vec<AutomationArtifactSpec>,
    pub idempotency_key: Option<String>,
}

impl AutomationSubmissionCreateRequest {
    pub fn new(
        app_key: impl Into<String>,
        submission_type: impl Into<String>,
        channel_code: impl Into<String>,
        version_name: impl Into<String>,
        version_code: impl Into<String>,
    ) -> Self {
        Self {
            app_key: app_key.into(),
            submission_type: submission_type.into(),
            channel_code: channel_code.into(),
            version_name: version_name.into(),
            version_code: version_code.into(),
            artifacts: Vec::new(),
            idempotency_key: None,
        }
    }

    pub fn with_artifacts(mut self, artifacts: Vec<AutomationArtifactSpec>) -> Self {
        self.artifacts = artifacts;
        self
    }

    pub fn with_idempotency_key(mut self, key: impl Into<String>) -> Self {
        self.idempotency_key = Some(key.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AutomationArtifactSpec {
    pub platform: String,
    pub architecture: String,
    pub package_format: String,
    pub drive_node_id: String,
    pub checksum_sha256: String,
    pub file_size_bytes: Option<String>,
}
