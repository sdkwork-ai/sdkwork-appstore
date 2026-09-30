//! Integration tests for the shared-database web chain stores.

use std::time::Duration;

use sqlx::SqlitePool;

use sdkwork_appstore_repository_sqlx::{
    AppstoreDbIdempotencyStore, AppstoreDbRateLimitStore, AppstoreSqlxDb,
};
use sdkwork_web_core::idempotency::IdempotencyBeginOutcome;
use sdkwork_web_core::{IdempotencyStore, RateLimitStore};

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
async fn rate_limit_admits_budget_then_rejects_until_window_expires() {
    let pool = setup_db().await;
    let store = AppstoreDbRateLimitStore::new(AppstoreSqlxDb::sqlite(pool.clone()));

    for _ in 0..3 {
        store
            .check_and_record("key-a", 3, Duration::from_secs(60))
            .await
            .expect("requests within budget must pass");
    }
    assert!(store
        .check_and_record("key-a", 3, Duration::from_secs(60))
        .await
        .is_err());

    // Independent bucket is unaffected.
    store
        .check_and_record("key-b", 3, Duration::from_secs(60))
        .await
        .expect("separate bucket must have its own budget");

    // Counter persists in the shared table.
    let count: (i64,) = sqlx::query_as(
        "SELECT request_count FROM appstore_web_rate_limit_bucket WHERE bucket_key = 'key-a'",
    )
    .fetch_one(&pool)
    .await
    .unwrap();
    assert_eq!(count.0, 4);

    // Backdate the window: the bucket resets and admits again.
    sqlx::query(
        "UPDATE appstore_web_rate_limit_bucket SET window_start = ? WHERE bucket_key = 'key-a'",
    )
    .bind(chrono::Utc::now() - chrono::Duration::minutes(2))
    .execute(&pool)
    .await
    .unwrap();
    store
        .check_and_record("key-a", 3, Duration::from_secs(60))
        .await
        .expect("expired window must reset the budget");
}

#[tokio::test]
async fn idempotency_leader_completes_then_replays() {
    let pool = setup_db().await;
    let store = AppstoreDbIdempotencyStore::new(AppstoreSqlxDb::sqlite(pool.clone()));
    let ttl = Duration::from_secs(300);

    let outcome = store
        .begin("op-key", "fp-1", ttl)
        .await
        .expect("first begin must claim leadership");
    assert!(matches!(outcome, IdempotencyBeginOutcome::Leader));

    // Same fingerprint, still in progress.
    let outcome = store.begin("op-key", "fp-1", ttl).await.unwrap_err();
    assert!(outcome.to_string().contains("in progress"));

    store
        .complete(
            "op-key",
            "fp-1",
            sdkwork_web_core::idempotency::IdempotencyResponseRecord {
                status_code: 200,
                body: b"payload".to_vec(),
                content_type: Some("application/json".to_string()),
            },
            ttl,
        )
        .await
        .expect("completion must persist the response");

    match store.begin("op-key", "fp-1", ttl).await.unwrap() {
        IdempotencyBeginOutcome::Replay(record) => {
            assert_eq!(record.status_code, 200);
            assert_eq!(record.body, b"payload".to_vec());
            assert_eq!(record.content_type.as_deref(), Some("application/json"));
        }
        _ => panic!("completed key must replay"),
    }
}

#[tokio::test]
async fn idempotency_fingerprint_conflict() {
    let pool = setup_db().await;
    let store = AppstoreDbIdempotencyStore::new(AppstoreSqlxDb::sqlite(pool.clone()));
    let ttl = Duration::from_secs(300);

    store.begin("k", "fp-1", ttl).await.unwrap();
    let error = store.begin("k", "fp-2", ttl).await.unwrap_err();
    assert!(error.to_string().contains("different request fingerprint"));
}

#[tokio::test]
async fn idempotency_release_allows_retry_with_same_key() {
    let pool = setup_db().await;
    let store = AppstoreDbIdempotencyStore::new(AppstoreSqlxDb::sqlite(pool.clone()));
    let ttl = Duration::from_secs(300);

    store.begin("k", "fp-1", ttl).await.unwrap();
    store.release("k", "fp-1").await.unwrap();

    let outcome = store
        .begin("k", "fp-1", ttl)
        .await
        .expect("released key must be claimable again");
    assert!(matches!(outcome, IdempotencyBeginOutcome::Leader));
}

#[tokio::test]
async fn idempotency_expired_entry_is_taken_over() {
    let pool = setup_db().await;
    let store = AppstoreDbIdempotencyStore::new(AppstoreSqlxDb::sqlite(pool.clone()));
    let ttl = Duration::from_secs(300);

    store.begin("k", "fp-1", ttl).await.unwrap();
    // Simulate a crashed leader: backdate expiry.
    sqlx::query(
        "UPDATE appstore_web_idempotency_entry SET expires_at = ? WHERE idempotency_key = 'k'",
    )
    .bind(chrono::Utc::now() - chrono::Duration::minutes(1))
    .execute(&pool)
    .await
    .unwrap();

    let outcome = store
        .begin("k", "fp-2", ttl)
        .await
        .expect("expired reservation must be taken over");
    assert!(matches!(outcome, IdempotencyBeginOutcome::Leader));
}
