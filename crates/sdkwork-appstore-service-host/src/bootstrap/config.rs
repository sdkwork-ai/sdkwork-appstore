//! App Store runtime configuration.
//!
//! This type describes *this* process: its listener ports, its default tenant
//! scope, and how it reaches sibling SDKWork modules.
//!
//! It deliberately carries **no** sibling module base URL. Sibling modules are
//! reached in-process by default (MODULE_SPEC.md §4.2); a split deployment opts
//! into HTTP through `APPSTORE_INTEGRATION_MODE=http`, and that transport owns
//! its own endpoint/credential contract inside `crate::integrations::ports`.
//! Keeping endpoints out of this struct is what stops a missing sibling URL
//! from becoming a boot-time requirement again.

use serde::{Deserialize, Serialize};

use crate::integrations::mode::IntegrationMode;

/// Runtime configuration resolved from the process environment.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AppstoreRuntimeConfig {
    pub app_api_port: u16,
    pub backend_api_port: u16,
    pub open_api_port: u16,
    pub tenant_id: String,
    pub organization_id: Option<String>,
    /// How this process reaches sdkwork-drive / sdkwork-search.
    pub integration_mode: IntegrationMode,
}

impl AppstoreRuntimeConfig {
    /// Resolve the configuration from the environment.
    ///
    /// # Errors
    ///
    /// Returns an error only for an explicitly misspelled integration mode; an
    /// absent mode resolves to the in-process default.
    pub fn from_env() -> Result<Self, String> {
        Ok(Self {
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
            tenant_id: std::env::var("APPSTORE_TENANT_ID").unwrap_or_else(|_| "100001".to_string()),
            organization_id: std::env::var("APPSTORE_ORGANIZATION_ID").ok(),
            integration_mode: crate::integrations::mode::integration_mode()?,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::AppstoreRuntimeConfig;
    use crate::integrations::mode::IntegrationMode;
    use crate::test_support::env_lock;

    #[test]
    fn the_runtime_config_carries_no_sibling_module_endpoint() {
        let _guard = env_lock();
        let config = AppstoreRuntimeConfig::from_env().expect("the default must resolve");
        assert_eq!(config.integration_mode, IntegrationMode::InProcess);
    }

    #[test]
    fn no_sibling_endpoint_variable_is_read() {
        // Regression guard: this struct used to require IAM and Drive base URLs.
        let source = include_str!("config.rs");
        let production = source
            .split("#[cfg(test)]")
            .next()
            .expect("the module has a production section");
        for forbidden in ["_BASE_URL", "_URL\""] {
            assert!(
                !production.contains(forbidden),
                "runtime config must not read {forbidden}"
            );
        }
    }
}
