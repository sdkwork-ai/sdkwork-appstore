//! R4 — user-store repository owner isolation over real SQL.
//!
//! The user store stores user-scoped rows (`appstore_user_category`,
//! `appstore_user_category_item`, `appstore_user_store_share`). Owner scoping
//! is part of every management query/write instead of a service-level
//! post-filter, so a foreign id reads as nothing and writes no row.
//!
//! The public share view is the deliberate exception: the share token is the
//! capability credential, so `find_share_by_token` and the public view counter
//! stay tenant-scoped and must keep working for a visitor who owns nothing.

use chrono::Utc;
use sqlx::SqlitePool;

use sdkwork_appstore_repository_sqlx::pool::AppstoreSqlxDb;
use sdkwork_appstore_repository_sqlx::repository::user_store_repository::SqlxUserStoreRepository;
use sdkwork_appstore_user_store_service::context::AppstoreRequestContext;
use sdkwork_appstore_user_store_service::domain::models::{
    ShareScope, ShareStatus, ShareVisibility, UserCategory, UserCategoryId, UserCategoryItem,
    UserCategoryItemId, UserCategoryStatus, UserStoreShare, UserStoreShareId,
};
use sdkwork_appstore_user_store_service::ports::repository::UserStoreRepositoryPort;

/// SQLite projection of `database/migrations/postgres/0003_user_store.up.sql`
/// (the folded baseline fixture predates the user-store family, so the suite
/// creates its own tables locally; the production migration is untouched).
const USER_STORE_DDL: &str = r#"
CREATE TABLE IF NOT EXISTS appstore_user_category (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL DEFAULT '0',
  owner_user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon_media_resource_id TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  category_status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, owner_user_id, name)
);

CREATE TABLE IF NOT EXISTS appstore_user_category_item (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL DEFAULT '0',
  user_category_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  note TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (user_category_id, listing_id)
);

CREATE TABLE IF NOT EXISTS appstore_user_store_share (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL DEFAULT '0',
  owner_user_id TEXT NOT NULL,
  share_token TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  share_scope TEXT NOT NULL,
  selected_category_ids_json TEXT NOT NULL DEFAULT '[]',
  share_visibility TEXT NOT NULL,
  share_status TEXT NOT NULL,
  expires_at TEXT,
  view_count BIGINT NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
"#;

const TENANT: &str = "tenant-1";
const OWNER: &str = "user-1";
const STRANGER: &str = "user-2";

async fn setup_db() -> SqlitePool {
    let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
    for stmt in USER_STORE_DDL.split(';') {
        let stmt = stmt.trim();
        if !stmt.is_empty() {
            sqlx::query(stmt).execute(&pool).await.unwrap();
        }
    }
    pool
}

fn context(user_id: &str) -> AppstoreRequestContext {
    AppstoreRequestContext {
        tenant_id: TENANT.to_string(),
        organization_id: "0".to_string(),
        user_id: user_id.to_string(),
        request_id: "req-1".to_string(),
        trace_id: None,
        permission_scopes: vec![],
    }
}

fn repository(pool: &SqlitePool) -> SqlxUserStoreRepository {
    SqlxUserStoreRepository::new(AppstoreSqlxDb::sqlite(pool.clone()))
}

fn category(id: &str, owner_user_id: &str, name: &str) -> UserCategory {
    let now = Utc::now();
    UserCategory {
        id: id.to_string(),
        tenant_id: TENANT.to_string(),
        owner_user_id: owner_user_id.to_string(),
        name: name.to_string(),
        description: None,
        icon_media_resource_id: None,
        sort_order: 0,
        status: UserCategoryStatus::Active,
        created_at: now,
        updated_at: now,
    }
}

fn item(id: &str, category_id: &str) -> UserCategoryItem {
    let now = Utc::now();
    UserCategoryItem {
        id: id.to_string(),
        tenant_id: TENANT.to_string(),
        user_category_id: category_id.to_string(),
        listing_id: "listing-1".to_string(),
        note: None,
        sort_order: 0,
        created_at: now,
        updated_at: now,
    }
}

fn share(id: &str, owner_user_id: &str, token: &str) -> UserStoreShare {
    let now = Utc::now();
    UserStoreShare {
        id: id.to_string(),
        tenant_id: TENANT.to_string(),
        owner_user_id: owner_user_id.to_string(),
        share_token: token.to_string(),
        title: "My Appstore".to_string(),
        description: None,
        scope: ShareScope::All,
        selected_category_ids: vec![],
        visibility: ShareVisibility::Public,
        status: ShareStatus::Active,
        expires_at: None,
        view_count: 0,
        created_at: now,
        updated_at: now,
    }
}

async fn seed_category(
    repository: &SqlxUserStoreRepository,
    id: &str,
    owner_user_id: &str,
    name: &str,
) {
    repository
        .insert_category(&context(owner_user_id), &category(id, owner_user_id, name))
        .await
        .unwrap();
}

#[tokio::test]
async fn category_reads_are_owner_scoped() {
    let pool = setup_db().await;
    let repository = repository(&pool);
    seed_category(&repository, "cat-owner", OWNER, "owner-category").await;
    seed_category(&repository, "cat-other", STRANGER, "stranger-category").await;

    let owner_read = repository
        .find_category_by_id(&context(OWNER), &UserCategoryId::new("cat-owner"), OWNER)
        .await
        .unwrap()
        .expect("the owner must read its own category");
    assert_eq!(owner_read.name, "owner-category");

    let cross_user_read = repository
        .find_category_by_id(
            &context(STRANGER),
            &UserCategoryId::new("cat-owner"),
            STRANGER,
        )
        .await
        .unwrap();
    assert!(
        cross_user_read.is_none(),
        "a foreign category id must read as not-found"
    );

    let owner_batch = repository
        .find_categories_by_ids(&context(OWNER), &["cat-owner".to_string()], OWNER)
        .await
        .unwrap();
    assert_eq!(owner_batch.len(), 1);

    let cross_user_batch = repository
        .find_categories_by_ids(&context(STRANGER), &["cat-owner".to_string()], STRANGER)
        .await
        .unwrap();
    assert!(
        cross_user_batch.is_empty(),
        "id lookup must not return another user's category"
    );
}

#[tokio::test]
async fn category_writes_are_owner_scoped() {
    let pool = setup_db().await;
    let repository = repository(&pool);
    seed_category(&repository, "cat-owner", OWNER, "owner-category").await;

    // A foreign caller cannot rename the row: the UPDATE matches no row.
    let mut hijack = category("cat-owner", OWNER, "hijacked");
    hijack.updated_at = Utc::now();
    repository
        .update_category(&context(STRANGER), &hijack)
        .await
        .unwrap();
    let after_update = repository
        .find_category_by_id(&context(OWNER), &UserCategoryId::new("cat-owner"), OWNER)
        .await
        .unwrap()
        .expect("the owner's category must survive a foreign update");
    assert_eq!(after_update.name, "owner-category");

    // A foreign caller cannot delete the row either.
    repository
        .delete_category(&context(STRANGER), &UserCategoryId::new("cat-owner"))
        .await
        .unwrap();
    assert!(
        repository
            .find_category_by_id(&context(OWNER), &UserCategoryId::new("cat-owner"), OWNER)
            .await
            .unwrap()
            .is_some(),
        "a foreign category id must not delete the owner's row"
    );

    // The owner's own delete still works.
    repository
        .delete_category(&context(OWNER), &UserCategoryId::new("cat-owner"))
        .await
        .unwrap();
    assert!(repository
        .find_category_by_id(&context(OWNER), &UserCategoryId::new("cat-owner"), OWNER)
        .await
        .unwrap()
        .is_none());
}

#[tokio::test]
async fn item_reads_and_writes_follow_the_category_owner() {
    let pool = setup_db().await;
    let repository = repository(&pool);
    seed_category(&repository, "cat-owner", OWNER, "owner-category").await;
    repository
        .insert_item(&context(OWNER), &item("item-1", "cat-owner"))
        .await
        .unwrap();

    let owner_item = repository
        .find_item_by_id(
            &context(OWNER),
            &UserCategoryItemId::new("item-1"),
            &UserCategoryId::new("cat-owner"),
            OWNER,
        )
        .await
        .unwrap()
        .expect("the owner must read its own item");
    assert_eq!(owner_item.listing_id, "listing-1");

    let cross_user_item = repository
        .find_item_by_id(
            &context(STRANGER),
            &UserCategoryItemId::new("item-1"),
            &UserCategoryId::new("cat-owner"),
            STRANGER,
        )
        .await
        .unwrap();
    assert!(
        cross_user_item.is_none(),
        "an item of a foreign category must read as not-found"
    );

    let cross_user_items = repository
        .find_items_by_category(
            &context(STRANGER),
            &UserCategoryId::new("cat-owner"),
            STRANGER,
            None,
            50,
        )
        .await
        .unwrap();
    assert!(cross_user_items.is_empty());

    let cross_user_counts = repository
        .count_items_by_categories(&context(STRANGER), &["cat-owner".to_string()], STRANGER)
        .await
        .unwrap();
    assert!(
        cross_user_counts.is_empty(),
        "foreign category ids must not contribute item counts"
    );

    let owner_items = repository
        .find_items_by_category(
            &context(OWNER),
            &UserCategoryId::new("cat-owner"),
            OWNER,
            None,
            50,
        )
        .await
        .unwrap();
    assert_eq!(owner_items.len(), 1);

    let owner_counts = repository
        .count_items_by_categories(&context(OWNER), &["cat-owner".to_string()], OWNER)
        .await
        .unwrap();
    assert_eq!(owner_counts, vec![("cat-owner".to_string(), 1)]);

    // `update_item` is owner-scoped as well: the foreign write rewrites nothing
    // while the owner's own write lands.
    let mut foreign_update = owner_items[0].clone();
    foreign_update.note = Some("hijacked".to_string());
    repository
        .update_item(&context(STRANGER), &foreign_update)
        .await
        .unwrap();
    let after_foreign_update = repository
        .find_item_by_id(
            &context(OWNER),
            &UserCategoryItemId::new("item-1"),
            &UserCategoryId::new("cat-owner"),
            OWNER,
        )
        .await
        .unwrap()
        .unwrap();
    assert_eq!(after_foreign_update.note, None);

    let mut owner_update = after_foreign_update.clone();
    owner_update.note = Some("owned".to_string());
    repository
        .update_item(&context(OWNER), &owner_update)
        .await
        .unwrap();
    let after_owner_update = repository
        .find_item_by_id(
            &context(OWNER),
            &UserCategoryItemId::new("item-1"),
            &UserCategoryId::new("cat-owner"),
            OWNER,
        )
        .await
        .unwrap()
        .unwrap();
    assert_eq!(after_owner_update.note.as_deref(), Some("owned"));

    // Writes are owner-scoped too: neither delete nor reorder touches the row,
    // and a duplicate-add probe does not see it.
    let cross_user_probe = repository
        .find_item_by_category_and_listing(
            &context(STRANGER),
            &UserCategoryId::new("cat-owner"),
            "listing-1",
            STRANGER,
        )
        .await
        .unwrap();
    assert!(cross_user_probe.is_none());

    repository
        .delete_item(&context(STRANGER), &UserCategoryItemId::new("item-1"))
        .await
        .unwrap();
    repository
        .reorder_items(
            &context(STRANGER),
            &UserCategoryId::new("cat-owner"),
            &["item-1".to_string()],
        )
        .await
        .unwrap();

    let after_foreign_writes = repository
        .find_items_by_category(
            &context(OWNER),
            &UserCategoryId::new("cat-owner"),
            OWNER,
            None,
            50,
        )
        .await
        .unwrap();
    assert_eq!(
        after_foreign_writes.len(),
        1,
        "foreign delete/reorder must not touch the owner's item"
    );
    assert_eq!(
        after_foreign_writes[0].sort_order, 0,
        "foreign reorder must not reorder the owner's item"
    );

    repository
        .delete_item(&context(OWNER), &UserCategoryItemId::new("item-1"))
        .await
        .unwrap();
    assert!(repository
        .find_item_by_id(
            &context(OWNER),
            &UserCategoryItemId::new("item-1"),
            &UserCategoryId::new("cat-owner"),
            OWNER,
        )
        .await
        .unwrap()
        .is_none());
}

#[tokio::test]
async fn share_management_is_owner_scoped_but_the_token_stays_a_capability() {
    let pool = setup_db().await;
    let repository = repository(&pool);
    repository
        .insert_share(&context(OWNER), &share("share-1", OWNER, "token-1"))
        .await
        .unwrap();

    let owner_share = repository
        .find_share_by_id(&context(OWNER), &UserStoreShareId::new("share-1"), OWNER)
        .await
        .unwrap()
        .expect("the owner must read its own share");
    assert_eq!(owner_share.title, "My Appstore");

    let cross_user_share = repository
        .find_share_by_id(
            &context(STRANGER),
            &UserStoreShareId::new("share-1"),
            STRANGER,
        )
        .await
        .unwrap();
    assert!(
        cross_user_share.is_none(),
        "a foreign share id must read as not-found"
    );

    // A foreign caller cannot rename or revoke the share.
    let mut hijack = share("share-1", OWNER, "token-1");
    hijack.title = "hijacked".to_string();
    hijack.status = ShareStatus::Revoked;
    repository
        .update_share(&context(STRANGER), &hijack)
        .await
        .unwrap();
    let after_update = repository
        .find_share_by_id(&context(OWNER), &UserStoreShareId::new("share-1"), OWNER)
        .await
        .unwrap()
        .expect("the owner's share must survive a foreign update");
    assert_eq!(after_update.title, "My Appstore");
    assert_eq!(after_update.status, ShareStatus::Active);

    // The token itself remains the capability credential: a visitor who owns
    // nothing resolves the share and bumps its public view counter.
    let visitor = context(STRANGER);
    let public_share = repository
        .find_share_by_token(&visitor, "token-1")
        .await
        .unwrap()
        .expect("the share token must stay publicly resolvable");
    assert_eq!(public_share.id, "share-1");
    repository
        .increment_share_view_count(&visitor, &UserStoreShareId::new("share-1"))
        .await
        .unwrap();
    let after_view = repository
        .find_share_by_token(&visitor, "token-1")
        .await
        .unwrap()
        .unwrap();
    assert_eq!(after_view.view_count, 1);

    // ... while an unknown token is still not found.
    assert!(repository
        .find_share_by_token(&visitor, "token-unknown")
        .await
        .unwrap()
        .is_none());
}
