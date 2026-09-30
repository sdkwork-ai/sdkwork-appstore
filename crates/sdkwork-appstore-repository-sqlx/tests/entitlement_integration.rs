//! Integration tests for the commerce entitlement receiver (appstore side).

use chrono::{Duration, Utc};
use sqlx::SqlitePool;

use sdkwork_appstore_library_service::context::AppstoreRequestContext;
use sdkwork_appstore_library_service::domain::commands::{
    CommerceEntitlementCheckRequest, CommerceEntitlementRevokeRequest,
    CommerceEntitlementSyncRequest,
};
use sdkwork_appstore_library_service::{LibraryOperations, LibraryService};
use sdkwork_appstore_release_service::context::AppstoreRequestContext as ReleaseRequestContext;
use sdkwork_appstore_release_service::ports::repository::ReleaseRepositoryPort;
use sdkwork_appstore_repository_sqlx::pool::AppstoreSqlxDb;
use sdkwork_appstore_repository_sqlx::repository::library_repository::SqlxLibraryRepository;
use sdkwork_appstore_repository_sqlx::repository::release_repository::SqlxReleaseRepository;

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

fn test_context() -> AppstoreRequestContext {
    AppstoreRequestContext {
        tenant_id: "100001".to_string(),
        organization_id: "0".to_string(),
        user_id: "1".to_string(),
        request_id: "req-1".to_string(),
        trace_id: Some("trace-1".to_string()),
        permission_scopes: vec![],
    }
}

#[allow(clippy::too_many_arguments)]
fn sync_request(
    app_id: &str,
    status: &str,
    expires_at: Option<chrono::DateTime<Utc>>,
) -> CommerceEntitlementSyncRequest {
    CommerceEntitlementSyncRequest::new(
        app_id,
        Some("listing-1".to_string()),
        "user-42",
        "purchase",
        "order_payment",
        status,
        Utc::now() - Duration::minutes(1),
        expires_at,
        "{}",
    )
}

#[tokio::test]
async fn sync_is_idempotent_and_check_follows_lifecycle() {
    let pool = setup_db().await;
    let repository = SqlxLibraryRepository::new(AppstoreSqlxDb::sqlite(pool.clone()));
    let service = LibraryService::new(repository);
    let ctx = test_context();

    service
        .commerce_entitlement_sync(&ctx, sync_request("app-1", "active", None))
        .await
        .expect("first sync must insert");
    service
        .commerce_entitlement_sync(&ctx, sync_request("app-1", "active", None))
        .await
        .expect("replayed sync must upsert, not duplicate");

    let stored: (i64,) =
        sqlx::query_as("SELECT COUNT(*) FROM appstore_entitlement WHERE app_id = 'app-1'")
            .fetch_one(&pool)
            .await
            .unwrap();
    assert_eq!(stored.0, 1, "natural key must keep a single row");

    let check = service
        .commerce_entitlement_check(
            &ctx,
            CommerceEntitlementCheckRequest::new("app-1", "user-42"),
        )
        .await
        .unwrap();
    assert!(check.has_entitlement, "active entitlement must grant");

    // Expired entitlements must not grant.
    service
        .commerce_entitlement_sync(
            &ctx,
            sync_request("app-2", "active", Some(Utc::now() - Duration::hours(1))),
        )
        .await
        .unwrap();
    let expired = service
        .commerce_entitlement_check(
            &ctx,
            CommerceEntitlementCheckRequest::new("app-2", "user-42"),
        )
        .await
        .unwrap();
    assert!(!expired.has_entitlement, "expired entitlement must deny");
}

#[tokio::test]
async fn revoke_is_cas_and_replay_cannot_resurrect() {
    let pool = setup_db().await;
    let repository = SqlxLibraryRepository::new(AppstoreSqlxDb::sqlite(pool.clone()));
    let service = LibraryService::new(repository);
    let ctx = test_context();

    service
        .commerce_entitlement_sync(&ctx, sync_request("app-1", "active", None))
        .await
        .unwrap();

    let revoked = service
        .commerce_entitlement_revoke(
            &ctx,
            CommerceEntitlementRevokeRequest::new("app-1", "user-42", "purchase"),
        )
        .await
        .unwrap();
    assert!(revoked.revoked, "first revoke must flip the row");

    let replay = service
        .commerce_entitlement_revoke(
            &ctx,
            CommerceEntitlementRevokeRequest::new("app-1", "user-42", "purchase"),
        )
        .await
        .unwrap();
    assert!(!replay.revoked, "replayed revoke must be a no-op");

    let check = service
        .commerce_entitlement_check(
            &ctx,
            CommerceEntitlementCheckRequest::new("app-1", "user-42"),
        )
        .await
        .unwrap();
    assert!(!check.has_entitlement, "revoked entitlement must deny");

    // A replayed sync carrying the revoked snapshot must not resurrect access.
    service
        .commerce_entitlement_sync(&ctx, sync_request("app-1", "revoked", None))
        .await
        .unwrap();
    let after_replay = service
        .commerce_entitlement_check(
            &ctx,
            CommerceEntitlementCheckRequest::new("app-1", "user-42"),
        )
        .await
        .unwrap();
    assert!(
        !after_replay.has_entitlement,
        "revoked replay must stay denied"
    );
}

#[tokio::test]
async fn release_side_entitlement_gate_matches_listing_binding() {
    let pool = setup_db().await;
    let repository = SqlxLibraryRepository::new(AppstoreSqlxDb::sqlite(pool.clone()));
    let service = LibraryService::new(repository);
    let ctx = test_context();

    service
        .commerce_entitlement_sync(&ctx, sync_request("app-1", "active", None))
        .await
        .unwrap();

    let release_ctx = ReleaseRequestContext {
        tenant_id: ctx.tenant_id.clone(),
        organization_id: Some(ctx.organization_id.clone()),
        user_id: Some(ctx.user_id.clone()),
        request_id: ctx.request_id.clone(),
        permission_scopes: vec![],
    };
    let release_repository = SqlxReleaseRepository::new(AppstoreSqlxDb::sqlite(pool.clone()));

    assert!(
        release_repository
            .has_active_entitlement(&release_ctx, "listing-1", "user-42")
            .await
            .unwrap(),
        "entitlement bound to listing-1 must gate-pass listing-1"
    );
    assert!(
        !release_repository
            .has_active_entitlement(&release_ctx, "listing-2", "user-42")
            .await
            .unwrap(),
        "other listings must stay gated"
    );
}
