use async_trait::async_trait;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ArtifactUploadResult {
    pub media_resource_id: String,
    pub drive_node_id: String,
    pub file_size_bytes: i64,
    pub checksum_sha256: String,
    pub content_type: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PlatformManifest {
    pub app_id: String,
    pub runtime_family: String,
    pub runtime_framework: String,
    pub manifest_snapshot: serde_json::Value,
}

#[async_trait]
pub trait ReleaseProviderPort: Send + Sync {
    async fn upload_artifact(
        &self,
        tenant_id: &str,
        organization_id: &str,
        file_name: &str,
        content_type: &str,
        data: &[u8],
    ) -> Result<ArtifactUploadResult, String>;

    async fn resolve_platform_manifest(
        &self,
        tenant_id: &str,
        app_id: &str,
    ) -> Result<PlatformManifest, String>;

    async fn generate_download_url(
        &self,
        tenant_id: &str,
        drive_node_id: &str,
        expires_in_seconds: i64,
    ) -> Result<String, String>;

    async fn validate_drive_node(&self, tenant_id: &str, drive_node_id: &str)
        -> Result<(), String>;
}
