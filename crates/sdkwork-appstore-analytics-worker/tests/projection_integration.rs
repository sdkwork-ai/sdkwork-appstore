use chrono::{NaiveDate, Utc};
use sqlx::SqlitePool;

use sdkwork_appstore_analytics_worker::projection::AnalyticsProjectionRepository;
use sdkwork_appstore_repository_sqlx::AppstoreSqlxDb;

const BASELINE_SQL: &str = include_str!(
    "../../../tests/fixtures/database/sqlite/ddl/baseline/sqlite/0001_appstore_baseline.sql"
);

async fn setup_db() -> SqlitePool {
    let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
    for stmt in BASELINE_SQL.split(';') {
        let stmt = stmt.trim();
        if !stmt.is_empty() {
            sqlx::query(stmt).execute(&pool).await.unwrap();
        }
    }
    pool
}

#[tokio::test]
async fn project_listing_metrics_from_install_events() {
    let pool = setup_db().await;
    let repo = AnalyticsProjectionRepository::new(AppstoreSqlxDb::sqlite(pool.clone()));
    let tenant_id = "100001";
    let listing_id = "listing-1";
    let now = Utc::now().to_rfc3339();

    sqlx::query(
        r#"
        INSERT INTO appstore_install_event (
          id, tenant_id, organization_id, event_no, listing_id, release_id,
          user_id, event_type, platform, event_status, occurred_at, created_at
        ) VALUES (?, ?, '0', 'EVT-001', ?, 'rel-1', '1', 'install', 'ANDROID', 'recorded', ?, ?)
        "#,
    )
    .bind("evt-1")
    .bind(tenant_id)
    .bind(listing_id)
    .bind(&now)
    .bind(&now)
    .execute(&pool)
    .await
    .unwrap();

    let snapshot_date = Utc::now().date_naive();
    let written = repo
        .project_listing_metrics(tenant_id, snapshot_date)
        .await
        .expect("projection should succeed");
    assert_eq!(written, 1);

    let row: (i64,) = sqlx::query_as(
        "SELECT install_count FROM appstore_listing_metric_snapshot WHERE listing_id = ?",
    )
    .bind(listing_id)
    .fetch_one(&pool)
    .await
    .unwrap();
    assert_eq!(row.0, 1);
}

#[tokio::test]
async fn project_trending_terms_from_search_history() {
    let pool = setup_db().await;
    let repo = AnalyticsProjectionRepository::new(AppstoreSqlxDb::sqlite(pool.clone()));
    let tenant_id = "100001";
    let now = Utc::now().to_rfc3339();

    for (id, query_text) in [
        ("h1", "photo editor"),
        ("h2", "photo editor"),
        ("h3", "games"),
    ] {
        sqlx::query(
            r#"
            INSERT INTO appstore_catalog_search_history (
              id, tenant_id, user_id, query_text, filters_json, result_count, created_at
            ) VALUES (?, ?, '1', ?, '{}', 0, ?)
            "#,
        )
        .bind(id)
        .bind(tenant_id)
        .bind(query_text)
        .bind(&now)
        .execute(&pool)
        .await
        .unwrap();
    }

    let snapshot_date = NaiveDate::from_ymd_opt(2026, 7, 5).unwrap();
    let written = repo
        .project_trending_terms(tenant_id, snapshot_date, "zh-CN", 7, 10)
        .await
        .expect("trending projection should succeed");
    assert_eq!(written, 2);

    let top: (String, i32) = sqlx::query_as(
        "SELECT term, rank FROM appstore_catalog_trending_term WHERE tenant_id = ? ORDER BY rank ASC LIMIT 1",
    )
    .bind(tenant_id)
    .fetch_one(&pool)
    .await
    .unwrap();
    assert_eq!(top.0, "photo editor");
    assert_eq!(top.1, 1);
}
