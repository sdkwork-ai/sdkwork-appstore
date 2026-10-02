use async_trait::async_trait;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct EntitlementGrant {
    pub entitlement_id: String,
    pub app_id: String,
    pub subject_id: String,
    pub entitlement_type: String,
    pub starts_at: chrono::DateTime<chrono::Utc>,
    pub expires_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DownloadUrlResult {
    pub url: String,
    pub expires_at: chrono::DateTime<chrono::Utc>,
}

#[async_trait]
pub trait LibraryProviderPort: Send + Sync {
    async fn check_entitlement(
        &self,
        tenant_id: &str,
        app_id: &str,
        user_id: &str,
    ) -> Result<Option<EntitlementGrant>, String>;

    /// Resolves a short-lived download URL for the drive node backing a
    /// verified artifact (the presigned link the storefront hands to the
    /// browser download).
    async fn generate_download_url(
        &self,
        tenant_id: &str,
        drive_node_id: &str,
        expires_in_seconds: i64,
    ) -> Result<DownloadUrlResult, String>;

    async fn resolve_latest_release(
        &self,
        tenant_id: &str,
        listing_id: &str,
        platform: &str,
    ) -> Result<Option<ReleaseInfo>, String>;
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ReleaseInfo {
    pub release_id: String,
    pub version_name: String,
    pub version_code: String,
    pub artifact_id: Option<String>,
}
