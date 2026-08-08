use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct WorkerConfig {
    pub tenant_id: String,
    pub metrics_interval_seconds: u64,
    pub chart_interval_seconds: u64,
    pub trending_interval_seconds: u64,
}

impl WorkerConfig {
    pub fn from_env() -> Self {
        Self {
            tenant_id: std::env::var("APPSTORE_TENANT_ID").unwrap_or_else(|_| "100001".to_string()),
            metrics_interval_seconds: std::env::var("APPSTORE_METRICS_INTERVAL_SECONDS")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(3600),
            chart_interval_seconds: std::env::var("APPSTORE_CHART_INTERVAL_SECONDS")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(86400),
            trending_interval_seconds: std::env::var("APPSTORE_TRENDING_INTERVAL_SECONDS")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(3600),
        }
    }
}
