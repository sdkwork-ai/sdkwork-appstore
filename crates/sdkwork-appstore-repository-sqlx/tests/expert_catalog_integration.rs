//! Repository tests for the public AI expert roster.
//!
//! The expert page reads `appstore_expert_catalog` only. These tests pin the
//! SQL-level contract the service relies on: published and non-deleted rows
//! only, the `category_code` filter, `sort_weight` ordering, keyset
//! pagination, and lookup by row id or `expert_code`.

use chrono::{TimeZone, Utc};
use sqlx::SqlitePool;

use sdkwork_appstore_catalog_service::context::AppstoreRequestContext;
use sdkwork_appstore_catalog_service::ports::repository::{
    CatalogRepositoryPort, ExpertCatalogQuery, ExpertSortOrder,
};
use sdkwork_appstore_catalog_service::service::expert_catalog::expert_cursor;
use sdkwork_appstore_repository_sqlx::pool::AppstoreSqlxDb;
use sdkwork_appstore_repository_sqlx::repository::catalog_repository::SqlxCatalogRepository;

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

fn context(tenant_id: &str) -> AppstoreRequestContext {
    AppstoreRequestContext {
        tenant_id: tenant_id.to_string(),
        organization_id: Some("0".to_string()),
        user_id: None,
        request_id: "req-experts".to_string(),
        permission_scopes: vec![],
    }
}

struct ExpertSeed<'a> {
    id: &'a str,
    code: &'a str,
    name: &'a str,
    category: Option<&'a str>,
    status: &'a str,
    sort_weight: i32,
    deleted: bool,
    tenant_id: &'a str,
}

impl<'a> ExpertSeed<'a> {
    fn published(id: &'a str, code: &'a str, sort_weight: i32) -> Self {
        Self {
            id,
            code,
            name: "Expert",
            category: Some("工程开发"),
            status: "published",
            sort_weight,
            deleted: false,
            tenant_id: "100001",
        }
    }

    fn with_category(mut self, category: &'a str) -> Self {
        self.category = Some(category);
        self
    }

    fn with_name(mut self, name: &'a str) -> Self {
        self.name = name;
        self
    }

    fn with_status(mut self, status: &'a str) -> Self {
        self.status = status;
        self
    }

    fn deleted(mut self) -> Self {
        self.deleted = true;
        self
    }

    fn with_tenant(mut self, tenant_id: &'a str) -> Self {
        self.tenant_id = tenant_id;
        self
    }
}

async fn seed_expert(pool: &SqlitePool, seed: ExpertSeed<'_>) {
    let now = Utc.with_ymd_and_hms(2026, 1, 1, 0, 0, 0).unwrap();
    let profile = serde_json::json!({
        "nickname": "吴人哥",
        "tags": ["高级开发"],
        "rating": 4.9,
        "popularity": 9820,
    })
    .to_string();
    sqlx::query(
        r#"
        INSERT INTO appstore_expert_catalog (
            id, tenant_id, organization_id, expert_code, expert_name, description,
            category_code, profile_json, expert_status, visibility, featured, sort_weight,
            owner_user_id, version, published_at, deleted_at, created_at, updated_at
        ) VALUES (?, ?, '0', ?, ?, ?, ?, ?, ?, 1, ?, ?, NULL, 0, ?, ?, ?, ?)
        "#,
    )
    .bind(seed.id)
    .bind(seed.tenant_id)
    .bind(seed.code)
    .bind(seed.name)
    .bind(Some("curated expert"))
    .bind(seed.category)
    .bind(profile)
    .bind(seed.status)
    .bind(false)
    .bind(seed.sort_weight)
    .bind(Some(now))
    .bind(if seed.deleted { Some(now) } else { None })
    .bind(now)
    .bind(now)
    .execute(pool)
    .await
    .unwrap();
}

/// One published row per sort weight, plus a draft, a soft-deleted row and a
/// row of another tenant that must never leak into the public roster.
async fn seed_roster(pool: &SqlitePool) {
    seed_expert(
        pool,
        ExpertSeed::published("531000000000000001", "exp-1", 10).with_name("高级开发工程师"),
    )
    .await;
    seed_expert(
        pool,
        ExpertSeed::published("531000000000000002", "exp-2", 20).with_category("内容创作"),
    )
    .await;
    seed_expert(
        pool,
        ExpertSeed::published("531000000000000003", "exp-3", 20),
    )
    .await;
    seed_expert(
        pool,
        ExpertSeed::published("531000000000000004", "exp-4", 1).with_status("draft"),
    )
    .await;
    seed_expert(
        pool,
        ExpertSeed::published("531000000000000005", "exp-5", 2).deleted(),
    )
    .await;
    seed_expert(
        pool,
        ExpertSeed::published("531000000000000006", "exp-6", 5).with_category("内容创作"),
    )
    .await;
    seed_expert(
        pool,
        ExpertSeed::published("531000000000000007", "exp-7", 3).with_tenant("200002"),
    )
    .await;
}

fn repo(pool: &SqlitePool) -> SqlxCatalogRepository {
    SqlxCatalogRepository::new(AppstoreSqlxDb::sqlite(pool.clone()))
}

fn ids(
    expert_rows: &[sdkwork_appstore_catalog_service::domain::models::ExpertCatalogEntry],
) -> Vec<&str> {
    expert_rows.iter().map(|entry| entry.id.as_str()).collect()
}

#[tokio::test]
async fn list_returns_only_published_rows_in_editorial_order() {
    let pool = setup_db().await;
    seed_roster(&pool).await;

    let rows = repo(&pool)
        .find_expert_catalog_entries(
            &context("100001"),
            ExpertCatalogQuery {
                category_code: None,
                order: ExpertSortOrder::SortWeightAsc,
                cursor: None,
                limit: 20,
            },
        )
        .await
        .unwrap();

    assert_eq!(
        ids(&rows),
        vec![
            "531000000000000006",
            "531000000000000001",
            "531000000000000002",
            "531000000000000003",
        ],
        "draft (exp-4), soft-deleted (exp-5) and other-tenant (exp-7) rows must not appear"
    );

    let first = &rows[1];
    assert_eq!(first.expert_code, "exp-1");
    assert_eq!(first.expert_name, "高级开发工程师");
    assert_eq!(
        first.profile.get("rating").and_then(|v| v.as_f64()),
        Some(4.9)
    );
}

#[tokio::test]
async fn list_filters_by_category_code() {
    let pool = setup_db().await;
    seed_roster(&pool).await;

    let rows = repo(&pool)
        .find_expert_catalog_entries(
            &context("100001"),
            ExpertCatalogQuery {
                category_code: Some("内容创作"),
                order: ExpertSortOrder::SortWeightAsc,
                cursor: None,
                limit: 20,
            },
        )
        .await
        .unwrap();

    assert_eq!(ids(&rows), vec!["531000000000000006", "531000000000000002"]);
    assert!(rows
        .iter()
        .all(|entry| entry.category_code.as_deref() == Some("内容创作")));
}

#[tokio::test]
async fn list_reverses_the_sort_weight_order_when_asked() {
    let pool = setup_db().await;
    seed_roster(&pool).await;

    let rows = repo(&pool)
        .find_expert_catalog_entries(
            &context("100001"),
            ExpertCatalogQuery {
                category_code: None,
                order: ExpertSortOrder::SortWeightDesc,
                cursor: None,
                limit: 20,
            },
        )
        .await
        .unwrap();

    assert_eq!(
        ids(&rows),
        vec![
            "531000000000000003",
            "531000000000000002",
            "531000000000000001",
            "531000000000000006",
        ],
        "heaviest weight first, id descending inside a weight tie"
    );
}

#[tokio::test]
async fn keyset_cursor_continues_a_page_without_repeating_rows() {
    let pool = setup_db().await;
    seed_roster(&pool).await;
    let repository = repo(&pool);
    let ctx = context("100001");

    let first_page = repository
        .find_expert_catalog_entries(
            &ctx,
            ExpertCatalogQuery {
                category_code: None,
                order: ExpertSortOrder::SortWeightAsc,
                cursor: None,
                limit: 2,
            },
        )
        .await
        .unwrap();
    assert_eq!(
        ids(&first_page),
        vec!["531000000000000006", "531000000000000001"]
    );

    let cursor = expert_cursor(first_page.last().unwrap());
    assert_eq!(cursor, "10:531000000000000001");

    let second_page = repository
        .find_expert_catalog_entries(
            &ctx,
            ExpertCatalogQuery {
                category_code: None,
                order: ExpertSortOrder::SortWeightAsc,
                cursor: Some(cursor.as_str()),
                limit: 2,
            },
        )
        .await
        .unwrap();
    assert_eq!(
        ids(&second_page),
        vec!["531000000000000002", "531000000000000003"]
    );

    let second_cursor = expert_cursor(second_page.last().unwrap());
    let third_page = repository
        .find_expert_catalog_entries(
            &ctx,
            ExpertCatalogQuery {
                category_code: None,
                order: ExpertSortOrder::SortWeightAsc,
                cursor: Some(second_cursor.as_str()),
                limit: 2,
            },
        )
        .await
        .unwrap();
    assert!(third_page.is_empty(), "the cursor must not loop");
}

#[tokio::test]
async fn malformed_cursor_degrades_to_the_first_page() {
    let pool = setup_db().await;
    seed_roster(&pool).await;

    let rows = repo(&pool)
        .find_expert_catalog_entries(
            &context("100001"),
            ExpertCatalogQuery {
                category_code: None,
                order: ExpertSortOrder::SortWeightAsc,
                cursor: Some("not-a-cursor"),
                limit: 20,
            },
        )
        .await
        .unwrap();

    assert_eq!(rows.len(), 4);
    assert_eq!(rows[0].id, "531000000000000006");
}

#[tokio::test]
async fn detail_resolves_by_row_id_or_expert_code() {
    let pool = setup_db().await;
    seed_roster(&pool).await;
    let repository = repo(&pool);
    let ctx = context("100001");

    let by_id = repository
        .find_expert_catalog_entry(&ctx, "531000000000000001")
        .await
        .unwrap()
        .expect("published expert must resolve by row id");
    assert_eq!(by_id.expert_code, "exp-1");

    let by_code = repository
        .find_expert_catalog_entry(&ctx, "exp-2")
        .await
        .unwrap()
        .expect("published expert must resolve by expert code");
    assert_eq!(by_code.id, "531000000000000002");
    assert_eq!(by_code.category_code.as_deref(), Some("内容创作"));
}

#[tokio::test]
async fn detail_hides_draft_deleted_and_other_tenant_experts() {
    let pool = setup_db().await;
    seed_roster(&pool).await;
    let repository = repo(&pool);
    let ctx = context("100001");

    assert!(repository
        .find_expert_catalog_entry(&ctx, "exp-4")
        .await
        .unwrap()
        .is_none());
    assert!(repository
        .find_expert_catalog_entry(&ctx, "exp-5")
        .await
        .unwrap()
        .is_none());
    assert!(repository
        .find_expert_catalog_entry(&ctx, "exp-7")
        .await
        .unwrap()
        .is_none());
    assert!(repository
        .find_expert_catalog_entry(&ctx, "exp-unknown")
        .await
        .unwrap()
        .is_none());
}
