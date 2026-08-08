use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AppstoreRuntimeConfig {
    pub app_api_port: u16,
    pub backend_api_port: u16,
    pub open_api_port: u16,
    pub tenant_id: String,
    pub organization_id: Option<String>,
    pub iam_base_url: String,
    pub drive_base_url: String,
    pub comments_base_url: String,
    pub commerce_base_url: String,
}

impl AppstoreRuntimeConfig {
    pub fn from_env() -> Self {
        Self {
            app_api_port: std::env::var("APPSTORE_APP_API_PORT")
                .ok()
                .and_then(|p| p.parse().ok())
                .unwrap_or(18090),
            backend_api_port: std::env::var("APPSTORE_BACKEND_API_PORT")
                .ok()
                .and_then(|p| p.parse().ok())
                .unwrap_or(18091),
            open_api_port: std::env::var("APPSTORE_OPEN_API_PORT")
                .ok()
                .and_then(|p| p.parse().ok())
                .unwrap_or(18092),
            tenant_id: std::env::var("APPSTORE_TENANT_ID")
                .unwrap_or_else(|_| "100001".to_string()),
            organization_id: std::env::var("APPSTORE_ORGANIZATION_ID").ok(),
            iam_base_url: std::env::var("APPSTORE_IAM_BASE_URL")
                .unwrap_or_else(|_| "http://127.0.0.1:18080".to_string()),
            drive_base_url: std::env::var("APPSTORE_DRIVE_BASE_URL")
                .unwrap_or_else(|_| "http://127.0.0.1:18081".to_string()),
            comments_base_url: std::env::var("APPSTORE_COMMENTS_BASE_URL")
                .unwrap_or_else(|_| "http://127.0.0.1:18082".to_string()),
            commerce_base_url: std::env::var("APPSTORE_COMMERCE_BASE_URL")
                .unwrap_or_else(|_| "http://127.0.0.1:18083".to_string()),
        }
    }
}
