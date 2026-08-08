use chrono::Utc;
use sqlx::SqlitePool;

use sdkwork_appstore_publisher_service::context::AppstoreRequestContext;
use sdkwork_appstore_publisher_service::domain::models::*;
use sdkwork_appstore_publisher_service::ports::repository::PublisherRepositoryPort;

use sdkwork_appstore_release_service::context::AppstoreRequestContext as ReleaseRequestContext;
use sdkwork_appstore_release_service::domain::models::{
    ArtifactId, ArtifactStatus, Release, ReleaseArtifact, ReleaseChannelId, ReleaseId,
    ReleaseStatus, SignatureSnapshot,
};
use sdkwork_appstore_release_service::ports::repository::ReleaseRepositoryPort;
use sdkwork_appstore_repository_sqlx::pool::AppstoreSqlxDb;
use sdkwork_appstore_repository_sqlx::repository::publisher_repository::SqlxPublisherRepository;
use sdkwork_appstore_repository_sqlx::repository::release_repository::SqlxReleaseRepository;

const MIGRATION_SQL: &str = include_str!(
    "../../../tests/fixtures/database/sqlite/ddl/baseline/sqlite/0001_appstore_baseline.sql"
);

async fn setup_db() -> SqlitePool {
    let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
    for stmt in MIGRATION_SQL.split(';') {
        let stmt = stmt.trim();
        if !stmt.is_empty() {
            sqlx::query(stmt).execute(&pool).await.unwrap();
        }
    }
    pool
}

fn appstore_db(pool: &SqlitePool) -> AppstoreSqlxDb {
    AppstoreSqlxDb::sqlite(pool.clone())
}

fn test_context() -> AppstoreRequestContext {
    AppstoreRequestContext {
        tenant_id: "100001".to_string(),
        organization_id: "0".to_string(),
        user_id: "1".to_string(),
        request_id: "req-1".to_string(),
        trace_id: Some("trace-1".to_string()),
        permission_scopes: vec!["appstore.publishers.*".to_string()],
    }
}

#[tokio::test]
async fn test_publisher_crud() {
    let pool = setup_db().await;
    let repo = SqlxPublisherRepository::new(appstore_db(&pool));
    let ctx = test_context();

    let now = Utc::now();
    let publisher = Publisher {
        id: PublisherId::new("pub-1"),
        tenant_id: ctx.tenant_id.clone(),
        organization_id: ctx.organization_id.clone(),
        publisher_no: "PUB-001".to_string(),
        publisher_type: PublisherType::Individual,
        display_name: "Test Publisher".to_string(),
        legal_name: Some("Test Legal Name".to_string()),
        status: PublisherStatus::Active,
        verification_status: VerificationStatus::Unverified,
        contact_snapshot: ContactSnapshot {
            email: Some("test@example.com".to_string()),
            phone: None,
            address: None,
        },
        profile_snapshot: ProfileSnapshot {
            bio: None,
            website_url: Some("https://example.com".to_string()),
            social_links: vec![],
        },
        website_url: Some("https://example.com".to_string()),
        support_email: Some("support@example.com".to_string()),
        logo_media_resource_id: None,
        owner_user_id: ctx.user_id.clone(),
        version: 1,
        verified_at: None,
        suspended_at: None,
        deleted_at: None,
        created_at: now,
        updated_at: now,
    };

    repo.insert_publisher(&ctx, &publisher).await.unwrap();

    let found = repo
        .find_publisher_by_id(&ctx, &PublisherId::new("pub-1"))
        .await
        .unwrap();
    assert!(found.is_some());
    let found = found.unwrap();
    assert_eq!(found.display_name, "Test Publisher");
    assert_eq!(found.status, PublisherStatus::Active);

    let found_by_owner = repo
        .find_publisher_by_owner(&ctx, &ctx.user_id)
        .await
        .unwrap();
    assert!(found_by_owner.is_some());

    let found_by_org = repo
        .find_publisher_by_organization(&ctx, &ctx.organization_id)
        .await
        .unwrap();
    assert!(found_by_org.is_some());
}

#[tokio::test]
async fn test_publisher_update() {
    let pool = setup_db().await;
    let repo = SqlxPublisherRepository::new(appstore_db(&pool));
    let ctx = test_context();

    let now = Utc::now();
    let publisher = Publisher {
        id: PublisherId::new("pub-2"),
        tenant_id: ctx.tenant_id.clone(),
        organization_id: ctx.organization_id.clone(),
        publisher_no: "PUB-002".to_string(),
        publisher_type: PublisherType::Organization,
        display_name: "Original Name".to_string(),
        legal_name: None,
        status: PublisherStatus::Active,
        verification_status: VerificationStatus::Unverified,
        contact_snapshot: ContactSnapshot::default(),
        profile_snapshot: ProfileSnapshot::default(),
        website_url: None,
        support_email: None,
        logo_media_resource_id: None,
        owner_user_id: ctx.user_id.clone(),
        version: 1,
        verified_at: None,
        suspended_at: None,
        deleted_at: None,
        created_at: now,
        updated_at: now,
    };

    repo.insert_publisher(&ctx, &publisher).await.unwrap();

    let mut updated = publisher.clone();
    updated.display_name = "Updated Name".to_string();
    updated.version = 2;
    updated.updated_at = Utc::now();

    repo.update_publisher(&ctx, &updated).await.unwrap();

    let found = repo
        .find_publisher_by_id(&ctx, &PublisherId::new("pub-2"))
        .await
        .unwrap()
        .unwrap();
    assert_eq!(found.display_name, "Updated Name");
}

#[tokio::test]
async fn test_publisher_not_found() {
    let pool = setup_db().await;
    let repo = SqlxPublisherRepository::new(appstore_db(&pool));
    let ctx = test_context();

    let found = repo
        .find_publisher_by_id(&ctx, &PublisherId::new("nonexistent"))
        .await
        .unwrap();
    assert!(found.is_none());
}

#[tokio::test]
async fn test_publisher_member_crud() {
    let pool = setup_db().await;
    let repo = SqlxPublisherRepository::new(appstore_db(&pool));
    let ctx = test_context();

    let now = Utc::now();
    let publisher = Publisher {
        id: PublisherId::new("pub-3"),
        tenant_id: ctx.tenant_id.clone(),
        organization_id: ctx.organization_id.clone(),
        publisher_no: "PUB-003".to_string(),
        publisher_type: PublisherType::Individual,
        display_name: "Publisher With Members".to_string(),
        legal_name: None,
        status: PublisherStatus::Active,
        verification_status: VerificationStatus::Unverified,
        contact_snapshot: ContactSnapshot::default(),
        profile_snapshot: ProfileSnapshot::default(),
        website_url: None,
        support_email: None,
        logo_media_resource_id: None,
        owner_user_id: ctx.user_id.clone(),
        version: 1,
        verified_at: None,
        suspended_at: None,
        deleted_at: None,
        created_at: now,
        updated_at: now,
    };

    repo.insert_publisher(&ctx, &publisher).await.unwrap();

    let member = PublisherMember {
        id: "member-1".to_string(),
        tenant_id: ctx.tenant_id.clone(),
        organization_id: ctx.organization_id.clone(),
        publisher_id: PublisherId::new("pub-3"),
        user_id: "user-2".to_string(),
        member_role: MemberRole::Admin,
        member_status: MemberStatus::Active,
        invited_by: Some(ctx.user_id.clone()),
        joined_at: Some(now),
        created_at: now,
        updated_at: now,
    };

    repo.insert_member(&ctx, &member).await.unwrap();

    let members = repo
        .find_members_by_publisher(&ctx, &PublisherId::new("pub-3"), None, 10)
        .await
        .unwrap();
    assert_eq!(members.len(), 1);
    assert_eq!(members[0].user_id, "user-2");

    let found_member = repo
        .find_member_by_user(&ctx, &PublisherId::new("pub-3"), "user-2")
        .await
        .unwrap();
    assert!(found_member.is_some());
}

#[tokio::test]
async fn test_publisher_verification_crud() {
    let pool = setup_db().await;
    let repo = SqlxPublisherRepository::new(appstore_db(&pool));
    let ctx = test_context();

    let now = Utc::now();
    let publisher = Publisher {
        id: PublisherId::new("pub-4"),
        tenant_id: ctx.tenant_id.clone(),
        organization_id: ctx.organization_id.clone(),
        publisher_no: "PUB-004".to_string(),
        publisher_type: PublisherType::Individual,
        display_name: "Publisher With Verification".to_string(),
        legal_name: None,
        status: PublisherStatus::Active,
        verification_status: VerificationStatus::Unverified,
        contact_snapshot: ContactSnapshot::default(),
        profile_snapshot: ProfileSnapshot::default(),
        website_url: None,
        support_email: None,
        logo_media_resource_id: None,
        owner_user_id: ctx.user_id.clone(),
        version: 1,
        verified_at: None,
        suspended_at: None,
        deleted_at: None,
        created_at: now,
        updated_at: now,
    };

    repo.insert_publisher(&ctx, &publisher).await.unwrap();

    let verification = PublisherVerification {
        id: "ver-1".to_string(),
        tenant_id: ctx.tenant_id.clone(),
        organization_id: ctx.organization_id.clone(),
        publisher_id: PublisherId::new("pub-4"),
        verification_type: VerificationType::Identity,
        verification_status: VerificationStatus::Pending,
        credential_snapshot: serde_json::json!({"document_type": "passport"}),
        evidence_media_resource_id: Some("media-1".to_string()),
        reviewed_by: None,
        reviewed_at: None,
        expires_at: None,
        created_at: now,
        updated_at: now,
    };

    repo.insert_verification(&ctx, &verification).await.unwrap();

    let found = repo
        .find_verification(
            &ctx,
            &PublisherId::new("pub-4"),
            &VerificationType::Identity,
        )
        .await
        .unwrap();
    assert!(found.is_some());
    let found = found.unwrap();
    assert_eq!(found.verification_status, VerificationStatus::Pending);
}

#[tokio::test]
async fn test_publisher_optimistic_lock_conflict() {
    let pool = setup_db().await;
    let repo = SqlxPublisherRepository::new(appstore_db(&pool));
    let ctx = test_context();

    let now = Utc::now();
    let publisher = Publisher {
        id: PublisherId::new("pub-5"),
        tenant_id: ctx.tenant_id.clone(),
        organization_id: ctx.organization_id.clone(),
        publisher_no: "PUB-005".to_string(),
        publisher_type: PublisherType::Individual,
        display_name: "Optimistic Lock Test".to_string(),
        legal_name: None,
        status: PublisherStatus::Active,
        verification_status: VerificationStatus::Unverified,
        contact_snapshot: ContactSnapshot::default(),
        profile_snapshot: ProfileSnapshot::default(),
        website_url: None,
        support_email: None,
        logo_media_resource_id: None,
        owner_user_id: ctx.user_id.clone(),
        version: 1,
        verified_at: None,
        suspended_at: None,
        deleted_at: None,
        created_at: now,
        updated_at: now,
    };

    repo.insert_publisher(&ctx, &publisher).await.unwrap();

    let mut updated = publisher.clone();
    updated.version = 3;
    updated.display_name = "Conflict".to_string();

    let result = repo.update_publisher(&ctx, &updated).await;
    assert!(result.is_err());
}

#[tokio::test]
async fn test_database_schema_integrity() {
    let pool = setup_db().await;

    let tables: Vec<(String,)> = sqlx::query_as(
        "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'appstore_%' ORDER BY name"
    )
    .fetch_all(&pool)
    .await
    .unwrap();

    let table_names: Vec<&str> = tables.iter().map(|(name,)| name.as_str()).collect();

    assert!(table_names.contains(&"appstore_publisher"));
    assert!(table_names.contains(&"appstore_publisher_member"));
    assert!(table_names.contains(&"appstore_publisher_verification"));
    assert!(table_names.contains(&"appstore_listing"));
    assert!(table_names.contains(&"appstore_listing_localization"));
    assert!(table_names.contains(&"appstore_listing_media"));
    assert!(table_names.contains(&"appstore_listing_category_binding"));
    assert!(table_names.contains(&"appstore_listing_submission"));
    assert!(table_names.contains(&"appstore_category"));
    assert!(table_names.contains(&"appstore_category_localization"));
    assert!(table_names.contains(&"appstore_release"));
    assert!(table_names.contains(&"appstore_release_channel"));
    assert!(table_names.contains(&"appstore_release_artifact"));
    assert!(table_names.contains(&"appstore_release_rollout"));
    assert!(table_names.contains(&"appstore_compliance_profile"));
    assert!(table_names.contains(&"appstore_compliance_permission_disclosure"));
    assert!(table_names.contains(&"appstore_moderation_review"));
    assert!(table_names.contains(&"appstore_moderation_decision"));
    assert!(table_names.contains(&"appstore_catalog_collection"));
    assert!(table_names.contains(&"appstore_catalog_featured_slot"));
    assert!(table_names.contains(&"appstore_catalog_chart_snapshot"));
    assert!(table_names.contains(&"appstore_user_library_item"));
    assert!(table_names.contains(&"appstore_user_wishlist_item"));
    assert!(table_names.contains(&"appstore_download_grant"));
    assert!(table_names.contains(&"appstore_install_event"));
    assert!(table_names.contains(&"appstore_market_channel"));
    assert!(table_names.contains(&"appstore_market_release"));
    assert!(table_names.contains(&"appstore_listing_metric_snapshot"));
}

#[tokio::test]
async fn test_database_indexes() {
    let pool = setup_db().await;

    let indexes: Vec<(String,)> = sqlx::query_as(
        "SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_appstore_%' ORDER BY name"
    )
    .fetch_all(&pool)
    .await
    .unwrap();

    let index_names: Vec<&str> = indexes.iter().map(|(name,)| name.as_str()).collect();

    assert!(index_names.contains(&"idx_appstore_listing_catalog"));
    assert!(index_names.contains(&"idx_appstore_app_status"));
    assert!(index_names.contains(&"idx_appstore_listing_publisher"));
    assert!(index_names.contains(&"idx_appstore_release_update_check"));
    assert!(index_names.contains(&"idx_appstore_release_artifact_lookup"));
    assert!(index_names.contains(&"idx_appstore_market_release_status"));
    assert!(index_names.contains(&"idx_appstore_user_library"));
    assert!(index_names.contains(&"idx_appstore_entitlement_subject"));
    assert!(index_names.contains(&"idx_appstore_moderation_queue"));
    assert!(index_names.contains(&"idx_appstore_download_grant_active"));
    assert!(index_names.contains(&"idx_appstore_install_event_listing"));
}

#[tokio::test]
async fn test_publisher_tenant_isolation() {
    let pool = setup_db().await;
    let repo = SqlxPublisherRepository::new(appstore_db(&pool));

    let ctx1 = AppstoreRequestContext {
        tenant_id: "100001".to_string(),
        organization_id: "0".to_string(),
        user_id: "1".to_string(),
        request_id: "req-1".to_string(),
        trace_id: None,
        permission_scopes: vec![],
    };

    let ctx2 = AppstoreRequestContext {
        tenant_id: "100002".to_string(),
        organization_id: "0".to_string(),
        user_id: "1".to_string(),
        request_id: "req-2".to_string(),
        trace_id: None,
        permission_scopes: vec![],
    };

    let now = Utc::now();
    let publisher = Publisher {
        id: PublisherId::new("pub-iso"),
        tenant_id: "100001".to_string(),
        organization_id: "0".to_string(),
        publisher_no: "PUB-ISO".to_string(),
        publisher_type: PublisherType::Individual,
        display_name: "Tenant A Publisher".to_string(),
        legal_name: None,
        status: PublisherStatus::Active,
        verification_status: VerificationStatus::Unverified,
        contact_snapshot: ContactSnapshot::default(),
        profile_snapshot: ProfileSnapshot::default(),
        website_url: None,
        support_email: None,
        logo_media_resource_id: None,
        owner_user_id: "1".to_string(),
        version: 1,
        verified_at: None,
        suspended_at: None,
        deleted_at: None,
        created_at: now,
        updated_at: now,
    };

    repo.insert_publisher(&ctx1, &publisher).await.unwrap();

    let found_in_tenant_a = repo
        .find_publisher_by_id(&ctx1, &PublisherId::new("pub-iso"))
        .await
        .unwrap();
    assert!(found_in_tenant_a.is_some());

    let found_in_tenant_b = repo
        .find_publisher_by_id(&ctx2, &PublisherId::new("pub-iso"))
        .await
        .unwrap();
    assert!(found_in_tenant_b.is_none());
}

#[tokio::test]
async fn test_listing_raw_sql_operations() {
    let pool = setup_db().await;
    let ctx = test_context();

    let now = Utc::now();
    sqlx::query(
        r#"INSERT INTO appstore_listing (
            id, tenant_id, organization_id, publisher_id, listing_no, app_id, app_key,
            listing_slug, listing_type, pricing_model, listing_status, storefront_visibility,
            review_status, default_locale, content_rating_json, featured_score, download_count,
            rating_count, version, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
    )
    .bind("listing-1")
    .bind(&ctx.tenant_id)
    .bind(&ctx.organization_id)
    .bind("pub-1")
    .bind("LST-001")
    .bind("app-1")
    .bind("app-key-1")
    .bind("test-listing")
    .bind("app")
    .bind("free")
    .bind("draft")
    .bind("visible")
    .bind("pending")
    .bind("en-US")
    .bind("{}")
    .bind(0)
    .bind(0)
    .bind(0)
    .bind(1)
    .bind(now.to_rfc3339())
    .bind(now.to_rfc3339())
    .execute(&pool)
    .await
    .unwrap();

    let row: (String, String, String) = sqlx::query_as(
        "SELECT id, listing_status, listing_slug FROM appstore_listing WHERE id = ?",
    )
    .bind("listing-1")
    .fetch_one(&pool)
    .await
    .unwrap();

    assert_eq!(row.0, "listing-1");
    assert_eq!(row.1, "draft");
    assert_eq!(row.2, "test-listing");
}

#[tokio::test]
async fn test_category_raw_sql_operations() {
    let pool = setup_db().await;

    let now = Utc::now();
    sqlx::query(
        r#"INSERT INTO appstore_category (
            id, tenant_id, category_code, category_level, category_status, sort_order, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"#
    )
    .bind("cat-1")
    .bind("100001")
    .bind("productivity")
    .bind(1)
    .bind("active")
    .bind(10)
    .bind(now.to_rfc3339())
    .bind(now.to_rfc3339())
    .execute(&pool)
    .await
    .unwrap();

    sqlx::query(
        r#"INSERT INTO appstore_category_localization (
            id, tenant_id, category_id, locale, display_name, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)"#,
    )
    .bind("cat-loc-1")
    .bind("100001")
    .bind("cat-1")
    .bind("en-US")
    .bind("Productivity")
    .bind(now.to_rfc3339())
    .bind(now.to_rfc3339())
    .execute(&pool)
    .await
    .unwrap();

    let row: (String, String) =
        sqlx::query_as("SELECT category_code, category_status FROM appstore_category WHERE id = ?")
            .bind("cat-1")
            .fetch_one(&pool)
            .await
            .unwrap();

    assert_eq!(row.0, "productivity");
    assert_eq!(row.1, "active");

    let loc_row: (String,) = sqlx::query_as(
        "SELECT display_name FROM appstore_category_localization WHERE category_id = ? AND locale = ?"
    )
    .bind("cat-1")
    .bind("en-US")
    .fetch_one(&pool)
    .await
    .unwrap();

    assert_eq!(loc_row.0, "Productivity");
}

#[tokio::test]
async fn test_release_raw_sql_operations() {
    let pool = setup_db().await;

    let now = Utc::now();
    sqlx::query(
        r#"INSERT INTO appstore_release_channel (
            id, tenant_id, channel_code, channel_type, channel_status, audience_scope, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"#
    )
    .bind("channel-1")
    .bind("100001")
    .bind("stable")
    .bind("production")
    .bind("active")
    .bind("public")
    .bind(now.to_rfc3339())
    .bind(now.to_rfc3339())
    .execute(&pool)
    .await
    .unwrap();

    sqlx::query(
        r#"INSERT INTO appstore_release (
            id, tenant_id, organization_id, listing_id, release_no, channel_id,
            version_name, version_code, release_status, manifest_snapshot_json,
            version, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
    )
    .bind("release-1")
    .bind("100001")
    .bind("0")
    .bind("listing-1")
    .bind("REL-001")
    .bind("channel-1")
    .bind("1.0.0")
    .bind("100")
    .bind("draft")
    .bind("{}")
    .bind(1)
    .bind(now.to_rfc3339())
    .bind(now.to_rfc3339())
    .execute(&pool)
    .await
    .unwrap();

    let row: (String, String, String) = sqlx::query_as(
        "SELECT release_no, version_name, release_status FROM appstore_release WHERE id = ?",
    )
    .bind("release-1")
    .fetch_one(&pool)
    .await
    .unwrap();

    assert_eq!(row.0, "REL-001");
    assert_eq!(row.1, "1.0.0");
    assert_eq!(row.2, "draft");
}

#[tokio::test]
async fn test_release_with_artifacts_rolls_back_as_one_unit() {
    let pool = setup_db().await;
    let repository = SqlxReleaseRepository::new(appstore_db(&pool));
    let context = ReleaseRequestContext {
        tenant_id: "100001".to_string(),
        organization_id: Some("0".to_string()),
        user_id: Some("1".to_string()),
        request_id: "release-transaction-test".to_string(),
        permission_scopes: vec![],
    };
    let now = Utc::now();
    let release = Release {
        id: ReleaseId::new("release-transaction"),
        tenant_id: context.tenant_id.clone(),
        organization_id: "0".to_string(),
        listing_id: "listing-transaction".to_string(),
        release_no: "REL-TRANSACTION".to_string(),
        channel_id: ReleaseChannelId::new("channel-transaction"),
        version_name: "1.0.0".to_string(),
        version_code: "100".to_string(),
        build_number: None,
        release_status: ReleaseStatus::Submitted,
        minimum_os_version: None,
        release_notes_default_locale: None,
        manifest_snapshot: serde_json::json!({}),
        submitted_at: Some(now),
        approved_at: None,
        published_at: None,
        retired_at: None,
        version: 1,
        created_at: now,
        updated_at: now,
    };
    let artifact = ReleaseArtifact {
        id: ArtifactId::new("artifact-duplicate"),
        tenant_id: context.tenant_id.clone(),
        organization_id: "0".to_string(),
        release_id: release.id.clone(),
        artifact_no: "ART-TRANSACTION".to_string(),
        platform: "windows".to_string(),
        architecture: "x86_64".to_string(),
        package_format: "msi".to_string(),
        artifact_status: ArtifactStatus::Pending,
        drive_node_id: "drive-node-transaction".to_string(),
        media_resource_id: None,
        file_size_bytes: "1024".to_string(),
        content_type: "application/octet-stream".to_string(),
        checksum_sha256: "test-checksum".to_string(),
        signature_snapshot: SignatureSnapshot {
            algorithm: None,
            public_key_ref: None,
            signature_value: None,
        },
        sbom_ref: None,
        provenance_ref: None,
        min_os_version: None,
        created_at: now,
        updated_at: now,
    };

    let result = repository
        .insert_release_with_artifacts(&context, &release, &[artifact.clone(), artifact])
        .await;

    assert!(result.is_err());
    let release_count: i64 =
        sqlx::query_scalar("SELECT COUNT(*) FROM appstore_release WHERE id = ?")
            .bind(release.id.as_str())
            .fetch_one(&pool)
            .await
            .unwrap();
    let artifact_count: i64 =
        sqlx::query_scalar("SELECT COUNT(*) FROM appstore_release_artifact WHERE release_id = ?")
            .bind(release.id.as_str())
            .fetch_one(&pool)
            .await
            .unwrap();

    assert_eq!(release_count, 0);
    assert_eq!(artifact_count, 0);
}

#[tokio::test]
async fn test_moderation_raw_sql_operations() {
    let pool = setup_db().await;

    let now = Utc::now();
    sqlx::query(
        r#"INSERT INTO appstore_moderation_review (
            id, tenant_id, organization_id, submission_id, review_no, review_status,
            priority, queue_code, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
    )
    .bind("review-1")
    .bind("100001")
    .bind("0")
    .bind("submission-1")
    .bind("REV-001")
    .bind("pending")
    .bind("normal")
    .bind("standard")
    .bind(now.to_rfc3339())
    .bind(now.to_rfc3339())
    .execute(&pool)
    .await
    .unwrap();

    sqlx::query(
        r#"INSERT INTO appstore_moderation_decision (
            id, tenant_id, organization_id, review_id, decision_no, decision_type,
            decision_status, decided_by, decided_at, payload_snapshot_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
    )
    .bind("decision-1")
    .bind("100001")
    .bind("0")
    .bind("review-1")
    .bind("DEC-001")
    .bind("approve")
    .bind("decided")
    .bind("moderator-1")
    .bind(now.to_rfc3339())
    .bind("{}")
    .bind(now.to_rfc3339())
    .execute(&pool)
    .await
    .unwrap();

    let row: (String, String) = sqlx::query_as(
        "SELECT review_no, review_status FROM appstore_moderation_review WHERE id = ?",
    )
    .bind("review-1")
    .fetch_one(&pool)
    .await
    .unwrap();

    assert_eq!(row.0, "REV-001");
    assert_eq!(row.1, "pending");

    let dec_row: (String, String) = sqlx::query_as(
        "SELECT decision_no, decision_type FROM appstore_moderation_decision WHERE id = ?",
    )
    .bind("decision-1")
    .fetch_one(&pool)
    .await
    .unwrap();

    assert_eq!(dec_row.0, "DEC-001");
    assert_eq!(dec_row.1, "approve");
}

#[tokio::test]
async fn test_compliance_raw_sql_operations() {
    let pool = setup_db().await;

    let now = Utc::now();
    sqlx::query(
        r#"INSERT INTO appstore_compliance_profile (
            id, tenant_id, organization_id, listing_id, compliance_version,
            privacy_nutrition_json, content_rating_questionnaire_json, data_safety_json,
            target_audience_json, compliance_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
    )
    .bind("comp-1")
    .bind("100001")
    .bind("0")
    .bind("listing-1")
    .bind(1)
    .bind("{}")
    .bind("{}")
    .bind("{}")
    .bind("{}")
    .bind("draft")
    .bind(now.to_rfc3339())
    .bind(now.to_rfc3339())
    .execute(&pool)
    .await
    .unwrap();

    let row: (String, i32) = sqlx::query_as(
        "SELECT compliance_status, compliance_version FROM appstore_compliance_profile WHERE id = ?"
    )
    .bind("comp-1")
    .fetch_one(&pool)
    .await
    .unwrap();

    assert_eq!(row.0, "draft");
    assert_eq!(row.1, 1);
}

#[tokio::test]
async fn test_library_raw_sql_operations() {
    let pool = setup_db().await;

    let now = Utc::now();
    sqlx::query(
        r#"INSERT INTO appstore_user_library_item (
            id, tenant_id, user_id, listing_id, app_key,
            library_status, install_source, platform, updated_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
    )
    .bind("lib-1")
    .bind("100001")
    .bind("1")
    .bind("listing-1")
    .bind("app-key-1")
    .bind("installed")
    .bind("store")
    .bind("windows")
    .bind(now.to_rfc3339())
    .bind(now.to_rfc3339())
    .execute(&pool)
    .await
    .unwrap();

    let row: (String, String) = sqlx::query_as(
        "SELECT library_status, platform FROM appstore_user_library_item WHERE id = ?",
    )
    .bind("lib-1")
    .fetch_one(&pool)
    .await
    .unwrap();

    assert_eq!(row.0, "installed");
    assert_eq!(row.1, "windows");
}

#[tokio::test]
async fn test_library_item_scoped_to_user() {
    use sdkwork_appstore_library_service::domain::models::LibraryItemId;
    use sdkwork_appstore_library_service::ports::repository::LibraryRepositoryPort;
    use sdkwork_appstore_repository_sqlx::repository::library_repository::SqlxLibraryRepository;

    let pool = setup_db().await;
    let repo = SqlxLibraryRepository::new(appstore_db(&pool));
    let now = Utc::now();

    for (id, user_id) in [("lib-owner", "user-a"), ("lib-other", "user-b")] {
        sqlx::query(
            r#"INSERT INTO appstore_user_library_item (
                id, tenant_id, user_id, listing_id, app_key,
                library_status, install_source, platform, updated_at, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
        )
        .bind(id)
        .bind("100001")
        .bind(user_id)
        .bind("listing-1")
        .bind("app-key-1")
        .bind("installed")
        .bind("store")
        .bind("windows")
        .bind(now.to_rfc3339())
        .bind(now.to_rfc3339())
        .execute(&pool)
        .await
        .unwrap();
    }

    let owner_ctx = sdkwork_appstore_library_service::context::AppstoreRequestContext {
        tenant_id: "100001".to_string(),
        organization_id: "org-1".to_string(),
        user_id: "user-a".to_string(),
        request_id: "req-1".to_string(),
        trace_id: Some("trace-1".to_string()),
        permission_scopes: vec![],
    };

    let found = repo
        .find_library_item_by_id(&owner_ctx, &LibraryItemId::new("lib-owner"))
        .await
        .unwrap();
    assert!(found.is_some());

    let idor = repo
        .find_library_item_by_id(&owner_ctx, &LibraryItemId::new("lib-other"))
        .await
        .unwrap();
    assert!(
        idor.is_none(),
        "library item must not be readable across users"
    );
}

#[tokio::test]
async fn test_market_raw_sql_operations() {
    let pool = setup_db().await;

    let now = Utc::now();
    sqlx::query(
        r#"INSERT INTO appstore_market_channel (
            id, tenant_id, channel_code, channel_type, provider, channel_status,
            api_capability_json, config_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
    )
    .bind("channel-1")
    .bind("100001")
    .bind("apple_app_store")
    .bind("native")
    .bind("apple")
    .bind("active")
    .bind("{}")
    .bind("{}")
    .bind(now.to_rfc3339())
    .bind(now.to_rfc3339())
    .execute(&pool)
    .await
    .unwrap();

    let row: (String, String) =
        sqlx::query_as("SELECT channel_code, provider FROM appstore_market_channel WHERE id = ?")
            .bind("channel-1")
            .fetch_one(&pool)
            .await
            .unwrap();

    assert_eq!(row.0, "apple_app_store");
    assert_eq!(row.1, "apple");
}

#[tokio::test]
async fn test_catalog_collection_raw_sql() {
    let pool = setup_db().await;

    let now = Utc::now();
    sqlx::query(
        r#"INSERT INTO appstore_catalog_collection (
            id, tenant_id, collection_code, collection_type, collection_status,
            audience_scope, sort_order, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
    )
    .bind("coll-1")
    .bind("100001")
    .bind("featured-apps")
    .bind("curated")
    .bind("active")
    .bind("public")
    .bind(1)
    .bind(now.to_rfc3339())
    .bind(now.to_rfc3339())
    .execute(&pool)
    .await
    .unwrap();

    sqlx::query(
        r#"INSERT INTO appstore_catalog_collection_localization (
            id, tenant_id, collection_id, locale, display_name, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)"#,
    )
    .bind("coll-loc-1")
    .bind("100001")
    .bind("coll-1")
    .bind("en-US")
    .bind("Featured Apps")
    .bind(now.to_rfc3339())
    .bind(now.to_rfc3339())
    .execute(&pool)
    .await
    .unwrap();

    let row: (String,) = sqlx::query_as(
        "SELECT display_name FROM appstore_catalog_collection_localization WHERE collection_id = ?",
    )
    .bind("coll-1")
    .fetch_one(&pool)
    .await
    .unwrap();

    assert_eq!(row.0, "Featured Apps");
}

#[tokio::test]
async fn test_unique_constraints() {
    let pool = setup_db().await;

    let now = Utc::now();
    sqlx::query(
        r#"INSERT INTO appstore_publisher (
            id, tenant_id, organization_id, publisher_no, publisher_type, display_name,
            publisher_status, verification_status, contact_snapshot_json, profile_snapshot_json,
            owner_user_id, version, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
    )
    .bind("pub-uniq-1")
    .bind("100001")
    .bind("0")
    .bind("PUB-UNIQ")
    .bind("individual")
    .bind("Publisher 1")
    .bind("active")
    .bind("unverified")
    .bind("{}")
    .bind("{}")
    .bind("1")
    .bind(1)
    .bind(now.to_rfc3339())
    .bind(now.to_rfc3339())
    .execute(&pool)
    .await
    .unwrap();

    let result = sqlx::query(
        r#"INSERT INTO appstore_publisher (
            id, tenant_id, organization_id, publisher_no, publisher_type, display_name,
            publisher_status, verification_status, contact_snapshot_json, profile_snapshot_json,
            owner_user_id, version, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
    )
    .bind("pub-uniq-2")
    .bind("100001")
    .bind("0")
    .bind("PUB-UNIQ")
    .bind("individual")
    .bind("Publisher 2")
    .bind("active")
    .bind("unverified")
    .bind("{}")
    .bind("{}")
    .bind("user-2")
    .bind(1)
    .bind(now.to_rfc3339())
    .bind(now.to_rfc3339())
    .execute(&pool)
    .await;

    assert!(result.is_err());
}
