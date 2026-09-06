//! SQLx-backed adapter for the user store repository port.

use crate::db::columns::{
    columns_csv, APPSTORE_USER_CATEGORY_COLUMNS, APPSTORE_USER_CATEGORY_ITEM_COLUMNS,
    APPSTORE_USER_STORE_SHARE_COLUMNS,
};
use crate::db::rows::{UserCategoryItemRow, UserCategoryRow, UserStoreShareRow};
use crate::mapper::row_mapper::{
    map_user_category_item_row_to_domain, map_user_category_row_to_domain,
    map_user_category_status_to_row, map_user_store_share_domain_to_share_columns,
    map_user_store_share_row_to_domain,
};
use crate::pool::AppstoreSqlxDb;

use sdkwork_appstore_user_store_service::context::AppstoreRequestContext;
use sdkwork_appstore_user_store_service::domain::models::{
    UserCategory, UserCategoryId, UserCategoryItem, UserCategoryItemId, UserStoreShare,
    UserStoreShareId,
};
use sdkwork_appstore_user_store_service::error::AppstoreServiceError;
use sdkwork_appstore_user_store_service::ports::repository::UserStoreRepositoryPort;

#[derive(Debug, Clone)]
pub struct SqlxUserStoreRepository {
    db: AppstoreSqlxDb,
}

impl SqlxUserStoreRepository {
    pub fn new(db: AppstoreSqlxDb) -> Self {
        Self { db }
    }
}

fn db_error(e: impl std::fmt::Display) -> AppstoreServiceError {
    AppstoreServiceError::Internal(format!("Database error: {}", e))
}

/// Parses the `"<sort_order>:<id>"` cursor used by sort-ordered listings.
fn parse_order_cursor(cursor: &str) -> Result<(i32, String), AppstoreServiceError> {
    let (order, id) = cursor
        .split_once(':')
        .ok_or_else(|| AppstoreServiceError::ValidationFailed("Invalid cursor".to_string()))?;
    let sort_order: i32 = order
        .parse()
        .map_err(|_| AppstoreServiceError::ValidationFailed("Invalid cursor".to_string()))?;
    Ok((sort_order, id.to_string()))
}

#[async_trait::async_trait]
impl UserStoreRepositoryPort for SqlxUserStoreRepository {
    async fn find_categories_by_owner(
        &self,
        context: &AppstoreRequestContext,
        owner_user_id: &str,
        cursor: Option<&str>,
        limit: i32,
    ) -> Result<Vec<UserCategory>, AppstoreServiceError> {
        let rows = if let Some(cursor) = cursor {
            let (cursor_order, cursor_id) = parse_order_cursor(cursor)?;
            self.db
                .query_as::<UserCategoryRow>(&format!(
                    r#"SELECT {} FROM appstore_user_category
                WHERE tenant_id = ? AND owner_user_id = ?
                  AND (sort_order > ? OR (sort_order = ? AND id > ?))
                ORDER BY sort_order ASC, id ASC LIMIT ?"#,
                    columns_csv(APPSTORE_USER_CATEGORY_COLUMNS)
                ))
                .bind(&context.tenant_id)
                .bind(owner_user_id)
                .bind(cursor_order)
                .bind(cursor_order)
                .bind(&cursor_id)
                .bind(limit)
                .fetch_all(&self.db)
                .await
                .map_err(db_error)?
        } else {
            self.db
                .query_as::<UserCategoryRow>(&format!(
                    r#"SELECT {} FROM appstore_user_category
                WHERE tenant_id = ? AND owner_user_id = ?
                ORDER BY sort_order ASC, id ASC LIMIT ?"#,
                    columns_csv(APPSTORE_USER_CATEGORY_COLUMNS)
                ))
                .bind(&context.tenant_id)
                .bind(owner_user_id)
                .bind(limit)
                .fetch_all(&self.db)
                .await
                .map_err(db_error)?
        };

        rows.into_iter()
            .map(map_user_category_row_to_domain)
            .collect::<Result<Vec<_>, _>>()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn find_category_by_id(
        &self,
        context: &AppstoreRequestContext,
        category_id: &UserCategoryId,
    ) -> Result<Option<UserCategory>, AppstoreServiceError> {
        let row = self
            .db
            .query_as::<UserCategoryRow>(&format!(
                r#"SELECT {} FROM appstore_user_category WHERE id = ? AND tenant_id = ?"#,
                columns_csv(APPSTORE_USER_CATEGORY_COLUMNS)
            ))
            .bind(category_id.as_str())
            .bind(&context.tenant_id)
            .fetch_optional(&self.db)
            .await
            .map_err(db_error)?;

        row.map(map_user_category_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn find_category_by_name(
        &self,
        context: &AppstoreRequestContext,
        name: &str,
    ) -> Result<Option<UserCategory>, AppstoreServiceError> {
        let row = self
            .db
            .query_as::<UserCategoryRow>(&format!(
                r#"SELECT {} FROM appstore_user_category
            WHERE tenant_id = ? AND owner_user_id = ? AND name = ?"#,
                columns_csv(APPSTORE_USER_CATEGORY_COLUMNS)
            ))
            .bind(&context.tenant_id)
            .bind(&context.user_id)
            .bind(name)
            .fetch_optional(&self.db)
            .await
            .map_err(db_error)?;

        row.map(map_user_category_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn find_categories_by_ids(
        &self,
        context: &AppstoreRequestContext,
        category_ids: &[String],
    ) -> Result<Vec<UserCategory>, AppstoreServiceError> {
        if category_ids.is_empty() {
            return Ok(Vec::new());
        }
        let placeholders = vec!["?"; category_ids.len()].join(", ");
        let sql = format!(
            r#"SELECT {} FROM appstore_user_category
            WHERE tenant_id = ? AND id IN ({placeholders})"#,
            columns_csv(APPSTORE_USER_CATEGORY_COLUMNS)
        );
        let mut query = self
            .db
            .query_as::<UserCategoryRow>(&sql)
            .bind(&context.tenant_id);
        for id in category_ids {
            query = query.bind(id);
        }
        let rows = query.fetch_all(&self.db).await.map_err(db_error)?;

        rows.into_iter()
            .map(map_user_category_row_to_domain)
            .collect::<Result<Vec<_>, _>>()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn count_categories_by_owner(
        &self,
        context: &AppstoreRequestContext,
        owner_user_id: &str,
    ) -> Result<i64, AppstoreServiceError> {
        let row: (i64,) = self
            .db
            .query_as(
                r#"SELECT COUNT(*) FROM appstore_user_category
               WHERE tenant_id = ? AND owner_user_id = ?"#,
            )
            .bind(&context.tenant_id)
            .bind(owner_user_id)
            .fetch_one(&self.db)
            .await
            .map_err(db_error)?;
        Ok(row.0)
    }

    async fn insert_category(
        &self,
        context: &AppstoreRequestContext,
        category: &UserCategory,
    ) -> Result<(), AppstoreServiceError> {
        self.db
            .query(
                r#"INSERT INTO appstore_user_category (
                id, tenant_id, organization_id, owner_user_id, name, description,
                icon_media_resource_id, sort_order, category_status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
            )
            .bind(&category.id)
            .bind(&context.tenant_id)
            .bind(&context.organization_id)
            .bind(&category.owner_user_id)
            .bind(&category.name)
            .bind(&category.description)
            .bind(&category.icon_media_resource_id)
            .bind(category.sort_order)
            .bind(map_user_category_status_to_row(category))
            .bind(category.created_at)
            .bind(category.updated_at)
            .execute_unified(&self.db)
            .await
            .map_err(db_error)?;
        Ok(())
    }

    async fn update_category(
        &self,
        context: &AppstoreRequestContext,
        category: &UserCategory,
    ) -> Result<(), AppstoreServiceError> {
        self.db
            .query(
                r#"UPDATE appstore_user_category SET
                name = ?, description = ?, icon_media_resource_id = ?,
                sort_order = ?, category_status = ?, updated_at = ?
            WHERE id = ? AND tenant_id = ?"#,
            )
            .bind(&category.name)
            .bind(&category.description)
            .bind(&category.icon_media_resource_id)
            .bind(category.sort_order)
            .bind(map_user_category_status_to_row(category))
            .bind(category.updated_at)
            .bind(&category.id)
            .bind(&context.tenant_id)
            .execute_unified(&self.db)
            .await
            .map_err(db_error)?;
        Ok(())
    }

    async fn delete_category(
        &self,
        context: &AppstoreRequestContext,
        category_id: &UserCategoryId,
    ) -> Result<(), AppstoreServiceError> {
        self.db
            .query(
                "DELETE FROM appstore_user_category_item WHERE tenant_id = ? AND user_category_id = ?",
            )
            .bind(&context.tenant_id)
            .bind(category_id.as_str())
            .execute_unified(&self.db)
            .await
            .map_err(db_error)?;

        self.db
            .query("DELETE FROM appstore_user_category WHERE tenant_id = ? AND id = ?")
            .bind(&context.tenant_id)
            .bind(category_id.as_str())
            .execute_unified(&self.db)
            .await
            .map_err(db_error)?;
        Ok(())
    }

    async fn find_items_by_category(
        &self,
        context: &AppstoreRequestContext,
        category_id: &UserCategoryId,
        cursor: Option<&str>,
        limit: i32,
    ) -> Result<Vec<UserCategoryItem>, AppstoreServiceError> {
        let rows = if let Some(cursor) = cursor {
            let (cursor_order, cursor_id) = parse_order_cursor(cursor)?;
            self.db
                .query_as::<UserCategoryItemRow>(&format!(
                    r#"SELECT {} FROM appstore_user_category_item
                WHERE tenant_id = ? AND user_category_id = ?
                  AND (sort_order > ? OR (sort_order = ? AND id > ?))
                ORDER BY sort_order ASC, id ASC LIMIT ?"#,
                    columns_csv(APPSTORE_USER_CATEGORY_ITEM_COLUMNS)
                ))
                .bind(&context.tenant_id)
                .bind(category_id.as_str())
                .bind(cursor_order)
                .bind(cursor_order)
                .bind(&cursor_id)
                .bind(limit)
                .fetch_all(&self.db)
                .await
                .map_err(db_error)?
        } else {
            self.db
                .query_as::<UserCategoryItemRow>(&format!(
                    r#"SELECT {} FROM appstore_user_category_item
                WHERE tenant_id = ? AND user_category_id = ?
                ORDER BY sort_order ASC, id ASC LIMIT ?"#,
                    columns_csv(APPSTORE_USER_CATEGORY_ITEM_COLUMNS)
                ))
                .bind(&context.tenant_id)
                .bind(category_id.as_str())
                .bind(limit)
                .fetch_all(&self.db)
                .await
                .map_err(db_error)?
        };

        rows.into_iter()
            .map(map_user_category_item_row_to_domain)
            .collect::<Result<Vec<_>, _>>()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn find_item_by_id(
        &self,
        context: &AppstoreRequestContext,
        item_id: &UserCategoryItemId,
    ) -> Result<Option<UserCategoryItem>, AppstoreServiceError> {
        let row = self
            .db
            .query_as::<UserCategoryItemRow>(&format!(
                r#"SELECT {} FROM appstore_user_category_item WHERE id = ? AND tenant_id = ?"#,
                columns_csv(APPSTORE_USER_CATEGORY_ITEM_COLUMNS)
            ))
            .bind(item_id.as_str())
            .bind(&context.tenant_id)
            .fetch_optional(&self.db)
            .await
            .map_err(db_error)?;

        row.map(map_user_category_item_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn find_item_by_category_and_listing(
        &self,
        context: &AppstoreRequestContext,
        category_id: &UserCategoryId,
        listing_id: &str,
    ) -> Result<Option<UserCategoryItem>, AppstoreServiceError> {
        let row = self
            .db
            .query_as::<UserCategoryItemRow>(&format!(
                r#"SELECT {} FROM appstore_user_category_item
            WHERE tenant_id = ? AND user_category_id = ? AND listing_id = ?"#,
                columns_csv(APPSTORE_USER_CATEGORY_ITEM_COLUMNS)
            ))
            .bind(&context.tenant_id)
            .bind(category_id.as_str())
            .bind(listing_id)
            .fetch_optional(&self.db)
            .await
            .map_err(db_error)?;

        row.map(map_user_category_item_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn count_items_by_categories(
        &self,
        context: &AppstoreRequestContext,
        category_ids: &[String],
    ) -> Result<Vec<(String, i64)>, AppstoreServiceError> {
        if category_ids.is_empty() {
            return Ok(Vec::new());
        }
        let placeholders = vec!["?"; category_ids.len()].join(", ");
        let sql = format!(
            r#"SELECT user_category_id, COUNT(*) FROM appstore_user_category_item
            WHERE tenant_id = ? AND user_category_id IN ({placeholders})
            GROUP BY user_category_id"#
        );
        let mut query = self
            .db
            .query_as::<(String, i64)>(&sql)
            .bind(&context.tenant_id);
        for id in category_ids {
            query = query.bind(id);
        }
        let rows = query.fetch_all(&self.db).await.map_err(db_error)?;
        Ok(rows)
    }

    async fn insert_item(
        &self,
        context: &AppstoreRequestContext,
        item: &UserCategoryItem,
    ) -> Result<(), AppstoreServiceError> {
        self.db
            .query(
                r#"INSERT INTO appstore_user_category_item (
                id, tenant_id, organization_id, user_category_id, listing_id, note,
                sort_order, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
            )
            .bind(&item.id)
            .bind(&context.tenant_id)
            .bind(&context.organization_id)
            .bind(&item.user_category_id)
            .bind(&item.listing_id)
            .bind(&item.note)
            .bind(item.sort_order)
            .bind(item.created_at)
            .bind(item.updated_at)
            .execute_unified(&self.db)
            .await
            .map_err(db_error)?;
        Ok(())
    }

    async fn update_item(
        &self,
        context: &AppstoreRequestContext,
        item: &UserCategoryItem,
    ) -> Result<(), AppstoreServiceError> {
        self.db
            .query(
                r#"UPDATE appstore_user_category_item SET
                note = ?, sort_order = ?, updated_at = ?
            WHERE id = ? AND tenant_id = ?"#,
            )
            .bind(&item.note)
            .bind(item.sort_order)
            .bind(item.updated_at)
            .bind(&item.id)
            .bind(&context.tenant_id)
            .execute_unified(&self.db)
            .await
            .map_err(db_error)?;
        Ok(())
    }

    async fn delete_item(
        &self,
        context: &AppstoreRequestContext,
        item_id: &UserCategoryItemId,
    ) -> Result<(), AppstoreServiceError> {
        self.db
            .query("DELETE FROM appstore_user_category_item WHERE id = ? AND tenant_id = ?")
            .bind(item_id.as_str())
            .bind(&context.tenant_id)
            .execute_unified(&self.db)
            .await
            .map_err(db_error)?;
        Ok(())
    }

    async fn reorder_items(
        &self,
        context: &AppstoreRequestContext,
        category_id: &UserCategoryId,
        ordered_item_ids: &[String],
    ) -> Result<(), AppstoreServiceError> {
        for (position, item_id) in ordered_item_ids.iter().enumerate() {
            self.db
                .query(
                    r#"UPDATE appstore_user_category_item
                SET sort_order = ?, updated_at = ?
                WHERE id = ? AND tenant_id = ? AND user_category_id = ?"#,
                )
                .bind(position as i32)
                .bind(chrono::Utc::now())
                .bind(item_id)
                .bind(&context.tenant_id)
                .bind(category_id.as_str())
                .execute_unified(&self.db)
                .await
                .map_err(db_error)?;
        }
        Ok(())
    }

    async fn find_share_by_token(
        &self,
        context: &AppstoreRequestContext,
        share_token: &str,
    ) -> Result<Option<UserStoreShare>, AppstoreServiceError> {
        let row = self
            .db
            .query_as::<UserStoreShareRow>(&format!(
                r#"SELECT {} FROM appstore_user_store_share
            WHERE tenant_id = ? AND share_token = ?"#,
                columns_csv(APPSTORE_USER_STORE_SHARE_COLUMNS)
            ))
            .bind(&context.tenant_id)
            .bind(share_token)
            .fetch_optional(&self.db)
            .await
            .map_err(db_error)?;

        row.map(map_user_store_share_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn find_share_by_id(
        &self,
        context: &AppstoreRequestContext,
        share_id: &UserStoreShareId,
    ) -> Result<Option<UserStoreShare>, AppstoreServiceError> {
        let row = self
            .db
            .query_as::<UserStoreShareRow>(&format!(
                r#"SELECT {} FROM appstore_user_store_share WHERE id = ? AND tenant_id = ?"#,
                columns_csv(APPSTORE_USER_STORE_SHARE_COLUMNS)
            ))
            .bind(share_id.as_str())
            .bind(&context.tenant_id)
            .fetch_optional(&self.db)
            .await
            .map_err(db_error)?;

        row.map(map_user_store_share_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn find_shares_by_owner(
        &self,
        context: &AppstoreRequestContext,
        cursor: Option<&str>,
        limit: i32,
    ) -> Result<Vec<UserStoreShare>, AppstoreServiceError> {
        let rows = if let Some(cursor_id) = cursor {
            self.db
                .query_as::<UserStoreShareRow>(&format!(
                    r#"SELECT {} FROM appstore_user_store_share
                WHERE tenant_id = ? AND owner_user_id = ? AND id > ?
                ORDER BY id ASC LIMIT ?"#,
                    columns_csv(APPSTORE_USER_STORE_SHARE_COLUMNS)
                ))
                .bind(&context.tenant_id)
                .bind(&context.user_id)
                .bind(cursor_id)
                .bind(limit)
                .fetch_all(&self.db)
                .await
                .map_err(db_error)?
        } else {
            self.db
                .query_as::<UserStoreShareRow>(&format!(
                    r#"SELECT {} FROM appstore_user_store_share
                WHERE tenant_id = ? AND owner_user_id = ?
                ORDER BY id ASC LIMIT ?"#,
                    columns_csv(APPSTORE_USER_STORE_SHARE_COLUMNS)
                ))
                .bind(&context.tenant_id)
                .bind(&context.user_id)
                .bind(limit)
                .fetch_all(&self.db)
                .await
                .map_err(db_error)?
        };

        rows.into_iter()
            .map(map_user_store_share_row_to_domain)
            .collect::<Result<Vec<_>, _>>()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn count_shares_by_owner(
        &self,
        context: &AppstoreRequestContext,
    ) -> Result<i64, AppstoreServiceError> {
        let row: (i64,) = self
            .db
            .query_as(
                r#"SELECT COUNT(*) FROM appstore_user_store_share
               WHERE tenant_id = ? AND owner_user_id = ? AND share_status = 'active'"#,
            )
            .bind(&context.tenant_id)
            .bind(&context.user_id)
            .fetch_one(&self.db)
            .await
            .map_err(db_error)?;
        Ok(row.0)
    }

    async fn insert_share(
        &self,
        context: &AppstoreRequestContext,
        share: &UserStoreShare,
    ) -> Result<(), AppstoreServiceError> {
        let (scope, selected_json, visibility, status, _expires_at) =
            map_user_store_share_domain_to_share_columns(share)
                .map_err(AppstoreServiceError::Internal)?;

        self.db
            .query(
                r#"INSERT INTO appstore_user_store_share (
                id, tenant_id, organization_id, owner_user_id, share_token, title, description,
                share_scope, selected_category_ids_json, share_visibility, share_status,
                expires_at, view_count, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
            )
            .bind(&share.id)
            .bind(&context.tenant_id)
            .bind(&context.organization_id)
            .bind(&share.owner_user_id)
            .bind(&share.share_token)
            .bind(&share.title)
            .bind(&share.description)
            .bind(&scope)
            .bind(&selected_json)
            .bind(&visibility)
            .bind(&status)
            .bind(share.expires_at)
            .bind(share.view_count)
            .bind(share.created_at)
            .bind(share.updated_at)
            .execute_unified(&self.db)
            .await
            .map_err(db_error)?;
        Ok(())
    }

    async fn update_share(
        &self,
        context: &AppstoreRequestContext,
        share: &UserStoreShare,
    ) -> Result<(), AppstoreServiceError> {
        let (scope, selected_json, visibility, status, _expires_at) =
            map_user_store_share_domain_to_share_columns(share)
                .map_err(AppstoreServiceError::Internal)?;

        self.db
            .query(
                r#"UPDATE appstore_user_store_share SET
                title = ?, description = ?, share_scope = ?, selected_category_ids_json = ?,
                share_visibility = ?, share_status = ?, expires_at = ?, updated_at = ?
            WHERE id = ? AND tenant_id = ?"#,
            )
            .bind(&share.title)
            .bind(&share.description)
            .bind(&scope)
            .bind(&selected_json)
            .bind(&visibility)
            .bind(&status)
            .bind(share.expires_at)
            .bind(share.updated_at)
            .bind(&share.id)
            .bind(&context.tenant_id)
            .execute_unified(&self.db)
            .await
            .map_err(db_error)?;
        Ok(())
    }

    async fn increment_share_view_count(
        &self,
        context: &AppstoreRequestContext,
        share_id: &UserStoreShareId,
    ) -> Result<(), AppstoreServiceError> {
        self.db
            .query(
                r#"UPDATE appstore_user_store_share
            SET view_count = view_count + 1
            WHERE id = ? AND tenant_id = ?"#,
            )
            .bind(share_id.as_str())
            .bind(&context.tenant_id)
            .execute_unified(&self.db)
            .await
            .map_err(db_error)?;
        Ok(())
    }
}
