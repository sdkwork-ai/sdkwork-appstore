//! Dependency adapter wiring for the appstore standalone gateway.
//!
//! The gateway does **not** decide how App Store reaches sibling modules; that
//! decision (and its environment contract) lives in
//! `sdkwork_appstore_service_host::integrations::ports` so there is exactly one
//! place that can select the split-deployment transport (MODULE_SPEC.md §4.2).
//!
//! This module only reports what the gateway observed, for startup logs and the
//! readiness surface. It never reads a sibling endpoint variable itself.

use sdkwork_appstore_service_host::integrations::flag_enabled;
use sdkwork_appstore_service_host::integrations::ports::{
    APPSTORE_SEARCH_ENABLED_ENV, APPSTORE_SEARCH_PROJECTION_ENABLED_ENV,
};
use sdkwork_appstore_service_host::integrations::IntegrationMode;

/// Which optional dependency surfaces this process activated.
#[derive(Debug, Clone, Default)]
pub struct DependencyAdapters {
    /// Transport selected for sdkwork-drive / sdkwork-search.
    pub mode: Option<IntegrationMode>,
    /// Whether sdkwork-platform registered-app validation is configured.
    pub platform_enabled: bool,
    /// Whether catalog search federation is enabled.
    pub search_enabled: bool,
    /// Whether published-listing search projection is enabled.
    pub search_projection_enabled: bool,
}

impl DependencyAdapters {
    /// Observe the dependency surface from the configured environment.
    ///
    /// This reads only the transport selector and the optional capability
    /// toggles; it does not build adapters, so it cannot fail and cannot make
    /// startup depend on a sibling endpoint.
    pub fn from_env() -> Self {
        let mode =
            sdkwork_appstore_service_host::integrations::integration_mode()
                .unwrap_or(IntegrationMode::InProcess);
        Self::from_parts(
            mode,
            std::env::var("APPSTORE_PLATFORM_BASE_URL")
                .ok()
                .map(|value| !value.trim().is_empty())
                .unwrap_or(false),
            flag_enabled(APPSTORE_SEARCH_ENABLED_ENV),
            flag_enabled(APPSTORE_SEARCH_PROJECTION_ENABLED_ENV),
        )
    }

    /// Assemble the observed surface from already-resolved parts.
    pub fn from_parts(
        mode: IntegrationMode,
        platform_enabled: bool,
        search_enabled: bool,
        search_projection_enabled: bool,
    ) -> Self {
        Self {
            mode: Some(mode),
            platform_enabled,
            search_enabled,
            search_projection_enabled,
        }
    }

    /// Whether the in-process (default) transport is active.
    pub fn in_process(&self) -> bool {
        matches!(self.mode, Some(IntegrationMode::InProcess))
    }

    /// Whether the explicit split-deployment transport is active.
    pub fn http(&self) -> bool {
        matches!(self.mode, Some(IntegrationMode::Http))
    }
}

#[cfg(test)]
mod tests {
    use super::DependencyAdapters;
    use sdkwork_appstore_service_host::integrations::IntegrationMode;

    #[test]
    fn the_default_transport_is_in_process() {
        let adapters = DependencyAdapters::from_parts(IntegrationMode::InProcess, false, false, false);
        assert!(adapters.in_process());
        assert!(!adapters.http());
    }

    #[test]
    fn the_split_deployment_transport_is_reported_as_http() {
        let adapters = DependencyAdapters::from_parts(IntegrationMode::Http, true, true, false);
        assert!(adapters.http());
        assert!(!adapters.in_process());
        assert!(adapters.platform_enabled);
        assert!(adapters.search_enabled);
        assert!(!adapters.search_projection_enabled);
    }

    #[test]
    fn observing_the_environment_never_panics() {
        let adapters = DependencyAdapters::from_env();
        assert!(
            adapters.in_process() || adapters.http() || adapters.mode.is_none(),
            "from_env must observe at most one transport"
        );
    }
}
