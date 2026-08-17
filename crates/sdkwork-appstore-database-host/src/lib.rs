//! Database lifecycle bootstrap for sdkwork-appstore (`DATABASE_FRAMEWORK_SPEC.md`).

use std::path::PathBuf;
use std::sync::Arc;

use sdkwork_database_config::DatabaseConfig;
use sdkwork_database_lifecycle::{lifecycle_options_from_env, LifecycleOrchestrator};
use sdkwork_database_spi::{DatabaseAssetProvider, DatabaseManifest, DefaultDatabaseModule};
use sdkwork_database_sqlx::{create_pool_from_config, create_pool_from_env, DatabasePool};

pub struct AppstoreDatabaseHost {
    pool: DatabasePool,
    module: Arc<DefaultDatabaseModule>,
}

impl AppstoreDatabaseHost {
    pub fn pool(&self) -> &DatabasePool {
        &self.pool
    }

    pub fn module(&self) -> Arc<DefaultDatabaseModule> {
        self.module.clone()
    }
}

pub async fn bootstrap_appstore_database(
    pool: DatabasePool,
) -> Result<AppstoreDatabaseHost, String> {
    if pool.as_postgres().is_none() {
        return Err("appstore authoritative persistence requires PostgreSQL".to_string());
    }
    let app_root = resolve_app_root();
    let module = Arc::new(
        DefaultDatabaseModule::from_app_root(&app_root)
            .map_err(|error| format!("load appstore database module failed: {error}"))?,
    );
    let manifest = DatabaseManifest::from_file(module.manifest_path())
        .map_err(|error| format!("read appstore database manifest failed: {error}"))?;
    let options = lifecycle_options_from_env("APPSTORE", &manifest);
    let orchestrator = LifecycleOrchestrator::new(pool.clone(), module.clone())
        .with_applied_by("sdkwork-appstore");

    orchestrator
        .init()
        .await
        .map_err(|error| format!("appstore database init failed: {error}"))?;

    if options.auto_migrate {
        orchestrator
            .migrate()
            .await
            .map_err(|error| format!("appstore database migrate failed: {error}"))?;
    }

    Ok(AppstoreDatabaseHost { pool, module })
}

pub async fn bootstrap_appstore_database_from_env() -> Result<AppstoreDatabaseHost, String> {
    let app_root = resolve_app_root();
    let _ = dotenvy::dotenv();
    load_workspace_postgres_env(&app_root);
    if let Ok(pool) = create_pool_from_env("APPSTORE").await {
        if let Some(pool) = pool {
            return bootstrap_appstore_database(pool).await;
        }
    }

    let config = DatabaseConfig::from_env("APPSTORE")
        .map_err(|error| format!("read appstore database config failed: {error}"))?;
    let pool = create_pool_from_config(config)
        .await
        .map_err(|error| format!("create appstore database pool failed: {error}"))?;
    bootstrap_appstore_database(pool).await
}

fn resolve_app_root() -> PathBuf {
    std::env::var("SDKWORK_APPSTORE_APP_ROOT")
        .map(PathBuf::from)
        .unwrap_or_else(|_| {
            PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                .join("../..")
                .canonicalize()
                .unwrap_or_else(|_| PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../.."))
        })
}

fn load_workspace_postgres_env(app_root: &PathBuf) {
    let postgres_env = app_root.join(".env.postgres");
    if postgres_env.is_file() {
        dotenvy::from_filename(&postgres_env).map_err(|error| {
            format!(
                "load workspace postgres env {} failed: {error}",
                postgres_env.display()
            )
        }).expect("workspace postgres env must be readable");
    }
}
