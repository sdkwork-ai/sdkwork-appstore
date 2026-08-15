use sdkwork_web_bootstrap::{service_router, ServiceRouterConfig};
use tracing_subscriber::EnvFilter;

mod bootstrap;
mod preflight;
mod server;

use bootstrap::config::AppstoreGatewayConfig;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();
    let _ = dotenvy::dotenv();

    let config = AppstoreGatewayConfig::from_env();
    let adapters = bootstrap::adapters::DependencyAdapters::from_env();
    tracing::info!(
        active_dependency_surfaces = ?preflight::dependency_surfaces::active_dependency_surfaces()
            .iter()
            .map(|surface| surface.code())
            .collect::<Vec<_>>(),
        drive_enabled = adapters.drive_enabled(),
        platform_enabled = adapters.platform_enabled(),
        search_enabled = adapters.search_enabled(),
        "appstore gateway dependency surfaces"
    );

    let assembly = bootstrap::routers::assemble_router().await;
    let readiness = assembly.readiness_check.clone();
    let business = assembly.router.layer(cors_layer_from_env());
    let app = service_router(
        business,
        ServiceRouterConfig::default().with_readiness_check(readiness),
    );

    server::serve(config.addr(), app).await;
}

fn cors_layer_from_env() -> sdkwork_web_axum::CanonicalCorsLayer {
    let environment =
        sdkwork_web_bootstrap::web_environment_from_env(&["SDKWORK_APPSTORE_ENVIRONMENT"]);
    let origins =
        sdkwork_web_bootstrap::cors_allowed_origins_from_env(&["APPSTORE_CORS_ALLOWED_ORIGINS"]);
    let policy = sdkwork_web_bootstrap::security_policy_for_environment(&environment, origins);
    sdkwork_web_axum::cors_layer_from_policy(policy.cors)
}
