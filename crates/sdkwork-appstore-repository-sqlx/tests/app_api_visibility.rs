//! app-api consumer-boundary tests over the real sqlx repositories.
//!
//! R1 — `GET /app/v3/api/releases/{releaseId}` must apply the same
//!      publisher/visibility policy as the release list: the owning publisher
//!      sees every management state, every other tenant caller sees published
//!      releases only, and a hidden release answers not-found (never 403) so
//!      its existence does not leak.
//!
//! R2 — `POST /app/v3/api/download_grants` must refuse to mint a grant from a
//!      listing that is not live on the storefront (hidden / non-active), and
//!      must not write a grant row for it.

use chrono::Utc;
use sqlx::SqlitePool;

use sdkwork_appstore_library_service::context::AppstoreRequestContext as LibraryRequestContext;
use sdkwork_appstore_library_service::error::AppstoreServiceError as LibraryError;
use sdkwork_appstore_library_service::{
    CreateDownloadGrantRequest, LibraryOperations, LibraryService,
};
use sdkwork_appstore_release_service::context::AppstoreRequestContext as ReleaseRequestContext;
use sdkwork_appstore_release_service::{
    ReleaseOperations, ReleaseService, ReleaseStatus, RetrieveReleaseRequest,
};
use sdkwork_appstore_repository_sqlx::pool::AppstoreSqlxDb;
use sdkwork_appstore_repository_sqlx::repository::library_repository::SqlxLibraryRepository;
use sdkwork_appstore_repository_sqlx::repository::release_repository::SqlxReleaseRepository;

const BASELINE_SQL: &str = include_str!(
    "../../../tests/fixtures/database/sqlite/ddl/baseline/sqlite/0001_appstore_baseline.sql"
);

const TENANT: &str = "100001";
const PUBLISHER_ID: &str = "pub-1";
const PUBLISHER_OWNER: &str = "publisher-user";
const TENANT_MEMBER: &str = "tenant-member";

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

fn release_ctx(user_id: &str) -> ReleaseRequestContext {
    ReleaseRequestContext {
        tenant_id: TENANT.to_string(),
        organization_id: Some("0".to_string()),
        user_id: Some(user_id.to_string()),
        request_id: "req-1".to_string(),
        permission_scopes: vec![],
    }
}

fn library_ctx(user_id: &str) -> LibraryRequestContext {
    LibraryRequestContext {
        tenant_id: TENANT.to_string(),
        organization_id: "0".to_string(),
        user_id: user_id.to_string(),
        request_id: "req-1".to_string(),
        trace_id: None,
        permission_scopes: vec![],
    }
}

async fn insert_publisher(pool: &SqlitePool, publisher_id: &str, owner_user_id: &str) {
    let now = Utc::now().to_rfc3339();
    sqlx::query(
        r#"INSERT INTO appstore_publisher (
            id, tenant_id, organization_id, publisher_no, publisher_type, display_name,
            publisher_status, verification_status, contact_snapshot_json,
            profile_snapshot_json, owner_user_id, version, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
    )
    .bind(publisher_id)
    .bind(TENANT)
    .bind("0")
    .bind(format!("PUB-{publisher_id}"))
    .bind("individual")
    .bind("Test Publisher")
    .bind("active")
    .bind("unverified")
    .bind("{}")
    .bind("{}")
    .bind(owner_user_id)
    .bind(1)
    .bind(&now)
    .bind(&now)
    .execute(pool)
    .await
    .unwrap();
}

/// Seeds the publisher plus one listing with the given lifecycle state.
async fn insert_listing(
    pool: &SqlitePool,
    listing_id: &str,
    app_id: &str,
    listing_status: &str,
    storefront_visibility: &str,
) {
    insert_publisher(pool, PUBLISHER_ID, PUBLISHER_OWNER).await;
    let now = Utc::now().to_rfc3339();
    sqlx::query(
        r#"INSERT INTO appstore_application_listing (
            id, tenant_id, organization_id, publisher_id, listing_no, app_id, app_key,
            listing_slug, listing_type, pricing_model, listing_status, storefront_visibility,
            review_status, default_locale, content_rating_json, featured_score, download_count,
            rating_count, version, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
    )
    .bind(listing_id)
    .bind(TENANT)
    .bind("0")
    .bind(PUBLISHER_ID)
    .bind(format!("LST-{listing_id}"))
    .bind(app_id)
    .bind(format!("{app_id}-key"))
    .bind(format!("{listing_id}-slug"))
    .bind("app")
    .bind("free")
    .bind(listing_status)
    .bind(storefront_visibility)
    .bind("approved")
    .bind("en-US")
    .bind("{}")
    .bind(0)
    .bind(0)
    .bind(0)
    .bind(1)
    .bind(&now)
    .bind(&now)
    .execute(pool)
    .await
    .unwrap();
}

async fn insert_release(
    pool: &SqlitePool,
    release_id: &str,
    release_no: &str,
    listing_id: &str,
    release_status: &str,
) {
    let now = Utc::now().to_rfc3339();
    sqlx::query(
        r#"INSERT INTO appstore_application_release (
            id, tenant_id, organization_id, listing_id, release_no, channel_id,
            version_name, version_code, release_status, manifest_snapshot_json,
            version, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
    )
    .bind(release_id)
    .bind(TENANT)
    .bind("0")
    .bind(listing_id)
    .bind(release_no)
    .bind("channel-stable")
    .bind("1.0.0")
    .bind("1")
    .bind(release_status)
    .bind("{}")
    .bind(1)
    .bind(&now)
    .bind(&now)
    .execute(pool)
    .await
    .unwrap();
}

async fn insert_verified_artifact(pool: &SqlitePool, artifact_id: &str, release_id: &str) {
    let now = Utc::now().to_rfc3339();
    sqlx::query(
        r#"INSERT INTO appstore_application_release_artifact (
            id, tenant_id, organization_id, release_id, artifact_no, platform,
            architecture, package_format, artifact_status, drive_node_id,
            file_size_bytes, content_type, checksum_sha256, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
    )
    .bind(artifact_id)
    .bind(TENANT)
    .bind("0")
    .bind(release_id)
    .bind(format!("ART-{artifact_id}"))
    .bind("windows")
    .bind("x86_64")
    .bind("msi")
    .bind("verified")
    .bind("drive-node-1")
    .bind("1048576")
    .bind("application/octet-stream")
    .bind("checksum-1")
    .bind(&now)
    .bind(&now)
    .execute(pool)
    .await
    .unwrap();
}

fn release_service(pool: &SqlitePool) -> ReleaseService<SqlxReleaseRepository> {
    ReleaseService::new(SqlxReleaseRepository::new(AppstoreSqlxDb::sqlite(
        pool.clone(),
    )))
}

fn library_service(pool: &SqlitePool) -> LibraryService<SqlxLibraryRepository> {
    LibraryService::new(SqlxLibraryRepository::new(AppstoreSqlxDb::sqlite(
        pool.clone(),
    )))
}

// ---------------------------------------------------------------------------
// R1: release retrieve visibility
// ---------------------------------------------------------------------------

#[tokio::test]
async fn draft_release_is_not_found_for_non_publisher() {
    let pool = setup_db().await;
    insert_listing(&pool, "listing-1", "app-1", "draft", "hidden").await;
    insert_release(&pool, "release-draft", "REL-001", "listing-1", "draft").await;

    let result = release_service(&pool)
        .retrieve_release(
            &release_ctx(TENANT_MEMBER),
            RetrieveReleaseRequest::new("release-draft"),
        )
        .await
        .expect("retrieve must not surface a forbidden error");

    assert!(
        result.release.is_none(),
        "a draft release must answer not-found for a non-publisher"
    );
}

#[tokio::test]
async fn retired_release_is_hidden_from_non_publisher() {
    let pool = setup_db().await;
    insert_listing(&pool, "listing-1", "app-1", "draft", "hidden").await;
    insert_release(&pool, "release-retired", "REL-002", "listing-1", "retired").await;

    let result = release_service(&pool)
        .retrieve_release(
            &release_ctx(TENANT_MEMBER),
            RetrieveReleaseRequest::new("release-retired"),
        )
        .await
        .unwrap();

    assert!(
        result.release.is_none(),
        "only published releases are visible outside the publisher view"
    );
}

#[tokio::test]
async fn draft_release_is_visible_to_publisher_owner() {
    let pool = setup_db().await;
    insert_listing(&pool, "listing-1", "app-1", "draft", "hidden").await;
    insert_release(&pool, "release-draft", "REL-001", "listing-1", "draft").await;

    let result = release_service(&pool)
        .retrieve_release(
            &release_ctx(PUBLISHER_OWNER),
            RetrieveReleaseRequest::new("release-draft"),
        )
        .await
        .unwrap();

    let release = result
        .release
        .expect("the owning publisher must read its own draft release");
    assert_eq!(release.release_status, ReleaseStatus::Draft);
}

#[tokio::test]
async fn published_release_is_visible_to_any_tenant_member() {
    let pool = setup_db().await;
    insert_listing(&pool, "listing-1", "app-1", "active", "visible").await;
    insert_release(
        &pool,
        "release-published",
        "REL-003",
        "listing-1",
        "published",
    )
    .await;

    let result = release_service(&pool)
        .retrieve_release(
            &release_ctx(TENANT_MEMBER),
            RetrieveReleaseRequest::new("release-published"),
        )
        .await
        .unwrap();

    let release = result
        .release
        .expect("a published release must be readable by every tenant member");
    assert_eq!(release.release_status, ReleaseStatus::Published);
}

// ---------------------------------------------------------------------------
// R2: download grant minting requires a live storefront listing
// ---------------------------------------------------------------------------

#[tokio::test]
async fn hidden_listing_cannot_mint_download_grant() {
    let pool = setup_db().await;
    insert_listing(&pool, "listing-1", "app-1", "draft", "hidden").await;
    insert_release(&pool, "release-1", "REL-010", "listing-1", "published").await;
    insert_verified_artifact(&pool, "artifact-1", "release-1").await;

    let error = library_service(&pool)
        .download_grants_create(
            &library_ctx(TENANT_MEMBER),
            CreateDownloadGrantRequest::new("artifact-1"),
        )
        .await
        .expect_err("a hidden listing must not mint a download grant");

    assert!(
        matches!(error, LibraryError::NotFound(_)),
        "a hidden listing must be indistinguishable from a missing artifact, got {error:?}"
    );

    let grants: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM appstore_download_grant")
        .fetch_one(&pool)
        .await
        .unwrap();
    assert_eq!(
        grants, 0,
        "no grant row may be written for a hidden listing"
    );
}

#[tokio::test]
async fn live_listing_mints_download_grant() {
    let pool = setup_db().await;
    insert_listing(&pool, "listing-1", "app-1", "active", "visible").await;
    insert_release(&pool, "release-1", "REL-010", "listing-1", "published").await;
    insert_verified_artifact(&pool, "artifact-1", "release-1").await;

    let result = library_service(&pool)
        .download_grants_create(
            &library_ctx(TENANT_MEMBER),
            CreateDownloadGrantRequest::new("artifact-1"),
        )
        .await
        .expect("a live storefront listing must mint a download grant");

    assert_eq!(result.grant.listing_id, "listing-1");
    assert_eq!(result.grant.artifact_id, "artifact-1");

    let grants: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM appstore_download_grant")
        .fetch_one(&pool)
        .await
        .unwrap();
    assert_eq!(grants, 1);
}

#[tokio::test]
async fn featured_listing_mints_download_grant() {
    // `featured` is a public storefront visibility (Listing::is_visible), so
    // the grant gate must not over-tighten to `visible` only.
    let pool = setup_db().await;
    insert_listing(&pool, "listing-1", "app-1", "active", "featured").await;
    insert_release(&pool, "release-1", "REL-011", "listing-1", "published").await;
    insert_verified_artifact(&pool, "artifact-1", "release-1").await;

    let result = library_service(&pool)
        .download_grants_create(
            &library_ctx(TENANT_MEMBER),
            CreateDownloadGrantRequest::new("artifact-1"),
        )
        .await
        .expect("a featured listing is public and must mint a download grant");

    assert_eq!(result.grant.listing_id, "listing-1");
}
