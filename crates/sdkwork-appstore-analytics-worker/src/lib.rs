//! App Store analytics projection worker.

pub mod bootstrap;
pub mod jobs;
pub mod projection;
pub mod scheduler;

use std::sync::Arc;
use std::time::Duration;

use bootstrap::{WorkerConfig, WorkerRepositories};
use jobs::{ChartProjectionJob, ListingMetricsJob, TrendingTermsJob};
use projection::AnalyticsProjectionRepository;
use scheduler::Scheduler;
use tracing::{error, info};

pub async fn run_worker(config: WorkerConfig) -> Result<(), String> {
    let host = sdkwork_appstore_database_host::bootstrap_appstore_database_from_env().await?;
    if host.pool().as_postgres().is_none() {
        return Err("analytics worker authoritative persistence requires PostgreSQL".to_string());
    }
    let database =
        sdkwork_appstore_repository_sqlx::AppstoreSqlxDb::from_database_pool(host.pool())?;

    let repos = Arc::new(WorkerRepositories::new(database));
    let tenant_filter = config.tenant_id.clone();

    let metrics_job = ListingMetricsJob::new(repos.projection.clone());
    let chart_job = ChartProjectionJob::new(repos.projection.clone());
    let trending_job = TrendingTermsJob::new(repos.projection.clone());

    let scheduler = Scheduler::new(
        Duration::from_secs(config.metrics_interval_seconds),
        Duration::from_secs(config.chart_interval_seconds),
        Duration::from_secs(config.trending_interval_seconds),
    );

    info!(
        tenant_filter = tenant_filter.as_deref().unwrap_or("(all tenants)"),
        metrics_secs = config.metrics_interval_seconds,
        chart_secs = config.chart_interval_seconds,
        trending_secs = config.trending_interval_seconds,
        "sdkwork-appstore-analytics-worker started"
    );

    // Run once at startup.
    run_metrics_cycle(&tenant_filter, &repos.projection, &metrics_job).await;
    run_chart_cycle(&tenant_filter, &repos.projection, &chart_job).await;
    run_trending_cycle(&tenant_filter, &repos.projection, &trending_job).await;

    let metrics_interval = scheduler.metrics_interval();
    let chart_interval = scheduler.chart_interval();
    let trending_interval = scheduler.trending_interval();

    let metrics_handle = {
        let repos = Arc::clone(&repos);
        let filter = tenant_filter.clone();
        tokio::spawn(async move {
            let job = ListingMetricsJob::new(repos.projection.clone());
            let mut ticker = tokio::time::interval(metrics_interval);
            loop {
                ticker.tick().await;
                run_metrics_cycle(&filter, &repos.projection, &job).await;
            }
        })
    };

    let chart_handle = {
        let repos = Arc::clone(&repos);
        let filter = tenant_filter.clone();
        tokio::spawn(async move {
            let job = ChartProjectionJob::new(repos.projection.clone());
            let mut ticker = tokio::time::interval(chart_interval);
            loop {
                ticker.tick().await;
                run_chart_cycle(&filter, &repos.projection, &job).await;
            }
        })
    };

    let trending_handle = {
        let repos = Arc::clone(&repos);
        let filter = tenant_filter;
        tokio::spawn(async move {
            let job = TrendingTermsJob::new(repos.projection.clone());
            let mut ticker = tokio::time::interval(trending_interval);
            loop {
                ticker.tick().await;
                run_trending_cycle(&filter, &repos.projection, &job).await;
            }
        })
    };

    tokio::try_join!(metrics_handle, chart_handle, trending_handle)
        .map_err(|e| format!("worker task failed: {e}"))?;
    Ok(())
}

/// Tenants to project in one cycle: the configured filter when present,
/// otherwise every tenant that has analytics source data. Discovery runs
/// per cycle so newly onboarded tenants are picked up without a restart.
async fn resolve_tenant_ids(
    filter: &Option<String>,
    projection: &AnalyticsProjectionRepository,
) -> Vec<String> {
    if let Some(tenant_id) = filter {
        return vec![tenant_id.clone()];
    }
    match projection.find_active_tenant_ids().await {
        Ok(tenants) => tenants,
        Err(error) => {
            error!(error, "analytics tenant discovery failed, skipping cycle");
            Vec::new()
        }
    }
}

async fn run_metrics_cycle(
    filter: &Option<String>,
    projection: &AnalyticsProjectionRepository,
    job: &ListingMetricsJob,
) {
    let tenant_ids = resolve_tenant_ids(filter, projection).await;
    for tenant_id in &tenant_ids {
        let mut delay_secs = 5u64;
        for _ in 0..3 {
            match job.execute(tenant_id).await {
                Ok(count) => {
                    info!(tenant_id, count, "listing metrics projection completed");
                    break;
                }
                Err(error) => {
                    error!(
                        tenant_id,
                        retry_in_secs = delay_secs,
                        error,
                        "listing metrics projection failed, retrying"
                    );
                    tokio::time::sleep(Duration::from_secs(delay_secs)).await;
                    delay_secs *= 2;
                }
            }
        }
    }
}

async fn run_chart_cycle(
    filter: &Option<String>,
    projection: &AnalyticsProjectionRepository,
    job: &ChartProjectionJob,
) {
    let tenant_ids = resolve_tenant_ids(filter, projection).await;
    for tenant_id in &tenant_ids {
        let mut delay_secs = 5u64;
        for _ in 0..3 {
            match job.execute(tenant_id).await {
                Ok(()) => {
                    info!(tenant_id, "chart projection completed");
                    break;
                }
                Err(error) => {
                    error!(
                        tenant_id,
                        retry_in_secs = delay_secs,
                        error,
                        "chart projection failed, retrying"
                    );
                    tokio::time::sleep(Duration::from_secs(delay_secs)).await;
                    delay_secs *= 2;
                }
            }
        }
    }
}

async fn run_trending_cycle(
    filter: &Option<String>,
    projection: &AnalyticsProjectionRepository,
    job: &TrendingTermsJob,
) {
    let tenant_ids = resolve_tenant_ids(filter, projection).await;
    for tenant_id in &tenant_ids {
        let mut delay_secs = 5u64;
        for _ in 0..3 {
            match job.execute(tenant_id).await {
                Ok(count) => {
                    info!(tenant_id, count, "trending terms projection completed");
                    break;
                }
                Err(error) => {
                    error!(
                        tenant_id,
                        retry_in_secs = delay_secs,
                        error,
                        "trending terms projection failed, retrying"
                    );
                    tokio::time::sleep(Duration::from_secs(delay_secs)).await;
                    delay_secs *= 2;
                }
            }
        }
    }
}
