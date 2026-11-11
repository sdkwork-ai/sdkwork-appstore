//! Mode-aware construction of the sibling-module ports.
//!
//! This module is the single decision point for *how* App Store reaches
//! sdkwork-drive and sdkwork-search (MODULE_SPEC.md §4.2):
//!
//! - **in-process (default)** — the service/repository crates of the sibling
//!   module, over the process database pool. Nothing about the sibling's HTTP
//!   surface is read, so a deployment that configures nothing still boots and
//!   serves.
//! - **http (explicit opt-in, `APPSTORE_INTEGRATION_MODE=http`)** — the
//!   split-deployment adapters. Because a split deployment is a deliberate
//!   operational choice, it is validated *at startup*: a missing endpoint or
//!   credential aborts the boot instead of failing the first business request,
//!   after state may already have changed.
//!
//! Optional capabilities keep their own opt-ins so enabling a projection or a
//! search federation is a separate decision from choosing the transport.

use std::sync::Arc;

use sdkwork_appstore_catalog_service::ports::search_federation::CatalogSearchFederationPort;
use sdkwork_appstore_library_service::ports::provider::LibraryProviderPort;
use sdkwork_appstore_listing_service::ports::provider::ListingProviderPort;
use sdkwork_appstore_listing_service::ports::search_projection::ListingSearchProjectionPort;
use sdkwork_appstore_release_service::ports::provider::ReleaseProviderPort;
use sdkwork_database_sqlx::DatabasePool;
use sqlx::PgPool;

use super::drive_http_adapter::DriveHttpAdapter;
use super::drive_inprocess::InProcessDriveAdapter;
use super::mode::{integration_mode, IntegrationMode};
use super::search_http_adapter::SearchFederationHttpAdapter;
use super::search_inprocess::{InProcessSearchFederationAdapter, InProcessSearchProjectionAdapter};
use super::search_projection_http_adapter::SearchProjectionHttpAdapter;

/// Enables catalog search federation. Absent or false leaves the SQL query in
/// charge, which is the behaviour of a deployment with no federation endpoint.
pub const APPSTORE_SEARCH_ENABLED_ENV: &str = "APPSTORE_SEARCH_ENABLED";

/// Enables projection of published listings into the search index.
pub const APPSTORE_SEARCH_PROJECTION_ENABLED_ENV: &str = "APPSTORE_SEARCH_PROJECTION_ENABLED";

/// Whether the sdkwork-drive port is wired at all.
///
/// Absent means enabled: Drive backs artifact upload, listing media resolution
/// and storefront downloads, so a deployment that configures nothing gets the
/// in-process port.
pub const APPSTORE_DRIVE_ENABLED_ENV: &str = "APPSTORE_DRIVE_ENABLED";

/// Whether a toggle variable is turned on.
///
/// Absent means off: an optional capability must never be activated by a
/// deployment that did not ask for it.
pub fn flag_enabled(key: &str) -> bool {
    matches!(
        std::env::var(key).as_deref(),
        Ok("1") | Ok("true") | Ok("TRUE") | Ok("True") | Ok("on") | Ok("ON") | Ok("On")
    )
}

/// Whether the Drive port is wired, resolved once at startup.
///
/// The previous HTTP adapter read this flag on every call and answered with
/// "drive integration disabled"; a failure that surfaces only after the caller
/// already changed business state is exactly what MODULE_SPEC.md §4.2.7 tells an
/// in-process migration to remove. Honouring it at composition time instead
/// means a disabled deployment simply has no Drive port, and the domain services
/// keep their own "not configured" behaviour.
pub fn drive_enabled() -> bool {
    drive_enabled_for(std::env::var(APPSTORE_DRIVE_ENABLED_ENV).ok().as_deref())
}

fn drive_enabled_for(configured: Option<&str>) -> bool {
    let configured = configured
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_ascii_lowercase);
    !matches!(
        configured.as_deref(),
        Some("0") | Some("false") | Some("off")
    )
}

/// The sibling-module ports this process runs with.
pub struct AppstoreIntegrationPorts {
    /// Which transport was selected.
    pub mode: IntegrationMode,
    /// Drive-backed artifact/release operations.
    pub release_provider: Option<Arc<dyn ReleaseProviderPort>>,
    /// Drive-backed listing media resolution.
    pub listing_media_provider: Option<Arc<dyn ListingProviderPort>>,
    /// Drive-backed storefront download delivery.
    pub library_provider: Option<Arc<dyn LibraryProviderPort>>,
    /// Federated catalog search.
    pub search_federation: Option<Arc<dyn CatalogSearchFederationPort>>,
    /// Published-listing search projection.
    pub search_projection: Option<Arc<dyn ListingSearchProjectionPort>>,
}

impl AppstoreIntegrationPorts {
    /// Ports with no sibling capability wired, used when none is available.
    pub fn empty(mode: IntegrationMode) -> Self {
        Self {
            mode,
            release_provider: None,
            listing_media_provider: None,
            library_provider: None,
            search_federation: None,
            search_projection: None,
        }
    }
}

/// Extract the PostgreSQL pool the sibling modules need.
///
/// Drive and Search are PostgreSQL-only modules (`DATABASE_SPEC.md`
/// authoritative-server). A client-local SQLite process therefore has no
/// in-process path to them and must not pretend to have one.
pub fn postgres_pool(pool: &DatabasePool) -> Option<PgPool> {
    #[allow(unreachable_patterns)]
    match pool {
        DatabasePool::Postgres(pool, _) => Some(pool.clone()),
        _ => None,
    }
}

/// Build the sibling-module ports for this process.
///
/// # Errors
///
/// Fails only when the caller opted into HTTP mode and that mode's endpoint or
/// credential contract is incomplete. The default in-process mode never fails on
/// missing configuration.
pub fn integration_ports_from_env(pool: &DatabasePool) -> Result<AppstoreIntegrationPorts, String> {
    match integration_mode()? {
        IntegrationMode::InProcess => Ok(in_process_ports(postgres_pool(pool))),
        IntegrationMode::Http => http_ports(),
    }
}

/// In-process ports over an optional PostgreSQL pool.
///
/// `None` (a client-local SQLite process) leaves the Drive ports unset and says
/// so out loud, instead of silently serving `drive://` placeholder URLs.
fn in_process_ports(pg_pool: Option<PgPool>) -> AppstoreIntegrationPorts {
    let Some(pg_pool) = pg_pool else {
        tracing::warn!(
            mode = IntegrationMode::InProcess.label(),
            "sdkwork-drive and sdkwork-search in-process ports require a PostgreSQL pool; \
             continuing without them"
        );
        return AppstoreIntegrationPorts::empty(IntegrationMode::InProcess);
    };

    let drive: Option<Arc<InProcessDriveAdapter>> = if drive_enabled() {
        Some(Arc::new(InProcessDriveAdapter::new(pg_pool.clone())))
    } else {
        tracing::warn!(
            "APPSTORE_DRIVE_ENABLED is off: the in-process sdkwork-drive port is not wired \
             (artifact upload, listing media resolution and storefront downloads are unavailable)"
        );
        None
    };
    let (release_provider, listing_media_provider, library_provider): (
        Option<Arc<dyn ReleaseProviderPort>>,
        Option<Arc<dyn ListingProviderPort>>,
        Option<Arc<dyn LibraryProviderPort>>,
    ) = match drive {
        Some(drive) => (Some(drive.clone()), Some(drive.clone()), Some(drive)),
        None => (None, None, None),
    };

    let search_federation: Option<Arc<dyn CatalogSearchFederationPort>> =
        if flag_enabled(APPSTORE_SEARCH_ENABLED_ENV) {
            match InProcessSearchFederationAdapter::new(pg_pool.clone()) {
                Ok(adapter) => Some(Arc::new(adapter)),
                Err(error) => {
                    tracing::warn!("in-process search federation unavailable: {error}");
                    None
                }
            }
        } else {
            None
        };

    let search_projection: Option<Arc<dyn ListingSearchProjectionPort>> =
        if flag_enabled(APPSTORE_SEARCH_PROJECTION_ENABLED_ENV) {
            match InProcessSearchProjectionAdapter::new(pg_pool) {
                Ok(adapter) => Some(Arc::new(adapter)),
                Err(error) => {
                    tracing::warn!("in-process search projection unavailable: {error}");
                    None
                }
            }
        } else {
            None
        };

    AppstoreIntegrationPorts {
        mode: IntegrationMode::InProcess,
        release_provider,
        listing_media_provider,
        library_provider,
        search_federation,
        search_projection,
    }
}

fn http_ports() -> Result<AppstoreIntegrationPorts, String> {
    let drive: Option<Arc<DriveHttpAdapter>> = if drive_enabled() {
        // Startup validation: a split deployment that cannot address Drive cannot
        // serve release submission or storefront downloads at all, so fail here
        // rather than on the first business request.
        Some(Arc::new(DriveHttpAdapter::from_env()?))
    } else {
        tracing::warn!(
            "APPSTORE_DRIVE_ENABLED is off: the split-deployment sdkwork-drive adapter is not wired"
        );
        None
    };
    let (release_provider, listing_media_provider, library_provider): (
        Option<Arc<dyn ReleaseProviderPort>>,
        Option<Arc<dyn ListingProviderPort>>,
        Option<Arc<dyn LibraryProviderPort>>,
    ) = match drive {
        Some(drive) => (Some(drive.clone()), Some(drive.clone()), Some(drive)),
        None => (None, None, None),
    };

    let search_federation: Option<Arc<dyn CatalogSearchFederationPort>> =
        if flag_enabled(APPSTORE_SEARCH_ENABLED_ENV) {
            Some(Arc::new(SearchFederationHttpAdapter::from_env()?))
        } else {
            None
        };

    let search_projection: Option<Arc<dyn ListingSearchProjectionPort>> =
        if flag_enabled(APPSTORE_SEARCH_PROJECTION_ENABLED_ENV) {
            Some(Arc::new(SearchProjectionHttpAdapter::from_env()?))
        } else {
            None
        };

    Ok(AppstoreIntegrationPorts {
        mode: IntegrationMode::Http,
        release_provider,
        listing_media_provider,
        library_provider,
        search_federation,
        search_projection,
    })
}

#[cfg(test)]
mod tests {
    use super::{
        drive_enabled_for, flag_enabled, in_process_ports, APPSTORE_DRIVE_ENABLED_ENV,
        APPSTORE_SEARCH_ENABLED_ENV, APPSTORE_SEARCH_PROJECTION_ENABLED_ENV,
    };
    use crate::test_support::{env_lock, with_env};

    fn lazy_pg_pool() -> sqlx::PgPool {
        // `connect_lazy` registers pool internals on the ambient Tokio runtime,
        // so these tests run under `#[tokio::test]`.
        sqlx::postgres::PgPoolOptions::new()
            .connect_lazy("postgres://sdkwork:sdkwork@127.0.0.1:5432/sdkwork")
            .expect("lazy pool")
    }

    #[tokio::test]
    async fn a_postgres_pool_yields_in_process_drive_ports() {
        let _guard = env_lock();
        with_env(APPSTORE_DRIVE_ENABLED_ENV, None, || {
            let ports = in_process_ports(Some(lazy_pg_pool()));
            assert!(ports.release_provider.is_some());
            assert!(ports.listing_media_provider.is_some());
            assert!(ports.library_provider.is_some());
        });
    }

    #[tokio::test]
    async fn optional_search_capabilities_stay_off_without_an_opt_in() {
        let _guard = env_lock();
        with_env(APPSTORE_SEARCH_ENABLED_ENV, None, || {
            with_env(APPSTORE_SEARCH_PROJECTION_ENABLED_ENV, None, || {
                let ports = in_process_ports(Some(lazy_pg_pool()));
                assert!(ports.search_federation.is_none());
                assert!(ports.search_projection.is_none());
            });
        });
    }

    #[test]
    fn a_process_without_a_postgres_pool_gets_no_drive_port() {
        let ports = in_process_ports(None);
        assert!(ports.release_provider.is_none());
        assert!(ports.listing_media_provider.is_none());
        assert!(ports.library_provider.is_none());
    }

    #[tokio::test]
    async fn a_disabled_drive_flag_leaves_the_drive_ports_unwired() {
        // The kill switch is honoured when the ports are composed, not per
        // request: a wired port whose every call fails would surface the failure
        // after the caller already changed business state.
        let _guard = env_lock();
        with_env(APPSTORE_DRIVE_ENABLED_ENV, Some("0"), || {
            let ports = in_process_ports(Some(lazy_pg_pool()));
            assert!(ports.release_provider.is_none());
            assert!(ports.listing_media_provider.is_none());
            assert!(ports.library_provider.is_none());
        });
    }

    #[test]
    fn the_drive_flag_defaults_to_enabled_and_accepts_the_documented_off_values() {
        assert!(drive_enabled_for(None));
        assert!(drive_enabled_for(Some("")));
        assert!(drive_enabled_for(Some("  ")));
        assert!(drive_enabled_for(Some("1")));
        assert!(drive_enabled_for(Some("true")));
        for off in ["0", "false", "FALSE", "off", " Off "] {
            assert!(!drive_enabled_for(Some(off)), "value {off:?}");
        }
    }

    #[test]
    fn flags_are_off_when_absent_and_on_only_for_explicit_values() {
        let _guard = env_lock();
        with_env("APPSTORE_TEST_FLAG_ABSENT", None, || {
            assert!(!flag_enabled("APPSTORE_TEST_FLAG_ABSENT"));
        });
        for (value, expected) in [
            ("1", true),
            ("true", true),
            ("on", true),
            ("0", false),
            ("false", false),
            ("off", false),
            ("", false),
        ] {
            with_env("APPSTORE_TEST_FLAG_VALUE", Some(value), || {
                assert_eq!(
                    flag_enabled("APPSTORE_TEST_FLAG_VALUE"),
                    expected,
                    "value {value:?}"
                );
            });
        }
    }
}
