//! Sibling-module integrations (MODULE_SPEC.md §4.2).
//!
//! Two transports exist per sibling module:
//!
//! - `*_inprocess` — the default: the sibling's service/repository crates over
//!   the shared PostgreSQL.
//! - `*_http` — an explicit split-deployment opt-in, validated at startup.
//!
//! `ports` is the single place that decides between them.

pub mod appbase;
pub mod comments;
pub mod commerce;
pub mod drive;
pub mod drive_http_adapter;
pub mod drive_inprocess;
pub mod drive_uploader;
pub mod http_client;
pub mod http_market_channel_connector;
pub mod market_channel_adapter;
pub mod market_channels;
pub mod mode;
pub mod notifications;
pub mod platform;
pub mod platform_adapter;
pub mod ports;
pub mod registry;
pub mod search;
pub mod search_http_adapter;
pub mod search_inprocess;
pub mod search_projection_http_adapter;

pub use drive_http_adapter::DriveHttpAdapter;
pub use drive_inprocess::{DriveServiceSubject, InProcessDriveAdapter};
pub use market_channel_adapter::MarketChannelIntegrationAdapter;
pub use mode::{integration_mode, resolve_integration_mode, IntegrationMode};
pub use platform_adapter::PlatformIntegrationAdapter;
pub use ports::{
    flag_enabled, integration_ports_from_env, AppstoreIntegrationPorts,
    APPSTORE_SEARCH_ENABLED_ENV, APPSTORE_SEARCH_PROJECTION_ENABLED_ENV,
};
pub use search_http_adapter::SearchFederationHttpAdapter;
pub use search_inprocess::{
    appstore_search_index_key, InProcessSearchFederationAdapter, InProcessSearchProjectionAdapter,
    DEFAULT_APPSTORE_SEARCH_INDEX_KEY,
};
pub use search_projection_http_adapter::SearchProjectionHttpAdapter;
