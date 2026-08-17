use std::time::Duration;

use sdkwork_api_appstore_assembly::http_route_manifest::{
    appstore_open_api_prefixes, appstore_public_path_prefixes,
};
use sdkwork_database_sqlx::enable_process_shared_database_pool;
use sdkwork_iam_web_adapter::{
    build_web_framework_builder_with_open_api_prefixes, iam_web_request_context_resolver_from_env,
};
use sdkwork_web_bootstrap::{infra_public_path_prefixes, ComposedApiAssembly};
use sdkwork_web_core::{memory_idempotency_store, memory_rate_limit_store};
use tracing_subscriber::EnvFilter;

mod bootstrap;
mod preflight;
mod server;

use bootstrap::config::AppstoreGatewayConfig;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .init();
    let _ = dotenvy::dotenv();
    enable_process_shared_database_pool();

    let config = AppstoreGatewayConfig::from_env();
    let adapters = bootstrap::adapters::DependencyAdapters::from_env();
    tracing::info!(
        bind = %config.bind_address,
        "bootstrapping sdkwork-api-appstore-standalone-gateway"
    );
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

    tracing::info!("connecting appstore database and assembling routes");
    let appstore = bootstrap::routers::assemble_router().await;
    let iam = sdkwork_api_iam_assembly::assemble_app_api_contribution()
        .await
        .expect("IAM app API contribution assembly failed");
    tracing::info!("appstore and IAM routes assembled; wiring IAM web framework");
    let composed = ComposedApiAssembly::try_compose("SDKWork AppStore API", vec![appstore, iam])
        .expect("appstore gateway composition failed");
    let mut public_path_prefixes = infra_public_path_prefixes();
    public_path_prefixes.extend(appstore_public_path_prefixes());
    let framework = build_web_framework_builder_with_open_api_prefixes(
        iam_web_request_context_resolver_from_env().await,
        composed.route_manifest.clone(),
        public_path_prefixes,
        appstore_open_api_prefixes(),
    )
    .rate_limit_store(memory_rate_limit_store())
    .idempotency_store(memory_idempotency_store());
    let hosted = composed.into_hosted(framework);
    let app = sdkwork_web_axum::with_request_timeout(hosted.router, Duration::from_secs(30))
        .layer(cors_layer_from_env());

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
