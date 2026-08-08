use async_trait::async_trait;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AppReference {
    pub app_id: String,
    pub app_key: String,
    pub display_name: String,
    pub manifest_snapshot: serde_json::Value,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct MediaUploadResult {
    pub media_resource_id: String,
    pub drive_node_id: String,
    pub content_type: String,
    pub file_size_bytes: i64,
}

#[async_trait]
pub trait ListingProviderPort: Send + Sync {
    async fn resolve_app(&self, tenant_id: &str, app_id: &str) -> Result<AppReference, String>;

    async fn resolve_media_resource(
        &self,
        tenant_id: &str,
        media_resource_id: &str,
    ) -> Result<MediaUploadResult, String>;
}
