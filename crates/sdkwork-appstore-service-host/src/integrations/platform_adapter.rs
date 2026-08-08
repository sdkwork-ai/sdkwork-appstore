//! Platform (registered app) integration adapter.

use async_trait::async_trait;
use serde::Deserialize;

use sdkwork_appstore_listing_service::ports::provider::{
    AppReference, ListingProviderPort, MediaUploadResult,
};

use super::http_client::IntegrationHttpClient;

#[derive(Debug, Clone)]
pub struct PlatformIntegrationAdapter {
    http: IntegrationHttpClient,
    enabled: bool,
}

impl PlatformIntegrationAdapter {
    pub fn from_env() -> Result<Self, String> {
        let enabled = !matches!(
            std::env::var("APPSTORE_PLATFORM_ENABLED").as_deref(),
            Ok("0") | Ok("false") | Ok("off")
        );
        let base_url = std::env::var("APPSTORE_PLATFORM_BASE_URL")
            .unwrap_or_else(|_| "http://127.0.0.1:18080".to_string());
        let auth_token = std::env::var("APPSTORE_PLATFORM_SERVICE_AUTH_TOKEN")
            .ok()
            .or_else(|| std::env::var("APPSTORE_PLATFORM_API_KEY").ok());
        let http = IntegrationHttpClient::new(base_url, auth_token, 10)?;
        Ok(Self { http, enabled })
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AppWire {
    app_id: String,
    app_key: String,
    display_name: String,
    #[serde(default)]
    manifest_snapshot: serde_json::Value,
}

#[async_trait]
impl ListingProviderPort for PlatformIntegrationAdapter {
    async fn resolve_app(&self, _tenant_id: &str, app_id: &str) -> Result<AppReference, String> {
        if !self.enabled {
            return Err("platform integration disabled (APPSTORE_PLATFORM_ENABLED=0)".to_string());
        }

        let path = format!("/app/v3/api/apps/{app_id}");
        match self.http.get_envelope_item::<AppWire>(&path, &[]).await {
            Ok(item) => Ok(AppReference {
                app_id: item.app_id,
                app_key: item.app_key,
                display_name: item.display_name,
                manifest_snapshot: item.manifest_snapshot,
            }),
            Err(error) => Err(format!(
                "platform app resolution failed for {app_id}: {error}"
            )),
        }
    }

    async fn resolve_media_resource(
        &self,
        _tenant_id: &str,
        media_resource_id: &str,
    ) -> Result<MediaUploadResult, String> {
        Err(format!(
            "platform media resolution is owned by sdkwork-drive; use drive adapter for {media_resource_id}"
        ))
    }
}
