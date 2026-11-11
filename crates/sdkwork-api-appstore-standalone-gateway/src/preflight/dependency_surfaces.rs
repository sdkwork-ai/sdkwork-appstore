//! Dependency surface preflight declarations.
//!
//! Declares the dependency surfaces the appstore standalone gateway consumes and
//! how each one is activated.
//!
//! Sibling SDKWork modules are consumed **in-process** by default
//! (MODULE_SPEC.md §4.2), so their surfaces are always available and have no
//! endpoint to declare here. A surface only becomes opt-in when it is an
//! optional capability (search federation, listing projection) or a genuinely
//! separate dependency (platform, market channels).
//!
//! Endpoint variables are owned by
//! `sdkwork_appstore_service_host::integrations::ports`, the single place that
//! may select a split-deployment transport. This module records *which* surface
//! is active, never *where* it lives.

use sdkwork_appstore_service_host::integrations::flag_enabled;
use sdkwork_appstore_service_host::integrations::ports::{
    APPSTORE_SEARCH_ENABLED_ENV, APPSTORE_SEARCH_PROJECTION_ENABLED_ENV,
};
use sdkwork_appstore_service_host::integrations::IntegrationMode;

/// How a dependency surface became active.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SurfaceActivation {
    /// Always on: served in-process by default, HTTP only in a split deployment.
    Always,
    /// On only when its documented toggle is set.
    OptIn,
}

/// A dependency surface the gateway can activate.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DependencySurface {
    /// sdkwork-drive artifact/media/release storage.
    Drive,
    /// sdkwork-platform registered-app metadata.
    Platform,
    /// sdkwork-search catalog federation.
    Search,
    /// sdkwork-search listing projection.
    SearchProjection,
    /// Market channel connectors.
    MarketChannels,
}

impl DependencySurface {
    /// Stable diagnostic code.
    pub fn code(&self) -> &'static str {
        match self {
            Self::Drive => "drive",
            Self::Platform => "platform",
            Self::Search => "search",
            Self::SearchProjection => "search_projection",
            Self::MarketChannels => "market_channels",
        }
    }

    /// How this surface is activated.
    pub fn activation(&self) -> SurfaceActivation {
        match self {
            Self::Drive => SurfaceActivation::Always,
            Self::Platform | Self::Search | Self::SearchProjection | Self::MarketChannels => {
                SurfaceActivation::OptIn
            }
        }
    }
}

/// All dependency surfaces the gateway can activate in a deployment.
pub fn dependency_surfaces() -> Vec<DependencySurface> {
    vec![
        DependencySurface::Drive,
        DependencySurface::Platform,
        DependencySurface::Search,
        DependencySurface::SearchProjection,
        DependencySurface::MarketChannels,
    ]
}

/// Surfaces activated by the current process configuration.
pub fn active_dependency_surfaces() -> Vec<DependencySurface> {
    let mode = sdkwork_appstore_service_host::integrations::integration_mode()
        .unwrap_or(IntegrationMode::InProcess);
    active_dependency_surfaces_for(mode, &environment_flags())
}

/// The optional capability flags observed in this process.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub struct EnvironmentFlags {
    pub platform_enabled: bool,
    pub search_enabled: bool,
    pub search_projection_enabled: bool,
    pub market_channels_enabled: bool,
}

fn environment_flags() -> EnvironmentFlags {
    EnvironmentFlags {
        platform_enabled: non_empty_env("APPSTORE_PLATFORM_BASE_URL"),
        search_enabled: flag_enabled(APPSTORE_SEARCH_ENABLED_ENV),
        search_projection_enabled: flag_enabled(APPSTORE_SEARCH_PROJECTION_ENABLED_ENV),
        market_channels_enabled: non_empty_env("APPSTORE_MARKET_PROVIDER_ENABLED"),
    }
}

fn non_empty_env(key: &str) -> bool {
    std::env::var(key)
        .ok()
        .map(|value| !value.trim().is_empty())
        .unwrap_or(false)
}

/// Compute the active surfaces from an already-resolved mode and flag set.
pub fn active_dependency_surfaces_for(
    mode: IntegrationMode,
    flags: &EnvironmentFlags,
) -> Vec<DependencySurface> {
    let _ = mode;
    dependency_surfaces()
        .into_iter()
        .filter(|surface| match surface {
            // Drive is required and always served: in-process by default, over
            // HTTP only in a split deployment. Either way the surface is active.
            DependencySurface::Drive => true,
            DependencySurface::Platform => flags.platform_enabled,
            DependencySurface::Search => flags.search_enabled,
            DependencySurface::SearchProjection => flags.search_projection_enabled,
            DependencySurface::MarketChannels => flags.market_channels_enabled,
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::{
        active_dependency_surfaces_for, dependency_surfaces, DependencySurface,
        EnvironmentFlags, SurfaceActivation,
    };
    use sdkwork_appstore_service_host::integrations::IntegrationMode;

    #[test]
    fn drive_is_the_only_always_on_surface() {
        assert_eq!(
            DependencySurface::Drive.activation(),
            SurfaceActivation::Always
        );
        for surface in [
            DependencySurface::Platform,
            DependencySurface::Search,
            DependencySurface::SearchProjection,
            DependencySurface::MarketChannels,
        ] {
            assert_eq!(surface.activation(), SurfaceActivation::OptIn, "{surface:?}");
        }
    }

    #[test]
    fn an_unconfigured_process_activates_only_drive() {
        for mode in [IntegrationMode::InProcess, IntegrationMode::Http] {
            let active = active_dependency_surfaces_for(mode, &EnvironmentFlags::default());
            assert_eq!(active, vec![DependencySurface::Drive]);
        }
    }

    #[test]
    fn optional_capabilities_activate_only_when_flagged() {
        let flags = EnvironmentFlags {
            platform_enabled: true,
            search_enabled: true,
            search_projection_enabled: false,
            market_channels_enabled: true,
        };
        let active = active_dependency_surfaces_for(IntegrationMode::InProcess, &flags);
        assert!(active.contains(&DependencySurface::Platform));
        assert!(active.contains(&DependencySurface::Search));
        assert!(!active.contains(&DependencySurface::SearchProjection));
        assert!(active.contains(&DependencySurface::MarketChannels));
    }

    #[test]
    fn every_surface_has_a_unique_code() {
        let mut codes: Vec<&str> = dependency_surfaces()
            .iter()
            .map(DependencySurface::code)
            .collect();
        codes.sort_unstable();
        let count = codes.len();
        codes.dedup();
        assert_eq!(codes.len(), count, "surface codes must be unique");
    }
}
