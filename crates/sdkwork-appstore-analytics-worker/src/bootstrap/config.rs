use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct WorkerConfig {
    /// Optional tenant filter. `None` projects every tenant that has
    /// analytics source data (multi-tenant operation).
    pub tenant_id: Option<String>,
    pub metrics_interval_seconds: u64,
    pub chart_interval_seconds: u64,
    pub trending_interval_seconds: u64,
}

impl WorkerConfig {
    pub fn from_env() -> Self {
        Self {
            tenant_id: std::env::var("APPSTORE_TENANT_ID")
                .ok()
                .filter(|value| !value.trim().is_empty()),
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
