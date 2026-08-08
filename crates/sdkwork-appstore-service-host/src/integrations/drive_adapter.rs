//! Drive integration adapter for artifact download URLs and uploads via sdkwork-drive app-api.

use async_trait::async_trait;
use serde::Deserialize;

use sdkwork_appstore_listing_service::ports::provider::{
    AppReference, ListingProviderPort, MediaUploadResult,
};
use sdkwork_appstore_release_service::ports::provider::{
    ArtifactUploadResult, PlatformManifest, ReleaseProviderPort,
};

use super::drive_uploader::DriveUploaderClient;
use super::http_client::IntegrationHttpClient;

#[derive(Debug, Clone)]
pub struct DriveIntegrationAdapter {
    http: IntegrationHttpClient,
    uploader: DriveUploaderClient,
    enabled: bool,
}

impl DriveIntegrationAdapter {
    pub fn from_env() -> Result<Self, String> {
        let enabled = !matches!(
            std::env::var("APPSTORE_DRIVE_ENABLED").as_deref(),
            Ok("0") | Ok("false") | Ok("off")
        );
        let base_url = std::env::var("APPSTORE_DRIVE_BASE_URL").map_err(|_| {
            "APPSTORE_DRIVE_BASE_URL is required for sdkwork-drive integration".to_string()
        })?;
        let auth_token = std::env::var("APPSTORE_DRIVE_SERVICE_AUTH_TOKEN")
            .ok()
            .or_else(|| std::env::var("APPSTORE_DRIVE_API_KEY").ok());
        let access_token = std::env::var("APPSTORE_DRIVE_SERVICE_ACCESS_TOKEN")
            .ok()
            .or_else(|| std::env::var("APPSTORE_DRIVE_ACCESS_TOKEN").ok());
        let http =
            IntegrationHttpClient::with_access_token(base_url, auth_token, access_token, 120)?;
        let uploader = DriveUploaderClient::new(http.clone());
        Ok(Self {
            http,
            uploader,
            enabled,
        })
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct DriveNodeWire {
    id: String,
}

impl DriveIntegrationAdapter {
    async fn fetch_drive_node(&self, drive_node_id: &str) -> Result<(), String> {
        let path = format!("/app/v3/api/drive/nodes/{drive_node_id}");
        let node: DriveNodeWire = self
            .http
            .get_envelope_item(&path, &[])
            .await
            .map_err(|error| format!("drive nodes.get failed for node {drive_node_id}: {error}"))?;
        if node.id != drive_node_id {
            return Err(format!(
                "drive node id mismatch: expected {drive_node_id}, got {}",
                node.id
            ));
        }
        Ok(())
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateDownloadUrlWire {
    download_url: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AssetItemWire {
    asset_id: Option<String>,
    drive_node_id: String,
    #[serde(default)]
    resource_snapshot: Option<MediaResourceWire>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct MediaResourceWire {
    media_resource_id: Option<String>,
    id: Option<String>,
    content_type: Option<String>,
    mime_type: Option<String>,
    size_bytes: Option<String>,
}

#[async_trait]
impl ReleaseProviderPort for DriveIntegrationAdapter {
    async fn upload_artifact(
        &self,
        _tenant_id: &str,
        organization_id: &str,
        file_name: &str,
        content_type: &str,
        data: &[u8],
    ) -> Result<ArtifactUploadResult, String> {
        if !self.enabled {
            return Err("sdkwork-drive integration disabled".to_string());
        }

        let resource_id = format!("artifact-{}", uuid::Uuid::new_v4());
        let uploaded = self
            .uploader
            .upload_bytes(
                organization_id,
                "appstore.artifact",
                &resource_id,
                "archive",
                file_name,
                content_type,
                data,
            )
            .await?;

        Ok(ArtifactUploadResult {
            media_resource_id: uploaded.asset_id.clone(),
            drive_node_id: uploaded.node_id,
            file_size_bytes: uploaded.file_size_bytes,
            checksum_sha256: uploaded.checksum_sha256,
            content_type: uploaded.content_type,
        })
    }

    async fn resolve_platform_manifest(
        &self,
        _tenant_id: &str,
        app_id: &str,
    ) -> Result<PlatformManifest, String> {
        Err(format!(
            "platform manifest resolution is owned by platform adapter; requested app_id={app_id}"
        ))
    }

    async fn generate_download_url(
        &self,
        _tenant_id: &str,
        drive_node_id: &str,
        expires_in_seconds: i64,
    ) -> Result<String, String> {
        if !self.enabled {
            return Err(format!(
                "sdkwork-drive integration disabled; cannot resolve download for node {drive_node_id}"
            ));
        }

        let ttl = expires_in_seconds.clamp(30, 300).to_string();
        let path = format!("/app/v3/api/drive/nodes/{drive_node_id}/download_url");
        let item: CreateDownloadUrlWire = self
            .http
            .get_envelope_item(&path, &[("requestedTtlSeconds", ttl.as_str())])
            .await
            .map_err(|error| {
                format!("drive nodes.downloadUrls.create failed for node {drive_node_id}: {error}")
            })?;

        Ok(item.download_url)
    }

    async fn validate_drive_node(
        &self,
        _tenant_id: &str,
        drive_node_id: &str,
    ) -> Result<(), String> {
        if !self.enabled {
            return Err(format!(
                "sdkwork-drive integration disabled; cannot validate node {drive_node_id}"
            ));
        }
        if drive_node_id.trim().is_empty() {
            return Err("drive node id is required".to_string());
        }

        self.fetch_drive_node(drive_node_id.trim()).await?;
        Ok(())
    }
}

#[async_trait]
impl ListingProviderPort for DriveIntegrationAdapter {
    async fn resolve_app(&self, _tenant_id: &str, app_id: &str) -> Result<AppReference, String> {
        Err(format!(
            "app resolution is owned by platform adapter; requested app_id={app_id}"
        ))
    }

    async fn resolve_media_resource(
        &self,
        _tenant_id: &str,
        media_resource_id: &str,
    ) -> Result<MediaUploadResult, String> {
        if !self.enabled {
            return Err(format!(
                "sdkwork-drive integration disabled; cannot resolve media resource {media_resource_id}"
            ));
        }

        let path = format!("/app/v3/api/assets/{media_resource_id}");
        let item: AssetItemWire =
            self.http
                .get_envelope_item(&path, &[])
                .await
                .map_err(|error| {
                    format!("drive assets.get failed for asset {media_resource_id}: {error}")
                })?;

        let snapshot = item.resource_snapshot.unwrap_or_default();
        let resolved_media_id = snapshot
            .media_resource_id
            .or(snapshot.id)
            .or(item.asset_id)
            .unwrap_or_else(|| media_resource_id.to_string());
        let content_type = snapshot
            .content_type
            .or(snapshot.mime_type)
            .unwrap_or_else(|| "application/octet-stream".to_string());
        let file_size_bytes = snapshot
            .size_bytes
            .and_then(|value| value.parse::<i64>().ok())
            .unwrap_or(0);

        Ok(MediaUploadResult {
            media_resource_id: resolved_media_id,
            drive_node_id: item.drive_node_id,
            content_type,
            file_size_bytes,
        })
    }
}

impl Default for MediaResourceWire {
    fn default() -> Self {
        Self {
            media_resource_id: None,
            id: None,
            content_type: None,
            mime_type: None,
            size_bytes: None,
        }
    }
}
