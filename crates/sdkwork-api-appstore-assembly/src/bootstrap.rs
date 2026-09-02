//! Gateway bootstrap for sdkwork-appstore.

mod decision_listing_projection;
mod submission_moderation;

use std::sync::Arc;

use axum::Router;
use sdkwork_appstore_catalog_service::service::catalog_service::CatalogService;
use sdkwork_appstore_compliance_service::service::compliance_service::ComplianceService;
use sdkwork_appstore_database_host::bootstrap_appstore_database_from_env;
use sdkwork_appstore_library_service::service::library_service::LibraryService;
use sdkwork_appstore_listing_service::service::listing_service::ListingService;
use sdkwork_appstore_market_service::service::market_service::MarketService;
use sdkwork_appstore_moderation_service::service::moderation_service::ModerationService;
use sdkwork_appstore_publisher_service::service::publisher_service::PublisherService;
use sdkwork_appstore_release_service::service::release_service::ReleaseService;
use sdkwork_appstore_repository_sqlx::repository::catalog_repository::SqlxCatalogRepository;
use sdkwork_appstore_repository_sqlx::repository::compliance_repository::SqlxComplianceRepository;
use sdkwork_appstore_repository_sqlx::repository::library_repository::SqlxLibraryRepository;
use sdkwork_appstore_repository_sqlx::repository::listing_repository::SqlxListingRepository;
use sdkwork_appstore_repository_sqlx::repository::market_repository::SqlxMarketRepository;
use sdkwork_appstore_repository_sqlx::repository::moderation_repository::SqlxModerationRepository;
use sdkwork_appstore_repository_sqlx::repository::publisher_repository::SqlxPublisherRepository;
use sdkwork_appstore_repository_sqlx::repository::release_repository::SqlxReleaseRepository;
use sdkwork_appstore_repository_sqlx::AppstoreSqlxDb;
use sdkwork_appstore_routes_common::AppState;
use sdkwork_appstore_service_host::integrations::http_market_channel_connector::register_http_market_connectors;
use sdkwork_appstore_service_host::integrations::{
    DriveIntegrationAdapter, MarketChannelIntegrationAdapter, PlatformIntegrationAdapter,
    SearchFederationAdapter, SearchProjectionAdapter,
};
use sdkwork_database_sqlx::DatabasePool;

use self::decision_listing_projection::decision_listing_projection_port;
use self::submission_moderation::submission_moderation_port;
pub use sdkwork_web_bootstrap::ApiAssemblyContribution;
use sdkwork_web_bootstrap::{DatabasePoolReadinessCheck, HttpRouteManifest, WebModule};

/// Indivisible host-neutral API assembly contribution (web-bootstrap contract).
pub type ApiAssembly = ApiAssemblyContribution;

/// Assemble the appstore application router from environment variables.
///
/// This function bootstraps the appstore database from environment variables,
/// creates all repositories and services, and builds the router with all route
/// modules. The selected gateway host applies the process web framework once.
pub async fn assemble_api_router() -> Result<ApiAssembly, String> {
    let database_host = bootstrap_appstore_database_from_env().await?;
    assemble_api_router_with_pool(database_host.pool().clone()).await
}

/// Assemble the appstore router against a caller-provided database pool so the
/// platform cloud gateway can share its process-wide PostgreSQL pool.
pub async fn assemble_api_router_with_pool(pool: DatabasePool) -> Result<ApiAssembly, String> {
    let db = AppstoreSqlxDb::from_database_pool(&pool)
        .map_err(|e| format!("Failed to create appstore db from pool: {e}"))?;

    let publisher_repo = SqlxPublisherRepository::new(db.clone());
    let listing_repo = SqlxListingRepository::new(db.clone());
    let release_repo = SqlxReleaseRepository::new(db.clone());
    let catalog_repo = SqlxCatalogRepository::new(db.clone());
    let library_repo = SqlxLibraryRepository::new(db.clone());
    let moderation_repo = SqlxModerationRepository::new(db.clone());
    let compliance_repo = SqlxComplianceRepository::new(db.clone());
    let market_repo = SqlxMarketRepository::new(db.clone());

    let listing_service = {
        let mut service = ListingService::new(listing_repo);
        if let Ok(adapter) = PlatformIntegrationAdapter::from_env() {
            service = service.with_platform_provider(Arc::new(adapter));
        }
        if let Ok(adapter) = DriveIntegrationAdapter::from_env() {
            service = service.with_media_provider(Arc::new(adapter));
        }
        if let Ok(adapter) = SearchProjectionAdapter::from_env() {
            service = service.with_search_projection(Arc::new(adapter));
        }
        service
    };

    let moderation_service = ModerationService::new(moderation_repo.clone())
        .with_listing_projection(decision_listing_projection_port(listing_service.clone()));

    let listing_service = listing_service
        .with_moderation_port(submission_moderation_port(moderation_service.clone()));

    let release_service = {
        let service = ReleaseService::new(release_repo);
        match DriveIntegrationAdapter::from_env() {
            Ok(adapter) => service.with_provider(Arc::new(adapter)),
            Err(_) => service,
        }
    };

    let catalog_service = {
        let mut service = CatalogService::new(catalog_repo);
        if let Ok(adapter) = SearchFederationAdapter::from_env() {
            service = service.with_search_federation(Arc::new(adapter));
        }
        service
    };

    let market_service = {
        let mut service = MarketService::new(market_repo);
        if let Ok(adapter) = MarketChannelIntegrationAdapter::from_env() {
            match register_http_market_connectors(adapter) {
                Ok(Some(adapter)) => {
                    service = service.with_market_provider(Arc::new(adapter));
                }
                _ => {}
            }
        }
        service
    };

    let state = AppState {
        publisher_service: PublisherService::new(publisher_repo),
        listing_service,
        release_service,
        catalog_service,
        library_service: LibraryService::new(library_repo),
        moderation_service,
        compliance_service: ComplianceService::new(compliance_repo),
        market_service,
    };

    let business = Router::new()
        .merge(sdkwork_routes_appstore_catalog_app_api::gateway_mount(
            state.clone(),
        ))
        .merge(sdkwork_routes_appstore_catalog_backend_api::gateway_mount(
            state.clone(),
        ))
        .merge(sdkwork_routes_listing_app_api::gateway_mount(state.clone()))
        .merge(sdkwork_routes_listing_backend_api::gateway_mount(
            state.clone(),
        ))
        .merge(sdkwork_routes_publisher_app_api::gateway_mount(
            state.clone(),
        ))
        .merge(sdkwork_routes_publisher_backend_api::gateway_mount(
            state.clone(),
        ))
        .merge(sdkwork_routes_release_app_api::gateway_mount(state.clone()))
        .merge(sdkwork_routes_library_app_api::gateway_mount(state.clone()))
        .merge(sdkwork_routes_moderation_backend_api::gateway_mount(
            state.clone(),
        ))
        .merge(sdkwork_routes_compliance_app_api::gateway_mount(
            state.clone(),
        ))
        .merge(sdkwork_routes_market_backend_api::gateway_mount(
            state.clone(),
        ))
        .merge(sdkwork_routes_metrics_backend_api::gateway_mount(
            state.clone(),
        ))
        .merge(sdkwork_routes_appstore_catalog_open_api::gateway_mount(
            state.clone(),
        ))
        .merge(sdkwork_routes_listing_open_api::gateway_mount(
            state.clone(),
        ))
        .merge(sdkwork_routes_release_open_api::gateway_mount(
            state.clone(),
        ))
        .merge(sdkwork_routes_automation_open_api::gateway_mount(state));

    let routes = [
        sdkwork_routes_appstore_catalog_app_api::app_route_manifest(),
        sdkwork_routes_appstore_catalog_backend_api::backend_route_manifest(),
        sdkwork_routes_listing_app_api::app_route_manifest(),
        sdkwork_routes_listing_backend_api::backend_route_manifest(),
        sdkwork_routes_publisher_app_api::app_route_manifest(),
        sdkwork_routes_publisher_backend_api::backend_route_manifest(),
        sdkwork_routes_release_app_api::app_route_manifest(),
        sdkwork_routes_library_app_api::app_route_manifest(),
        sdkwork_routes_moderation_backend_api::backend_route_manifest(),
        sdkwork_routes_compliance_app_api::app_route_manifest(),
        sdkwork_routes_market_backend_api::backend_route_manifest(),
        sdkwork_routes_metrics_backend_api::backend_route_manifest(),
        sdkwork_routes_appstore_catalog_open_api::open_route_manifest(),
        sdkwork_routes_listing_open_api::open_route_manifest(),
        sdkwork_routes_release_open_api::open_route_manifest(),
        sdkwork_routes_automation_open_api::open_route_manifest(),
    ]
    .into_iter()
    .flat_map(|manifest| manifest.routes().to_vec())
    .collect();

    ApiAssemblyContribution::from_manifest(
        "sdkwork-appstore",
        "SDKWork Appstore API",
        business,
        HttpRouteManifest::from_owned_routes(routes),
        Vec::new(),
        Arc::new(DatabasePoolReadinessCheck::new(pool)),
    )
}

/// Build the complete host-neutral appstore contribution for gateway embedding.
pub async fn assemble_contribution_with_pool(
    pool: DatabasePool,
) -> Result<ApiAssemblyContribution, String> {
    assemble_api_router_with_pool(pool).await
}

/// Canonical Web Module definition for this application
/// (API_ASSEMBLY_SPEC §4.1.1): the complete HTTP surface — every route,
/// manifest, and OpenAPI document of this owner — as one installable module.
pub async fn web_module() -> Result<WebModule, String> {
    Ok(WebModule::from_contribution(assemble_api_router().await?))
}

/// Same as [`web_module`] but composed on a process-shared database pool
/// (platform gateways, API_ASSEMBLY_SPEC §4.1.1).
pub async fn web_module_with_pool(pool: DatabasePool) -> Result<WebModule, String> {
    Ok(WebModule::from_contribution(assemble_api_router_with_pool(pool).await?))
}
